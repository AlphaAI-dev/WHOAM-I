/**
 * Closing: your line continues, dotted, into the dark; the sentences surface
 * one after another and the ember of light breathes.
 */
import { markIdleOffscreen } from './idle';
import { gsap, ScrollTrigger } from './setup';
import { motion } from '../config/theme';
import type { MotionContext } from '../hooks/useGsap';

export function animateClosing({ root, reduced }: MotionContext) {
  if (reduced) return;
  const q = gsap.utils.selector(root);

  markIdleOffscreen(root);

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
      y: motion.reveal.y * 1.5,
      filter: 'blur(8px)',
      duration: 1.6,
      stagger: 0.7,
      ease: motion.ease.reveal,
    });

  const ember = gsap.to(q('[data-anim=ember]'), {
    scale: 1.15,
    opacity: 0.7,
    duration: motion.ambient.breathe / 2,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    paused: true,
  });
  ScrollTrigger.create({
    trigger: root,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? ember.play() : ember.pause()),
  });
}
