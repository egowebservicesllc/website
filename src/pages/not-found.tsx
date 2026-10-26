import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/services', label: 'Our services', desc: 'Hosting, web, mobile, branding, marketing and consulting.' },
  { href: '/pricing', label: 'Pricing', desc: 'Transparent starting prices for every service.' },
  { href: '/portfolio', label: 'Portfolio', desc: 'Results we have delivered for clients.' },
  { href: '/support', label: 'Support', desc: 'Get help from our engineering team.' },
];

export default function NotFound() {
  return (
    <Layout>
      <Seo path="/404" />
      <section className="bg-slate-50 py-24 md:py-32 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <span className="inline-block py-1.5 px-3 rounded-full bg-blue-100/50 text-blue-800 text-sm font-semibold mb-6 tracking-wide uppercase border border-blue-200">
            Error 404
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">We couldn't find that page.</h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-10">
            The link may be outdated or mistyped. Here are some places to go instead, or tell us what you're looking for.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-white rounded-full">
              <Link href="/contact">Get a Free Quote</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl grid sm:grid-cols-2 gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <span className="flex items-center justify-between font-semibold text-slate-900 group-hover:text-primary">
                {l.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="block mt-1 text-sm text-slate-600">{l.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
