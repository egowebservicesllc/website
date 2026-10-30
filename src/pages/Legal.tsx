import { ReactNode } from "react";
import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { BUSINESS } from "@/lib/site";
import { OPEN_CONSENT_EVENT } from "@/components/ConsentBanner";

/*
 * Plain-language Privacy Policy and Terms of Service (with refund policy). Google Ads, Meta and
 * LinkedIn require a privacy policy on any site that runs their pixels or
 * collects leads. This text reflects the tools this site actually uses;
 * have it reviewed by your attorney before relying on it.
 */
const UPDATED = "October 30, 2026";

function LegalShell({ path, title, children }: { path: string; title: string; children: ReactNode }) {
  return (
    <Layout>
      <Seo path={path} />
      <section className="bg-slate-50 pt-20 pb-12 md:pt-24 md:pb-16 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">{title}</h1>
          <p className="text-slate-500">Last updated: {UPDATED}</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl prose prose-slate prose-headings:font-bold prose-a:text-primary">
          {children}
        </div>
      </section>
    </Layout>
  );
}

export function Privacy() {
  return (
    <LegalShell path="/privacy" title="Privacy Policy">
      <p>
        This policy explains how {BUSINESS.legalName} ("EGO Web Services", "we", "us") collects and uses personal information
        when you visit egowebservices.com or contact us. Questions: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Information you give us:</strong> when you request a quote, subscribe to updates, book a call or contact support, we collect what you enter, such as your name, email, company, phone number, country and message.</li>
        <li><strong>Usage information:</strong> pages viewed, device and browser type, approximate location derived from IP address, the website or ad that referred you, and campaign parameters in the link you clicked.</li>
        <li><strong>Chat:</strong> messages you send through our live chat.</li>
        <li><strong>Orders and payments:</strong> when you buy a package we collect the order details you enter (for example your domain name or brand brief). Card and bank details are entered directly on Stripe's secure checkout and never reach our servers; we receive the payment status, amount and your billing name and email from Stripe.</li>
        <li><strong>Client portal:</strong> your email address (used to sign in with a one-time link), messages you send us and files you upload.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To respond to your enquiry, prepare quotes and deliver our services.</li>
        <li>To send updates you have subscribed to (you can unsubscribe at any time).</li>
        <li>To understand how our website and advertising perform, and to show relevant ads.</li>
        <li>To process payments, manage subscriptions and send receipts, order updates and service emails.</li>
        <li>To protect our website against spam and abuse.</li>
      </ul>
      <p>
        We use AI tools to help draft replies and order emails. Drafts for quotes and custom work are reviewed by a member of
        our team before they are sent. Automatic confirmations for fixed-price packages are generated from your order details only.
      </p>
      <p>We do not sell your personal information.</p>

      <h2>Services we use</h2>
      <p>We share information with providers that help us run this website, only for the purposes above:</p>
      <ul>
        <li><strong>MailerLite</strong>: contact form and newsletter.</li>
        <li><strong>Calendly</strong>: call scheduling.</li>
        <li><strong>tawk.to</strong>: live chat.</li>
        <li><strong>Google reCAPTCHA</strong>: spam protection.</li>
        <li><strong>Google Analytics</strong>: website analytics.</li>
        <li><strong>Google Ads, Meta (Facebook &amp; Instagram) and LinkedIn</strong>: advertising and measuring ad conversions.</li>
        <li><strong>Stripe</strong>: payments, subscriptions, invoices and receipts.</li>
        <li><strong>ClickUp</strong>: managing requests, orders and files.</li>
        <li><strong>Slack</strong>: internal notifications to our team.</li>
        <li><strong>Resend</strong>: sending emails (confirmations, sign-in links and order updates).</li>
        <li><strong>Anthropic (Claude)</strong>: AI assistance for drafting replies and emails. Your request is processed to create the draft and is not used to train AI models.</li>
        <li><strong>Vercel</strong>: hosting this website and the client portal.</li>
      </ul>
      <p>Some of these providers are located in the United States and other countries. They process information on our behalf under their own security and privacy commitments.</p>

      <h2>Cookies and advertising technologies</h2>
      <p>
        We use cookies and similar technologies for analytics and advertising measurement. Visitors in the European Economic
        Area, the UK and Switzerland are asked for consent before these are used. You can change your choice at any time:
      </p>
      <p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
          className="font-semibold text-primary underline underline-offset-4"
        >
          Open cookie preferences
        </button>
      </p>
      <p>
        You can also manage ad personalisation in your Google, Meta and LinkedIn account settings, or opt out of interest-based
        advertising at <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer">optout.aboutads.info</a>.
      </p>
      <p>
        The client portal uses one strictly necessary cookie to keep you signed in for up to 30 days. It is not used for
        tracking or advertising and is removed when you sign out.
      </p>

      <h2>How long we keep information</h2>
      <p>We keep enquiry and client records for as long as needed to respond, provide services and meet legal obligations (for example, payment and tax records are kept for the period required by law), then delete or anonymise them.</p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, delete or receive a copy of your personal
        information, to object to or restrict its use, and to withdraw consent. To make a request, email{" "}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. We will not discriminate against you for exercising your rights.
      </p>

      <h2>Security</h2>
      <p>We use reasonable technical and organisational measures to protect personal information. No method of transmission over the internet is completely secure.</p>

      <h2>Children</h2>
      <p>Our services are intended for businesses and are not directed to children under 16.</p>

      <h2>Changes</h2>
      <p>We may update this policy. The date at the top shows the latest revision.</p>

      <h2>Contact</h2>
      <p>
        {BUSINESS.legalName}<br />
        {BUSINESS.street}, {BUSINESS.city}, {BUSINESS.regionName} {BUSINESS.postalCode}, USA<br />
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
      </p>
    </LegalShell>
  );
}

