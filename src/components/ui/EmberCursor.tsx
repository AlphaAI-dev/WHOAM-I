import { useEffect, useRef } from 'react';
import { gsap } from '../../animations/setup';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * A small amber light that follows the pointer with a little lag and swells
 * over anything clickable: the recurring motif of the site.
 * Mouse and pen only; never on touch screens or under reduced motion.
 */
export function EmberCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !window.matchMedia('(pointer: fine)').matches) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
    let shown = false;
    let big = false;

    const move = (e: PointerEvent) => {
      if (!shown) {
        gsap.set(el, { x: e.clientX, y: e.clientY });
        gsap.to(el, { opacity: 1, duration: 0.4 });
        shown = true;
      }
      x(e.clientX);
      y(e.clientY);
      const over = !!(e.target as Element | null)?.closest?.('a, button');
      if (over !== big) {
        big = over;
        gsap.to(el, { scale: over ? 3.2 : 1, duration: 0.45, ease: 'power3.out' });
      }
    };
    const leave = () => {
      shown = false;
      gsap.to(el, { opacity: 0, duration: 0.3 });
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[70] -mt-1.5 -ml-1.5 size-3 rounded-full opacity-0"
      style={{
        background: 'radial-gradient(circle, #E89A4B 0 35%, rgb(200 121 44 / 0.35) 36%, transparent 70%)',
        willChange: 'transform',
      }}
    />
  );
}
