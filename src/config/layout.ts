/**
 * Layout values: SVG coordinate spaces, positions of overlay elements and
 * spacing that the components share. Coordinates are in each scene's own
 * viewBox units, so they scale with the scene.
 */
import type { ChapterId } from '../data/chapters';

/* ------------------------------------------------------------------ */
/* Founding Tree                                                       */
/* ------------------------------------------------------------------ */

type Cubic = [number, number, number, number, number, number, number, number];

export const tree = {
  /** Overlay coordinate space (from the design reference). */
  viewBox: { w: 1000, h: 760 },

  /**
   * Where the artwork sits inside the overlay space, in viewBox units.
   * To align overlays to new artwork, adjust this box (or the coordinates
   * below) until the trunk, branch tips and roots sit on the drawing.
   */
  image: { x: 80, y: 15, w: 840, h: 730 },

  /** Ground line and the point where roots spread from. */
  ground: { y: 600, x1: 200, x2: 800 },
  rootOrigin: { x: 500, y: 600 },
  /** Angles (degrees, 0 = right, clockwise) of the root strands. */
  rootAngles: [168, 138, 104, 78, 42, 12],

  /** Trunk: cubic Bezier from the ground to the crown. */
  trunk: [500, 600, 496, 520, 504, 450, 500, 380] as Cubic,

  /**
   * One main branch per chapter: cubic Bezier from trunk to tip.
   * The tip (last two numbers) is where the chapter marker sits.
   */
  branches: {
    i: { path: [500, 430, 440, 410, 320, 380, 250, 330] as Cubic, labelSide: 'left' },
    ii: { path: [500, 390, 470, 320, 410, 250, 360, 215] as Cubic, labelSide: 'left' },
    iii: { path: [500, 380, 505, 280, 495, 200, 500, 150] as Cubic, labelSide: 'right' },
    iv: { path: [500, 390, 530, 320, 590, 250, 640, 215] as Cubic, labelSide: 'right' },
    v: { path: [500, 430, 560, 410, 680, 380, 750, 330] as Cubic, labelSide: 'right' },
  } satisfies Record<ChapterId, { path: Cubic; labelSide: 'left' | 'right' }>,

  /** Extra twigs on the trunk itself (x, y, angle in radians, length). */
  trunkTwigs: [
    [500, 520, -2.55, 72, 1, 4],
    [500, 505, -0.6, 72, 1, 4],
    [500, 470, -2.0, 50, 2, 3],
    [500, 455, -1.15, 50, 2, 3],
  ] as [number, number, number, number, number, number][],

  /** Seed for the small aspect twigs, so the drawing is identical on every visit. */
  growthSeed: 11,

  /** Drifting light particles near the crown. */
  particles: [
    { x: 410, y: 250, r: 1.4, o: 0.5, accent: false },
    { x: 590, y: 190, r: 1.2, o: 0.4, accent: false },
    { x: 680, y: 300, r: 1.6, o: 0.35, accent: false },
    { x: 310, y: 360, r: 1.2, o: 0.4, accent: false },
    { x: 530, y: 110, r: 1.0, o: 0.5, accent: false },
    { x: 460, y: 300, r: 1.4, o: 0.6, accent: true },
  ],

  /**
   * Overlay strength. Lower `withArtwork` values let the illustration lead;
   * `withoutArtwork` is used while the artwork file is missing.
   */
  overlayOpacity: { withArtwork: 0.7, withoutArtwork: 1 },
} as const;

/* ------------------------------------------------------------------ */
/* Constellation map                                                   */
/* ------------------------------------------------------------------ */

export const constellation = {
  viewBox: { w: 1000, h: 640 },
  points: {
    i: { x: 180, y: 420, labelSide: 'right' },
    ii: { x: 330, y: 220, labelSide: 'right' },
    iii: { x: 520, y: 140, labelSide: 'right' },
    iv: { x: 700, y: 260, labelSide: 'right' },
    v: { x: 840, y: 470, labelSide: 'left' },
  } satisfies Record<ChapterId, { x: number; y: number; labelSide: 'left' | 'right' }>,
  /** The faint dotted line leading off the map from the last chapter. */
  tail: { x: 960, y: 560 },
  starCount: 110,
  starSeed: 7,
} as const;
