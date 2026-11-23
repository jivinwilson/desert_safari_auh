'use client';

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GALLERY, type GalleryItem } from '@/lib/gallery';

const WEIGHTS: Record<number, number[]> = { 1: [1], 2: [1.15, 1], 3: [1.25, 1, 1.1] };
const colsFor = (w: number) => (w >= 1000 ? 3 : w >= 520 ? 2 : 1);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const lightbox = (open: boolean) => {
  document.documentElement.style.overflow = open ? 'hidden' : '';
  window.dispatchEvent(new CustomEvent('lightbox', { detail: open }));
};

type Block =
  | { kind: 'group'; title: string }
  | { kind: 'full' | 'large'; it: GalleryItem; flip: boolean }
  | { kind: 'run'; cols: GalleryItem[][] };

function layout(items: GalleryItem[], n: number): Block[] {
  const out: Block[] = [], w = WEIGHTS[n];
  let run: GalleryItem[] = [], group: string | undefined, splits = 0;
  const flush = () => {
    if (!run.length) return;
    const cols: GalleryItem[][] = w.map(() => []), heights = w.map(() => 0);
    for (const it of run) {
      const k = heights.indexOf(Math.min(...heights));
      cols[k].push(it);
      heights[k] += (it.h / it.w) * w[k] + .22;
    }
    out.push({ kind: 'run', cols });
    run = [];
  };
  for (const it of items) {
    if (it.group && it.group !== group) {
      flush();
      group = it.group;
      out.push({ kind: 'group', title: group });
    }
    if (it.feature) {
      flush();
      out.push({ kind: it.feature, it, flip: it.feature === 'large' && splits++ % 2 === 1 });
    } else run.push(it);
  }
  flush();
  return out;
}

function Caption({ it, full }: { it: GalleryItem; full: boolean }) {
  const meta = [it.date, it.location].filter(Boolean).join(' · ');
  return (
    <span className="g-cap">
      {it.category && <span className="g-cat">{it.category}</span>}
      {it.title && <span className="g-title">{it.title}</span>}
      {full && it.description && <span className="g-desc">{it.description}</span>}
      {meta && <span className="g-meta">{meta}</span>}
    </span>
  );
}

function Tile({ it, full, onOpen }: { it: GalleryItem; full: boolean; onOpen: () => void }) {
  const video = it.type === 'video';
  return (
    <button type="button" className="g-tile rise" onClick={onOpen} aria-label={`${video ? 'Play film' : 'View photo'}: ${it.title || it.alt}`}>
      <span className="g-frame" style={{ aspectRatio: `${it.w}/${it.h}` }}>
        <span className="g-media">
          {/* eslint-disable-next-line @next/next/no-img-element -- files are pre-sized WebP in /public */}
          <img src={video ? it.poster : it.src} alt={it.alt} width={it.w} height={it.h} loading="lazy" decoding="async" />
        </span>
        {video && (
          <svg className="g-play" viewBox="0 0 68 68" aria-hidden="true">
            <circle cx="34" cy="34" r="32" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M28 22l18 12-18 12z" fill="currentColor" />
          </svg>
        )}
      </span>
      <Caption it={it} full={full} />
    </button>
  );
}

