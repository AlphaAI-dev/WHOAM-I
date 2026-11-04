import { useEffect, useRef } from 'react';
import { chapterAt } from '../../data/chapters';
import type { Person } from '../../data/people';
import type { Moment } from '../../data/timeline';
import { isPlaceholder } from '../../data/site';
import { useGsap } from '../../hooks/useGsap';
import { animatePanelSwap } from '../../animations/timeline';

export type Selection = { kind: 'person'; person: Person } | { kind: 'moment'; moment: Moment } | null;

const STATUS: Record<Person['status'], string> = {
  continues: 'Still here',
  branched: 'Walked with me for a while',
  ended: 'In my sky',
};

interface Props {
  selection: Selection;
  onClose: () => void;
}

/** Details for the selected person or moment, floating over the night sky. */
export function DetailPanel({ selection, onClose }: Props) {
  const ref = useRef<HTMLElement>(null);
  const key = selection ? (selection.kind === 'person' ? selection.person.id : selection.moment.id) : 'none';
  useGsap(ref, animatePanelSwap, [key]);

  useEffect(() => {
    if (!selection) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selection, onClose]);

  if (!selection) return null;

  let kind: string;
  let title: string;
  let rows: { k: string; v?: string }[];
  let note: string | undefined;
  if (selection.kind === 'person') {
    const p = selection.person;
    const c = chapterAt(p.start);
    kind = 'Line';
    title = p.name;
    rows = [
      { k: 'Relationship', v: p.relation },
      { k: 'Enters', v: p.enters },
      ...(p.leaves ? [{ k: p.status === 'ended' ? 'Until' : 'Leaves', v: p.leaves }] : []),
      { k: 'Line', v: STATUS[p.status] },
      { k: 'Joins in', v: `${c.num} — ${c.name}` },
    ];
    note = p.note;
  } else {
    const m = selection.moment;
    const c = chapterAt(m.at);
    kind = 'Moment';
    title = m.title;
    rows = [
      { k: 'When', v: m.when },
      { k: 'Chapter', v: `${c.num} — ${c.name}` },
    ];
    note = m.note;
  }
  // Fields that are still placeholders are simply left out.
  const shown = rows.filter((r): r is { k: string; v: string } => !!r.v && !isPlaceholder(r.v));
  const showNote = !!note && !isPlaceholder(note);

  return (
    <aside
      ref={ref}
      aria-live="polite"
      aria-label="Details"
      className="glass-card absolute inset-x-3 bottom-3 z-20 flex max-h-[58svh] flex-col gap-4 overflow-y-auto rounded-2xl p-6 text-cream sm:inset-x-auto sm:right-[clamp(20px,5vw,72px)] sm:bottom-10 sm:w-[360px]"
    >
      <div className="flex items-start justify-between gap-4">
        <span data-anim="swap" className="eyebrow text-amber">
          {kind}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="-mt-3 -mr-3 inline-flex size-11 items-center justify-center text-cream/60 transition-colors hover:text-cream"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1 1 L13 13 M13 1 L1 13" />
          </svg>
        </button>
      </div>
      <h3 data-anim="swap" className="m-0 font-serif text-[clamp(32px,3vw,44px)] leading-none font-normal text-champagne">
        {title}
      </h3>
      <dl data-anim="swap" className="m-0 flex flex-col gap-2.5">
        {shown.map((r) => (
          <div key={r.k} className="flex justify-between gap-4 border-b border-champagne/10 pb-2.5">
            <dt className="eyebrow text-cream/50">{r.k}</dt>
            <dd className="m-0 text-right text-[15px]">{r.v}</dd>
          </div>
        ))}
      </dl>
      {showNote && (
        <p data-anim="swap" className="m-0 text-[15px] leading-[1.6] text-cream/70">
          {note}
        </p>
      )}
    </aside>
  );
}
