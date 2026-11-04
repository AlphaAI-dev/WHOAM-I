/** Registers GSAP plugins and the design's custom eases once, app-wide. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { easeCurves } from '../config/theme';

gsap.registerPlugin(ScrollTrigger, CustomEase);

for (const [name, [x1, y1, x2, y2]] of Object.entries(easeCurves)) {
  CustomEase.create(name, `M0,0 C${x1},${y1} ${x2},${y2} 1,1`);
}

gsap.defaults({ ease: 'sb-reveal' });

// Touch devices: don't recalculate on the address bar showing/hiding.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };

/**
 * Length that drawable paths declare with pathLength={DRAW}, so stroke draws
 * work in the same units whatever a path's real length. It is large because
 * GSAP rounds pixel values: with a length of 1 a line could only be fully
 * hidden or fully drawn.
 */
export const DRAW = 1000;

/** Prepares paths to be "drawn" by tweening strokeDashoffset DRAW → 0. */
export function hideStroke(targets: gsap.TweenTarget) {
  gsap.set(targets, { strokeDasharray: DRAW, strokeDashoffset: DRAW });
}
