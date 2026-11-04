/**
 * Life timeline motion.
 *
 * Your line draws with the scroll. As its tip reaches each row:
 * - a person's entry point appears on your line, their line draws out into
 *   its lane and on down to where it continues, branches away or ends;
 * - their name fades in beside it;
 * - moments and chapter headings appear on the line.
 * Everything reverses when scrolling back up, so the drawing always matches
 * how far you have read. Under reduced motion the full drawing is shown.
 */
import { gsap, hideStroke } from './setup';
import { motion } from '../config/theme';
import type { MotionContext } from '../hooks/useGsap';
import type { TimelineGeometry } from '../lib/timelineLayout';

/** Viewport line (from the top) that "reads" the timeline. */
const READ = '68%';

export function animateTimeline({ root, reduced }: MotionContext, geo: TimelineGeometry | null) {
  if (reduced || !geo) return;
  const q = gsap.utils.selector(root);
  const graph = q('[data-anim=graph]')[0];
  if (!graph) return;

  const at = (y: number) => `top+=${Math.round(y)} ${READ}`;
  const appear = (targets: Element[], y: number, vars: gsap.TweenVars) =>
    targets.length > 0 &&
    gsap.from(targets, {
      duration: 0.8,
      ease: motion.ease.reveal,
      ...vars,
      scrollTrigger: { trigger: graph, start: at(y), toggleActions: 'play none none reverse' },
    });

  // Your line.
  const you = q('[data-anim=you]');
  hideStroke(you);
  gsap.to(you, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: { trigger: graph, start: at(geo.top), end: at(geo.bottom), scrub: motion.scrub },
  });
  appear(q('[data-anim=you-label]'), geo.top - 40, { opacity: 0, duration: 1.2 });

  // People.
  for (const p of geo.people) {
    const sel = (part: string) => q(`[data-person="${p.person.id}"][data-part="${part}"]`);
    const line = sel('line');
    hideStroke(line);
    gsap.to(line, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: { trigger: graph, start: at(p.y0), end: at(p.yEnd), scrub: motion.scrub },
    });
    appear(sel('node'), p.y0, { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)' });
    appear(sel('label'), p.y1, {
      opacity: 0,
      x: p.person.side === 'left' ? 12 : -12,
      duration: motion.reveal.duration,
    });
    appear(sel('tail'), p.yEnd, { opacity: 0, duration: 1 });
    appear(sel('end'), p.yEnd, { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.6 });
  }

  // Moments and chapter headings on your line.
  for (const m of geo.moments) {
    const sel = (part: string) => q(`[data-moment="${m.moment.id}"][data-part="${part}"]`);
    appear(sel('node'), m.y, { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)' });
    appear(sel('label'), m.y, { opacity: 0, y: 8, duration: motion.reveal.duration });
  }
  for (const c of geo.chapters) {
    appear(q(`[data-chapter="${c.chapter.id}"]`), c.y, { opacity: 0, y: motion.reveal.y });
  }
  if (geo.unwritten) {
    appear(q('[data-anim=unwritten]'), geo.bottom, { opacity: 0, duration: 1.6, ease: 'power1.out' });
  }
}

/** Fade when the detail panel's content changes. */
export function animatePanelSwap({ root, reduced }: MotionContext) {
  const items = gsap.utils.selector(root)('[data-anim=swap]');
  if (reduced || !items.length) return;
  gsap.from(items, {
    opacity: 0,
    y: 6,
    duration: 0.45,
    stagger: 0.04,
    ease: motion.ease.reveal,
  });
}
