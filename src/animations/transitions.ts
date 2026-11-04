/**
 * Page-level transitions:
 * - the header label follows the section in view (also under reduced motion);
 * - section intros marked [data-reveal] rise in once as they arrive;
 * - layout-dependent triggers are refreshed once web fonts have loaded.
 */
import { gsap, ScrollTrigger } from './setup';
import { motion } from '../config/theme';
import type { MotionContext } from '../hooks/useGsap';

export function setupTransitions(
  { root, reduced }: MotionContext,
  onSection: (id: string) => void,
) {
  const q = gsap.utils.selector(root);

  q('[data-section]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => self.isActive && onSection((el as HTMLElement).dataset.section ?? ''),
    });
  });

  if (!reduced) {
    q('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: motion.reveal.y,
        duration: motion.reveal.duration,
        ease: motion.ease.reveal,
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      });
    });
  }

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
