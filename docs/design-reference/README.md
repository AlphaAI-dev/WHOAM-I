# Design reference

The five `*.dc.html` files are the original mockups exported from the visual
design tool. They are kept here as the record of the design decisions the site
implements: colours, type, motion timings, SVG coordinates and the line
language.

They are **references, not production code**. Their viewer runtime
(`support.js`, `vendor/react*.js`) was not committed, so they will not render
on their own. Read the inline `style="…"` values and the `<script>` logic
instead.

| File | Implemented in |
|---|---|
| `00_Opening.dc.html` | `src/components/Hero` |
| `01_Founding_Tree.dc.html` | `src/components/FoundingTree` |
| `02_Life_Timeline.dc.html` | `src/components/LifeTimeline` |
| `03_Constellation_map.dc.html` | `src/components/Constellation` |
| `Foundations.dc.html` | `src/config/theme.ts`, `src/styles/index.css` |
