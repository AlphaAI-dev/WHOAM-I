/**
 * Page-level transitions:
 * - reports which scene is in view (for the navigation and its colour);
 * - section intros marked [data-reveal] rise in as they arrive;
 * - all scroll positions are recalculated once web fonts have loaded.
 */
import { gsap, ScrollTrigger } from './setup';
import { motion } from '../config/theme';
import type { MotionContext } from '../hooks/useGsap';

export function setupTransitions({ root, reduced }: MotionContext, onScene: (id: string, dark: boolean) => void) {
  const q = gsap.utils.selector(root);

  q('[data-section]').forEach((el) => {
    const section = el as HTMLElement;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 40px',
      end: 'bottom 40px',
      onToggle: (self) => self.isActive && onScene(section.dataset.section ?? '', section.dataset.theme === 'dark'),
    });
  });

  if (!reduced) {
    q('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: motion.reveal.y,
        filter: 'blur(6px)',
        duration: motion.reveal.duration,
        ease: motion.ease.reveal,
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      });
    });
  }

  // Children registered their pins first; order everything by page position.
  ScrollTrigger.sort();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
