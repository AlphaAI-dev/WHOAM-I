import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { chapterAt, chapters, timeRange, type Chapter } from '../../data/chapters';
import { people } from '../../data/people';
import { moments } from '../../data/timeline';
import { isPlaceholder, site } from '../../data/site';
import { colors, motion } from '../../config/theme';
import { gsap, ScrollTrigger } from '../../animations/setup';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { LifeSky, type Anchor } from '../../lib/lifeSky';
import { timelineNav } from '../../lib/timelineNav';
import { DetailPanel, type Selection } from './DetailPanel';
import { BlockWipe } from '../ui/BlockWipe';

/** Extra scroll after "now" during which the constellation forms, in viewport heights. */
const FINALE_VH = 1.1;

/**
 * 02 — Life timeline. The scene stays pinned while you scroll; scrolling
 * moves time forward from the first chapter to now.
 */
export function LifeTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef(new Map<string, HTMLElement>());
  const finaleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LifeSky | null>(null);
  const reduced = useReducedMotion();
  const [chapter, setChapter] = useState<Chapter>(chapters[0]);
  const [selection, setSelection] = useState<Selection>(null);

  const selectedId = selection?.kind === 'person' ? selection.person.id : selection?.kind === 'moment' ? selection.moment.id : null;

  useEffect(() => {
    if (engineRef.current) engineRef.current.selected = selectedId;
  }, [selectedId]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const bg = bgRef.current;
    if (!stage || !canvas || !bg) return;

    const engine = new LifeSky(canvas, bg, chapters, people, moments);
    engine.selected = selectedId;
    engineRef.current = engine;
    const range = timeRange.max - timeRange.min || 1;

    let target = timeRange.min;
    let finaleTarget = 0;
    let lastChapter = '';

    const place = (anchors: Map<string, Anchor>) => {
      for (const [id, el] of labelRefs.current) {
        const a = anchors.get(id);
        if (!a || a.o < 0.02) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          continue;
        }
        const side = a.star || a.l;
        // Your own label sits higher, clear of the names of people beside you.
        const dy = side ? '-50%' : id === 'you' ? 'calc(-100% - 34px)' : a.b ? '14px' : 'calc(-100% - 14px)';
        const dx = a.star ? '14px' : a.l ? 'calc(-100% - 14px)' : '-50%';
        el.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0) translate(${dx}, ${dy})`;
        el.style.opacity = String(Math.min(1, a.o));
        el.style.pointerEvents = a.o > 0.3 ? 'auto' : 'none';
      }
    };

    const draw = (time: number) => {
      const anchors = engine.render(time);
      place(anchors);
      if (finaleRef.current) finaleRef.current.style.opacity = String(Math.max(0, engine.finale * 1.4 - 0.4));
      if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - (engine.T - timeRange.min) / 6));
      const c = chapterAt(engine.T);
      if (c.id !== lastChapter) {
        lastChapter = c.id;
        setChapter(c);
      }
    };

    const resize = () => {
      engine.resize(stage.clientWidth, stage.clientHeight);
      draw(gsap.ticker.time);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    // Reduced motion: no pinning or flowing; show the whole story at once.
    if (reduced) {
      engine.live = false;
      engine.T = timeRange.max;
      engine.finale = 1;
      draw(0);
      const off = timelineNav.register(() => sectionRef.current?.scrollIntoView({ block: 'start' }));
      return () => {
        off();
        ro.disconnect();
        engineRef.current = null;
      };
    }

    // Scroll length: time part plus the finale.
    const timePx = () => (range / 100) * motion.timelineLength * window.innerHeight;
    const finalePx = () => FINALE_VH * window.innerHeight;
    const st = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: () => `+=${timePx() + finalePx()}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const total = timePx() + finalePx();
        const px = self.progress * total;
        target = timeRange.min + Math.min(1, px / timePx()) * range;
        finaleTarget = Math.max(0, (px - timePx()) / finalePx());
      },
    });

    // Render only while the scene is on screen; ease time towards the scroll position.
    let active = false;
    const tick = (time: number, dt: number) => {
      const k = 1 - Math.exp(-(dt / 1000) * 6);
      engine.T += (target - engine.T) * k;
      engine.finale += (finaleTarget - engine.finale) * k;
      draw(time);
    };
    const vis = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive && !active) gsap.ticker.add(tick);
        if (!self.isActive && active) gsap.ticker.remove(tick);
        active = self.isActive;
      },
    });

    // Entering: the roast of the tree scene breaks up into blocks and reveals the sky.
    const wipe = gsap.context(() => {
      const blocks = (kind: string) => stage.querySelectorAll(`[data-wipe=sky-in] [data-block=${kind}]`);
      gsap
        .timeline({ scrollTrigger: { trigger: stage, start: 'top bottom', end: 'top 15%', scrub: 0.6 } })
        .fromTo(blocks('settle'), { scaleY: 1 }, { scaleY: 0, transformOrigin: 'top', ease: 'none', stagger: { each: 0.01, from: 'random' } }, 0)
        .fromTo(blocks('lead'), { scaleY: 1 }, { scaleY: 0, transformOrigin: 'top', ease: 'none', stagger: { each: 0.01, from: 'random' } }, 0.25);
    }, stage);

    const off = timelineNav.register((t, smooth) => {
      const frac = (Math.min(timeRange.max, t + 1.5) - timeRange.min) / range;
      const y = st.start + frac * timePx();
      window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
    });

    return () => {
      off();
      wipe.revert();
      gsap.ticker.remove(tick);
      vis.kill();
      st.kill(true);
      ro.disconnect();
      engineRef.current = null;
    };
    // The engine is rebuilt only when the motion preference changes.
  }, [reduced]);

  const setLabel = (id: string) => (el: HTMLElement | null) => {
    if (el) labelRefs.current.set(id, el);
    else labelRefs.current.delete(id);
  };
  const toggle = (next: NonNullable<Selection>) => {
    const id = next.kind === 'person' ? next.person.id : next.moment.id;
    setSelection(id === selectedId ? null : next);
  };

  return (
    <section
      id="timeline"
      ref={sectionRef}
      data-section="timeline"
      data-theme="dark"
      aria-labelledby="timeline-title"
      className="relative bg-espresso"
    >
      <div ref={stageRef} data-anim="stage" className="sky-nebula relative h-svh w-full overflow-hidden">
        <canvas ref={bgRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        {/* The past fades into the dark (a plain overlay: far cheaper than masking a live canvas). */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-b from-transparent to-[#170f09]" />

        {/* Heading and the chapter you are in. */}
        <div className="pointer-events-none absolute top-24 right-[clamp(20px,5vw,72px)] z-10 flex flex-col items-end gap-2 text-right sm:top-28">
          <span className="eyebrow text-amber">02 — Life timeline</span>
          <h2 id="timeline-title" className="sr-only">
            Life timeline
          </h2>
          <p
            key={chapter.id}
            aria-live="polite"
            className="chapter-swap m-0 font-serif text-[clamp(30px,4.6vw,64px)] leading-none text-champagne italic"
          >
            <span className="mr-3 font-sans text-[12px] tracking-[0.3em] text-champagne/50 not-italic">
              {chapter.num}
            </span>
            {chapter.name}
          </p>
        </div>

        {/* Labels that follow the lines. */}
        <div className="absolute inset-0 z-10">
          <button
            ref={setLabel('you')}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="sky-label absolute top-0 left-0 font-display text-[11px] tracking-[0.2em] text-champagne uppercase"
          >
            {site.name}
          </button>
          {/* Only real names get a label; placeholder entries stay as unnamed lines. */}
          {people.filter((p) => !isPlaceholder(p.name)).map((p) => (
            <button
              key={p.id}
              ref={setLabel(p.id)}
              type="button"
              onClick={() => toggle({ kind: 'person', person: p })}
              aria-pressed={selectedId === p.id}
              aria-label={`${p.name}. Show details.`}
              className={`sky-label absolute top-0 left-0 min-h-8 px-1.5 font-sans text-[11px] whitespace-nowrap sm:text-[13px] ${
                selectedId === p.id ? 'text-ember' : 'text-cream/85'
              }`}
            >
              {p.name}
            </button>
          ))}
          {moments.filter((m) => !isPlaceholder(m.title)).map((m) => (
            <button
              key={m.id}
              ref={setLabel(m.id)}
              type="button"
              onClick={() => toggle({ kind: 'moment', moment: m })}
              aria-pressed={selectedId === m.id}
              aria-label={`Moment: ${m.title}, ${m.when}. Show details.`}
              className="sky-label sky-label-moment absolute top-0 left-0 min-h-8 px-1.5 font-sans text-[11px] whitespace-nowrap text-champagne/80"
            >
              {m.title}
            </button>
          ))}
        </div>

        {/* The last frame. */}
        <div
          ref={finaleRef}
          className="pointer-events-none absolute inset-x-0 bottom-[14svh] z-10 flex flex-col items-center gap-2 px-6 text-center opacity-0"
        >
          <p className="m-0 font-serif text-[clamp(28px,3.6vw,52px)] leading-tight text-cream">{site.timelineFinale[0]}</p>
          <p className="m-0 font-serif text-[clamp(22px,2.6vw,36px)] text-champagne/80 italic">{site.timelineFinale[1]}</p>
        </div>

        <div ref={hintRef} className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <span className="eyebrow text-champagne/60">Scroll to move through time</span>
        </div>

        <DetailPanel selection={selection} onClose={() => setSelection(null)} />
        <BlockWipe name="sky-in" lead={colors.amber} settle={colors.roast} cols={8} rows={5} />
      </div>
    </section>
  );
}
