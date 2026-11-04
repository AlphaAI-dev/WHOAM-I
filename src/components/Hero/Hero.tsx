import { useRef } from 'react';
import { assets } from '../../config/assets';
import { site } from '../../data/site';
import { useGsap } from '../../hooks/useGsap';
import { animateHero } from '../../animations/hero';
import { ArtImage } from '../ui/ArtImage';

/** 00 — Opening: the portrait and the statement. */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  useGsap(ref, animateHero);

  const lastIdx = site.statement.length - 1;

  return (
    <section
      id="opening"
      data-section="opening"
      ref={ref}
      aria-label="Opening"
      className="relative flex min-h-svh flex-col overflow-hidden px-[clamp(20px,5vw,72px)] pt-24 pb-8"
    >
      <div
        data-anim="hero-inner"
        className="flex flex-1 flex-wrap items-end gap-x-[clamp(32px,6vw,96px)] gap-y-10"
      >
        <figure
          data-anim="portrait"
          className="relative m-0 aspect-[3/4] w-[clamp(200px,24vw,340px)] shrink-0 overflow-hidden border border-paper/14 bg-surface"
        >
          <ArtImage asset={assets.portrait} priority className="absolute inset-0 h-full w-full" />
          <span aria-hidden="true" className="absolute top-4 left-4 size-1.5 rounded-full bg-accent" />
        </figure>

        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-9 pb-2">
          <h1
            data-anim="name"
            className="m-0 font-serif text-[clamp(56px,8.4vw,136px)] leading-[0.92] font-normal tracking-[-0.02em]"
          >
            {site.name}
          </h1>
          <p className="m-0 flex flex-col font-serif text-[clamp(26px,2.6vw,40px)] leading-[1.2]">
            {site.statement.map((line, i) => (
              <span key={line} data-anim="line" className={i === 1 ? 'italic' : undefined}>
                {i === lastIdx && line.endsWith('.') ? (
                  <>
                    {line.slice(0, -1)}
                    <span className="text-accent">.</span>
                  </>
                ) : (
                  line
                )}
              </span>
            ))}
          </p>
        </div>
      </div>

      <a
        href="#tree"
        data-anim="cue"
        className="mt-12 inline-flex items-center gap-4 self-start text-quiet no-underline transition-colors hover:text-paper"
      >
        <span aria-hidden="true" className="relative block h-14 w-px overflow-hidden bg-paper/18">
          <span className="scroll-cue absolute top-0 left-0 h-3.5 w-px bg-accent" />
        </span>
        <span className="label text-[12px] tracking-[0.16em]">Scroll to enter</span>
      </a>
    </section>
  );
}
