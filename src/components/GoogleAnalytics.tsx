import { useEffect } from 'react';
import { useLocation } from 'wouter';

const GA_MEASUREMENT_ID = 'G-QKGBVMML4R';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a Google Analytics page_view event on every route change.
 * The base gtag.js loader lives in index.html with send_page_view
 * disabled, so navigation inside this single-page app is tracked
 * explicitly here instead of only on the initial full page load.
 */
const GoogleAnalytics = () => {
  const [pathname] = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pathname,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
};

export default GoogleAnalytics;
