/**
 * Central image configuration.
 *
 * HOW TO ADD OR REPLACE AN IMAGE
 * 1. Put the original file in src/assets/images/ using the `file` name below
 *    (any of .jpg, .jpeg, .png or .webp). Originals are never modified.
 * 2. Optional: add a WebP next to it with the same base name
 *    (for example portrait.webp beside portrait.jpg). The site then serves the
 *    WebP and keeps the original as a fallback. See README › Images.
 * 3. Set `width`/`height` to the file's real pixel size so the page reserves
 *    the right space before the image loads.
 *
 * Files are detected at build time. If an image is missing, the site shows a
 * labelled empty frame in its place instead of a broken image, and every other
 * part keeps working.
 */

const files = import.meta.glob<string>('../assets/images/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** Look up an image by base name; returns the best format available plus a fallback. */
function resolve(base: string): { src?: string; webp?: string; avif?: string } {
  const found: Record<string, string> = {};
  for (const [path, url] of Object.entries(files)) {
    const name = path.split('/').pop() ?? '';
    const dot = name.lastIndexOf('.');
    if (name.slice(0, dot) === base) found[name.slice(dot + 1).toLowerCase()] = url;
  }
  const original = found.jpg ?? found.jpeg ?? found.png;
  return {
    src: original ?? found.webp ?? found.avif,
    webp: original ? found.webp : undefined,
    avif: found.avif,
  };
}

export interface ImageAsset {
  /** Base file name in src/assets/images (no extension). */
  file: string;
  /** Resolved URL of the original (or the only available format). Undefined when missing. */
  src?: string;
  /** Resolved WebP variant, served first when present. */
  webp?: string;
  avif?: string;
  /** Intrinsic size of the file in pixels; used for aspect ratio and layout stability. */
  width: number;
  height: number;
  alt: string;
  /** CSS object-position: which part of the image stays in frame when it is cropped. */
  objectPosition: string;
  /** CSS object-fit inside its frame. */
  fit: 'cover' | 'contain';
  /** Optional CSS filter, for example 'grayscale(1)'. */
  filter?: string;
  /** Text shown in the empty frame while the file is missing. */
  placeholder: string;
}

export const assets = {
  /** Opening scene. The frame is 3:4; `objectPosition` chooses the crop. */
  portrait: {
    file: 'portrait',
    ...resolve('portrait'),
    width: 1200,
    height: 1600,
    alt: 'Portrait of Rohit',
    objectPosition: '50% 30%',
    fit: 'cover',
    filter: 'grayscale(1) sepia(0.35) contrast(1.06)',
    placeholder: 'Portrait\nadd src/assets/images/portrait.*',
  },
  /**
   * The Founding Tree illustration. It is drawn under the SVG overlays.
   * Where it sits inside the overlay coordinate space is set in
   * layout.ts › tree.image, so overlays and artwork can be aligned.
   */
  foundingTree: {
    file: 'founding-tree',
    ...resolve('founding-tree'),
    width: 2000,
    height: 1520,
    alt: 'The Founding Tree: an illustrated tree whose branches are the chapters of this life',
    objectPosition: '50% 50%',
    fit: 'contain',
    placeholder: 'Founding Tree artwork\nadd src/assets/images/founding-tree.*',
  },
} satisfies Record<string, ImageAsset>;

export type AssetKey = keyof typeof assets;
