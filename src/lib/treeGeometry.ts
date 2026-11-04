/**
 * Generates the overlay geometry for the Founding Tree: the small "aspect"
 * twigs on each chapter branch (some lit, some dark), the trunk twigs and the
 * roots. Ported from docs/design-reference/01_Founding_Tree.dc.html so the
 * same seed draws exactly the same tree.
 */
import { tree } from '../config/layout';
import type { ChapterId } from '../data/chapters';
import { bezierAt, fmt, seeded, type Cubic } from './geometry';

export type TwigGroupKey = ChapterId | 'x';

export interface TwigGroup {
  /** Neutral twigs. */
  n: string;
  /** Lit twigs: aspects that glow. */
  l: string;
  /** Dark twigs: aspects that stay dark. */
  d: string;
  lit: number;
  dark: number;
}

export interface Leaf {
  kind: 'lit' | 'dark';
  x: number;
  y: number;
  group: TwigGroupKey;
}

export interface TreeGeometry {
  groups: Record<TwigGroupKey, TwigGroup>;
  roots: string;
  leaves: Leaf[];
}

const CHAPTER_ORDER: ChapterId[] = ['i', 'ii', 'iii', 'iv', 'v'];

export function buildTree(seed: number = tree.growthSeed): TreeGeometry {
  const rnd = seeded(seed);
  for (let i = 0; i < 5; i++) rnd();

  const empty = (): TwigGroup => ({ n: '', l: '', d: '', lit: 0, dark: 0 });
  const groups = { i: empty(), ii: empty(), iii: empty(), iv: empty(), v: empty(), x: empty() } as Record<
    TwigGroupKey,
    TwigGroup
  >;
  let roots = '';
  const leaves: Leaf[] = [];

  type Kind = 'n' | 'l' | 'd';
  const grow = (
    key: TwigGroupKey | 'roots',
    x: number,
    y: number,
    ang: number,
    len: number,
    depth: number,
    max: number,
    kind: Kind,
  ) => {
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    const bend = (rnd() - 0.5) * 0.5 * len;
    const cx = (x + x2) / 2 - Math.sin(ang) * bend;
    const cy = (y + y2) / 2 + Math.cos(ang) * bend;
    let k = kind;
    if (key !== 'roots' && depth === 2) {
      const r = rnd();
      k = r < 0.26 ? 'l' : r < 0.5 ? 'd' : 'n';
    } else if (key !== 'roots' && depth > 2 && kind === 'l' && rnd() < 0.25) {
      k = 'n';
    }
    const seg = `M${fmt(x)} ${fmt(y)} Q${fmt(cx)} ${fmt(cy)} ${fmt(x2)} ${fmt(y2)} `;
    if (key === 'roots') roots += seg;
    else groups[key][k] += seg;

    if (depth < max) {
      const kids = rnd() < 0.35 ? 3 : 2;
      for (let i = 0; i < kids; i++) {
        const spread = kids === 3 ? (i - 1) * 0.55 : (i === 0 ? -1 : 1) * (0.3 + rnd() * 0.25);
        grow(key, x2, y2, ang + spread + (rnd() - 0.5) * 0.15, len * (0.6 + rnd() * 0.14), depth + 1, max, k);
      }
    } else if (key !== 'roots') {
      if (k === 'l') {
        groups[key].lit++;
        leaves.push({ kind: 'lit', x: x2, y: y2, group: key });
      }
      if (k === 'd') {
        groups[key].dark++;
        leaves.push({ kind: 'dark', x: x2, y: y2, group: key });
      }
    }
  };

  for (const id of CHAPTER_ORDER) {
    const p = tree.branches[id].path as Cubic;
    const base = Math.atan2(p[7] - p[5], p[6] - p[4]);
    const kids = rnd() < 0.5 ? 3 : 2;
    for (let i = 0; i < kids; i++) {
      const spread = kids === 3 ? (i - 1) * 0.5 : i === 0 ? -0.4 : 0.4;
      grow(id, p[6], p[7], base + spread, 56 + rnd() * 10, 1, 3, 'n');
    }
    for (const t of [0.42, 0.68]) {
      const a = bezierAt(p, t - 0.03);
      const c = bezierAt(p, t + 0.03);
      const at = bezierAt(p, t);
      const tan = Math.atan2(c[1] - a[1], c[0] - a[0]);
      const o1 = tan - 0.95;
      const o2 = tan + 0.95;
      const side = Math.sin(o1) < Math.sin(o2) ? o1 : o2;
      grow(id, at[0], at[1], side, 40 + rnd() * 10, 2, 3, 'n');
    }
  }

  for (const [x, y, ang, len, depth, max] of tree.trunkTwigs) grow('x', x, y, ang, len, depth, max, 'n');

  for (const deg of tree.rootAngles) {
    grow('roots', tree.rootOrigin.x, tree.rootOrigin.y, (deg * Math.PI) / 180, 58 + rnd() * 10, 1, 3, 'n');
  }

  return { groups, roots, leaves };
}
