import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './animations/setup';
import './styles/index.css';
import App from './App';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The production build ships pre-rendered HTML (see scripts/prerender.mjs),
// so the first paint needs no JavaScript; React then takes over in place.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
