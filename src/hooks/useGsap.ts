import { useLayoutEffect, type DependencyList, type RefObject } from 'react';
import { gsap } from '../animations/setup';

export interface MotionContext {
  /** The scoped root element. Selector strings inside `setup` are limited to it. */
  root: HTMLElement;
  /** True when the visitor prefers reduced motion: show final states, no loops, no scrub. */
  reduced: boolean;
}

/**
 * Runs GSAP setup for a component inside a scoped matchMedia context.
 *
 * - Everything created inside `setup` (tweens, timelines, ScrollTriggers) is
 *   reverted when deps change, when the component unmounts, and when the
 *   reduced-motion preference changes (setup then re-runs with the new value).
 * - Selector strings such as '[data-anim=line]' only match inside `scope`.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (ctx: MotionContext) => void | (() => void),
  deps: DependencyList = [],
) {
  useLayoutEffect(() => {
    const root = scope.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' },
      (ctx) => setup({ root, reduced: !!ctx.conditions?.reduced }),
    );
    return () => mm.revert();
  }, deps);
}