export default function Wall() {
  const [active, setActive] = useState('All');
  const [cols, setCols] = useState(3);
  const [at, setAt] = useState<number | null>(null);
  const wall = useRef<HTMLDivElement>(null);
  const filters = useRef<HTMLDivElement>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const dir = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const current = active === 'All' ? GALLERY : GALLERY.filter((i) => i.category === active);
  const cats = [...new Set(GALLERY.map((i) => i.category))];

  useEffect(() => {
    const fit = () => setCols(colsFor(innerWidth));
    fit();
    addEventListener('resize', fit);
    return () => removeEventListener('resize', fit);
  }, []);

  useLayoutEffect(() => {
    const el = wall.current!;
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    el.querySelectorAll('.g-tile').forEach((t) => io.observe(t));
    if (reduced()) return () => io.disconnect();
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('.g-full .g-media').forEach((m) =>
        gsap.fromTo(m, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: m.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }),
      );
    });
    ScrollTrigger.refresh();
    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [active, cols]);

  useLayoutEffect(() => {
    if (at === null || !dir.current || reduced() || !media.current) return;
    const t = gsap.fromTo(media.current, { x: dir.current * 46, opacity: 0 }, { x: 0, opacity: 1, duration: .7, ease: 'power3.out' });
    for (const k of [at - 1, at + 1]) {
      const n = current[(k + current.length) % current.length];
      if (n.type !== 'video') new Image().src = n.src;
    }
    return () => void t.kill();
  }, [at, current]);

  const pick = (c: string) => {
    if (c === active) return;
    const top = filters.current!.getBoundingClientRect().top + scrollY - 110;
    const swap = () => {
      setActive(c);
      if (scrollY > top) scrollTo(0, top);
    };
    if (reduced()) return swap();
    gsap.to(wall.current, {
      opacity: 0, duration: .3, ease: 'power1.in',
      onComplete: () => {
        swap();
        gsap.to(wall.current, { opacity: 1, duration: .6, ease: 'power2.out' });
      },
    });
  };

  const show = (i: number, d: number) => {
    dir.current = d;
    setAt((i + current.length) % current.length);
  };
  const open = (i: number) => {
    lightbox(true);
    dlg.current!.showModal();
    show(i, 0);
  };
  const teardown = () => {
    setAt(null);
    lightbox(false);
  };
  const shut = () => {
    dlg.current!.close();
    teardown();
  };

  const it = at === null ? null : current[at];
  const tile = (x: GalleryItem, full: boolean) => <Tile it={x} full={full} onOpen={() => open(current.indexOf(x))} />;

  return (
    <div id="gallery" className="block" data-dim=".86">
      <div className="inner">
        <div className="head" id="gHead">
          <div className="rise">
            <p className="kicker">Events &amp; experiences</p>
            <h2>In the <em>desert,</em> as it happened.</h2>
          </div>
          <p className="sub rise">Photographs and films from our safaris around Abu Dhabi.</p>
        </div>
        {cats.length > 1 && (
          <div className="g-filters" ref={filters} role="group" aria-label="Filter gallery by category">
            {['All', ...cats].map((c) => (
              <button key={c} type="button" className="lnk" aria-pressed={c === active} onClick={() => pick(c)}>{c}</button>
            ))}
          </div>
        )}
        <div id="gWall" ref={wall}>
          {layout(current, cols).map((b, i) =>
            b.kind === 'group' ? <h3 key={i} className="g-group">{b.title}</h3>
            : b.kind === 'run' ? (
              <div key={i} className="g-run" style={{ gridTemplateColumns: WEIGHTS[cols].map((x) => `minmax(0,${x}fr)`).join(' ') }}>
                {b.cols.map((col, k) => <div key={k} className="g-col">{col.map((x) => <div key={x.src}>{tile(x, false)}</div>)}</div>)}
              </div>
            ) : (
              <div key={i} className={b.kind === 'full' ? 'g-full' : `g-split${b.flip ? ' flip' : ''}`}>{tile(b.it, true)}</div>
            ),
          )}
        </div>
      </div>

      <dialog
        id="lb"
        ref={dlg}
        aria-label="Photo viewer"
        // The close event is queued and can land after a quick reopen.
        onClose={() => !dlg.current?.open && teardown()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            return shut();
          }
          if (at === null || (e.target as Element).tagName === 'VIDEO') return;
          if (e.key === 'ArrowLeft') show(at - 1, -1);
          if (e.key === 'ArrowRight') show(at + 1, 1);
        }}
      >
        <button className="lnk" id="lbClose" type="button" autoFocus onClick={shut}>Close</button>
        <div
          className="lb-stage"
          ref={media}
          onPointerDown={(e: PointerEvent) => {
            swipe.current = (e.target as Element).tagName === 'VIDEO' ? null : { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e: PointerEvent) => {
            const s = swipe.current;
            swipe.current = null;
            if (!s || at === null) return;
            const dx = e.clientX - s.x;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) show(at + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
          }}
        >
          {it && (it.type === 'video'
            ? <video key={it.src} src={it.src} poster={it.poster} controls playsInline preload="metadata" aria-label={it.title || it.alt} />
            // eslint-disable-next-line @next/next/no-img-element -- full-size original in a contain box
            : <img key={it.src} src={it.src} alt={it.alt} />)}
        </div>
        <div className="lb-bar">
          <div className="lb-cap" aria-live="polite">{it && <Caption it={it} full />}</div>
          <div className="lb-nav">
            <span id="lbCount">{at === null ? '' : `${at + 1} / ${current.length}`}</span>
            <button className="lnk" type="button" onClick={() => at !== null && show(at - 1, -1)}>Previous</button>
            <button className="lnk" type="button" onClick={() => at !== null && show(at + 1, 1)}>Next</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
