/**
 * Computes the life timeline's geometry from the content files, so a new
 * person or moment finds its own place on the line without UI changes.
 *
 * Layout model
 * - The central line ("you") runs top to bottom through chapters I–IV and
 *   becomes dotted at chapter V (Unwritten).
 * - Every chapter heading, person entry and moment gets its own row, so
 *   labels never collide.
 * - A person's line leaves the central line at their row and settles into a
 *   lane beside it. Lanes are reused once a previous occupant has left.
 */
import { timeline as T } from '../config/layout';
import type { Chapter, ChapterId } from '../data/chapters';
import type { Person } from '../data/people';
import type { Moment } from '../data/timeline';

export interface LabelPos {
  x: number;
  y: number;
  /** Which side of x the label extends to. */
  align: 'left' | 'right';
}

export interface PersonGeo {
  person: Person;
  laneX: number;
  /** Point on the central line where they enter. */
  y0: number;
  /** Where the line settles into its lane. */
  y1: number;
  /** Where the solid part of the line stops. */
  yEnd: number;
  /** Solid line: entry curve plus lane. Drawn with the scroll. */
  path: string;
  /** Dotted tail (continues) or dashed curve away (branched). */
  tail?: string;
  /** Open circle for an ended line. */
  endCircle?: { x: number; y: number };
  label: LabelPos;
}

export interface MomentGeo {
  moment: Moment;
  y: number;
  label: LabelPos;
}

export interface ChapterGeo {
  chapter: Chapter;
  y: number;
  /** End of the chapter's band on the line. */
  yEnd: number;
}

export interface TimelineGeometry {
  width: number;
  height: number;
  cx: number;
  /** Top and bottom of the solid central line. */
  top: number;
  bottom: number;
  rowHeight: number;
  chapters: ChapterGeo[];
  people: PersonGeo[];
  moments: MomentGeo[];
  /** Row of the final, unwritten chapter. */
  unwritten: ChapterGeo | null;
}

type Item = { kind: 'person'; person: Person; order: number } | { kind: 'moment'; moment: Moment; order: number };

export function layoutTimeline(
  width: number,
  desktop: boolean,
  chapters: Chapter[],
  people: Person[],
  moments: Moment[],
): TimelineGeometry {
  const rowH = desktop ? T.rowHeight.desktop : T.rowHeight.mobile;
  const laneGap = desktop ? T.laneGap.desktop : T.laneGap.mobile;
  const branchOut = desktop ? T.branchOut.desktop : T.branchOut.mobile;
  const cx = Math.round(width * (desktop ? T.centre.desktop : T.centre.mobile));

  // The last chapter is the unwritten one; the others form the drawn line.
  const lived = chapters.slice(0, -1);
  const last = chapters[chapters.length - 1] ?? null;

  // 1. Rows ---------------------------------------------------------------
  type Row = { kind: 'chapter'; chapter: Chapter } | Item;
  const rows: Row[] = [];
  for (const chapter of lived) {
    rows.push({ kind: 'chapter', chapter });
    const items: Item[] = [
      ...people
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => p.chapter === chapter.id)
        .map(({ p, i }) => ({ kind: 'person' as const, person: p, order: p.order ?? i })),
      ...moments
        .map((m, i) => ({ m, i }))
        .filter(({ m }) => m.chapter === chapter.id)
        .map(({ m, i }) => ({ kind: 'moment' as const, moment: m, order: m.order ?? 1000 + i })),
    ];
    items.sort((a, b) => a.order - b.order);
    rows.push(...items);
  }

  const rowY = (i: number) => T.padTop + rowH * (i + 0.5);
  const unwrittenRow = rows.length;
  const bottom = rowY(unwrittenRow) - rowH * 0.5;
  const top = T.padTop * 0.4;

  // 2. Chapter bands ------------------------------------------------------
  const headingIdx = rows.map((r, i) => (r.kind === 'chapter' ? i : -1)).filter((i) => i >= 0);
  const chapterGeo: ChapterGeo[] = headingIdx.map((idx, k) => {
    const nextIdx = headingIdx[k + 1] ?? unwrittenRow;
    return {
      chapter: (rows[idx] as { chapter: Chapter }).chapter,
      y: rowY(idx),
      yEnd: rowY(nextIdx) - rowH * 0.45,
    };
  });
  const bandEnd = (id: ChapterId | undefined) =>
    chapterGeo.find((c) => c.chapter.id === id)?.yEnd ?? bottom;

  // 3. People and lanes ---------------------------------------------------
  const lanes: Record<'left' | 'right', number[]> = { left: [], right: [] };
  const peopleGeo: PersonGeo[] = [];
  const momentGeo: MomentGeo[] = [];

  rows.forEach((row, idx) => {
    const y = rowY(idx);
    if (row.kind === 'person') {
      const p = row.person;
      const y0 = y - rowH * 0.3;
      const y1 = y + rowH * 0.2;

      let yEnd = p.status === 'continues' ? bottom : Math.max(bandEnd(p.until ?? p.chapter), y1 + rowH * 0.3);
      if (yEnd > bottom) yEnd = bottom;

      // Lowest free lane on this side.
      const side = lanes[p.side];
      let lane = side.findIndex((busyUntil) => busyUntil < y0);
      if (lane === -1) lane = side.length;
      const busyUntil = p.status === 'continues' ? Infinity : yEnd + (p.status === 'branched' ? rowH : 12);
      side[lane] = busyUntil;

      const dir = p.side === 'left' ? -1 : 1;
      const laneX = cx + dir * laneGap * (lane + 1);
      const dx = laneX - cx;
      const h = y1 - y0;
      const path = `M${cx} ${y0} C${cx + dx * 0.5} ${y0 + h * 0.25} ${laneX} ${y0 + h * 0.5} ${laneX} ${y1} L${laneX} ${yEnd}`;

      let tail: string | undefined;
      let endCircle: PersonGeo['endCircle'];
      if (p.status === 'continues') {
        tail = `M${laneX} ${bottom + 6} L${laneX} ${bottom + T.tail}`;
      } else if (p.status === 'branched') {
        const out = dir * branchOut;
        tail = `M${laneX} ${yEnd} C${laneX} ${yEnd + rowH * 0.45} ${laneX + out * 0.35} ${yEnd + rowH * 0.6} ${laneX + out} ${yEnd + rowH * 0.85}`;
      } else {
        endCircle = { x: laneX, y: yEnd };
      }

      peopleGeo.push({
        person: p,
        laneX,
        y0,
        y1,
        yEnd,
        path,
        tail,
        endCircle,
        label: { x: laneX + dir * 12, y: y1, align: p.side === 'left' ? 'left' : 'right' },
      });
    } else if (row.kind === 'moment') {
      // Put the label on the side with fewer lines passing at this height.
      const busy = (s: 'left' | 'right') => lanes[s].filter((u) => u > y).length;
      const side = busy('left') <= busy('right') ? 'left' : 'right';
      const dir = side === 'left' ? -1 : 1;
      momentGeo.push({
        moment: row.moment,
        y,
        label: { x: cx + dir * 16, y, align: side },
      });
    }
  });

  const unwritten: ChapterGeo | null = last ? { chapter: last, y: bottom + T.tail + 28, yEnd: bottom + T.tail } : null;

  return {
    width,
    height: Math.ceil(bottom + T.tail + T.padBottom),
    cx,
    top,
    bottom,
    rowHeight: rowH,
    chapters: chapterGeo,
    people: peopleGeo,
    moments: momentGeo,
    unwritten,
  };
}
