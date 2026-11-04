import { useRef } from 'react';
import { site } from '../../data/site';
import { useGsap } from '../../hooks/useGsap';
import { animateClosing } from '../../animations/closing';

/** V — Unwritten: a near-black, unfinished ending. */
export function Closing() {
  const ref = useRef<HTMLElement>(null);
  useGsap(ref, animateClosing);
  const [first, second] = site.closing;

  return (
    <section
      id="closing"
      data-section="closing"
      ref={ref}
      aria-label="The unfinished chapter"
      className="relative flex min-h-svh flex-col items-center bg-night px-[clamp(20px,5vw,72px)] pb-[18svh]"
    >
      {/* Soft hand-off from the ink of the timeline to near-black. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ink to-night" />

      {/* Your line, continuing unwritten. */}
      <div
        aria-hidden="true"
        data-anim="thread"
        className="relative h-[34svh] w-px"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgb(242 239 232 / 0.5) 0 2px, transparent 2px 8px)',
          backgroundSize: '1px 8px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent)',
        }}
      />

      <div className="relative mt-[8svh] flex max-w-[min(100%,46rem)] flex-col items-center gap-8 text-center text-balance">
        <p data-anim="sentence" className="m-0 font-serif text-[clamp(34px,5vw,72px)] leading-[1.05]">
          {first}
        </p>
        <p data-anim="sentence" className="m-0 font-serif text-[clamp(24px,2.6vw,36px)] leading-[1.2] text-quiet">
          {second.endsWith('.') ? second.slice(0, -1) : second}
          <span data-anim="light" className="text-accent">
            .
          </span>
        </p>
      </div>
    </section>
  );
}
