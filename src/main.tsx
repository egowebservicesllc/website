import { createRoot, hydrateRoot } from 'react-dom/client';

import App from './App';

import './index.css';

const container = document.getElementById('root')!;

// Pages are prerendered to static HTML at build time (scripts/prerender.mjs).
// When that markup is present, hydrate it so visitors see content instantly;
// otherwise (vite dev server) render from scratch as before.
if (container.firstElementChild) {
  hydrateRoot(container, <App />);
} else {
  createRoot(container).render(<App />);
}
