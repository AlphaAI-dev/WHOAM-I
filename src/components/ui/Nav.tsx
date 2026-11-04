import { forwardRef } from 'react';
import { site, type SectionId } from '../../data/site';

interface Props {
  section: SectionId;
  /** Light scenes get mocha text; dark scenes get cream. */
  dark: boolean;
  mapOpen: boolean;
  onOpenMap: () => void;
  onGo: (id: SectionId) => void;
}

/** Fixed top navigation and the vertical scene index. */
export const Nav = forwardRef<HTMLButtonElement, Props>(function Nav({ section, dark, mapOpen, onOpenMap, onGo }, mapRef) {
  const tone = dark ? 'text-cream' : 'text-mocha';
  const rule = dark ? 'bg-cream/20' : 'bg-mocha/20';
  const current = site.sections.findIndex((s) => s.id === section);

  return (
    <>
      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 px-[clamp(20px,5vw,72px)] pt-5 transition-colors duration-700 ${tone}`}
      >
        <div className="flex items-center justify-between gap-6">
          <a
            href="#opening"
            onClick={(e) => {
              e.preventDefault();
              onGo('opening');
            }}
            className="pointer-events-auto inline-flex min-h-11 items-center gap-2.5 no-underline"
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-amber shadow-[0_0_10px_2px_rgba(200,121,44,0.6)]" />
            <span className="font-display text-[13px] tracking-[0.18em]">{site.name.toUpperCase()}</span>
          </a>

          <nav aria-label="Scenes" className="pointer-events-auto hidden md:block">
            <ul className="m-0 flex list-none gap-9 p-0">
              {site.sections.map((s) => {
                const on = s.id === section;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      aria-current={on ? 'true' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        onGo(s.id);
                      }}
                      className={`eyebrow group relative inline-flex min-h-11 items-center gap-2 no-underline transition-opacity ${on ? 'opacity-100' : 'opacity-55 hover:opacity-100'}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`size-1 rounded-full bg-amber transition-transform duration-500 ${on ? 'scale-100' : 'scale-0'}`}
                      />
                      {s.label}
                      <span
                        aria-hidden="true"
                        className={`absolute right-0 bottom-2 left-3 h-px origin-left bg-amber transition-transform duration-500 ${on ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            ref={mapRef}
            type="button"
            onClick={onOpenMap}
            aria-haspopup="dialog"
            aria-expanded={mapOpen}
            aria-controls="constellation-map"
            className="group pointer-events-auto inline-flex min-h-11 min-w-11 items-center justify-center gap-3"
          >
            <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true" className="overflow-visible">
              <path d="M2 13 L8 5 L14 8 L20 2" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.8" />
              <circle cx="2" cy="13" r="1.5" fill="currentColor" />
              <circle cx="8" cy="5" r="1.5" fill="currentColor" />
              <circle cx="14" cy="8" r="2.2" className="fill-amber transition-transform duration-500 group-hover:scale-125" style={{ transformOrigin: '14px 8px' }} />
              <circle cx="20" cy="2" r="1.5" fill="currentColor" />
            </svg>
            <span className="eyebrow">Map</span>
          </button>
        </div>
        <div aria-hidden="true" className={`mt-1 h-px w-full ${rule} transition-colors duration-700`}>
          <div
            className="h-px bg-amber transition-[width] duration-700 ease-out"
            style={{ width: `${((current + 1) / site.sections.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Vertical scene index (01 / 02 / 03), as in the reference. */}
      <nav
        aria-label="Scene index"
        className={`fixed top-1/2 right-[clamp(14px,2.2vw,32px)] z-40 hidden -translate-y-1/2 flex-col items-end gap-1 transition-colors duration-700 lg:flex ${tone}`}
      >
        <span aria-hidden="true" className={`absolute top-0 -right-3 h-full w-px ${rule}`} />
        {site.sections.map((s, i) => {
          const on = i === current;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onGo(s.id)}
              aria-label={`${s.num} ${s.label}`}
              aria-current={on ? 'true' : undefined}
              className={`relative min-h-8 font-sans text-[10px] tracking-[0.2em] transition-opacity ${on ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
            >
              {s.num}
              {on && <span aria-hidden="true" className="absolute top-1/2 -right-3 h-4 w-px -translate-y-1/2 bg-amber" />}
            </button>
          );
        })}
      </nav>
    </>
  );
});
