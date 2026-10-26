/**
 * GA4 conversion events. After deploying, mark `generate_lead` as a
 * Key Event in GA4 (Admin → Events) so you can see which pages and
 * channels produce leads.
 */
import { adsConversion } from '@/lib/ads';

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
}

export const trackLead = (method: 'contact_form' | 'calendly' | 'support_ticket', extra: Record<string, unknown> = {}) => {
  track('generate_lead', { method, ...extra });
  // Paid-ads conversions (Google Ads / Meta / LinkedIn). Support tickets are
  // existing clients, so they are not reported to ad platforms.
  if (method === 'contact_form') adsConversion('lead', { content_category: String(extra.services ?? '') });
  if (method === 'calendly') adsConversion('booking');
};
