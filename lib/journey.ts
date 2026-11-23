import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { FRAG, SCENES, VERT, type Scene } from './scenes';

type Els = { stage: HTMLDivElement; glc: HTMLCanvasElement; motesC: HTMLCanvasElement; scrim: HTMLDivElement; dimEl: HTMLDivElement };
type Tex = { t: WebGLTexture; r: number };
type Source = ImageBitmap | HTMLImageElement;
type Mote = { x: number; y: number; z: number; s: number; e: boolean };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const UNIFORMS = 'T M E D W S H SC KA KB R C A B N XA XB GA GB'.split(' ');

// Mirrors the hero preload media queries in app/page.tsx so the hero is never fetched twice.
export const tierSuffix = () =>
  innerWidth < 820 ? '-m' : (devicePixelRatio >= 1.5 && innerWidth > 1333) || innerWidth > 2000 ? '' : '-l';

export function startJourney({ stage, glc, motesC, scrim, dimEl }: Els): () => void {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover:none)').matches;
  const phone = innerWidth < 820;
  const q = <T extends Element>(s: string) => document.querySelector(s) as T;
  const nav = q<HTMLElement>('#nav'), hud = q<HTMLElement>('.hud'), clockEl = q<HTMLElement>('#clock');
  const chapEl = q<HTMLElement>('#chap'), menuBtn = q<HTMLButtonElement>('#menuBtn');
  const chapters = [...document.querySelectorAll<HTMLElement>('[data-img]')];
  const dims = [...document.querySelectorAll<HTMLElement>('[data-dim]')];
  const times = chapters.map((c) => {
    const [h, m] = (c.dataset.at ?? '0:0').split(':');
    return +h * 60 + +m;
  });
  let tops: number[] = [], lens: number[] = [], vh = innerHeight;
  let dimR: { a: number; b: number; v: number }[] = [];
  let disposed = false;
  const offs: (() => void)[] = [];
  const on = (t: EventTarget, type: string, fn: (e: Event) => void) => {
    t.addEventListener(type, fn);
    offs.push(() => t.removeEventListener(type, fn));
  };

  function measure() {
    vh = innerHeight;
    const sy = scrollY;
    tops = chapters.map((c) => c.getBoundingClientRect().top + sy);
    const end = document.documentElement.scrollHeight - vh;
    lens = tops.map((t, i) => (i < tops.length - 1 ? tops[i + 1] : end + vh) - t);
    dimR = dims.map((d) => {
      const r = d.getBoundingClientRect();
      return { a: r.top + sy, b: r.bottom + sy, v: r.height ? +(d.dataset.dim ?? 0) : 0 };
    });
  }

  let gl: WebGLRenderingContext | null = null;
  const U: Record<string, WebGLUniformLocation | null> = {};
  const texs: (Tex | null)[] = SCENES.map(() => null);
  let prog: WebGLProgram | null = null, buf: WebGLBuffer | null = null, noiseTex: WebGLTexture | null = null;
  if (!reduce) {
    try {
      gl = glc.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch {}
  }
  if (gl) {
    const g = gl;
    const sh = (type: number, src: string) => {
      const s = g.createShader(type)!;
      g.shaderSource(s, src);
      g.compileShader(s);
      return s;
    };
    prog = g.createProgram();
    g.attachShader(prog, sh(g.VERTEX_SHADER, VERT));
    g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG));
    g.bindAttribLocation(prog, 0, 'a');
    g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) gl = null;
  }
  if (gl && prog) {
    gl.useProgram(prog);
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    for (const n of UNIFORMS) U[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(U.A, 0);
    gl.uniform1i(U.B, 1);
    gl.uniform1i(U.N, 2);
    const NS = 128, noise = new Uint8Array(NS * NS * 4);
    for (let i = 0; i < noise.length; i++) noise[i] = i % 4 === 3 ? 255 : Math.random() * 256;
    gl.activeTexture(gl.TEXTURE2);
    noiseTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, noiseTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, NS, NS, 0, gl.RGBA, gl.UNSIGNED_BYTE, noise);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    stage.classList.add('gl');
    on(glc, 'webglcontextlost', (e) => {
      e.preventDefault();
      gl = null;
      stage.classList.remove('gl');
      glc.style.display = 'none';
      initDom();
    });
  } else {
    glc.style.display = 'none';
  }

  let quality = 1, curW = 0, curH = 0;
  function size(force: boolean) {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!force && touch && w === curW && Math.abs(h - curH) < 140) return;
    curW = w;
    curH = h;
    const dpr = Math.min(devicePixelRatio || 1, phone ? 1.4 : 1.5) * quality;
    if (gl) {
      glc.width = Math.round(w * dpr);
      glc.height = Math.round(h * dpr);
      gl.viewport(0, 0, glc.width, glc.height);
      gl.uniform2f(U.R, glc.width, glc.height);
    }
    motesC.width = w;
    motesC.height = h;
  }

  const ratio = (i: number) => texs[i]?.r ?? 1.5;
  const tier = tierSuffix();
  const srcOf = (i: number) => `/assets/${SCENES[i].n}${tier}.webp`;
  const loadState = SCENES.map(() => 0);
  const pending: { k: number; src: Source }[] = [];
  const maxTex = phone ? 3 : 5;
  let loading = false, cur = 0, liveTex = 0, introDone = false;

  function want() {
    if (!gl || loading) return;
    for (const k of [cur, cur + 1, cur - 1, cur + 2]) {
      if (k >= 0 && k < SCENES.length && !loadState[k]) return load(k);
    }
  }
  function load(k: number) {
    loading = true;
    loadState[k] = 1;
    const im = new Image();
    const done = (src: Source) => {
      if (disposed) return void ('close' in src && src.close());
      pending.push({ k, src });
      loading = false;
      want();
    };
    im.onerror = () => {
      loading = false;
      if (!disposed) want();
    };
    im.onload = () => {
      im.decode()
        .then(() => createImageBitmap(im))
        .then(done, () => done(im));
    };
    im.src = srcOf(k);
  }
  function pump(moving: boolean) {
    if (!gl) return;
    for (let p = 0; p < pending.length; p++) {
      const k = pending[p].k;
      if (moving && k !== cur && k !== cur + 1) continue;
      const src = pending.splice(p, 1)[0].src, t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
      const w = 'naturalWidth' in src ? src.naturalWidth : src.width;
      const h = 'naturalHeight' in src ? src.naturalHeight : src.height;
      texs[k] = { t, r: w / h };
      if ('close' in src) src.close();
      loadState[k] = 2;
      liveTex++;
      dirty = true;
      if (!introDone) {
        introDone = true;
        beginIntro();
      }
      evict();
      return;
    }
  }
  function evict() {
    while (gl && liveTex > maxTex) {
      let far = -1, dist = 1;
      texs.forEach((t, k) => {
        const d = k < cur ? (cur - k) * 1.5 : k - cur;
        if (t && d > dist) {
          dist = d;
          far = k;
        }
      });
      if (far < 0) return;
      gl.deleteTexture(texs[far]!.t);
      texs[far] = null;
      loadState[far] = 0;
      liveTex--;
    }
  }

  let domImgs: HTMLImageElement[] | null = null;
  function initDom() {
    domImgs = SCENES.map((s) => {
      const im = document.createElement('img');
      im.alt = '';
      im.decoding = 'async';
      im.style.objectPosition = `${s.f0[0] * 100}% ${s.f0[1] * 100}%`;
      stage.insertBefore(im, dimEl);
      return im;
    });
    motesC.style.display = 'none';
  }
  if (!gl) initDom();

  function xf(s: Scene, p: number, i: number): [number, number, number, number] {
    const as = curW / curH, r = ratio(i);
    let zv = lerp(s.z[0], s.z[1], p);
    if (curW < curH) zv = 1 + (zv - 1) * .3 + .02;
    const sx = (as > r ? 1 : as / r) / zv, sy = (as > r ? r / as : 1) / zv;
    const cx = clamp(lerp(s.f0[0], s.f1[0], p), sx / 2, 1 - sx / 2);
    const cy = clamp(s.hy ? s.h + (.5 - s.hy) * sy : lerp(s.f0[1], s.f1[1], p), sy / 2, 1 - sy / 2);
    return [cx, cy, sx, sy];
  }
  const pOf = (i: number, y: number) => clamp(i === 0 ? y / lens[0] : (y - tops[i] + vh) / (lens[i] + vh), 0, 1);

  const T0 = performance.now();
  let dawn = reduce ? 1 : 0, lastY = -1, dirty = true, frameN = 0, slowN = 0, slowT = 0, lastT = T0;

  const motes: Mote[] = Array.from({ length: phone ? 10 : 36 }, (_, i) => ({
    x: Math.random(), y: Math.random(), z: .3 + Math.random() * .7, s: Math.random() * 6.28, e: i % 3 === 0,
  }));
  const mc = motesC.getContext('2d')!;
  let motesLive = false;
  function drawMotes(dust: number, ember: number, dt: number) {
    if (dust < .02 && ember < .02) {
      if (motesLive) {
        mc.clearRect(0, 0, curW, curH);
        motesLive = false;
      }
      return;
    }
    motesLive = true;
    mc.clearRect(0, 0, curW, curH);
    for (const m of motes) {
      if (m.e) {
        m.y -= dt * .00011 * m.z;
        m.x += Math.sin(m.s + m.y * 16) * .0006;
        if (m.y < .2) {
          m.y = 1;
          m.x = .2 + Math.random() * .4;
        }
      } else {
        m.x += dt * .000022 * m.z;
        m.y += Math.sin(m.s + m.x * 8) * .00016;
        if (m.x > 1) {
          m.x = 0;
          m.y = .2 + Math.random() * .8;
        }
      }
      const a = (m.e ? ember : dust) * (m.e ? .9 : .22) * m.z * (m.e ? clamp((m.y - .2) * 2.2, 0, 1) : 1);
      if (a < .01) continue;
      mc.globalAlpha = a;
      mc.fillStyle = m.e ? '#ffae5c' : '#f9dfae';
      const r = (m.e ? 1.5 : 1.3) * m.z;
      mc.fillRect(m.x * curW, m.y * curH, r, r);
    }
    mc.globalAlpha = 1;
  }

  function setUniforms(g: WebGLRenderingContext, a: number, pa: number, b: number, pb: number, m: number, dim: number, time: number) {
    const sa = SCENES[a], sb = SCENES[b];
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D, texs[a]!.t);
    g.activeTexture(g.TEXTURE1);
    g.bindTexture(g.TEXTURE_2D, texs[b]!.t);
    g.uniform4fv(U.XA, xf(sa, pa, a));
    g.uniform4fv(U.XB, xf(sb, pb, b));
    const sway = .004 * Math.sin(time * .06);
    g.uniform4f(U.GA, sa.h, lerp(sa.k[0], sa.k[1], pa), sa.vx, sa.kind === 2 ? .022 * pa + sway : 0);
    g.uniform4f(U.GB, sb.h, lerp(sb.k[0], sb.k[1], pb), sb.vx, sb.kind === 2 ? .022 * pb + sway : 0);
    g.uniform1f(U.KA, sa.kind);
    g.uniform1f(U.KB, sb.kind);
    g.uniform1f(U.T, time);
    g.uniform1f(U.M, m);
    g.uniform1f(U.E, lerp(sa.exp, sb.exp, m));
    g.uniform1f(U.D, dim);
    g.uniform1f(U.W, a === 0 ? dawn : 1);
    g.uniform1f(U.S, reduce || phone ? 0 : lerp(sa.shim, sb.shim, m));
    g.uniform1f(U.H, phone ? 0 : lerp(sa.haze, sb.haze, m));
    g.uniform3f(U.C, lerp(sa.tint[0], sb.tint[0], m), lerp(sa.tint[1], sb.tint[1], m), lerp(sa.tint[2], sb.tint[2], m));
  }

  function chapterAt(y: number) {
    let i = 0;
    for (let c = 0; c < tops.length; c++) if (tops[c] - vh * .1 <= y) i = c;
    return i;
  }

  const intro = { v: reduce ? 1 : 0 };
  let lastDim = 0, navY = 0, navAway = false, lbOpen = false;
  let lastHud = '1', lastDimS = '', lastScrim = '', lastClock = '', lastName = '';
  let lenis: Lenis | null = null;

  function frame(now: number) {
    if (lbOpen) {
      lastT = now;
      return;
    }
    const dt = now - lastT;
    lastT = now;
    lenis?.raf(now);
    const y = scrollY;
    const moving = Math.abs(y - lastY) > .3;
    frameN++;
    if (pending.length) pump(moving);
    const ambient = !reduce && lastDim < .7 && !(frameN % 2);
    if (!moving && !dirty && !ambient) return;
    lastY = y;
    dirty = false;

    if (!reduce) {
      const dy = y - navY;
      if (Math.abs(dy) > 6) {
        const away = dy > 0 && y > vh * .7 && !nav.classList.contains('open');
        if (away !== navAway) {
          nav.classList.toggle('away', away);
          navAway = away;
        }
        navY = y;
      }
    }

    const i = chapterAt(y), n = SCENES.length;
    if (i !== cur) {
      cur = i;
      want();
    }
    let m = i < n - 1 ? smooth(clamp((y - (tops[i + 1] - vh * .9)) / (vh * .8), 0, 1)) : 0;
    let d = 0;
    for (const r of dimR) {
      if (y + vh * .75 < r.a || y + vh * .25 - r.b > vh * .4) continue;
      d = Math.max(d, r.v * smooth(clamp((y + vh * .75 - r.a) / (vh * .45), 0, 1)) * (1 - smooth(clamp((y + vh * .25 - r.b) / (vh * .4), 0, 1))));
    }
    lastDim = d;
    const sc = 1 - clamp(y / (lens[0] * .5), 0, 1);
    const hudS = (1 - smooth(clamp((d - .3) / .16, 0, 1))).toFixed(2);
    if (hudS !== lastHud) {
      hud.style.opacity = hudS;
      lastHud = hudS;
    }

    if (gl) {
      let a = i;
      let b = Math.min(i + 1, n - 1);
      while (a > 0 && !texs[a]) a--;
      if (!texs[b]) {
        b = a;
        m = 0;
      }
      if (texs[a]) {
        dawn = i === 0 ? Math.min(1, intro.v * .72 + clamp(y / (lens[0] * .5), 0, 1) * .28) : 1;
        setUniforms(gl, a, pOf(a, y), b, pOf(b, y), m, d, (now - T0) / 1000);
        gl.uniform1f(U.SC, sc);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        const sa = SCENES[a], sb = SCENES[b];
        drawMotes(lerp(sa.dust ?? 0, sb.dust ?? 0, m) * intro.v, lerp(sa.ember ?? 0, sb.ember ?? 0, m), Math.min(dt, 50));
      }
      if (moving && !document.hidden) {
        slowT += dt;
        if (++slowN === 40) {
          if (slowT / 40 > 24 && quality > .55) {
            quality *= .8;
            size(true);
          }
          slowN = 0;
          slowT = 0;
        }
      }
    } else {
      const dimS = d.toFixed(3), scS = sc.toFixed(3);
      if (dimS !== lastDimS) dimEl.style.opacity = lastDimS = dimS;
      if (scS !== lastScrim) scrim.style.opacity = lastScrim = scS;
      domImgs?.forEach((im, k) => {
        let o = k === i ? 1 - m * (i < n - 1 ? 0 : 1) : k === i + 1 ? m : 0;
        if ((k === i || (k === i + 1 && m > 0)) && !im.src) im.src = srcOf(k);
        if (k > i + 2) o = 0;
        im.style.opacity = String(o);
        if (!reduce && o > 0) im.style.transform = `scale(${lerp(SCENES[k].z[0], SCENES[k].z[1], pOf(k, y)).toFixed(4)})`;
      });
    }

    const next = Math.min(i + 1, n - 1);
    const tt = n - 1 === i ? clamp((y - tops[i]) / (vh * 3), 0, 1) : clamp((y - tops[i]) / lens[i], 0, 1);
    const mins = i === n - 1 ? lerp(times[i], 21 * 60 + 30, tt) : lerp(times[i], times[next], tt);
    const hm = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(Math.floor(mins % 60)).padStart(2, '0')}`;
    if (hm !== lastClock) clockEl.textContent = lastClock = hm;
    const nm = chapters[i].dataset.name ?? '';
    if (nm !== lastName) chapEl.textContent = lastName = nm;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (!reduce) {
    lenis = new Lenis({ lerp: .13, wheelMultiplier: 1, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
  }

  const closeMenu = () => {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = 'Menu';
  };
  on(document, 'click', (e) => {
    const a = (e.target as Element).closest?.('a[href^="#"]');
    const el = a && document.querySelector(a.getAttribute('href')!);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(el as HTMLElement, { duration: 2.2 });
    else el.scrollIntoView();
  });
  on(menuBtn, 'click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
  });
  on(window, 'lightbox', (e) => {
    lbOpen = (e as CustomEvent<boolean>).detail;
    if (lbOpen) lenis?.stop();
    else {
      lenis?.start();
      dirty = true;
    }
  });

  const ctx = gsap.context(() => {});
  if (!reduce) {
    ScrollTrigger.config({ ignoreMobileResize: true });
    const setupBeat = (b: HTMLElement) => {
      const copy = b.querySelector<HTMLElement>('.copy');
      if (!copy) return;
      const hero = b.classList.contains('hero');
      const ws = copy.querySelectorAll(phone && !hero ? '.split' : '.w');
      const rest = [...copy.children].filter((c) => !c.classList.contains('split'));
      const tl = gsap.timeline({ scrollTrigger: { trigger: b, start: hero ? 'top top' : 'top 78%', end: 'bottom bottom', scrub: true } });
      if (!hero) {
        tl.fromTo(ws, { yPercent: phone ? 14 : 46, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .035, duration: .42, ease: 'power2.out' }, 0);
        if (rest.length) tl.fromTo(rest, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'power2.out' }, .08);
      }
      tl.to(copy, { y: -46, opacity: 0, duration: .42, ease: 'power1.in' }, hero ? .45 : '+=1.1');
    };
    // One timeline per task keeps startup free of long tasks on slow phones.
    const beats = [...document.querySelectorAll<HTMLElement>('.beat')];
    const nextBeat = () => {
      const b = beats.shift();
      if (!b || disposed) return;
      ctx.add(() => setupBeat(b));
      setTimeout(nextBeat, 0);
    };
    nextBeat();
  }

  let riser: IntersectionObserver | null = null;
  if (!reduce) {
    document.documentElement.classList.add('js-rise');
    riser = new IntersectionObserver((es) => {
      for (const e of es) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        riser?.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rise').forEach((el) => riser?.observe(el));
  }

  const links = [...document.querySelectorAll<HTMLAnchorElement>('nav ul a')];
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) links.forEach((l) => l.classList.toggle('on', l.getAttribute('href') === `#${e.target.id}`));
  }, { rootMargin: '-50% 0px -50% 0px' });
  links.forEach((l) => {
    const t = document.querySelector(l.getAttribute('href')!);
    if (t) io.observe(t);
  });

  measure();
  size(true);
  const ro = new ResizeObserver(() => {
    measure();
    dirty = true;
  });
  ro.observe(document.body);
  on(window, 'resize', () => {
    size(false);
    measure();
    dirty = true;
  });
  document.fonts?.ready.then(() => {
    if (disposed) return;
    measure();
    ScrollTrigger.refresh();
  });

  function beginIntro() {
    if (reduce) return;
    ctx.add(() => gsap.to(intro, { v: 1, duration: 3.6, ease: 'power2.out', onUpdate: () => void (dirty = true) }));
  }
  if (gl) {
    cur = chapterAt(scrollY);
    want();
  } else {
    intro.v = 1;
    dawn = 1;
  }
  gsap.ticker.lagSmoothing(0);
  const tick = () => frame(performance.now());
  gsap.ticker.add(tick, false, true);

  return () => {
    disposed = true;
    gsap.ticker.remove(tick);
    ctx.revert();
    lenis?.destroy();
    offs.forEach((off) => off());
    ro.disconnect();
    io.disconnect();
    riser?.disconnect();
    document.documentElement.classList.remove('js-rise');
    nav.classList.remove('away');
    closeMenu();
    hud.style.opacity = '';
    pending.forEach((p) => 'close' in p.src && p.src.close());
    domImgs?.forEach((im) => im.remove());
    stage.classList.remove('gl');
    if (gl) {
      for (const t of texs) if (t) gl.deleteTexture(t.t);
      gl.deleteTexture(noiseTex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    }
  };
}
