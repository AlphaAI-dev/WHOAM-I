/**
 * A grid of blocks used for scene transitions. Two layers (an accent colour
 * that leads and the destination colour that follows) give the wipe depth.
 * The blocks are animated by the scene that owns them (animations/*.ts).
 */
interface Props {
  /** Leading colour, then the colour the wipe settles on. */
  lead: string;
  settle: string;
  cols?: number;
  rows?: number;
  /** data-wipe value, so the owning animation can find it. */
  name: string;
  className?: string;
}

export function BlockWipe({ lead, settle, cols = 10, rows = 6, name, className = '' }: Props) {
  const cells = Array.from({ length: cols * rows }, (_, i) => i);
  const layer = (color: string, kind: string) => (
    <div
      className="absolute inset-0 grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
    >
      {cells.map((i) => (
        <span
          key={i}
          data-block={kind}
          className="-m-px block"
          style={{ background: color, transform: 'scaleY(0)', transformOrigin: 'bottom' }}
        />
      ))}
    </div>
  );
  return (
    <div data-wipe={name} aria-hidden="true" className={`pointer-events-none absolute inset-0 z-30 ${className}`}>
      {layer(lead, 'lead')}
      {layer(settle, 'settle')}
    </div>
  );
}
