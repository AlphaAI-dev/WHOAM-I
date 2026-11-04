import { useMemo, useRef, useState } from 'react';
import { assets } from '../../config/assets';
import { tree } from '../../config/layout';
import { colors, strokes } from '../../config/theme';
import { chapterById, chapters, type ChapterId } from '../../data/chapters';
import { isPlaceholder } from '../../data/site';
import { DRAW } from '../../animations/setup';
import { useGsap } from '../../hooks/useGsap';
import { animateChapterSwap, animateTree } from '../../animations/tree';
import { buildTree, type TwigGroupKey } from '../../lib/treeGeometry';
import { cubicPath, type Cubic } from '../../lib/geometry';
import { ArtImage } from '../ui/ArtImage';

interface Props {
  selected: ChapterId;
  onSelect: (id: ChapterId) => void;
  onEnter: (id: ChapterId) => void;
}

const { w: VW, h: VH } = tree.viewBox;
const pctX = (x: number) => `${(x / VW) * 100}%`;
const pctY = (y: number) => `${(y / VH) * 100}%`;
const TWIG_KEYS: TwigGroupKey[] = ['x', 'i', 'ii', 'iii', 'iv', 'v'];

/** 01 — The Founding Tree: the artwork with interactive SVG overlays, lit like a stage. */
export function FoundingTree({ selected, onSelect, onEnter }: Props) {
  const ref = useRef<HTMLElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const geo = useMemo(() => buildTree(), []);
  const [hasArt, setHasArt] = useState(!!assets.foundingTree.src);

  useGsap(ref, animateTree);
  useGsap(asideRef, animateChapterSwap, [selected]);

  const sel = chapterById[selected];
  const counts = geo.groups[selected];
  const overlayOpacity = hasArt ? tree.overlayOpacity.withArtwork : tree.overlayOpacity.withoutArtwork;
  const img = tree.image;
  const C = colors;

  return (
    <section
      id="tree"
      ref={ref}
      data-section="tree"
      data-theme="dark"
      aria-labelledby="tree-title"
      className="relative overflow-hidden bg-roast text-cream"
    >
      {/* Depth layers: stripes, beams of light, a giant numeral. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          data-depth="0.2"
          className="absolute -inset-[6%]"
          style={{
            background: `repeating-linear-gradient(90deg, ${C.roast} 0 9vw, #43321f 9vw 18vw)`,
            opacity: 0.9,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(60% 55% at 72% 8%, rgb(200 121 44 / 0.38), transparent 70%), radial-gradient(50% 50% at 50% 100%, rgb(33 23 15 / 0.9), transparent 75%), linear-gradient(180deg, rgb(91 70 50 / 0.5), rgb(33 23 15 / 0.85))`,
          }}
        />
        <div data-depth="0.5" className="beams drift absolute -inset-[10%]" />
        <div
          data-depth="0.35"
          className="outline-type absolute top-[18%] -right-[6vw] origin-center rotate-90 font-display text-[22vw] leading-none text-champagne/15 select-none"
        >
          01
        </div>
        {/* Continues the roast of the opening's wipe, so the hand-off has no seam. */}
        <div className="absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-roast via-roast/70 to-transparent" />
      </div>

      <div className="relative flex min-h-svh flex-col gap-8 px-[clamp(20px,5vw,72px)] pt-28 pb-16">
        <header className="flex flex-col gap-3">
          <span data-reveal className="eyebrow text-amber">
            01 — The Founding Tree
          </span>
          <h2 id="tree-title" data-reveal className="m-0 max-w-[16ch] font-serif text-[clamp(38px,5vw,76px)] leading-[0.95] font-normal">
            Where every <em className="gold-text shimmer not-italic">chapter</em> grows from
          </h2>
        </header>

        <div className="flex flex-1 flex-wrap items-center gap-8">
          {/* Stage: artwork + overlays share one coordinate space. */}
          <div className="flex min-w-0 flex-[999_1_640px] justify-center">
            <div data-anim="stage" data-depth="-0.25" className="relative aspect-[1000/760] w-full max-w-[1000px]">
              <ArtImage
                asset={assets.foundingTree}
                onMissing={() => setHasArt(false)}
                className="absolute h-auto w-auto"
                style={{ left: pctX(img.x), top: pctY(img.y), width: pctX(img.w), height: pctY(img.h) }}
                placeholderClassName="text-champagne/50"
              />

              {/* Static drawing: ground, trunk, twigs, branches. Repaints only when a branch is selected. */}
              <svg
                viewBox={`0 0 ${VW} ${VH}`}
                aria-hidden="true"
                className="absolute inset-0 h-full w-full"
                style={{ opacity: overlayOpacity }}
              >
                <defs>
                  <radialGradient id="tree-glow">
                    <stop offset="0" stopColor={C.amber} stopOpacity="0.45" />
                    <stop offset="1" stopColor={C.amber} stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="trunk-grad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" stopColor={C.amber} />
                    <stop offset="1" stopColor={C.champagne} />
                  </linearGradient>
                </defs>

                {/* A pool of light where the tree meets the ground. */}
                <ellipse cx="500" cy="600" rx="300" ry="70" fill="url(#tree-glow)" />
                <line x1={tree.ground.x1} y1={tree.ground.y} x2={tree.ground.x2} y2={tree.ground.y} stroke={C.champagne} strokeOpacity={0.18} />

                <g fill="none" strokeLinecap="round">
                  <path d={cubicPath(tree.trunk as Cubic)} stroke={C.champagne} strokeOpacity={0.12} strokeWidth={10} />
                  <path data-anim="trunk" d={cubicPath(tree.trunk as Cubic)} pathLength={DRAW} stroke="url(#trunk-grad)" strokeWidth={2.4} />

                  <g data-anim="twigs">
                    {TWIG_KEYS.map((k) => {
                      const on = k === selected;
                      const g = geo.groups[k];
                      return (
                        <g key={k} stroke={C.champagne} strokeWidth={strokes.twig}>
                          {g.n && <path d={g.n} className="sb-tw" style={{ strokeOpacity: on ? 0.75 : 0.32 }} />}
                          {g.d && <path d={g.d} className="sb-tw" style={{ strokeOpacity: on ? 0.22 : 0.1 }} />}
                        </g>
                      );
                    })}
                  </g>

                  {chapters.map((c) => {
                    const on = c.id === selected;
                    const d = cubicPath(tree.branches[c.id].path as Cubic);
                    return (
                      <g key={c.id}>
                        <path d={d} strokeWidth={9} className="sb-tw" style={{ stroke: C.ember, strokeOpacity: on ? 0.22 : 0 }} />
                        <path
                          data-anim="branch"
                          d={d}
                          pathLength={DRAW}
                          strokeWidth={on ? 2 : strokes.branch}
                          className="sb-tw"
                          style={{ stroke: on ? C.ember : C.champagne, strokeOpacity: on ? 1 : 0.55 }}
                        />
                      </g>
                    );
                  })}
                </g>

                <g data-anim="leaves">
                  {geo.leaves
                    .filter((lf) => lf.kind === 'dark')
                    .map((lf, i) => (
                      <circle key={i} cx={lf.x} cy={lf.y} r={2.5} fill={C.roast} stroke={C.champagne} strokeOpacity={0.3} />
                    ))}
                </g>
              </svg>

              {/* Glowing layer: roots, lit aspects. It breathes as one GPU layer, so the loop costs no repaint. */}
              <svg
                viewBox={`0 0 ${VW} ${VH}`}
                aria-hidden="true"
                data-anim="breathe"
                className="pointer-events-none absolute inset-0 h-full w-full"
                style={{ willChange: 'opacity' }}
              >
                <g style={{ opacity: overlayOpacity }}>
                  <g data-anim="roots" fill="none" stroke={C.amber} strokeLinecap="round">
                    <path d={geo.roots} strokeWidth={6} strokeOpacity={0.12} />
                    <path d={geo.roots} strokeWidth={1.1} strokeOpacity={0.9} />
                  </g>
                  <g data-anim="lit" fill="none" strokeLinecap="round" stroke={C.ember}>
                    <path d={TWIG_KEYS.map((k) => geo.groups[k].l).join(' ')} strokeOpacity={0.14} strokeWidth={6} />
                    {TWIG_KEYS.map((k) =>
                      geo.groups[k].l ? (
                        <path key={k} d={geo.groups[k].l} strokeWidth={1} className="sb-tw" style={{ strokeOpacity: k === selected ? 1 : 0.7 }} />
                      ) : null,
                    )}
                  </g>
                  <g data-anim="leaves" fill={C.ember}>
                    {geo.leaves
                      .filter((lf) => lf.kind === 'lit')
                      .map((lf, i) => (
                        <g key={i}>
                          <circle cx={lf.x} cy={lf.y} r={7} fillOpacity={0.2} />
                          <circle cx={lf.x} cy={lf.y} r={2.6} />
                        </g>
                      ))}
                  </g>
                </g>
              </svg>

              {/* Drifting motes of light: HTML, so their motion stays on the compositor. */}
              {tree.particles.map((p, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  data-anim="particle"
                  className="pointer-events-none absolute rounded-full"
                  style={{
                    left: pctX(p.x),
                    top: pctY(p.y),
                    width: p.r * 3,
                    height: p.r * 3,
                    background: p.accent ? C.ember : C.champagne,
                    opacity: p.o + 0.2,
                    boxShadow: `0 0 8px 1px ${p.accent ? 'rgb(232 154 75 / 0.6)' : 'rgb(244 217 160 / 0.5)'}`,
                    willChange: 'transform',
                  }}
                />
              ))}

              {/* Chapter markers: real buttons on the branch tips. */}
              {chapters.map((c) => {
                const on = c.id === selected;
                const b = tree.branches[c.id];
                const left = b.labelSide === 'left';
                return (
                  <div
                    key={c.id}
                    className="absolute"
                    style={{
                      left: pctX(b.path[6]),
                      top: pctY(b.path[7]),
                      transform: left ? 'translate(calc(-100% + 22px), -50%)' : 'translate(-22px, -50%)',
                    }}
                  >
                    <button
                      type="button"
                      data-anim="marker"
                      onClick={() => onSelect(c.id)}
                      aria-pressed={on}
                      aria-label={`Chapter ${c.num}: ${c.name}`}
                      className={`group flex min-h-11 items-center gap-1.5 p-2.5 ${left ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center">
                        <span
                          className="block rounded-full transition-all duration-500"
                          style={
                            on
                              ? { width: 12, height: 12, background: C.ember, boxShadow: `0 0 0 6px rgb(232 154 75 / 0.2), 0 0 24px 4px rgb(232 154 75 / 0.6)` }
                              : { width: 7, height: 7, background: C.champagne }
                          }
                        />
                      </span>
                      <span className="flex items-baseline gap-2 rounded-full bg-espresso/70 px-3 py-1 whitespace-nowrap ring-1 ring-champagne/10 transition-colors group-hover:ring-amber/50">
                        <span className="eyebrow text-champagne/60">{c.num}</span>
                        <span className={`hidden font-serif text-[21px] leading-none transition-colors duration-500 sm:inline ${on ? 'text-champagne' : 'text-cream/60'}`}>
                          {c.name}
                        </span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected chapter. */}
          <aside ref={asideRef} aria-live="polite" className="flex max-w-[380px] flex-[1_1_280px] flex-col gap-5 pb-6">
            <span data-anim="swap" className="eyebrow text-amber">
              Chapter {sel.num}
            </span>
            <h3 data-anim="swap" className="gold-text m-0 font-serif text-[clamp(48px,5vw,80px)] leading-[0.9] font-normal">
              {sel.name}
            </h3>
            <p data-anim="swap" className="m-0 text-base leading-[1.65] text-cream/70">
              {sel.summary}
            </p>
            {isPlaceholder(sel.summary) && (
              <span data-anim="swap" className="placeholder-tag self-start text-champagne/70">
                Placeholder · src/data/chapters.ts
              </span>
            )}
            <div data-anim="swap" className="eyebrow flex gap-6 text-cream/60">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-ember shadow-[0_0_10px_2px_rgba(232,154,75,0.6)]" />
                {counts.lit} glowing
              </span>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 rounded-full border border-champagne/40" />
                {counts.dark} dark
              </span>
            </div>
            <button data-anim="swap" type="button" onClick={() => onEnter(sel.id)} className="pill self-start text-champagne">
              Enter chapter
              <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden="true" fill="none" stroke="currentColor">
                <path d="M0 4 H15 M11 1 L15 4 L11 7" />
              </svg>
            </button>
          </aside>
        </div>

        <p className="eyebrow m-0 text-cream/40">Select a branch · the small ones are aspects: some glow, some stay dark</p>
      </div>
    </section>
  );
}
