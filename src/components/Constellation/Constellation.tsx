import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { constellation as C } from '../../config/layout';
import { colors } from '../../config/theme';
import { chapterById, chapters, type ChapterId } from '../../data/chapters';
import { DRAW } from '../../animations/setup';
import { useGsap } from '../../hooks/useGsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { animateMapClose, animateMapOpen } from '../../animations/constellation';
import { StarField } from './StarField';

interface Props {
  selected: ChapterId;
  onSelect: (id: ChapterId) => void;
  /** Close the map (after its closing animation). */
  onClose: () => void;
  /** Close the map and go to a chapter. */
  onNavigate: (id: ChapterId) => void;
}

const { w: VW, h: VH } = C.viewBox;

/**
 * Full-screen constellation: an alternative way to move through the site.
 * Each point is a chapter; selecting one shows how it connects, and
 * "Go to chapter" takes you there. Close (or Escape) returns to where you were.
 */
export default function Constellation({ selected, onSelect, onClose, onNavigate }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<ChapterId | null>(null);
  const closing = useRef(false);

  useGsap(ref, animateMapOpen);

  // Unique edges from each chapter's links.
  const edges = useMemo(() => {
    const seen = new Set<string>();
    const out: [ChapterId, ChapterId][] = [];
    for (const c of chapters)
      for (const l of c.links) {
        const k = [c.id, l].sort().join('-');
        if (!seen.has(k) && chapterById[l]) {
          seen.add(k);
          out.push([c.id, l]);
        }
      }
    return out;
  }, []);

  const act = hover ?? selected;
  const near = new Set(edges.filter((e) => e.includes(act)).flat());
  const active = chapterById[act];
  const linkedNames = chapters.filter((c) => c.id !== act && near.has(c.id)).map((c) => c.name);

  const close = useCallback(
    (then?: () => void) => {
      if (closing.current || !ref.current) return;
      closing.current = true;
      animateMapClose(ref.current, reduced, then ?? onClose);
    },
    [onClose, reduced],
  );

  // Escape closes; Tab stays inside the dialog; the page behind doesn't scroll.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    root.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'Tab') {
        const items = Array.from(root.querySelectorAll<HTMLElement>('button, a[href]'));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [close]);

  return (
    <div
      ref={ref}
      id="constellation-map"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-title"
      className="sky-nebula fixed inset-0 z-[55] flex flex-col gap-6 overflow-y-auto px-[clamp(20px,5vw,72px)] pt-5 pb-8 text-cream"
    >
      <StarField reduced={reduced} />

      <header className="relative flex items-center justify-between gap-4">
        <h2 id="map-title" className="eyebrow m-0 font-medium text-champagne/70">
          Still Becoming · Map
        </h2>
        <button
          type="button"
          onClick={() => close()}
          aria-label="Close map and return to the page"
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2.5 text-cream/70 transition-colors hover:text-champagne"
        >
          <span className="eyebrow">Close</span>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1 1 L13 13 M13 1 L1 13" />
          </svg>
        </button>
      </header>

      <div className="relative flex flex-1 flex-wrap-reverse items-end gap-8 md:flex-wrap">
        {/* Chapter details. */}
        <div data-anim="panel" aria-live="polite" className="flex max-w-[380px] flex-[1_1_300px] flex-col gap-4 pb-2 md:pb-6">
          <span className="eyebrow text-amber">Chapter {active.num}</span>
          <p className="gold-text m-0 font-serif text-[clamp(48px,5vw,80px)] leading-[0.95]">{active.name}</p>
          <p className="m-0 text-base leading-[1.6] text-cream/65">
            {linkedNames.length ? `Connected to ${joinNames(linkedNames)}.` : 'Not connected to anything yet.'}
          </p>
          <button
            type="button"
            onClick={() => close(() => onNavigate(act))}
            className="pill self-start text-champagne"
          >
            Go to chapter
            <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden="true" fill="none" stroke="currentColor">
              <path d="M0 4 H15 M11 1 L15 4 L11 7" />
            </svg>
          </button>
        </div>

        {/* The map. */}
        <div className="min-w-0 flex-[999_1_560px] self-center">
          <div className="relative mx-auto aspect-[1000/640] w-full max-w-[1000px]">
            <svg viewBox={`0 0 ${VW} ${VH}`} aria-hidden="true" className="absolute inset-0 h-full w-full">
              <g fill="none" strokeWidth={1}>
                {edges.map(([a, b]) => {
                  const on = a === act || b === act;
                  return (
                    <line
                      key={`${a}-${b}`}
                      data-anim="edge"
                      pathLength={DRAW}
                      x1={C.points[a].x}
                      y1={C.points[a].y}
                      x2={C.points[b].x}
                      y2={C.points[b].y}
                      className="sb-tw"
                      style={{ stroke: on ? colors.ember : colors.champagne, strokeOpacity: on ? 0.9 : 0.2 }}
                    />
                  );
                })}
                <line
                  data-anim="tail"
                  x1={C.points.vi.x}
                  y1={C.points.vi.y}
                  x2={C.tail.x}
                  y2={C.tail.y}
                  stroke={colors.champagne}
                  strokeOpacity={0.25}
                  strokeDasharray="2 6"
                />
              </g>
            </svg>

            {chapters.map((c) => {
              const p = C.points[c.id];
              const on = c.id === act;
              const lit = on || near.has(c.id);
              const left = p.labelSide === 'left';
              return (
                <div
                  key={c.id}
                  className="absolute"
                  style={{
                    left: `${(p.x / VW) * 100}%`,
                    top: `${(p.y / VH) * 100}%`,
                    transform: left ? 'translate(calc(-100% + 22px), -50%)' : 'translate(-22px, -50%)',
                  }}
                >
                <button
                  type="button"
                  data-anim="point"
                  onClick={() => onSelect(c.id)}
                  onDoubleClick={() => close(() => onNavigate(c.id))}
                  onMouseEnter={() => setHover(c.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(c.id)}
                  onBlur={() => setHover(null)}
                  aria-pressed={c.id === selected}
                  aria-label={`Chapter ${c.num}: ${c.name}`}
                  className={`flex min-h-11 items-center gap-2 p-2.5 ${left ? 'flex-row-reverse' : ''}`}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center">
                    <span
                      className="block rounded-full transition-all duration-500"
                      style={
                        on
                          ? { width: 12, height: 12, background: colors.ember, boxShadow: '0 0 0 7px rgb(232 154 75 / 0.18), 0 0 28px 6px rgb(232 154 75 / 0.55)' }
                          : { width: lit ? 7 : 5, height: lit ? 7 : 5, background: colors.champagne, opacity: lit ? 1 : 0.6, boxShadow: lit ? '0 0 12px 2px rgb(244 217 160 / 0.4)' : 'none' }
                      }
                    />
                  </span>
                  <span
                    className={`eyebrow whitespace-nowrap transition-colors duration-500 ${lit ? 'text-champagne' : 'text-cream/45'}`}
                  >
                    {c.num}
                    <span className="hidden sm:inline"> · {c.name}</span>
                  </span>
                </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="eyebrow relative m-0 text-cream/40">
        Select a point, then go to its chapter. Esc or Close returns you to the page.
      </p>
    </div>
  );
}

function joinNames(names: string[]) {
  if (names.length < 2) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
