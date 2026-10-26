import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

/**
 * Client-side navigation previously kept the old scroll position (clicking a
 * footer link landed you at the bottom of the next page) and links like
 * /services#web-development never scrolled to the section. This fixes both.
 */
export default function ScrollManager() {
  const [pathname] = useLocation();
  const first = useRef(true);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (first.current) {
      first.current = false;
      if (!hash) return; // let the browser restore scroll on reload/back
    }
    if (hash) {
      // Wait a frame for the new page to render, then scroll below the fixed header.
      let tries = 0;
      const seek = () => {
        const el = document.getElementById(decodeURIComponent(hash));
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 96;
          window.scrollTo({ top, behavior: 'smooth' });
        } else if (tries++ < 20) {
          requestAnimationFrame(seek);
        }
      };
      requestAnimationFrame(seek);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname]);

  // Same-page anchor links (e.g. footer "Web Development" while already on /services)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!a || a.origin !== window.location.origin || a.pathname !== window.location.pathname) return;
      const el = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (!el) return;
      setTimeout(() => {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' });
      }, 0);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
