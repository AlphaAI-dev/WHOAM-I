import { useRef } from 'react';
import { site } from '../../data/site';
import { useGsap } from '../../hooks/useGsap';
import { animateClosing } from '../../animations/closing';

/** 03 — Unwritten: a near-black, unfinished ending with one warm light. */
export function Closing() {
  const ref = useRef<HTMLElement>(null);
  useGsap(ref, animateClosing);
  const [first, second] = site.closing;

  return (
    <section
      id="closing"
      ref={ref}
      data-section="closing"
      data-theme="dark"
      aria-label="The unfinished chapter"
      className="relative flex min-h-svh flex-col items-center overflow-hidden bg-night px-[clamp(20px,5vw,72px)] pb-[16svh] text-cream"
    >
      {/* Hand-off from the night sky, and one ember of light. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#170f09] to-night" />
      <div
        aria-hidden="true"
        data-anim="ember"
        className="pointer-events-none absolute top-[58%] left-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgb(200 121 44 / 0.28), rgb(91 70 50 / 0.12) 40%, transparent 70%)' }}
      />

      {/* Your line, continuing unwritten. */}
      <div
        aria-hidden="true"
        data-anim="thread"
        className="relative h-[30svh] w-px"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgb(244 217 160 / 0.7) 0 2px, transparent 2px 9px)',
          backgroundSize: '1px 9px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent)',
        }}
      />

      <div className="relative mt-[8svh] flex max-w-[min(100%,52rem)] flex-col items-center gap-6 text-center text-balance">
        <span data-anim="sentence" className="eyebrow text-amber">
          03 — Unwritten
        </span>
        <p data-anim="sentence" className="m-0 font-serif text-[clamp(40px,6vw,96px)] leading-[1] text-cream">
          {first}
        </p>
        <p data-anim="sentence" className="gold-text shimmer m-0 px-4 font-script text-[clamp(48px,7vw,112px)] leading-[1.25]">
          {second}
        </p>
      </div>

      <a href="#opening" className="eyebrow relative mt-[10svh] inline-flex min-h-11 items-center gap-3 text-cream/50 no-underline transition-colors hover:text-champagne">
        <span aria-hidden="true">↑</span> Back to the beginning
      </a>
    </section>
  );
}
