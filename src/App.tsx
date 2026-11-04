import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Hero } from './components/Hero/Hero';
import { FoundingTree } from './components/FoundingTree/FoundingTree';
import { LifeTimeline } from './components/LifeTimeline/LifeTimeline';
import { Closing } from './components/Closing/Closing';
import { Nav } from './components/ui/Nav';
import { EmberCursor } from './components/ui/EmberCursor';
import { chapterById, defaultChapter, type ChapterId } from './data/chapters';
import { site, type SectionId } from './data/site';
import { useGsap } from './hooks/useGsap';
import { useReducedMotion } from './hooks/useReducedMotion';
import { setupTransitions } from './animations/transitions';
import { timelineNav } from './lib/timelineNav';

// The map is only downloaded when someone opens it.
const Constellation = lazy(() => import('./components/Constellation/Constellation'));

export default function App() {
  const mainRef = useRef<HTMLElement>(null);
  const mapButtonRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const [section, setSection] = useState<SectionId>('opening');
  const [dark, setDark] = useState(false);
  const [chapter, setChapter] = useState<ChapterId>(defaultChapter);
  const [mapOpen, setMapOpen] = useState(false);
  // The pre-rendered HTML holds only the opening, so the first screen paints at once;
  // the scenes below mount immediately after hydration.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  // Honour a link straight to a scene (e.g. /#timeline) once that scene exists.
  useEffect(() => {
    if (!ready || !location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
  }, [ready]);

  useGsap(
    mainRef,
    (ctx) =>
      setupTransitions(ctx, (id, isDark) => {
        if (site.sections.some((s) => s.id === id)) setSection(id as SectionId);
        setDark(isDark);
      }),
    [ready],
  );

  // Scenes can switch the navigation colour mid-scene (e.g. during a wipe).
  useEffect(() => {
    const onTheme = (e: Event) => setDark((e as CustomEvent<{ dark: boolean }>).detail.dark);
    window.addEventListener('sb:nav-theme', onTheme);
    return () => window.removeEventListener('sb:nav-theme', onTheme);
  }, []);

  const goToSection = useCallback(
    (id: SectionId) => {
      document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    },
    [reduced],
  );

  /** Chapters I–IV live on the life timeline; V (Unwritten) is the closing scene. */
  const goToChapter = useCallback(
    (id: ChapterId) => {
      setChapter(id);
      if (id === 'v' || !timelineNav.go(chapterById[id].start, !reduced)) goToSection(id === 'v' ? 'closing' : 'timeline');
    },
    [goToSection, reduced],
  );

  const closeMap = useCallback(() => {
    setMapOpen(false);
    requestAnimationFrame(() => mapButtonRef.current?.focus());
  }, []);

  const navigateFromMap = useCallback(
    (id: ChapterId) => {
      setMapOpen(false);
      requestAnimationFrame(() => goToChapter(id));
    },
    [goToChapter],
  );

  return (
    <>
      <a
        href="#tree"
        className="eyebrow sr-only z-[80] bg-mocha p-3 text-cream focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to the Founding Tree
      </a>

      <Nav
        ref={mapButtonRef}
        section={section}
        dark={dark}
        mapOpen={mapOpen}
        onOpenMap={() => setMapOpen(true)}
        onGo={goToSection}
      />

      <main ref={mainRef} inert={mapOpen}>
        <Hero onChapter={goToChapter} />
        {ready ? (
          <>
            <FoundingTree selected={chapter} onSelect={setChapter} onEnter={goToChapter} />
            <LifeTimeline />
            <Closing />
          </>
        ) : (
          <div aria-hidden="true" className="h-[300svh] bg-roast" />
        )}
      </main>

      {mapOpen && (
        <Suspense fallback={null}>
          <Constellation selected={chapter} onSelect={setChapter} onClose={closeMap} onNavigate={navigateFromMap} />
        </Suspense>
      )}

      <EmberCursor />
      {ready && <div className="grain" aria-hidden="true" />}
    </>
  );
}
