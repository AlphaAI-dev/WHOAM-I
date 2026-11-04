import { useRef } from 'react';
import { assets } from '../../config/assets';
import { colors } from '../../config/theme';
import { chapters, type ChapterId } from '../../data/chapters';
import { site } from '../../data/site';
import { useGsap } from '../../hooks/useGsap';
import { animateHero } from '../../animations/hero';
import { ArtImage } from '../ui/ArtImage';
import { BlockWipe } from '../ui/BlockWipe';

interface Props {
  onChapter: (id: ChapterId) => void;
}

/** 00 — Opening. */
export function Hero({ onChapter }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGsap(ref, animateHero);
  const name = site.name.toUpperCase();

  return (
    <section
      id="opening"
      ref={ref}
      data-section="opening"
      data-theme="light"
      aria-label="Opening"
      className="relative bg-cream"
    >
      <div data-anim="stage" className="relative h-svh min-h-[560px] w-full overflow-hidden">
        {/* Light. */}
        <div aria-hidden="true" className="absolute inset-0">
          <div className="light-pool drift" style={{ width: '75vw', height: '75vw', left: '-22vw', top: '-28vw', ['--pool' as string]: 'rgb(244 217 160 / 0.85)' }} />
          <div className="light-pool drift" style={{ width: '60vw', height: '60vw', right: '-18vw', top: '8%', ['--pool' as string]: 'rgb(200 121 44 / 0.26)', animationDelay: '-6s' }} />
          <div className="light-pool" style={{ width: '90vw', height: '42vw', left: '5vw', bottom: '-20vw', ['--pool' as string]: 'rgb(91 70 50 / 0.16)' }} />
        </div>

        {/* Giant outlined name. */}
        <div
          data-anim="ghost"
          aria-hidden="true"
          style={{ willChange: 'transform' }}
          className="outline-type pointer-events-none absolute inset-x-0 top-[13%] text-center font-display text-[31vw] leading-[0.8] tracking-[-0.04em] whitespace-nowrap text-mocha/25 select-none"
        >
          {name}
        </div>

        {/* Rohit's own statement surfaces around the portrait while the scene is pinned. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[clamp(20px,5vw,72px)] top-[30%] z-[5] hidden justify-between md:flex">
          {site.statement.map((s, i) => (
            <span
              key={s}
              data-anim="say"
              className={`font-serif text-[clamp(30px,3.6vw,58px)] leading-none text-mocha opacity-0 ${i === 1 ? 'mt-[16vh] italic' : ''} ${i === 2 ? 'mt-[6vh]' : ''}`}
            >
              {i === site.statement.length - 1 && s.endsWith('.') ? (
                <>
                  {s.slice(0, -1)}
                  <span className="text-amber">.</span>
                </>
              ) : (
                s
              )}
            </span>
          ))}
        </div>

        {/* Portrait. */}
        <figure
          data-anim="portrait"
          style={{ willChange: 'transform' }}
          className="absolute bottom-0 left-1/2 m-0 aspect-[3/4] h-[74svh] max-h-[860px] -translate-x-1/2"
        >
          <div className="intro-unveil relative h-full w-full overflow-hidden rounded-t-[999px]">
            <ArtImage
              asset={assets.portrait}
              priority
              className="absolute inset-0 h-full w-full"
              style={{
                maskImage: 'linear-gradient(to bottom, black 70%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent)',
              }}
            />
            {!assets.portrait.src && (
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(70% 55% at 50% 38%, ${colors.champagne}, transparent 70%), linear-gradient(180deg, rgb(234 219 190 / 0.9), rgb(247 238 220 / 0) 92%)`,
                }}
              />
            )}
          </div>
        </figure>

        {/* Name lockup: script over bold. */}
        <div data-anim="lockup" style={{ willChange: 'transform' }} className="pointer-events-none absolute inset-x-0 bottom-[7svh] z-10 flex flex-col items-center px-4">
          <span className="intro-write relative z-10 -mb-[0.32em] -ml-[30vw] font-script text-[clamp(40px,7vw,120px)] leading-none text-amber sm:-ml-[22vw]">
            Still becoming
          </span>
          <h1 className="m-0 overflow-hidden font-display text-[clamp(68px,15.5vw,250px)] leading-[0.9] font-extrabold tracking-[-0.03em] text-mocha">
            <span className="sr-only">{site.name}</span>
            <span aria-hidden="true" className="inline-flex">
              {name.split('').map((ch, i) => (
                <span key={i} className="intro-char" style={{ ['--i' as string]: i }}>
                  {ch}
                </span>
              ))}
            </span>
          </h1>
        </div>

        {/* Editorial details. */}
        <div className="intro-fade absolute top-24 left-[clamp(20px,5vw,72px)] z-10 flex flex-col gap-6 sm:top-28" style={{ ['--d' as string]: '1500ms' }}>
          <span className="font-display text-[42px] leading-none text-mocha/90">00</span>
          <p className="eyebrow m-0 text-mocha/70">
            A life
            <br />
            in five
            <br />
            chapters
          </p>
          <span aria-hidden="true" className="block h-px w-8 bg-mocha/40" />
        </div>

        <ul
          className="intro-fade absolute top-28 right-[clamp(20px,5vw,72px)] z-10 m-0 hidden list-none flex-col items-end gap-1.5 p-0 md:flex"
          style={{ ['--d' as string]: '1650ms' }}
        >
          {chapters.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onChapter(c.id)}
                className="eyebrow min-h-7 text-mocha/60 transition-colors hover:text-amber"
              >
                {c.num} · {c.name}
              </button>
            </li>
          ))}
        </ul>

        <div
          className="intro-fade absolute top-1/2 left-[clamp(20px,5vw,72px)] z-10 hidden -translate-y-1/2 lg:block"
          style={{ ['--d' as string]: '1800ms' }}
        >
          <div data-anim="statement-small" className="flex flex-col gap-1">
            {site.statement.map((s, i) => (
              <span key={s} className={`font-serif text-[22px] leading-tight ${i === 1 ? 'italic' : ''} text-mocha/80`}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <a
          href="#tree"
          className="intro-fade absolute bottom-8 left-[clamp(20px,5vw,72px)] z-10 hidden items-center gap-4 text-mocha/70 no-underline transition-colors hover:text-amber sm:flex"
          style={{ ['--d' as string]: '2200ms' }}
        >
          <span aria-hidden="true" className="relative block h-11 w-px overflow-hidden bg-mocha/20">
            <span className="scroll-cue absolute top-0 left-0 h-3 w-px bg-amber" />
          </span>
          <span className="eyebrow">Scroll</span>
        </a>

        <BlockWipe name="hero-out" lead={colors.amber} settle={colors.roast} />

        {/* Opening curtain: blocks that lift on first paint (CSS only). */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-40 grid grid-cols-8">
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="intro-block block h-full"
              style={{
                background: i % 3 === 1 ? colors.amber : colors.mocha,
                ['--d' as string]: `${[0, 90, 40, 140, 20, 110, 60, 160][i]}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