export function Terms() {
  return (
    <LegalShell path="/terms" title="Terms of Service">
      <p>
        These terms govern your use of egowebservices.com and the client portal, and purchases made on them, operated by{" "}
        {BUSINESS.legalName} ("EGO Web Services", "we", "us"). By using the website or buying a package you agree to them.
        Custom projects are also governed by the proposal or agreement confirmed for that work; if the two differ, the
        proposal or agreement applies.
      </p>

      <h2>Website content and prices</h2>
      <p>
        Content on this website is for general information. Packages marked with a fixed price (for example hosting plans,
        Logo Design, Complete Brand and the Cloud Readiness Assessment) can be bought online at the price shown at checkout.
        Other prices are starting prices; a quote for custom work is only binding once confirmed in writing.
      </p>

      <h2>Orders and payment</h2>
      <ul>
        <li>Payments are processed securely by Stripe. Prices are in US dollars and exclude any taxes or bank fees that may apply.</li>
        <li>An order is confirmed once payment succeeds. You receive a Stripe receipt and an email from us explaining the next steps.</li>
        <li>Work starts after payment. We aim to contact you within {BUSINESS.responseTime}. Delivery depends on you providing the information, access and feedback we ask for.</li>
        <li>You are responsible for giving accurate details. If an order cannot be delivered as described, we will contact you before doing any work.</li>
      </ul>

      <h2>Hosting subscriptions</h2>
      <ul>
        <li>Hosting plans are billed monthly in advance and renew automatically until cancelled.</li>
        <li>You can cancel at any time from the Billing page in your client portal or by emailing us. Your service continues until the end of the month you have paid for, and you will not be charged again.</li>
        <li>You are responsible for the content you host and for keeping your own copies of important data. We keep backups as described in your plan, but they do not replace your own.</li>
        <li>Hosting may be suspended for unpaid invoices, or for content or activity that is unlawful, abusive (for example spam or malware) or that harms our infrastructure or other customers.</li>
      </ul>

      <h2 id="refunds">Refunds and cancellations</h2>
      <ul>
        <li><strong>Hosting plans:</strong> cancel any time; no further charges after cancellation. Payments for a month that has already started are not refunded.</li>
        <li><strong>Logo Design and Complete Brand:</strong> full refund if you cancel before the first design concepts are delivered. Once concepts have been delivered, the payment is non-refundable.</li>
        <li><strong>Cloud Readiness Assessment:</strong> full refund if you cancel before the kickoff call. Once the review has started, the payment is non-refundable.</li>
        <li><strong>Custom projects:</strong> as set out in the proposal or agreement for that project.</li>
        <li>
          To cancel or request a refund, email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> with your order reference.
          Approved refunds are returned to the original payment method within 5–10 business days. Nothing in these terms
          affects rights you have under applicable law.
        </li>
      </ul>

      <h2>Client portal</h2>
      <p>
        You sign in with a one-time link sent to your email. Keep access to that mailbox secure; anyone who can open your
        sign-in emails can access your portal. Files you upload must be yours or used with permission, and must not contain
        malware or unlawful content.
      </p>

      <h2>Ownership of deliverables</h2>
      <p>
        Once a design or other deliverable has been paid for in full, you own the final files delivered to you and may use
        them for your business. Unused concepts, our working files, tools and know-how remain ours. We may show finished
        work in our portfolio unless you ask us not to.
      </p>

      <h2>Intellectual property</h2>
      <p>The website, its design, text, graphics and logos belong to EGO Web Services or its licensors and may not be copied without permission.</p>

      <h2>Acceptable use</h2>
      <p>You agree not to misuse the website or portal, including attempting to gain unauthorised access, interfering with their operation, or submitting spam, malware or unlawful content.</p>

      <h2>Third-party services and links</h2>
      <p>We use and link to third-party services (for example Stripe, scheduling, chat and social media). Their own terms apply to your use of them, and we are not responsible for their content or practices.</p>

      <h2>Disclaimer and limitation of liability</h2>
      <p>
        The website is provided "as is". To the extent permitted by law, EGO Web Services is not liable for indirect or
        consequential losses (such as lost profits or data), and our total liability for any order is limited to the amount
        you paid for that order.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. The version shown when you place an order applies to that order.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the State of Ohio, USA.</p>

      <h2>Contact</h2>
      <p>
        {BUSINESS.legalName}<br />
        {BUSINESS.street}, {BUSINESS.city}, {BUSINESS.regionName} {BUSINESS.postalCode}, USA<br />
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
      </p>
    </LegalShell>
  );
}
