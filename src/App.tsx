import { useCallback, useRef, useState } from 'react';
import { Hero } from './components/Hero/Hero';
import { FoundingTree } from './components/FoundingTree/FoundingTree';
import { LifeTimeline } from './components/LifeTimeline/LifeTimeline';
import { Constellation } from './components/Constellation/Constellation';
import { Closing } from './components/Closing/Closing';
import { Header } from './components/ui/Header';
import { chapterAnchor, defaultChapter, type ChapterId } from './data/chapters';
import { site } from './data/site';
import { useGsap } from './hooks/useGsap';
import { useReducedMotion } from './hooks/useReducedMotion';
import { setupTransitions } from './animations/transitions';
import { scrollToId } from './lib/navigation';

type SectionId = keyof typeof site.sections;

export default function App() {
  const mainRef = useRef<HTMLElement>(null);
  const mapButtonRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const [section, setSection] = useState<SectionId>('opening');
  const [chapter, setChapter] = useState<ChapterId>(defaultChapter);
  const [mapOpen, setMapOpen] = useState(false);

  useGsap(mainRef, (ctx) =>
    setupTransitions(ctx, (id) => {
      if (id in site.sections) setSection(id as SectionId);
    }),
  );

  const goToChapter = useCallback(
    (id: ChapterId) => {
      setChapter(id);
      scrollToId(chapterAnchor(id), reduced);
    },
    [reduced],
  );

  const closeMap = useCallback(() => {
    setMapOpen(false);
    // Return focus to the control that opened the map.
    requestAnimationFrame(() => mapButtonRef.current?.focus());
  }, []);

  const navigateFromMap = useCallback(
    (id: ChapterId) => {
      setMapOpen(false);
      // Wait a frame so the page can scroll again before moving.
      requestAnimationFrame(() => goToChapter(id));
    },
    [goToChapter],
  );

  return (
    <>
      <a
        href="#tree"
        className="label sr-only z-50 bg-ink p-3 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to the Founding Tree
      </a>

      <Header
        ref={mapButtonRef}
        sectionLabel={site.sections[section]}
        mapOpen={mapOpen}
        onOpenMap={() => setMapOpen(true)}
        night={section === 'closing'}
      />

      <main ref={mainRef} inert={mapOpen}>
        <Hero />
        <FoundingTree selected={chapter} onSelect={setChapter} onEnter={goToChapter} />
        <LifeTimeline onNavigate={goToChapter} />
        <Closing />
      </main>

      {mapOpen && (
        <Constellation selected={chapter} onSelect={setChapter} onClose={closeMap} onNavigate={navigateFromMap} />
      )}
    </>
  );
}
