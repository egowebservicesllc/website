import { ReactNode } from "react";
import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { BUSINESS } from "@/lib/site";
import { OPEN_CONSENT_EVENT } from "@/components/ConsentBanner";

/*
 * Plain-language Privacy Policy and Terms of Use. Google Ads, Meta and
 * LinkedIn require a privacy policy on any site that runs their pixels or
 * collects leads. This text reflects the tools this site actually uses;
 * have it reviewed by your attorney before relying on it.
 */
const UPDATED = "October 24, 2026";

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
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To respond to your enquiry, prepare quotes and deliver our services.</li>
        <li>To send updates you have subscribed to (you can unsubscribe at any time).</li>
        <li>To understand how our website and advertising perform, and to show relevant ads.</li>
        <li>To protect our website against spam and abuse.</li>
      </ul>
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
      </ul>

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

      <h2>How long we keep information</h2>
      <p>We keep enquiry and client records for as long as needed to respond, provide services and meet legal obligations, then delete or anonymise them.</p>

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
    <LegalShell path="/terms" title="Terms of Use">
      <p>
        These terms govern your use of egowebservices.com, operated by {BUSINESS.legalName}. By using the website you agree to them.
        Services we provide to clients are governed by the separate proposal or agreement signed for that work.
      </p>

      <h2>Website content</h2>
      <p>
        Content on this website is for general information. Prices shown are starting prices and may change; a quote is only
        binding once confirmed in writing in a signed proposal or agreement.
      </p>

      <h2>Intellectual property</h2>
      <p>The website, its design, text, graphics and logos belong to EGO Web Services or its licensors and may not be copied without permission.</p>

      <h2>Acceptable use</h2>
      <p>You agree not to misuse the website, including attempting to gain unauthorised access, interfering with its operation, or submitting spam or unlawful content through its forms.</p>

      <h2>Third-party services and links</h2>
      <p>The website uses and links to third-party services (for example scheduling, chat and social media). We are not responsible for their content or practices.</p>

      <h2>Disclaimer and limitation of liability</h2>
      <p>
        The website is provided "as is" without warranties of any kind. To the extent permitted by law, EGO Web Services is not
        liable for indirect or consequential losses arising from use of the website.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the State of Ohio, USA.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
      </p>
    </LegalShell>
  );
}
