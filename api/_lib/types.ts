export interface Lead {
  ref: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  country?: string;
  message: string;
  services: string[];
  serviceId?: string;
  packageName?: string;
  timeline?: string;
  source?: string;
  page?: string;
  receivedAt: string;
}

/** Small reference carried inside Slack buttons/modals (Slack limits: 2000 chars). */
export interface LeadRef {
  r: string; // lead ref
  e: string; // client email
  n: string; // client name
  t?: string; // ClickUp task id
  s?: string; // service title / package label for payment links
}
