/**
 * LifeSky: the canvas engine behind the life timeline.
 *
 * Time flows as you scroll. A horizontal "now" sits near the top third of the
 * screen; every life line is drawn from now downwards into the past, so as
 * time advances the lines grow and stream down the screen.
 *
 * - Your line runs through the centre, champagne gold, from the first chapter.
 * - People arrive from the side of the screen and settle into a lane beside
 *   you. Their line then either continues to now, curves away (branched), or
 *   ends, and the person rises into the sky as a star that stays.
 * - Moments flare on your line and remain as small diamonds.
 * - At the end of the timeline every star and every line still beside you is
 *   joined into a constellation.
 *
 * The engine is framework-free: React owns the DOM labels, this class owns
 * the pixels and reports where the labels should go (anchors).
 */
import { alpha, colors, fonts, lineColors, youColor } from '../config/theme';
import type { Chapter } from '../data/chapters';
import type { Person } from '../data/people';
import type { Moment } from '../data/timeline';
import { seeded } from './geometry';

/** Durations in timeline units. */
const ENTRY = 5; // flying in from the side
const EXIT = 8; // curving away after branching
const RISE = 7; // rising into the sky after ending
const WINDOW = 36; // how much past is visible below "now"

export interface Anchor {
  x: number;
  y: number;
  /** 0 hidden … 1 fully visible. */
  o: number;
  /** Put the label below the point (alternating lanes, so neighbours don't collide). */
  b?: boolean;
  /** The point is a star in the sky (label to the right). */
  star?: boolean;
  /** Label to the left of the point. */
  l?: boolean;
}

interface Lane {
  person: Person;
  color: string;
  side: -1 | 1;
  lane: number;
  phase: number;
  skyY: number; // 0..1 of the sky band
  skyJitter: number;
}

const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
const easeIn = (k: number) => k * k * k;
const clamp01 = (k: number) => (k < 0 ? 0 : k > 1 ? 1 : k);

export class LifeSky {
  private ctx: CanvasRenderingContext2D;
  private bg: CanvasRenderingContext2D;
  private W = 0;
  private H = 0;
  private dpr = 1;
  private cx = 0;
  private nowY = 0;
  private ppu = 10;
  private spacing = 50;
  private lanes: Lane[];
  private readonly tMin: number;

  /** Current time on the chapter scale. */
  T = 0;
  /** Final constellation, 0..1. */
  finale = 0;
  /** Selected person or moment id; other lines dim. */
  selected: string | null = null;
  /** Gentle live sway of the lines; off under reduced motion. */
  live = true;

  constructor(
    canvas: HTMLCanvasElement,
    bgCanvas: HTMLCanvasElement,
    private chapters: Chapter[],
    people: Person[],
    private moments: Moment[],
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.bg = bgCanvas.getContext('2d')!;
    this.tMin = chapters[0].start;
    this.T = this.tMin;
    this.lanes = assignLanes(people);
  }

  /* ---------------------------------------------------------------- */
  /* Layout                                                            */
  /* ---------------------------------------------------------------- */

