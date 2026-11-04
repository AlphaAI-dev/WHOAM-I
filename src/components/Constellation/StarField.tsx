import { useEffect, useRef } from 'react';
import { constellation } from '../../config/layout';
import { colors, motion } from '../../config/theme';
import { seeded } from '../../lib/geometry';
import { gsap } from '../../animations/setup';

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  phase: number;
  drift: number;
  warm: boolean;
}

function makeStars(): Star[] {
  const rnd = seeded(constellation.starSeed);
  return Array.from({ length: constellation.starCount }, () => ({
    x: rnd(),
    y: rnd(),
    r: rnd() < 0.85 ? 0.5 : 1,
    o: 0.15 + rnd() * 0.45,
    phase: rnd(),
    drift: rnd() * Math.PI * 2,
    warm: rnd() < 0.35,
  }));
}

/**
 * One canvas layer of stars that twinkle slowly and drift a pixel or two.
 * Static when reduced motion is requested.
 */
export function StarField({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const stars = makeStars();
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const period = motion.ambient.twinkle;
      for (const s of stars) {
        // Twinkle between full and 35% of the star's own brightness.
        const k = reduced ? 1 : 1 - 0.65 * (0.5 - 0.5 * Math.cos(((t / period + s.phase) % 1) * Math.PI * 2));
        const dx = reduced ? 0 : Math.sin(t / 14 + s.drift) * 1.5;
        const dy = reduced ? 0 : Math.cos(t / 17 + s.drift) * 1.5;
        ctx.globalAlpha = s.o * k;
        ctx.fillStyle = s.warm ? colors.champagne : '#FFF8EC';
        ctx.beginPath();
        ctx.arc(s.x * w + dx, s.y * h + dy, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    resize();
    draw(0);
    const ro = new ResizeObserver(() => {
      resize();
      draw(gsap.ticker.time);
    });
    ro.observe(canvas);

    const tick = (time: number) => draw(time);
    if (!reduced) gsap.ticker.add(tick);
    return () => {
      ro.disconnect();
      gsap.ticker.remove(tick);
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
