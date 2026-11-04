import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { colors, strokes } from '../../config/theme';
import { chapters, chapterAnchor, type ChapterId } from '../../data/chapters';
import { people } from '../../data/people';
import { moments } from '../../data/timeline';
import { layoutTimeline } from '../../lib/timelineLayout';
import { useGsap } from '../../hooks/useGsap';
import { animateTimeline } from '../../animations/timeline';
import { ScrollTrigger, DRAW } from '../../animations/setup';
import { DetailPanel, type Selection } from './DetailPanel';
import { Legend } from './Legend';

interface Props {
  onNavigate: (id: ChapterId) => void;
}

/** Width at which the graph switches to its roomier arrangement. */
const WIDE = 600;

/** 02 — Life timeline: your line, and the people who joined it. */
export function LifeTimeline({ onNavigate }: Props) {
  const ref = useRef<HTMLElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [selection, setSelection] = useState<Selection>(null);

  // Measure the graph column; the geometry is computed in real pixels so lines stay crisp.
  useLayoutEffect(() => {
    const el = graphRef.current;
    if (!el) return;
    setWidth(Math.round(el.getBoundingClientRect().width));
    let frame = 0;
    const ro = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const w = Math.round(entry.contentRect.width);
        // Ignore sub-20px jitter (scrollbars, mobile toolbars) to avoid rebuilding animations.
        setWidth((prev) => (Math.abs(prev - w) > 20 ? w : prev));
      });
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  const geo = useMemo(
    () => (width > 0 ? layoutTimeline(width, width >= WIDE, chapters, people, moments) : null),
    [width],
  );

  useGsap(ref, (ctx) => animateTimeline(ctx, geo), [geo]);
  // The graph's height shifts everything below it: recalculate all scroll triggers.
  useLayoutEffect(() => {
    if (geo) ScrollTrigger.refresh();
  }, [geo]);

  const selectedId = selection?.kind === 'person' ? selection.person.id : selection?.kind === 'moment' ? selection.moment.id : null;
  const anySel = selectedId !== null;
  const lineStyle = (id: string) =>
    id === selectedId
      ? { stroke: colors.accent, strokeOpacity: 1 }
      : { stroke: colors.paper, strokeOpacity: anySel ? 0.35 : 0.7 };
  const toggle = (next: NonNullable<Selection>) => {
    const id = next.kind === 'person' ? next.person.id : next.moment.id;
    setSelection(id === selectedId ? null : next);
  };
  const wide = width >= WIDE;

  return (
    <section
      id="timeline"
      data-section="timeline"
      ref={ref}
      aria-labelledby="timeline-title"
      className="relative px-[clamp(20px,5vw,72px)] pt-28 pb-24"
    >
      <div className="mb-10 flex flex-col gap-4 lg:mb-14">
        <span data-reveal className="label text-[12px] tracking-[0.16em] text-accent">
          02 — Life timeline
        </span>
        <h2 id="timeline-title" data-reveal className="m-0 font-serif text-[clamp(40px,5vw,72px)] leading-none font-normal">
          Lines that joined mine
        </h2>
        <div data-reveal>
          <Legend />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <div ref={graphRef} className="relative min-w-0">
          {geo && (
            <div data-anim="graph" className="relative" style={{ height: geo.height }}>
              <svg
                width={geo.width}
                height={geo.height}
                viewBox={`0 0 ${geo.width} ${geo.height}`}
                aria-hidden="true"
                className="absolute inset-0"
              >
                <g fill="none" strokeLinecap="round">
                  {/* Your line. */}
                  <path
                    data-anim="you"
                    d={`M${geo.cx} ${geo.top} L${geo.cx} ${geo.bottom}`}
                    pathLength={DRAW}
                    stroke={colors.paper}
                    strokeWidth={strokes.you}
                  />
                  <path
                    data-anim="unwritten"
                    d={`M${geo.cx} ${geo.bottom + 6} L${geo.cx} ${geo.bottom + 56}`}
                    stroke={colors.paper}
                    strokeOpacity={0.5}
                    strokeWidth={strokes.you}
                    strokeDasharray="2 6"
                  />

                  {/* People. */}
                  {geo.people.map((p) => {
                    const st = lineStyle(p.person.id);
                    return (
                      <g key={p.person.id}>
                        <path
                          data-person={p.person.id}
                          data-part="line"
                          d={p.path}
                          pathLength={DRAW}
                          strokeWidth={strokes.person}
                          className="sb-tw"
                          style={st}
                        />
                        {p.tail && (
                          <path
                            data-person={p.person.id}
                            data-part="tail"
                            d={p.tail}
                            strokeWidth={strokes.person}
                            strokeDasharray={p.person.status === 'branched' ? '3 6' : '2 6'}
                            className="sb-tw"
                            style={st}
                          />
                        )}
                        {p.endCircle && (
                          <circle
                            data-person={p.person.id}
                            data-part="end"
                            cx={p.endCircle.x}
                            cy={p.endCircle.y}
                            r={3}
                            fill={colors.ink}
                            strokeWidth={1.2}
                            className="sb-tw"
                            style={{ stroke: st.stroke }}
                          />
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* Entry points on your line (drawn above the person lines). */}
                {geo.people.map((p) => (
                  <circle
                    key={p.person.id}
                    data-person={p.person.id}
                    data-part="node"
                    cx={geo.cx}
                    cy={p.y0}
                    r={3.5}
                    className="sb-tw"
                    style={{ fill: p.person.id === selectedId ? colors.accent : colors.paper }}
                  />
                ))}

                {/* Moments: diamonds on your line. */}
                {geo.moments.map((m) => (
                  <g key={m.moment.id} data-moment={m.moment.id} data-part="node">
                    <rect
                      x={geo.cx - 5}
                      y={m.y - 5}
                      width={10}
                      height={10}
                      transform={`rotate(45 ${geo.cx} ${m.y})`}
                      className="sb-tw"
                      style={{ fill: m.moment.id === selectedId ? colors.accent : colors.paper }}
                    />
                  </g>
                ))}

                {/* Chapter ticks. */}
                {geo.chapters.map((c) => (
                  <circle
                    key={c.chapter.id}
                    cx={geo.cx}
                    cy={c.y}
                    r={5}
                    fill={colors.ink}
                    stroke={colors.paper}
                    strokeWidth={1.2}
                  />
                ))}
              </svg>

              {/* "You" at the top of the line. */}
              <span
                data-anim="you-label"
                className="label absolute -translate-x-1/2 text-paper"
                style={{ left: geo.cx, top: geo.top - 26, letterSpacing: '0.2em' }}
              >
                You
              </span>

              {/* Chapter headings, which are also the navigation anchors. */}
              {geo.chapters.map((c) => (
                <div
                  key={c.chapter.id}
                  id={chapterAnchor(c.chapter.id)}
                  className="pointer-events-none absolute left-0 w-full"
                  style={{ top: c.y - 14 }}
                >
                  <div className="absolute -translate-x-1/2" style={{ left: geo.cx, top: 0 }}>
                    <span
                      data-chapter={c.chapter.id}
                      className="label mt-7 block rounded bg-ink/90 px-2 py-1 text-[11px] whitespace-nowrap text-quiet"
                    >
                      {c.chapter.num} — {c.chapter.name}
                    </span>
                  </div>
                </div>
              ))}

              {/* Person labels. */}
              {geo.people.map((p) => {
                const on = p.person.id === selectedId;
                const left = p.label.align === 'left';
                return (
                  <div
                    key={p.person.id}
                    className="absolute"
                    style={{
                      top: p.label.y,
                      ...(left ? { right: geo.width - p.label.x } : { left: p.label.x }),
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <button
                      type="button"
                      data-person={p.person.id}
                      data-part="label"
                      aria-pressed={on}
                      aria-label={`${p.person.name}, ${statusText(p.person.status)}. Show details.`}
                      onClick={() => toggle({ kind: 'person', person: p.person })}
                      className={`flex min-h-11 flex-col justify-center gap-0.5 rounded bg-ink/85 px-2 py-1 ${
                        left ? 'items-end text-right' : 'items-start text-left'
                      }`}
                    >
                      <span
                        className={`font-serif leading-[1.1] transition-colors duration-500 ${
                          wide ? 'text-[20px]' : 'text-[17px]'
                        } ${on ? 'text-accent' : 'text-paper'}`}
                      >
                        {p.person.name}
                      </span>
                      <span className="label text-[10px] whitespace-nowrap text-quiet">Enters {p.person.enters}</span>
                    </button>
                  </div>
                );
              })}

              {/* Moment labels. */}
              {geo.moments.map((m) => {
                const on = m.moment.id === selectedId;
                const left = m.label.align === 'left';
                return (
                  <div
                    key={m.moment.id}
                    className="absolute"
                    style={{
                      top: m.y,
                      ...(left ? { right: geo.width - m.label.x } : { left: m.label.x }),
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <button
                      type="button"
                      data-moment={m.moment.id}
                      data-part="label"
                      aria-pressed={on}
                      aria-label={`Moment: ${m.moment.title}, ${m.moment.when}. Show details.`}
                      onClick={() => toggle({ kind: 'moment', moment: m.moment })}
                      className={`flex min-h-11 flex-col justify-center gap-0.5 rounded bg-ink/85 px-2 py-1 ${
                        left ? 'items-end text-right' : 'items-start text-left'
                      }`}
                    >
                      <span className={`text-sm transition-colors duration-500 ${on ? 'text-accent' : 'text-paper'}`}>
                        {m.moment.title}
                      </span>
                      <span className="label text-[10px] whitespace-nowrap text-quiet">{m.moment.when}</span>
                    </button>
                  </div>
                );
              })}

              {/* The last chapter: the line goes on, unwritten. */}
              {geo.unwritten && (
                <div
                  className="absolute -translate-x-1/2"
                  style={{ left: geo.cx, top: geo.unwritten.y }}
                >
                  <a
                    href="#closing"
                    data-anim="unwritten"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(geo.unwritten!.chapter.id);
                    }}
                    className="label flex min-h-11 items-center gap-2 whitespace-nowrap text-quiet no-underline transition-colors hover:text-paper"
                  >
                    {geo.unwritten.chapter.num} — {geo.unwritten.chapter.name} ↓
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <DetailPanel selection={selection} onClose={() => setSelection(null)} />
      </div>
    </section>
  );
}

function statusText(status: 'continues' | 'branched' | 'ended') {
  return status === 'continues' ? 'still here' : status === 'branched' ? 'branched away' : 'ended';
}