  resize(w: number, h: number) {
    const area = w * h;
    this.dpr = Math.min(window.devicePixelRatio || 1, area > 2_000_000 ? 1.5 : 2);
    this.W = w;
    this.H = h;
    for (const [c, ctx] of [
      [this.ctx.canvas, this.ctx],
      [this.bg.canvas, this.bg],
    ] as const) {
      c.width = Math.round(w * this.dpr);
      c.height = Math.round(h * this.dpr);
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    const mobile = w < 640;
    this.cx = w / 2;
    this.nowY = h * (mobile ? 0.36 : 0.38);
    this.ppu = (h - this.nowY) / WINDOW;
    const maxLane = Math.max(1, ...this.lanes.map((l) => l.lane + 1));
    // Keep every lane (plus room for labels) inside the screen.
    this.spacing = Math.min(mobile ? 40 : 86, (w / 2 - (mobile ? 44 : 140)) / maxLane);
    this.paintBackground();
  }

  private paintBackground() {
    const { bg, W, H } = this;
    bg.clearRect(0, 0, W, H);
    // A fixed field of distant stars.
    const rnd = seeded(23);
    const count = Math.round((W * H) / 5200);
    for (let i = 0; i < count; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const r = rnd() < 0.9 ? 0.6 : 1.1;
      bg.fillStyle = alpha(rnd() < 0.15 ? colors.champagne : '#FFFFFF', 0.12 + rnd() * 0.4);
      bg.beginPath();
      bg.arc(x, y, r, 0, Math.PI * 2);
      bg.fill();
    }
  }

  /* ---------------------------------------------------------------- */
  /* Geometry                                                          */
  /* ---------------------------------------------------------------- */

  private yAt(t: number) {
    return this.nowY + (this.T - t) * this.ppu;
  }

  private wave(t: number, phase: number, time: number, amp = 1) {
    const a = Math.min(1, this.spacing / 60) * amp;
    let x = 6 * a * Math.sin(t * 0.38 + phase) + 3.2 * a * Math.sin(t * 1.07 + phase * 2.3);
    if (this.live) x += 1.6 * a * Math.sin(time * 0.9 + t * 0.55 + phase);
    return x;
  }

  private laneX(l: Lane) {
    return this.cx + l.side * this.spacing * (l.lane + 1);
  }

  /** x of a person's line at time t (includes arriving and leaving). */
  private personX(l: Lane, t: number, time: number) {
    const p = l.person;
    let x = this.laneX(l) + this.wave(t, l.phase, time);
    const edge = l.side < 0 ? -60 : this.W + 60;
    if (p.start > this.tMin && t < p.start + ENTRY) {
      x = edge + (x - edge) * easeOut(clamp01((t - p.start) / ENTRY));
    }
    if (p.status === 'branched' && p.end !== undefined && t > p.end) {
      x = x + (edge - x) * easeIn(clamp01((t - p.end) / EXIT));
    }
    return x;
  }

  private skyPos(l: Lane) {
    const x = this.laneX(l) + l.side * this.spacing * (0.8 + l.skyJitter);
    const margin = this.W < 640 ? 36 : 120;
    return {
      x: Math.max(margin, Math.min(this.W - margin, x)),
      y: this.nowY * (0.18 + 0.55 * l.skyY),
    };
  }

  /* ---------------------------------------------------------------- */
  /* Frame                                                             */
  /* ---------------------------------------------------------------- */

  /** Draws one frame and returns label anchors keyed by person/moment id ('you' for your line). */
  render(time: number): Map<string, Anchor> {
    const { ctx, W, H, T } = this;
    const anchors = new Map<string, Anchor>();
    ctx.clearRect(0, 0, W, H);

    this.drawAxis();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Your future: a faint dotted line into the unwritten part above now.
    this.drawFuture(time);

    // People.
    for (const l of this.lanes) {
      const p = l.person;
      if (T < p.start) continue;
      const dim = this.selected && this.selected !== p.id ? 0.28 : 1;
      const hi = this.selected === p.id ? 1.5 : 1;
      const tEnd =
        p.status === 'continues' || p.end === undefined
          ? T
          : p.status === 'branched'
            ? Math.min(T, p.end + EXIT)
            : Math.min(T, p.end);
      const fadeFrom = p.status === 'branched' && p.end !== undefined ? p.end : Infinity;
      this.drawTrail(l, p.start, tEnd, time, dim, hi, fadeFrom);

      // Head, star or nothing.
      if (p.status === 'ended' && p.end !== undefined && T >= p.end) {
        const k = easeInOut(clamp01((T - p.end) / RISE));
        const from = { x: this.personX(l, p.end, time), y: this.nowY };
        const to = this.skyPos(l);
        const sx = from.x + (to.x - from.x) * k;
        const sy = from.y + (to.y - from.y) * k;
        if (k < 1) {
          // The thread that pulls them up fades as they settle.
          ctx.strokeStyle = alpha(l.color, 0.35 * (1 - k) * dim);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(from.x, this.yAt(p.end));
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }
        this.drawStar(sx, sy, l.color, time, dim * hi, 1 + 0.4 * (1 - k));
        anchors.set(p.id, { x: sx, y: sy, o: dim, star: true });
      } else if (p.status === 'branched' && p.end !== undefined && T > p.end) {
        const k = clamp01((T - p.end) / EXIT);
        if (k < 1) {
          const hx = this.personX(l, T, time);
          this.drawHead(hx, this.nowY, l.color, (1 - k) * dim, hi);
          anchors.set(p.id, { x: hx, y: this.nowY, o: (1 - k) * dim, b: l.lane % 2 === 1 });
        } else {
          anchors.set(p.id, { x: 0, y: 0, o: 0 });
        }
      } else {
        const hx = this.personX(l, T, time);
        const arriving = p.start > this.tMin ? clamp01((T - p.start) / 1.5) : 1;
        this.drawHead(hx, this.nowY, l.color, arriving * dim, hi);
        anchors.set(p.id, { x: hx, y: this.nowY, o: arriving * dim, b: l.lane % 2 === 1 });
      }
    }

    // Your line, drawn last so it sits on top.
    const youDim = this.selected && this.selected !== 'you' && !this.selected.startsWith('moment') ? 0.55 : 1;
    this.drawYou(time, youDim);
    anchors.set('you', { x: this.cx + this.wave(T, 0, time, 0.5), y: this.nowY, o: 1 });

    // Moments on your line.
    for (const m of this.moments) {
      if (T < m.at) {
        anchors.set(m.id, { x: 0, y: 0, o: 0 });
        continue;
      }
      const y = this.yAt(m.at);
      const x = this.cx + this.wave(m.at, 0, time, 0.5);
      const age = T - m.at;
      const on = this.selected === m.id;
      if (age < 4) {
        // A ring of light when the moment happens.
        const k = age / 4;
        ctx.strokeStyle = alpha(colors.ember, 0.7 * (1 - k));
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, y, 6 + 38 * easeOut(k), 0, Math.PI * 2);
        ctx.stroke();
      }
      this.drawDiamond(x, y, on ? colors.ember : colors.champagne, on ? 7 : 5);
      const vis = y < H - 20 ? 1 : 0;
      anchors.set(m.id, { x, y, o: vis, l: true });
    }

    // The constellation.
    if (this.finale > 0) this.drawConstellation(time);

    ctx.restore();
    // The past fades into the dark at the bottom through an overlay in the component.
    return anchors;
  }

