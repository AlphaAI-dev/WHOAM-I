/**
 * Opening: the portrait unveils upward, the name and the three lines rise in
 * sequence, then the scroll cue appears. Leaving the scene softly fades it.
 * Timings follow docs/design-reference/00_Opening.dc.html.
 */
import { gsap } from './setup';
import { motion } from '../config/theme';
import type { MotionContext } from '../hooks/useGsap';

export function animateHero({ root, reduced }: MotionContext) {
  if (reduced) return;
  const q = gsap.utils.selector(root);
  const { duration, y } = motion.reveal;

  const intro = gsap.timeline({ defaults: { ease: motion.ease.reveal } });
  intro
    .fromTo(
      q('[data-anim=portrait]'),
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: motion.ease.draw, clearProps: 'clipPath' },
      0.2,
    )
    .from(q('[data-anim=name]'), { opacity: 0, y, duration }, 0.6)
    .from(q('[data-anim=line]'), { opacity: 0, y, duration, stagger: 0.5 }, 1.4)
    .from(q('[data-anim=cue]'), { opacity: 0, duration: 1.6, ease: 'power1.out' }, 3);

  // Leaving the opening: a gentle fade, no parallax.
  gsap.to(q('[data-anim=hero-inner]'), {
    opacity: 0.15,
    y: -32,
    ease: 'none',
    scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: motion.scrub },
  });
}
