/**
 * Lets the rest of the page move the life timeline to a point in time
 * (used by the Founding Tree and the constellation map). The timeline
 * registers its handler when it mounts.
 */
type Handler = (t: number, smooth: boolean) => void;

let handler: Handler | null = null;

export const timelineNav = {
  register(h: Handler) {
    handler = h;
    return () => {
      if (handler === h) handler = null;
    };
  },
  /** Returns false when the timeline isn't mounted. */
  go(t: number, smooth: boolean): boolean {
    if (!handler) return false;
    handler(t, smooth);
    return true;
  },
};
