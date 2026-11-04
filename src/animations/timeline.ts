/**
 * Life timeline motion helpers. The flowing lines themselves are drawn by
 * lib/lifeSky.ts and driven from components/LifeTimeline (scroll → time).
 */
import { gsap } from './setup';
import { motion } from '../config/theme';
import type { MotionContext } from '../hooks/useGsap';

/** Fade when the detail panel opens or its content changes. */
export function animatePanelSwap({ root, reduced }: MotionContext) {
  const items = gsap.utils.selector(root)('[data-anim=swap]');
  if (reduced || !items.length) return;
  gsap.from(root, { opacity: 0, y: 12, duration: 0.5, ease: motion.ease.reveal });
  gsap.from(items, { opacity: 0, y: 8, duration: 0.5, stagger: 0.04, ease: motion.ease.reveal });
}
