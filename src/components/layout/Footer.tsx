import { Link } from "wouter";
import { BrandLogo } from "@/components/BrandLogo";
import { Mail, MapPin, Phone, Linkedin, Instagram, Facebook, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { MailerLiteFooterForm } from "@/components/MailerLiteFooterForm";
import { BUSINESS } from "@/lib/site";
import { CLOUD_PAGES } from "@/lib/cloud";
import { GoogleCloudPartnerBadge } from "@/components/PartnerBadge";
import { OPEN_CONSENT_EVENT } from "@/components/ConsentBanner";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.6 5.82c-.9-.98-1.4-2.26-1.4-3.57h-3.05v13.7c0 1.55-1.26 2.8-2.8 2.8a2.8 2.8 0 0 1 0-5.6c.28 0 .55.04.8.12V9.9a5.85 5.85 0 0 0-.8-.05 5.86 5.86 0 1 0 5.86 5.86V9.05a8.5 8.5 0 0 0 4.94 1.58V7.6a5.4 5.4 0 0 1-3.55-1.78Z" />
    </svg>
  );
}

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/ego-web-services-llc/", Icon: Linkedin },
  { label: "Instagram", href: "https://instagram.com/ego.web.services", Icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/egowebservices/", Icon: Facebook },
  { label: "YouTube", href: "https://www.youtube.com/@egowebservices", Icon: Youtube },
  { label: "TikTok", href: "https://www.tiktok.com/@egowebservices", Icon: TikTokIcon },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-border pt-16 pb-24 md:pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          <div className="space-y-4 lg:col-span-3">
            <Link href="/">
              <span className="flex items-center gap-3 cursor-pointer group mb-4">
                <motion.span
                  className="inline-flex"
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <BrandLogo size={32} />
                </motion.span>
                <span className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                  EGO Web Services
                </span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              A Google Cloud Partner and dependable digital agency serving clients worldwide. We build, host, and grow digital products for businesses that value substance over hype.
            </p>
            <address className="not-italic space-y-2 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <span>{BUSINESS.street}, {BUSINESS.city}, {BUSINESS.region} {BUSINESS.postalCode}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-primary" aria-hidden="true" />
                <a href={`mailto:${BUSINESS.email}`} className="hover:text-primary transition-colors">{BUSINESS.email}</a>
              </p>
              {BUSINESS.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0 text-primary" aria-hidden="true" />
                  <a href={`tel:${BUSINESS.phone}`} className="hover:text-primary transition-colors">{BUSINESS.phoneDisplay || BUSINESS.phone}</a>
                </p>
              )}
            </address>
            <GoogleCloudPartnerBadge />
            <div className="flex items-center gap-2 pt-1">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`EGO Web Services on ${label}`}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-200/70 text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-3">
              {[
                { title: "Enterprise Hosting", path: "/services#enterprise-hosting" },
                { title: "Web Development", path: "/services#web-development" },
                { title: "Mobile Development", path: "/services#mobile-development" },
                { title: "Branding & Design", path: "/services#branding-design" },
                { title: "Digital Marketing", path: "/services#digital-marketing" },
                { title: "Cloud Consulting", path: "/services#it-consulting" },
              ].map((item, i) => (
                <li key={i}>
                  <Link href={item.path}>
                    <motion.span 
                      whileHover={{ x: 4 }}
                      className="inline-block text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                    >
                      {item.title}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-semibold text-foreground mb-4">Cloud</h3>
            <ul className="space-y-3">
              {CLOUD_PAGES.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <motion.span
                      whileHover={{ x: 4 }}
                      className="inline-block text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                    >
                      {item.navLabel}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {[
                { title: "About Us", path: "/about" },
                { title: "Portfolio", path: "/portfolio" },
                { title: "Pricing", path: "/pricing" },
                { title: "Support", path: "/support" },
                { title: "Client portal", path: "/portal" },
                { title: "Contact", path: "/contact" },
              ].map((item, i) => (
                <li key={i}>
                  <Link href={item.path}>
                    <motion.span 
                      whileHover={{ x: 4 }}
                      className="inline-block text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                    >
                      {item.title}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <MailerLiteFooterForm />
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} EGO Web Services LLC. All rights reserved. Founded 2016.
            <span className="mx-2">·</span>
            <Link href="/privacy"><span className="hover:text-primary cursor-pointer transition-colors">Privacy</span></Link>
            <span className="mx-2">·</span>
            <Link href="/terms"><span className="hover:text-primary cursor-pointer transition-colors">Terms</span></Link>
            <span className="mx-2">·</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
              className="hover:text-primary transition-colors"
            >
              Cookie preferences
            </button>
          </p>
          
          <nav aria-label="Sitemap" className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/">
              <span className="hover:text-primary cursor-pointer transition-colors">Home</span>
            </Link>
            <Link href="/services">
              <span className="hover:text-primary cursor-pointer transition-colors">Services</span>
            </Link>
            <Link href="/pricing">
              <span className="hover:text-primary cursor-pointer transition-colors">Pricing</span>
            </Link>
            <Link href="/portfolio">
              <span className="hover:text-primary cursor-pointer transition-colors">Portfolio</span>
            </Link>
            <Link href="/about">
              <span className="hover:text-primary cursor-pointer transition-colors">About</span>
            </Link>
            <Link href="/support">
              <span className="hover:text-primary cursor-pointer transition-colors">Support</span>
            </Link>
            <Link href="/contact">
              <span className="hover:text-primary cursor-pointer transition-colors">Contact</span>
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}