import { forwardRef } from 'react';

interface Props {
  sectionLabel: string;
  mapOpen: boolean;
  onOpenMap: () => void;
  /** Darker header over the final, near-black scene. */
  night: boolean;
}

/** Fixed top bar: site mark, the current section and the constellation map control. */
export const Header = forwardRef<HTMLButtonElement, Props>(function Header(
  { sectionLabel, mapOpen, onOpenMap, night },
  mapButtonRef,
) {
  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 px-[clamp(20px,5vw,72px)] pt-4 pb-6 transition-[background] duration-700 ${
        night
          ? 'bg-gradient-to-b from-night via-night/80 to-transparent'
          : 'bg-gradient-to-b from-ink via-ink/80 to-transparent'
      }`}
    >
      <a
        href="#opening"
        className="label pointer-events-auto inline-flex min-h-11 items-center text-[12px] tracking-[0.22em] text-quiet no-underline transition-colors hover:text-paper"
      >
        Still Becoming
      </a>
      <div className="pointer-events-auto flex items-center gap-5 sm:gap-8">
        <span aria-live="polite" className="label hidden text-[12px] tracking-[0.12em] text-quiet normal-case sm:inline">
          {sectionLabel}
        </span>
        <button
          ref={mapButtonRef}
          type="button"
          onClick={onOpenMap}
          aria-haspopup="dialog"
          aria-expanded={mapOpen}
          aria-controls="constellation-map"
          className="group inline-flex min-h-11 min-w-11 items-center justify-center gap-2.5 text-quiet transition-colors hover:text-paper"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true" className="overflow-visible">
            <path d="M2 11 L7 4 L12 7 L16 2" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.8" />
            <circle cx="2" cy="11" r="1.4" fill="currentColor" />
            <circle cx="7" cy="4" r="1.4" fill="currentColor" />
            <circle cx="12" cy="7" r="1.8" className="fill-accent" />
            <circle cx="16" cy="2" r="1.4" fill="currentColor" />
          </svg>
          <span className="label text-[12px] tracking-[0.16em]">Map</span>
        </button>
      </div>
    </header>
  );
});
