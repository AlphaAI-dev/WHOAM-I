# WHOAM-I

**STILL BECOMING**: Rohit's animated personal life website.

One scrolling page in four scenes, plus a map:

| Scene | What it is |
|---|---|
| **00 Opening** | The portrait and the statement: *Still becoming. Still exploring. Still building.* |
| **01 The Founding Tree** | The tree illustration with SVG overlays: glowing roots, chapter branches, lit and dark aspects, and a marker for each chapter. |
| **02 Life timeline** | Your life as a central line. People's lines join it as you scroll; some continue, some branch away, some end. Moments sit on your line. |
| **03 Unwritten** | A near-black closing scene: *The story is still being written. Still becoming.* |
| **Map** (header) | A full-screen constellation of the five chapters: an alternative way to navigate. |

Built with React 19, Vite, TypeScript, Tailwind CSS v4, GSAP + ScrollTrigger and inline SVG. It is a static site with no backend.

---

## Local development

Requires Node.js 20.19+ (Node 22 recommended; see `.node-version`).

```bash
npm install
```

```bash
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-checks, then builds the production site into `dist/` |
| `npm run preview` | Serves the built `dist/` locally to check the production build |
| `npm run typecheck` | Type-check only |

---

## Editing content

All personal content lives in `src/data/`. Anything in `[square brackets]`
is a placeholder: the site shows it with a small **PLACEHOLDER** tag until
you replace it. No personal stories have been invented: every name, year
and note is yours to write.

| File | Contains |
|---|---|
| `src/data/site.ts` | Name, opening statement, closing lines, section labels |
| `src/data/chapters.ts` | The five chapters (Roots, Learning, Building, People, Unwritten), their summaries and how they connect on the map |
| `src/data/people.ts` | People on the timeline |
| `src/data/timeline.ts` | Moments on your own line |

### Add a person

Copy an entry in `src/data/people.ts`:

```ts
{
  id: 'person-e',
  name: 'Their name',
  relation: 'Friend',
  enters: '2019',
  leaves: '',             // '' while they are still here
  status: 'continues',    // 'continues' | 'branched' | 'ended'
  side: 'right',          // which side of your line
  chapter: 'iii',         // chapter they entered in
  // until: 'iv',         // for branched/ended: the chapter the line leaves in
  note: 'What they changed.',
},
```

No UI changes are needed. The timeline gives each person their own row and
a lane beside your line, reusing lanes once earlier lines have ended. Within
a chapter, people come first and moments follow; add `order: <number>` to
people or moments to interleave them.

---

## Images

Images live in `src/assets/images/` and are configured in
`src/config/assets.ts`. They are detected **by file name at build time**:

| File name | Used for |
|---|---|
| `portrait.jpg` / `.png` / `.webp` | Opening portrait (3:4 frame, shown in black and white) |
| `founding-tree.png` / `.jpg` / `.webp` | Founding Tree illustration |

- **Originals are kept as they are.** Add a `.webp` with the same base name next to the original and the site serves the WebP first, falling back to the original.
- If a file is missing, the site shows a labelled empty frame in its place and everything else keeps working.
- In `assets.ts`, set `width`/`height` to the real pixel size and adjust `objectPosition` (crop focus), `fit` and `filter` (the portrait is grayscale by default).
- Vite gives built images content-hashed names, and `public/_headers` tells Cloudflare to cache them permanently.

To make a WebP without adding a project dependency (either tool works):

```bash
cwebp -q 82 src/assets/images/portrait.jpg -o src/assets/images/portrait.webp
```

```bash
npx --yes sharp-cli -i src/assets/images/founding-tree.png -o src/assets/images/founding-tree.webp -f webp -q 82
```

### Aligning the tree overlays to the artwork

The overlays (roots, trunk, five chapter branches, aspects, markers) are
drawn in a 1000 × 760 coordinate space defined in `src/config/layout.ts`
(`tree`):

1. `tree.image` sets where the illustration sits in that space (x, y, w, h). Adjust it first, so the artwork's trunk sits on x = 500 and its ground on y = 600.
2. If branches still don't match, edit `tree.branches.<chapter>.path`, a cubic Bezier `[x0,y0, c1x,c1y, c2x,c2y, x1,y1]` from the trunk to the tip. The tip is where the chapter marker sits.
3. `tree.overlayOpacity.withArtwork` controls how strongly the overlays sit on top of the illustration.

---

## Project structure

```
src/
  config/       theme.ts (colours, fonts, motion) · assets.ts (images) · layout.ts (coordinates, spacing)
  data/         site.ts · chapters.ts · people.ts · timeline.ts — all editable content
  components/   Hero/ · FoundingTree/ · LifeTimeline/ · Constellation/ · Closing/ · ui/
  animations/   setup.ts · hero.ts · tree.ts · timeline.ts · constellation.ts · closing.ts · transitions.ts
  hooks/        useGsap.ts (scoped GSAP + reduced motion) · useReducedMotion.ts
  lib/          geometry.ts · treeGeometry.ts · timelineLayout.ts · navigation.ts
  styles/       index.css (Tailwind + design tokens)
docs/design-reference/   the original mockups the site implements
public/         favicon.svg · _headers (Cloudflare caching)
```

Content, styling and animation are separate: components render from
`data/` and `config/`, and each scene's motion lives in its own file in
`animations/`. Colours and fonts are defined in `src/config/theme.ts` and
mirrored in `src/styles/index.css` (`@theme`). Keep the two in sync.

## Motion and accessibility

- GSAP timelines with ScrollTrigger. Only line drawing is tied to scroll (scrubbed); everything else plays once as it comes into view and reverses when you scroll back up.
- Ambient loops (breathing roots, glowing aspects, drifting particles, twinkling stars) pause when off screen.
- **Reduced motion** (`prefers-reduced-motion: reduce`): no animations, loops or scroll-scrubbing; every scene shows its final state, and navigation jumps instead of scrolling smoothly.
- Every interactive element is a real button or link with a 44 px touch target and a visible focus ring.
- The map is a modal dialog: focus is trapped inside, Escape or Close returns you to where you were, and focus goes back to the Map button.

---

## Deployment (Cloudflare Pages)

The production build is a static site in `dist/`.

1. Push this repository to GitHub.
2. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, then choose this repository.
3. Build settings:

   | Setting | Value |
   |---|---|
   | Framework preset | Vite (or None) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node version | read from `.node-version` (22); or set the `NODE_VERSION=22` environment variable |

4. Deploy. Every push to the production branch then rebuilds and redeploys automatically, and other branches get preview URLs.

No environment variables, secrets or API keys are needed. Web fonts
(Instrument Serif, Inter Tight, JetBrains Mono) load from Google Fonts.

Before deploying, check locally that the production build works:

```bash
npm run build
```

```bash
npm run preview
```

---

## Licence

MIT. See [LICENSE](LICENSE).
