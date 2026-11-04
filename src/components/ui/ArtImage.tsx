import { useState, type CSSProperties } from 'react';
import type { ImageAsset } from '../../config/assets';

interface Props {
  asset: ImageAsset;
  /** Above-the-fold image: load immediately with high priority. */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Extra classes for the empty state (e.g. its text colour). */
  placeholderClassName?: string;
  /** Called when the image is missing or fails to load. */
  onMissing?: () => void;
}

/**
 * Renders a configured image (AVIF/WebP first when available, original as
 * fallback). While the file is missing it renders a quiet labelled space
 * instead, so the layout and the scene stay intact.
 */
export function ArtImage({ asset, priority = false, className = '', style, placeholderClassName = 'text-mocha/50', onMissing }: Props) {
  const [failed, setFailed] = useState(false);

  if (!asset.src || failed) {
    return (
      <div
        role="img"
        aria-label={`${asset.alt} (image not added yet)`}
        className={`flex items-end justify-center pb-[18%] ${placeholderClassName} ${className}`}
        style={style}
      >
        <span className="eyebrow text-center text-[9px] whitespace-pre-line">{asset.placeholder}</span>
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
