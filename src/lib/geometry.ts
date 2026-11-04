/** Small, dependency-free geometry helpers shared by the SVG scenes. */

export type Cubic = readonly [number, number, number, number, number, number, number, number];

/** Deterministic pseudo-random generator (Park–Miller), as used by the design reference. */
export function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Point on a cubic Bezier at t (0..1). */
export function bezierAt(p: Cubic, t: number): [number, number] {
  const u = 1 - t;
  return [
    u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6],
    u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7],
  ];
}

export function cubicPath(p: Cubic): string {
  return `M${p[0]} ${p[1]} C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]}`;
}

export const fmt = (v: number) => v.toFixed(1);
