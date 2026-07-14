import { Link } from "wouter";
import logoUrl from "@/assets/ego-logo.png";
import { Mail, MapPin, Phone, Linkedin, Instagram, Facebook, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { MailerLiteFooterForm } from "@/components/MailerLiteFooterForm";

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
    <footer className="bg-slate-50 border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          <div className="space-y-4 lg:col-span-4">
            <Link href="/">
              <span className="flex items-center gap-3 cursor-pointer group mb-4">
                <motion.img 
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  src={logoUrl} 
                  alt="EGO Web Services Logo" 
                  className="w-8 h-8" 
                  width={32} 
                  height={32} 
                />
                <span className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                  EGO Web Services
                </span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              A dependable digital agency in Columbus, Ohio. We build, host, and grow digital products for businesses that value substance over hype.
            </p>
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
                { title: "IT Consulting & Cloud", path: "/services#it-consulting" },
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
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {[
                { title: "About Us", path: "/about" },
                { title: "Portfolio", path: "/portfolio" },
                { title: "Pricing", path: "/pricing" },
                { title: "Support", path: "/support" },
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

          <div className="lg:col-span-4">
            <MailerLiteFooterForm />
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} EGO Web Services LLC. All rights reserved. Founded 2016.
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