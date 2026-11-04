/**
 * Closing: your line continues, dotted, into the dark; the two sentences
 * surface one after the other, and the single point of light breathes.
 */
import { gsap } from './setup';
import { motion } from '../config/theme';
import type { MotionContext } from '../hooks/useGsap';

export function animateClosing({ root, reduced }: MotionContext) {
  if (reduced) return;
  const q = gsap.utils.selector(root);

  gsap.fromTo(
    q('[data-anim=thread]'),
    { scaleY: 0 },
    {
      scaleY: 1,
      transformOrigin: '50% 0%',
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top 90%', end: 'center 60%', scrub: motion.scrub },
    },
  );

  gsap
    .timeline({ scrollTrigger: { trigger: root, start: 'top 45%', toggleActions: 'play none none reverse' } })
    .from(q('[data-anim=sentence]'), {
      opacity: 0,
      y: motion.reveal.y,
      duration: 1.6,
      stagger: 1.1,
      ease: motion.ease.reveal,
    });

  const light = gsap.to(q('[data-anim=light]'), {
    opacity: 0.35,
    duration: motion.ambient.breathe / 2,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    paused: true,
  });
  gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top bottom',
      onToggle: (self) => (self.isActive ? light.play() : light.pause()),
    },
  });
}
