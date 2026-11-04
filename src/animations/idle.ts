import { ScrollTrigger } from './setup';

/**
 * Adds .is-idle to a scene while it is off screen, which pauses its CSS
 * ambient loops (drifting light, shimmer) so hidden scenes cost nothing.
 */
export function markIdleOffscreen(root: HTMLElement) {
  root.classList.add('is-idle');
  ScrollTrigger.create({
    trigger: root,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => root.classList.toggle('is-idle', !self.isActive),
  });
}
