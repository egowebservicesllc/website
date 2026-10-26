import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { track, trackLead } from '@/lib/track';
import { adsConversion, adsPageView, captureAttribution, loadAdPixels } from '@/lib/ads';

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
 *
 * Also tracks lead-intent clicks (quote CTAs, email, phone) and
 * Calendly bookings as conversions.
 */
const GoogleAnalytics = () => {
  const [pathname] = useLocation();

  useEffect(() => {
    // Defer one tick so the page's <Seo> has updated document.title
    // (previously page views were logged with the previous page's title).
    const id = window.setTimeout(() => {
      window.gtag?.('config', GA_MEASUREMENT_ID, {
        page_path: pathname,
        page_title: document.title,
      });
      adsPageView();
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    captureAttribution();
    loadAdPixels();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const label = (a.textContent || '').trim().slice(0, 60);
      if (href.startsWith('/contact')) track('cta_click', { label, from: window.location.pathname, href });
      else if (href.startsWith('mailto:')) {
        track('email_click', { address: href.slice(7).split('?')[0], from: window.location.pathname });
        adsConversion('contact');
      } else if (href.startsWith('tel:')) {
        track('phone_click', { from: window.location.pathname });
        adsConversion('contact');
      }
    };
    const onMessage = (e: MessageEvent) => {
      if (e.origin.includes('calendly.com') && e.data?.event === 'calendly.event_scheduled') {
        trackLead('calendly');
      }
    };
    document.addEventListener('click', onClick);
    window.addEventListener('message', onMessage);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return null;
};

export default GoogleAnalytics;
