import { useEffect, useRef } from 'react';
import { chapterById } from '../../data/chapters';
import type { Person } from '../../data/people';
import type { Moment } from '../../data/timeline';
import { isPlaceholder } from '../../data/site';
import { useGsap } from '../../hooks/useGsap';
import { animatePanelSwap } from '../../animations/timeline';

export type Selection = { kind: 'person'; person: Person } | { kind: 'moment'; moment: Moment } | null;

const STATUS: Record<Person['status'], string> = {
  continues: 'Still here',
  branched: 'Branched away',
  ended: 'Ended',
};

interface Props {
  selection: Selection;
  onClose: () => void;
}

/**
 * Details for the selected person or moment.
 * Desktop: a sticky column beside the graph. Mobile: a sheet at the bottom of
 * the screen that appears only while something is selected.
 */
export function DetailPanel({ selection, onClose }: Props) {
  const ref = useRef<HTMLElement>(null);
  const key = selection ? (selection.kind === 'person' ? selection.person.id : selection.moment.id) : 'none';
  useGsap(ref, animatePanelSwap, [key]);

  // Escape clears the selection.
  useEffect(() => {
    if (!selection) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selection, onClose]);

  let kind = '';
  let title = '';
  let rows: { k: string; v: string }[] = [];
  let note = '';
  let file = '';
  if (selection?.kind === 'person') {
    const p = selection.person;
    kind = 'Person';
    title = p.name;
    rows = [
      { k: 'Relationship', v: p.relation },
      { k: 'Enters', v: p.enters },
      ...(p.leaves ? [{ k: p.status === 'ended' ? 'Ends' : 'Leaves', v: p.leaves }] : []),
      { k: 'Line', v: STATUS[p.status] },
      { k: 'Chapter', v: `${chapterById[p.chapter].num} — ${chapterById[p.chapter].name}` },
    ];
    note = p.note;
    file = 'src/data/people.ts';
  } else if (selection?.kind === 'moment') {
    const m = selection.moment;
    kind = 'Moment';
    title = m.title;
    rows = [
      { k: 'When', v: m.when },
      { k: 'Chapter', v: `${chapterById[m.chapter].num} — ${chapterById[m.chapter].name}` },
    ];
    note = m.note;
    file = 'src/data/timeline.ts';
  }
  const placeholder = selection && [title, note, ...rows.map((r) => r.v)].some(isPlaceholder);

  return (
    <aside
      ref={ref}
      aria-live="polite"
      aria-label="Details"
      className={`${
        selection ? 'flex' : 'hidden lg:flex'
      } fixed inset-x-3 bottom-3 z-30 max-h-[62svh] flex-col gap-5 overflow-y-auto rounded-md border border-paper/12 bg-ink/95 p-6 shadow-[0_-20px_60px_rgba(0,0,0,0.5)] backdrop-blur lg:sticky lg:inset-auto lg:top-28 lg:z-auto lg:max-h-none lg:self-start lg:overflow-visible lg:rounded-none lg:border-0 lg:border-l lg:bg-transparent lg:p-0 lg:py-6 lg:pl-8 lg:shadow-none lg:backdrop-blur-none`}
    >
      {selection ? (
        <>
          <div className="flex items-start justify-between gap-4">
            <span data-anim="swap" className="label text-[12px] tracking-[0.16em] text-accent">
              {kind}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="-mt-3 -mr-3 inline-flex size-11 items-center justify-center text-quiet transition-colors hover:text-paper"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M1 1 L13 13 M13 1 L1 13" />
              </svg>
            </button>
          </div>
          <h3 data-anim="swap" className="m-0 font-serif text-[clamp(34px,3.4vw,48px)] leading-none font-normal">
            {title}
          </h3>
          <dl data-anim="swap" className="m-0 flex flex-col gap-2.5">
            {rows.map((r) => (
              <div key={r.k} className="flex justify-between gap-4 border-b border-paper/8 pb-2.5">
                <dt className="label text-quiet">{r.k}</dt>
                <dd className="m-0 text-right text-[15px]">{r.v}</dd>
              </div>
            ))}
          </dl>
          <p data-anim="swap" className="m-0 text-base leading-[1.6] text-quiet">
            {note}
          </p>
          {placeholder && (
            <span data-anim="swap" className="placeholder-tag self-start">
              Placeholder · {file}
            </span>
          )}
        </>
      ) : (
        <>
          <span className="label text-[12px] tracking-[0.16em] text-accent">Select a line</span>
          <p className="m-0 text-base leading-[1.6] text-quiet">
            Each line beside mine is a person. Select a name or a moment to read about it.
          </p>
        </>
      )}
    </aside>
  );
}
