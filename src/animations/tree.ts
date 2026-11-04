/**
 * Founding Tree motion.
 * - Trunk and chapter branches draw as you scroll (scrubbed line draws).
 * - Twigs, aspects and chapter markers fade in once the tree is in view.
 * - Ambient loops: the roots and lit aspects breathe, particles drift.
 *   Loops pause while the tree is off screen.
 * Under reduced motion nothing is animated: the final drawing is shown.
 */
import { gsap, ScrollTrigger, hideStroke } from './setup';
import { motion } from '../config/theme';
import type { MotionContext } from '../hooks/useGsap';

export function animateTree({ root, reduced }: MotionContext) {
  if (reduced) return;
  const q = gsap.utils.selector(root);
  const stage = q('[data-anim=stage]')[0] ?? root;

  // 1. Line draws, tied to scroll.
  const trunk = q('[data-anim=trunk]');
  const branches = q('[data-anim=branch]');
  hideStroke([...trunk, ...branches]);
  gsap
    .timeline({
      scrollTrigger: { trigger: stage, start: 'top 85%', end: 'center 55%', scrub: motion.scrub },
      defaults: { ease: 'none' },
    })
    .to(trunk, { strokeDashoffset: 0, duration: 1 })
    .to(branches, { strokeDashoffset: 0, duration: 1.4, stagger: 0.2 }, 0.6);

  // 2. Details appear once, staggered like the reference.
  gsap
    .timeline({ scrollTrigger: { trigger: stage, start: 'top 60%', toggleActions: 'play none none reverse' } })
    .from(q('[data-anim=roots]'), { opacity: 0, duration: 1.4, ease: 'power1.out' }, 0)
    .from(q('[data-anim=twigs]'), { opacity: 0, duration: 1.6, ease: 'power1.out' }, 0.3)
    .from(q('[data-anim=lit]'), { opacity: 0, duration: 1.6, ease: 'power1.out' }, 0.8)
    .from(q('[data-anim=leaves]'), { opacity: 0, duration: 1.2, ease: 'power1.out' }, 1.1)
    .from(
      q('[data-anim=marker]'),
      { opacity: 0, y: 8, duration: 0.9, stagger: motion.stagger.nodes, ease: motion.ease.reveal },
      0.5,
    );

  // 3. Ambient loops, running only while the tree is on screen.
  const half = motion.ambient.breathe / 2;
  const loop = { repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true } as const;
  const loops: gsap.core.Tween[] = [
    gsap.to(q('[data-anim=breathe]'), { ...loop, opacity: 0.35, duration: half }),
    ...q('[data-anim=glow-leaf]').map((el, i) =>
      // Offset each aspect so they don't pulse in unison.
      gsap.to(el, { ...loop, opacity: 0.35, duration: half }).totalTime((i * 0.73) % motion.ambient.breathe),
    ),
    ...q('[data-anim=particle]').map((el, i) =>
      gsap.to(el, { ...loop, y: -14, duration: motion.ambient.drift / 2 }).totalTime(i * 1.5),
    ),
  ];
  ScrollTrigger.create({
    trigger: stage,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => loops.forEach((t) => (self.isActive ? t.play() : t.pause())),
  });
}

/** Short fade when the selected chapter's details change. */
export function animateChapterSwap({ root, reduced }: MotionContext) {
  const items = gsap.utils.selector(root)('[data-anim=swap]');
  if (reduced || !items.length) return;
  gsap.from(items, {
    opacity: 0,
    y: 6,
    duration: 0.5,
    stagger: 0.04,
    ease: motion.ease.reveal,
  });
}
