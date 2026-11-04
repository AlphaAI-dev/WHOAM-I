/**
 * Design tokens.
 *
 * The palette is built on three colours: mocha brown and champagne gold
 * carry the page, and burnt amber is the third colour that adds warmth and
 * depth. Every other tone is a tint or shade of those three.
 *
 * TypeScript code (canvas, SVG, GSAP) reads values from here. The same values
 * are exposed to Tailwind/CSS in src/styles/index.css (@theme). If you change
 * a colour or font here, change it there too.
 */

export const colors = {
  /* The three brand colours */
  mocha: '#5B4632',
  champagne: '#F4D9A0',
  amber: '#C8792C',

  /* Tints and shades used for depth */
  cream: '#F7EEDC', // page ground of the light scenes
  sand: '#EADBBE', // panels on cream
  latte: '#A68B6D', // quiet text on cream
  roast: '#3A2B1F', // dark scene ground
  espresso: '#21170F', // night sky of the life timeline
  night: '#140D08', // the unfinished chapter
  ember: '#E89A4B', // amber lit from within (glows)
} as const;

/**
 * Colours for people's lines on the life timeline, in order. Warm and cool
 * tones alternate so neighbouring lines stay distinct. A person can override
 * theirs with `color` in src/data/people.ts.
 */
export const lineColors = [
  '#C8792C', // burnt amber
  '#9FB7C9', // mist blue
  '#D98E73', // clay rose
  '#A9BE8E', // sage
  '#C7A6D6', // heather
  '#7FB7AE', // sea glass
  '#E3B862', // honey
] as const;

/** Your own line and star. */
export const youColor = colors.champagne;

export const fonts = {
  display: "'Archivo Expanded', 'Archivo', 'Arial Black', system-ui, sans-serif",
  script: "'Pinyon Script', 'Snell Roundhand', cursive",
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'Inter Tight', system-ui, sans-serif",
} as const;

/** Stroke widths. */
export const strokes = {
  branch: 1.4,
  twig: 0.8,
} as const;

/** Motion values. Durations are in seconds, matching GSAP. */
export const motion = {
  ease: {
    /** Reveal: cubic-bezier(.2,.7,.1,1) */
    reveal: 'sb-reveal',
    /** Line draw and wipes: cubic-bezier(.65,0,.35,1) */
    draw: 'sb-draw',
  },
  reveal: { duration: 1.1, y: 24 },
  stagger: { nodes: 0.12, chars: 0.045 },
  ambient: { breathe: 4.5, twinkle: 6, drift: 8 },
  /** Smoothing applied to scroll-scrubbed effects (seconds to catch up). */
  scrub: 0.8,
  /** Opening and closing the constellation map. */
  overlay: 0.5,
  /** Scroll length of the life timeline, in viewport heights per 100 units of time. */
  timelineLength: 5,
} as const;

/** Bezier control points for the custom eases above, registered in animations/setup.ts. */
export const easeCurves = {
  'sb-reveal': [0.2, 0.7, 0.1, 1],
  'sb-draw': [0.65, 0, 0.35, 1],
} as const;

/** Mix a hex colour with alpha, for canvas and inline styles. */
export function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
