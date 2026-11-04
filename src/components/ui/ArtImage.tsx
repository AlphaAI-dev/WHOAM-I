import { useState, type CSSProperties } from 'react';
import type { ImageAsset } from '../../config/assets';

interface Props {
  asset: ImageAsset;
  /** Above-the-fold image: load immediately with high priority. */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Called when the image is missing or fails to load. */
  onMissing?: () => void;
}

/**
 * Renders a configured image (WebP/AVIF first when available, original as
 * fallback). While the file is missing it renders a labelled empty frame
 * instead, so the layout stays the same.
 */
export function ArtImage({ asset, priority = false, className = '', style, onMissing }: Props) {
  const [failed, setFailed] = useState(false);

  if (!asset.src || failed) {
    return (
      <div
        role="img"
        aria-label={`${asset.alt} (image not added yet)`}
        className={`flex items-end justify-start border border-dashed border-paper/15 bg-surface/60 p-4 ${className}`}
        style={style}
      >
        <span className="label whitespace-pre-line text-[10px] leading-[1.7] text-quiet normal-case tracking-[0.12em]">
          {asset.placeholder}
        </span>
      </div>
    );
  }

  return (
    <picture>
      {asset.avif && <source type="image/avif" srcSet={asset.avif} />}
      {asset.webp && <source type="image/webp" srcSet={asset.webp} />}
      <img
        src={asset.src}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
        onError={() => {
          setFailed(true);
          onMissing?.();
        }}
        className={className}
        style={{ objectFit: asset.fit, objectPosition: asset.objectPosition, filter: asset.filter, ...style }}
      />
    </picture>
  );
}
