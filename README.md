# WHOAM-I

**STILL BECOMING**: Rohit's animated personal life website.

One scrolling page in four scenes, plus a map. The palette is built on three
colours: **mocha brown** (`#5B4632`) and **champagne gold** (`#F4D9A0`), with
**burnt amber** (`#C8792C`) as the third colour that adds warmth and depth.

| Scene | What happens |
|---|---|
| **00 Opening** | A cream editorial page: a giant outlined name, drifting pools of light, the portrait in an arch, and a script *Still becoming* over a bold **ROHIT**. Scrolling pins the scene, gathers a cloud of words around the portrait, then a block wipe in amber and roast carries you on. |
| **01 The Founding Tree** | A roast-brown stage with light beams and depth that follows the mouse. The tree illustration sits under SVG overlays: glowing roots, chapter branches that draw as you scroll, lit and dark aspects, and a marker for each chapter. |
| **02 Life timeline** | A night sky where **scrolling moves time forward**. Your line flows through the centre; each person's glowing line arrives from the side and walks beside you. Some continue, some curve away, and some rise into your sky as stars. Moments flare on your line. At "now", the stars and the people still beside you join into a constellation. |
| **03 Unwritten** | A near-black closing with one ember of light: *The story is still being written. Still becoming.* |
| **Map** (top right) | A full-screen constellation of the five chapters: an alternative way to navigate. |

Built with React 19, Vite, TypeScript, Tailwind CSS v4, GSAP + ScrollTrigger,
Canvas 2D and inline SVG. It is a static site with no backend.

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
| `npm run build` | Type-checks, builds into `dist/`, then pre-renders the page (see *Performance*) |
| `npm run preview` | Serves the built `dist/` locally |
| `npm run typecheck` | Type-check only |

---

## Editing content

All personal content lives in `src/data/`. Anything in `[square brackets]`
is a placeholder: the site marks it with a small **PLACEHOLDER** tag until
you replace it. No personal stories have been invented: every name, year
and note is yours to write.

| File | Contains |
|---|---|
| `src/data/site.ts` | Name, statement, the timeline's last lines, closing lines, scene labels |
| `src/data/chapters.ts` | The five chapters, their summaries, where each starts on the timeline, and how they connect on the map |
| `src/data/people.ts` | People on the life timeline |
| `src/data/timeline.ts` | Moments on your own line |

### Time on the life timeline

Chapters, people and moments share one number scale. The example data uses
0–100, but you can use your **age** or **real years** (e.g. 2004–2026)
instead. The timeline runs from the first chapter's `start` to the last
chapter's `start`, which counts as "now".

### Add a person

Copy an entry in `src/data/people.ts`:

```ts
{
  id: 'person-h',
  name: 'Their name',
  relation: 'Friend',
  enters: '2019',          // shown in the details
  leaves: '',              // '' while they are still here
  status: 'continues',     // 'continues' | 'branched' (curves away) | 'ended' (becomes a star)
  side: 'right',           // which side of your line
  start: 58,               // when their line joins yours (same scale as chapters)
  // end: 80,              // for branched/ended
  // color: '#9FB7C9',     // optional; otherwise the next colour in theme.lineColors
  note: 'What they changed.',
},
```

No UI changes are needed. Each person gets a lane beside your line, and lanes
are reused once an earlier line has gone.

---

## Images

Images live in `src/assets/images/` and are configured in
`src/config/assets.ts`. They are detected **by file name at build time**:

| File name | Used for |
|---|---|
| `portrait.jpg` / `.png` / `.webp` | Opening portrait (arch frame, warm black-and-white) |
| `founding-tree.png` / `.jpg` / `.webp` | Founding Tree illustration |

- **Originals are kept as they are.** Add a `.webp` with the same base name and the site serves the WebP first, falling back to the original.
- If a file is missing, the scene shows a quiet labelled space in its place and everything else keeps working.
- In `assets.ts`, set `width`/`height` to the real pixel size and adjust `objectPosition` (crop focus), `fit` and `filter`.

To make a WebP without adding a dependency:

```bash
npx --yes sharp-cli -i src/assets/images/portrait.jpg -o src/assets/images/portrait.webp -f webp -q 82
```

### Aligning the tree overlays to the artwork

