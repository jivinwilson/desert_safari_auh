'use client';

import { useEffect, useRef } from 'react';

export default function Journey() {
  const stage = useRef<HTMLDivElement>(null);
  const glc = useRef<HTMLCanvasElement>(null);
  const motesC = useRef<HTMLCanvasElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const dimEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stop: (() => void) | undefined, dead = false;
    // Loaded after hydration so GSAP, Lenis and the shader stay out of the first-paint bundle.
    import('@/lib/journey').then(({ startJourney }) => {
      if (!dead) stop = startJourney({ stage: stage.current!, glc: glc.current!, motesC: motesC.current!, scrim: scrim.current!, dimEl: dimEl.current! });
    });
    return () => {
      dead = true;
      stop?.();
    };
  }, []);

  return (
    <div id="stage" ref={stage} aria-hidden="true">
      <canvas id="gl" ref={glc} />
      <canvas id="motes" ref={motesC} />
      <div id="scrim" ref={scrim} />
      <div id="dim" ref={dimEl} />
    </div>
  );
}
