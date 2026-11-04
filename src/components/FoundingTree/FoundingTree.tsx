import { useMemo, useRef, useState } from 'react';
import { assets } from '../../config/assets';
import { tree } from '../../config/layout';
import { colors, strokes } from '../../config/theme';
import { chapterAnchor, chapterById, chapters, type ChapterId } from '../../data/chapters';
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

/** 01 — The Founding Tree: the artwork with interactive SVG overlays. */
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

  return (
    <section
      id="tree"
      data-section="tree"
      ref={ref}
      aria-labelledby="tree-title"
      className="relative flex min-h-svh flex-col gap-6 overflow-hidden px-[clamp(20px,5vw,72px)] pt-28 pb-16"
    >
      <h2 id="tree-title" className="sr-only">
        The Founding Tree
      </h2>

      <div className="flex flex-1 flex-wrap items-center gap-8">
        {/* Stage: artwork + overlays share one coordinate space. */}
        <div className="flex min-w-0 flex-[999_1_640px] justify-center">
          <div data-anim="stage" className="relative aspect-[1000/760] w-full max-w-[1000px]">
            <ArtImage
              asset={assets.foundingTree}
              onMissing={() => setHasArt(false)}
              className="absolute h-auto w-auto"
              style={{
                left: pctX(img.x),
                top: pctY(img.y),
                width: pctX(img.w),
                height: pctY(img.h),
                borderRadius: hasArt ? undefined : 8,
              }}
            />

            <svg
              viewBox={`0 0 ${VW} ${VH}`}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              style={{ opacity: overlayOpacity }}
            >
              <line
                x1={tree.ground.x1}
                y1={tree.ground.y}
                x2={tree.ground.x2}
                y2={tree.ground.y}
                stroke={colors.paper}
                strokeOpacity={0.1}
              />

              {/* Roots: the one orange that is always lit. */}
              <g data-anim="roots" fill="none" stroke={colors.accent} strokeLinecap="round">
                <g data-anim="breathe">
                  <path d={geo.roots} strokeWidth={5} strokeOpacity={0.07} />
                  <path d={geo.roots} strokeWidth={1} strokeOpacity={0.65} />
                </g>
              </g>

              <g fill="none" strokeLinecap="round">
                <path
                  data-anim="trunk"
                  d={cubicPath(tree.trunk as Cubic)}
                  pathLength={DRAW}
                  stroke={colors.paper}
                  strokeOpacity={0.4}
                  strokeWidth={2}
                />

                {/* Neutral and dark twigs. */}
                <g data-anim="twigs">
                  {TWIG_KEYS.map((k) => {
                    const on = k === selected;
                    const g = geo.groups[k];
                    return (
                      <g key={k} stroke={colors.paper} strokeWidth={strokes.twig}>
                        {g.n && <path d={g.n} className="sb-tw" style={{ strokeOpacity: on ? 0.62 : 0.26 }} />}
                        {g.d && <path d={g.d} className="sb-tw" style={{ strokeOpacity: on ? 0.16 : 0.08 }} />}
                      </g>
                    );
                  })}
                </g>

                {/* Lit twigs: aspects that glow. */}
                <g data-anim="lit">
                  <g data-anim="breathe" stroke={colors.accent}>
                    <path
                      d={TWIG_KEYS.map((k) => geo.groups[k].l).join(' ')}
                      strokeOpacity={0.08}
                      strokeWidth={5}
                    />
                    {TWIG_KEYS.map((k) =>
                      geo.groups[k].l ? (
                        <path
                          key={k}
                          d={geo.groups[k].l}
                          strokeWidth={0.9}
                          className="sb-tw"
                          style={{ strokeOpacity: k === selected ? 1 : 0.75 }}
                        />
                      ) : null,
                    )}
                  </g>
                </g>

                {/* Chapter branches. Only the selected one is orange. */}
                {chapters.map((c) => {
                  const on = c.id === selected;
                  return (
                    <path
                      key={c.id}
                      data-anim="branch"
                      d={cubicPath(tree.branches[c.id].path as Cubic)}
                      pathLength={DRAW}
                      strokeWidth={strokes.branch}
                      className="sb-tw"
                      style={{ stroke: on ? colors.accent : colors.paper, strokeOpacity: on ? 0.95 : 0.45 }}
                    />
                  );
                })}
              </g>

              {/* Aspect end points: lit ones glow, dark ones stay hollow. */}
              <g data-anim="leaves">
                {geo.leaves.map((lf, i) =>
                  lf.kind === 'lit' ? (
                    <g key={i} data-anim="glow-leaf" fill={colors.accent}>
                      <circle cx={lf.x} cy={lf.y} r={6} fillOpacity={0.16} />
                      <circle cx={lf.x} cy={lf.y} r={2.5} />
                    </g>
                  ) : (
                    <circle
                      key={i}
                      cx={lf.x}
                      cy={lf.y}
                      r={2.5}
                      fill={colors.ink}
                      stroke={colors.paper}
                      strokeOpacity={0.18}
                    />
                  ),
                )}
              </g>

              <g>
                {tree.particles.map((p, i) => (
                  <circle
                    key={i}
                    data-anim="particle"
                    cx={p.x}
                    cy={p.y}
                    r={p.r}
                    fill={p.accent ? colors.accent : colors.paper}
                    fillOpacity={p.o}
                  />
                ))}
              </g>
            </svg>

            {/* Chapter markers: real buttons positioned on the branch tips. */}
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
                  className={`flex min-h-11 items-center gap-1.5 p-2.5 ${left ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center">
                    <span
                      className="block rounded-full transition-all duration-500"
                      style={
                        on
                          ? { width: 10, height: 10, background: colors.accent, boxShadow: '0 0 0 6px rgba(255,90,31,0.16)' }
                          : { width: 7, height: 7, background: colors.paper }
                      }
                    />
                  </span>
                  <span className="flex items-baseline gap-2 rounded bg-ink/85 px-2 py-0.5 whitespace-nowrap">
                    <span className="label text-quiet">{c.num}</span>
                    <span
                      className={`hidden font-serif text-[22px] leading-none transition-colors duration-500 sm:inline ${
                        on ? 'text-paper' : 'text-quiet'
                      }`}
                    >
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
        <aside
          ref={asideRef}
          aria-live="polite"
          className="flex max-w-[360px] flex-[1_1_280px] flex-col gap-4 pb-6"
        >
          <span data-anim="swap" className="label text-[12px] tracking-[0.16em] text-accent">
            Chapter {sel.num}
          </span>
          <h3 data-anim="swap" className="m-0 font-serif text-[clamp(40px,4vw,56px)] leading-none font-normal">
            {sel.name}
          </h3>
          <p data-anim="swap" className="m-0 text-base leading-[1.6] text-quiet">
            {sel.summary}
          </p>
          {isPlaceholder(sel.summary) && (
            <span data-anim="swap" className="placeholder-tag self-start">
              Placeholder · src/data/chapters.ts
            </span>
          )}
          <div data-anim="swap" className="label flex gap-5 tracking-[0.12em] text-quiet normal-case">
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_1px_rgba(255,90,31,0.4)]"
              />
              {counts.lit} glowing
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="size-1.5 rounded-full border border-paper/30" />
              {counts.dark} dark
            </span>
          </div>
          <a
            data-anim="swap"
            href={`#${chapterAnchor(sel.id)}`}
            onClick={(e) => {
              e.preventDefault();
              onEnter(sel.id);
            }}
            className="cta self-start"
          >
            Enter chapter →
          </a>
        </aside>
      </div>

      <p className="label m-0 tracking-[0.12em] text-quiet normal-case">
        Select a branch. The small ones are aspects: some glow, some stay dark.
      </p>
    </section>
  );
}