The overlays are drawn in a 1000 × 760 coordinate space (`tree` in
`src/config/layout.ts`):

1. `tree.image` sets where the illustration sits in that space (x, y, w, h). Adjust it until the artwork's trunk sits on x = 500 and its ground on y = 600.
2. If branches still don't match, edit `tree.branches.<chapter>.path`, a cubic Bezier `[x0,y0, c1x,c1y, c2x,c2y, x1,y1]` from the trunk to the tip. The tip is where the chapter marker sits.
3. `tree.overlayOpacity.withArtwork` controls how strongly the overlays sit on the illustration.

---

## Project structure

```
src/
  config/       theme.ts (palette, line colours, fonts, motion) · assets.ts · layout.ts
  data/         site.ts · chapters.ts · people.ts · timeline.ts — all editable content
  components/   Hero/ · FoundingTree/ · LifeTimeline/ · Constellation/ · Closing/
                ui/ (Nav, EmberCursor, BlockWipe, ArtImage)
  animations/   setup.ts · hero.ts · tree.ts · timeline.ts · constellation.ts · closing.ts · transitions.ts · idle.ts
  lib/          lifeSky.ts (the life timeline's canvas engine) · treeGeometry.ts · geometry.ts · timelineNav.ts
  hooks/        useGsap.ts (scoped GSAP + reduced motion) · useReducedMotion.ts
  styles/       index.css (fonts, Tailwind tokens, CSS-only opening sequence)
  entry-server.tsx       build-time render used by the pre-renderer
scripts/prerender.mjs    writes the rendered HTML (and inlined CSS) into dist/index.html
public/         fonts/ (self-hosted) · favicon.svg · _headers (Cloudflare caching)
docs/design-reference/   the original mockups
```

Colours and fonts are defined in `src/config/theme.ts` and mirrored in
`src/styles/index.css` (`@theme`). Keep the two in sync.

## Performance

- **Pre-rendered HTML.** `npm run build` renders the whole page to static HTML and inlines the stylesheet, so the first screen paints with no JavaScript and no render-blocking request. React then takes over in place (hydration).
- **The opening animation is pure CSS**, so it starts on the very first paint.
- **Self-hosted fonts.** The two faces used in the first screen are preloaded, and all five are cached permanently.
- **The map is code-split** and downloads only when opened.
- **Everything that moves runs on the GPU compositor:** transforms and opacity only, gradients instead of blur filters, no blend modes or masks on moving layers. Ambient loops pause while their scene is off screen.
- **The life timeline** draws on one canvas per frame (plus a static star layer), only while it is on screen, at up to 2× pixel density.

Measured on the production build in headless Chrome, with no GPU:

| What | Result |
|---|---|
| First contentful paint | ~0.25–0.35 s |
| Life timeline scrolling | ~60 fps |
| Main-thread work per scroll frame | about 2 ms (script ~1.2 ms, style ~0.8 ms, layout ~0.04 ms), out of a 16.7 ms budget |

## Motion and accessibility

- GSAP timelines with ScrollTrigger. The opening and the life timeline pin while you scroll through them.
- **Reduced motion** (`prefers-reduced-motion: reduce`):
  - No intro curtain, pinning, scroll-driven effects or loops.
  - The life timeline shows the whole story at once, constellation included.
- Every interactive element is a real button or link with a visible focus ring.
- Names on the life timeline are buttons that ride on their lines and open a details panel. Escape closes it.
- The map is a modal dialog: focus stays inside, Escape or Close returns you, and focus goes back to the Map button.
- The ember cursor appears only with a mouse or pen, never on touch screens.

---

## Deployment (Cloudflare Pages)

The production build is a static site in `dist/`.

1. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, then choose this repository.
2. Build settings:

   | Setting | Value |
   |---|---|
   | Framework preset | None (or Vite) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node version | read from `.node-version` (22); or set `NODE_VERSION=22` |

3. Deploy. Every push to the production branch rebuilds and redeploys, and other branches get preview URLs.

No environment variables, secrets or API keys are needed.

---

## Licence

MIT. See [LICENSE](LICENSE). The bundled fonts are licensed under the SIL
Open Font License 1.1 (see `public/fonts/README.md`).