  /* ---------------------------------------------------------------- */
  /* Drawing helpers                                                   */
  /* ---------------------------------------------------------------- */

  private drawAxis() {
    const { ctx, H, T } = this;
    const x = this.W < 640 ? 14 : 40;
    ctx.save();
    ctx.strokeStyle = alpha(colors.champagne, 0.12);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();

    // "Now" marker.
    ctx.fillStyle = colors.amber;
    ctx.beginPath();
    ctx.moveTo(x - 4, this.nowY - 4);
    ctx.lineTo(x + 3, this.nowY);
    ctx.lineTo(x - 4, this.nowY + 4);
    ctx.fill();
    ctx.strokeStyle = alpha(colors.champagne, 0.08);
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.moveTo(x + 8, this.nowY);
    ctx.lineTo(this.W - x, this.nowY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Chapter ticks passing by.
    ctx.font = `500 10px ${fonts.sans}`;
    ctx.textBaseline = 'middle';
    for (const c of this.chapters) {
      if (c.start > T) continue;
      const y = this.yAt(c.start);
      if (y > H || y < 0) continue;
      ctx.fillStyle = alpha(colors.champagne, 0.55);
      ctx.fillRect(x - 3, y, 7, 1);
      if (this.W >= 640) {
        ctx.fillStyle = alpha(colors.champagne, 0.45);
        ctx.fillText(`${c.num} · ${c.name.toUpperCase()}`, x + 10, y);
      }
    }
    ctx.restore();
  }

  private drawFuture(time: number) {
    const { ctx } = this;
    ctx.save();
    ctx.setLineDash([2, 7]);
    ctx.lineDashOffset = this.live ? -time * 6 : 0;
    const g = ctx.createLinearGradient(0, 0, 0, this.nowY);
    g.addColorStop(0, alpha(youColor, 0));
    g.addColorStop(1, alpha(youColor, 0.35));
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(this.cx, this.nowY - 10);
    ctx.lineTo(this.cx, this.nowY * 0.12);
    ctx.stroke();
    ctx.restore();
  }

  /** A glowing line from t0 to t1 (t1 is the head end). */
  private drawTrail(l: Lane, t0: number, t1: number, time: number, dim: number, hi: number, fadeFrom: number) {
    const { ctx, H } = this;
    const from = Math.max(t0, this.T - WINDOW - 2);
    if (t1 <= from) return;
    const step = Math.max(0.12, 3 / this.ppu);
    const pts: number[] = [];
    for (let t = t1; t >= from; t -= step) {
      const y = this.yAt(t);
      if (y > H + 10) break;
      pts.push(this.personX(l, t, time), y);
    }
    pts.push(this.personX(l, from, time), this.yAt(from));
    if (pts.length < 4) return;

    const fade = fadeFrom < t1 ? 1 - 0.75 * clamp01((t1 - fadeFrom) / EXIT) : 1;
    const passes: [number, number][] = [
      [7 * hi, 0.07],
      [3 * hi, 0.18],
      [1.3 * hi, 0.9],
    ];
    for (const [w, a] of passes) {
      ctx.strokeStyle = alpha(l.color, a * dim * fade);
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      ctx.stroke();
    }
    // Glitter along the line.
    ctx.fillStyle = alpha('#FFFFFF', 0.5 * dim * fade);
    for (let i = 0; i < pts.length; i += 8) {
      const flick = 0.5 + 0.5 * Math.sin(time * 3 + i * 1.7 + l.phase);
      if (flick > 0.55) ctx.fillRect(pts[i] - 0.6, pts[i + 1] - 0.6, 1.2, 1.2);
    }
  }

  private drawYou(time: number, dim: number) {
    const { ctx, H, T } = this;
    const from = Math.max(this.tMin, T - WINDOW - 2);
    const step = Math.max(0.12, 3 / this.ppu);
    ctx.beginPath();
    let first = true;
    for (let t = T; t >= from; t -= step) {
      const y = this.yAt(t);
      if (y > H + 10) break;
      const x = this.cx + this.wave(t, 0, time, 0.5);
      if (first) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      first = false;
    }
    for (const [w, a] of [
      [10, 0.06],
      [4, 0.2],
      [1.8, 1],
    ] as const) {
      ctx.strokeStyle = alpha(youColor, a * dim);
      ctx.lineWidth = w;
      ctx.stroke();
    }
    this.drawHead(this.cx + this.wave(T, 0, time, 0.5), this.nowY, colors.ember, dim, 1.6);
  }

  private drawHead(x: number, y: number, color: string, o: number, size = 1) {
    if (o <= 0.01) return;
    const { ctx } = this;
    const r = 14 * size;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, alpha(color, 0.55 * o));
    g.addColorStop(0.35, alpha(color, 0.18 * o));
    g.addColorStop(1, alpha(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = alpha('#FFF8EC', 0.95 * o);
    ctx.beginPath();
    ctx.arc(x, y, 2.4 * size, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawStar(x: number, y: number, color: string, time: number, o: number, size = 1) {
    const { ctx } = this;
    const tw = this.live ? 0.8 + 0.2 * Math.sin(time * 2 + x * 0.05) : 1;
    this.drawHead(x, y, color, o * tw, size * 1.2);
    // Four-point sparkle.
    const s = 9 * size * tw;
    ctx.fillStyle = alpha('#FFF8EC', 0.85 * o);
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.quadraticCurveTo(x, y, x + s, y);
    ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y);
    ctx.quadraticCurveTo(x, y, x, y - s);
    ctx.fill();
  }

  private drawDiamond(x: number, y: number, color: string, s: number) {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s, y);
    ctx.lineTo(x, y + s);
    ctx.lineTo(x - s, y);
    ctx.closePath();
    ctx.fill();
  }

  private drawConstellation(time: number) {
    const { ctx } = this;
    const you = { x: this.cx, y: this.nowY };
    const pts: { x: number; y: number }[] = [];
    for (const l of this.lanes) {
      const p = l.person;
      if (p.status === 'ended' && p.end !== undefined && this.T >= p.end + RISE) pts.push(this.skyPos(l));
      if (p.status === 'continues') pts.push({ x: this.personX(l, this.T, time), y: this.nowY });
    }
    // Join the points in order around you, then each back to you.
    pts.sort((a, b) => Math.atan2(a.y - you.y, a.x - you.x) - Math.atan2(b.y - you.y, b.x - you.x));
    const k = easeInOut(this.finale);
    ctx.strokeStyle = alpha(colors.champagne, 0.45);
    ctx.lineWidth = 1;
    ctx.beginPath();
    const chain = [...pts];
    for (let i = 0; i < chain.length - 1; i++) {
      const a = chain[i];
      const b = chain[i + 1];
      const seg = clamp01(k * chain.length - i);
      if (seg <= 0) break;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + (b.x - a.x) * seg, a.y + (b.y - a.y) * seg);
    }
    for (const p of pts) {
      ctx.moveTo(you.x, you.y);
      ctx.lineTo(you.x + (p.x - you.x) * k, you.y + (p.y - you.y) * k);
    }
    ctx.stroke();
    this.drawStar(you.x, you.y, colors.ember, time, k, 1.4);
  }
}

/** Lowest free lane on each side, reused once an earlier line has gone. */
function assignLanes(people: Person[]): Lane[] {
  const busy: Record<'left' | 'right', number[]> = { left: [], right: [] };
  const sorted = [...people].sort((a, b) => a.start - b.start);
  const rnd = seeded(5);
  return sorted.map((person, i) => {
    const side = busy[person.side];
    const until =
      person.status === 'continues' || person.end === undefined
        ? Infinity
        : person.end + (person.status === 'branched' ? EXIT : 1);
    let lane = side.findIndex((u) => u < person.start - ENTRY);
    if (lane === -1) lane = side.length;
    side[lane] = until;
    const index = people.indexOf(person);
    return {
      person,
      color: person.color ?? lineColors[index % lineColors.length],
      side: person.side === 'left' ? -1 : 1,
      lane,
      phase: i * 1.9 + rnd() * 3,
      skyY: rnd(),
      skyJitter: rnd() * 0.8,
    };
  });
}

export const LIFE_SKY_DURATIONS = { ENTRY, EXIT, RISE, WINDOW };
