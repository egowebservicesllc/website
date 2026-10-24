import { renderToString } from 'react-dom/server';
import App from './App';

export { PAGES, INDEXABLE_ROUTES, PRERENDER_ROUTES, renderHeadTags, SITE_URL } from './lib/site';

/** Used only at build time by scripts/prerender.mjs. */
export function render(url: string) {
  return renderToString(<App ssrPath={url} />);
}
