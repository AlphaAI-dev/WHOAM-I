/**
 * Opening scroll sequence (the intro itself is CSS, see styles/index.css).
 *
 * The scene pins for about one screen of scrolling:
 * 1. the outlined name drifts up and apart, the lockup lifts away,
 * 2. Rohit's statement rises around the portrait, one line at a time,
 * 3. blocks of amber, then roast, wipe the scene into the Founding Tree.
 */
import { markIdleOffscreen } from './idle';
import { gsap } from './setup';
import type { MotionContext } from '../hooks/useGsap';

export function animateHero({ root, reduced }: MotionContext) {
  if (reduced) return;
  const q = gsap.utils.selector(root);
  const stage = q('[data-anim=stage]')[0];
  let wasDark = false;

  markIdleOffscreen(root);

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: '+=140%',
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      // Once the wipe has darkened the screen, the navigation switches to light text.
      onUpdate: (self) => {
        const dark = self.progress > 0.8;
        if (dark !== wasDark) {
          wasDark = dark;
          window.dispatchEvent(new CustomEvent('sb:nav-theme', { detail: { dark } }));
        }
      },
    },
  });

  tl.to(q('[data-anim=ghost]'), { yPercent: -18, scale: 1.12, opacity: 0.4, duration: 1 }, 0)
    .to(q('[data-anim=lockup]'), { yPercent: 30, opacity: 0, duration: 0.7 }, 0.05)
    .to(q('[data-anim=portrait]'), { scale: 1.06, yPercent: -2, duration: 1, transformOrigin: '50% 100%' }, 0)
    .to(q('[data-anim=statement-small]'), { opacity: 0, duration: 0.15 }, 0.05)
    .fromTo(q('[data-anim=say]'), { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 0.18, stagger: 0.12 }, 0.12);

  // The wipe: amber leads, roast settles, in a scattered order.
  tl.to(q('[data-wipe=hero-out] [data-block=lead]'), { scaleY: 1, duration: 0.25, stagger: { each: 0.004, from: 'random' } }, 0.72)
    .to(q('[data-wipe=hero-out] [data-block=settle]'), { scaleY: 1, duration: 0.25, stagger: { each: 0.004, from: 'random' } }, 0.84);
}
