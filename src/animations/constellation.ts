/**
 * Constellation map: the overlay fades in, the connections draw one after
 * another and the chapter points appear in sequence. Closing fades it out.
 */
import { gsap, hideStroke } from './setup';
import { motion } from '../config/theme';
import type { MotionContext } from '../hooks/useGsap';

export function animateMapOpen({ root, reduced }: MotionContext) {
  if (reduced) return;
  const q = gsap.utils.selector(root);
  const edges = q('[data-anim=edge]');
  hideStroke(edges);
  gsap
    .timeline()
    .from(root, { opacity: 0, duration: motion.overlay, ease: 'power1.out' })
    .from(q('[data-anim=point]'), { opacity: 0, scale: 0.6, duration: 0.6, stagger: motion.stagger.nodes }, 0.15)
    .to(edges, { strokeDashoffset: 0, duration: 1.1, ease: motion.ease.draw, stagger: 0.12, clearProps: 'strokeDasharray,strokeDashoffset' }, 0.3)
    .from(q('[data-anim=tail]'), { opacity: 0, duration: 0.8 }, 1)
    .from(q('[data-anim=panel]'), { opacity: 0, y: motion.reveal.y, duration: 0.9 }, 0.2);
}

export function animateMapClose(root: HTMLElement, reduced: boolean, done: () => void) {
  if (reduced) {
    done();
    return;
  }
  gsap.to(root, { opacity: 0, duration: motion.overlay * 0.8, ease: 'power1.in', onComplete: done });
}
