/**
 * Pre-renders the site into dist/index.html after `vite build`, so the first
 * paint is complete HTML + CSS with no JavaScript needed:
 * 1. builds an SSR bundle of src/entry-server.tsx,
 * 2. renders <App /> to a string and puts it in <div id="root">,
 * 3. inlines the (small) stylesheet so there is no render-blocking request,
 * 4. starts the JavaScript only after the first frame has painted.
 */
import { build } from 'vite';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = process.env.PRERENDER_OUT ? path.resolve(process.env.PRERENDER_OUT) : path.join(root, 'dist');
const ssrDir = path.join(root, 'node_modules/.prerender');

await build({
  root,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: ssrDir, emptyOutDir: true },
});

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
const html = render();

const indexPath = path.join(outDir, 'index.html');
let page = await readFile(indexPath, 'utf8');
if (!page.includes('<div id="root"></div>')) throw new Error('prerender: <div id="root"></div> not found');
page = page.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

// Inline the stylesheet.
const cssLink = page.match(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/);
if (cssLink) {
  const cssFile = path.join(outDir, cssLink[1].replace(/^\.?\//, ''));
  // Relative url()s were written for the stylesheet's own folder; rebase them onto the page.
  const rel = path.relative(outDir, path.dirname(cssFile)).split(path.sep).join('/');
  const css = (await readFile(cssFile, 'utf8')).replace(/url\((?!['"]?(?:\/|data:|https?:|#))(['"]?)([^)'"]+)\1\)/g, (_, q, u) => {
    const rebased = path.posix.normalize(`${rel}/${u}`);
    return `url(${q}./${rebased}${q})`;
  });
  page = page.replace(cssLink[0], `<style>${css}</style>`);
}

// Start the app only after the first frame has painted. The pre-rendered page is
// already complete, so this lets it appear immediately; the module files are
// still fetched in parallel through their <link rel="modulepreload"> tags.
const entry = page.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
if (!entry) throw new Error('prerender: entry script not found');
page = page.replace(
  entry[0],
  `<link rel="modulepreload" crossorigin href="${entry[1]}">` +
    `<script type="module">requestAnimationFrame(()=>setTimeout(()=>import(${JSON.stringify(entry[1])})))</script>`,
);

await writeFile(indexPath, page);
await rm(ssrDir, { recursive: true, force: true });
console.log(`prerender: ${(html.length / 1024).toFixed(1)} KB of HTML, CSS ${cssLink ? 'inlined' : 'not found'} → ${path.relative(root, indexPath)}`);
