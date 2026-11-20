import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Server, Globe, PenTool, BarChart, Cloud, Check, ArrowRight, ShieldCheck, Clock, CreditCard, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { SERVICE_MENU, canBuy, typeHref } from "@/lib/nav";
import { ProjectEstimator } from "@/components/ProjectEstimator";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Services() {
  const services = [
    {
      id: "it-consulting",
      serviceId: "consulting",
      page: "/cloud-migration",
      priceFrom: "Readiness assessment $2,000 · Migrations from $5,500",
      detailsLabel: "Cloud services & pricing",
      icon: Cloud,
      title: "Cloud Consulting & Migration",
      description: "As a Google Cloud Partner, we help businesses modernize their infrastructure and move to the cloud safely. We plan, migrate and manage workloads on Google Cloud, AWS and Microsoft Azure, with secure foundations, controlled costs and senior engineers who explain every decision in plain English.",
      features: ["Google Cloud Partner: GCP Consulting & Migration", "AWS & Microsoft Azure Migration", "Managed Cloud & Cost Optimization", "Kubernetes, Security & Disaster Recovery", "CTO-as-a-Service"]
    },
    {
      id: "enterprise-hosting",
      serviceId: "hosting",
      page: "/hosting",
      priceFrom: "From $9/mo · VPS $45/mo · Dedicated $150/mo",
      detailsLabel: "Hosting plans & details",
      icon: Server,
      title: "Hosting",
      description: "From a simple website to business-critical applications, we provide the right hosting for each stage of your growth: shared hosting, VPS, dedicated servers and scalable cloud hosting. Every plan is secured, backed up and monitored, so your site stays fast, reliable and accessible.",
      features: ["Built for 99.99% Uptime", "Automated Daily Backups", "DDoS Protection & Mitigation", "Global CDN Integration", "24/7 Infrastructure Monitoring"]
    },
    {
      id: "development",
      serviceId: "web-dev",
      page: "/web-development",
      priceFrom: "Websites from $1,500 · Web apps from $4,000 · Mobile apps from $6,000",
      detailsLabel: "Development details",
      icon: Globe,
      title: "Web & App Development",
      description: "We build websites, web applications and mobile apps that prioritize speed, security and user experience. Whether it's a high-converting company site, a SaaS platform or an iOS and Android app, our senior developers use modern frameworks to deliver maintainable, high-performance code.",
      features: ["Custom Websites & Web Applications", "E-commerce Solutions", "iOS & Android Apps (Native or React Native)", "API Development & Integration", "App Store Submission & Maintenance"]
    },
    {
      id: "branding-design",
      serviceId: "branding",
      page: "/branding-design",
      priceFrom: "Logos from $950 · Complete brand $2,800",
      detailsLabel: "Branding details",
      icon: PenTool,
      title: "Branding & Design",
      description: "Your visual identity should clearly communicate your competence and reliability. Our design team creates cohesive brand systems, graphics and motion that build trust with your audience, from your logo and website to animated videos for your marketing.",
      features: ["Brand Identity & Logo Design", "Graphic Design & Marketing Collateral", "UI/UX & Website Design", "Video Animation & Motion Graphics", "Design Systems & Guidelines"]
    },
    {
      id: "digital-marketing",
      serviceId: "marketing",
      page: "/digital-marketing",
      priceFrom: "From $1,200/mo",
      detailsLabel: "Marketing details",
      icon: BarChart,
      title: "Digital Marketing",
      description: "We focus on marketing that generates tangible business outcomes, not vanity metrics. Through social media, search engine optimization and paid advertising, we help you reach the right audience and convert them into loyal customers.",
      features: ["Social Media Management", "Search Engine Optimization (SEO)", "PPC Advertising (Google, Meta, LinkedIn)", "Conversion Rate Optimization", "Analytics & Reporting"]
    },
  ];

  return (
    <Layout>
      <Seo path="/services" />

      {/* Header */}
      <section className="bg-slate-50 pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-200 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div initial={false} animate="visible" variants={staggerContainer}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6">
              Cloud, hosting &amp; web services for growing businesses.
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              We handle the technical complexity so you can focus on running your business.
              Senior engineers, fixed prices and plain English.
            </p>
            <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full">
                <Link href="/contact">Get a free quote <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-white">
                <Link href="/pricing">See all prices</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Reassurance */}
      <section className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium text-slate-700">
          {[
            { icon: Clock, t: "Fixed quote within 1 business day" },
            { icon: BadgeCheck, t: "Google Cloud Partner · in business since 2016" },
            { icon: CreditCard, t: "Secure online payment by Stripe" },
            { icon: ShieldCheck, t: "Clear refund policy" , href: "/terms#refunds" },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-2.5">
              <x.icon className="w-5 h-5 text-primary shrink-0" />
              {x.href ? <Link href={x.href} className="hover:text-primary underline-offset-2 hover:underline">{x.t}</Link> : <span>{x.t}</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Services List */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="space-y-32">
            {services.map((service, index) => (
              <div key={service.id} id={service.id} className="scroll-mt-28">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-150px" }}
                variants={staggerContainer}
                className={`flex flex-col lg:flex-row gap-12 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                <motion.div variants={fadeInUp} className="w-full lg:w-1/2">
                  <div className="bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-100 group hover:shadow-xl transition-shadow duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700 ease-out" />
                    
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-8 text-primary relative z-10"
                    >
                      <service.icon className="w-8 h-8" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 relative z-10">{service.title}</h2>
                    <p className="text-lg text-slate-600 leading-relaxed mb-6 relative z-10">
                      {service.description}
                    </p>
                    <p className="relative z-10 mb-8 inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0" /> {service.priceFrom}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                      <Button asChild className="font-medium px-8 rounded-full shadow-sm hover:scale-105 transition-transform">
                        <Link href={`/contact?service=${service.serviceId}`}>
                          Get a Free Quote
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="font-medium px-8 rounded-full bg-white hover:border-primary hover:text-primary">
                        <Link href={service.page}>
                          {service.detailsLabel}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div variants={staggerContainer} className="w-full lg:w-1/2">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Key Capabilities</h3>
                  <ul className="space-y-4">
                    {service.features.map((feature, i) => (
                      <motion.li 
                        key={i} 
                        variants={fadeInUp}
                        whileHover={{ x: 10, backgroundColor: "var(--color-slate-50)" }}
                        className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-slate-700 font-medium">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
              {(() => {
                const cat = SERVICE_MENU.find((c) => c.anchor === service.id);
                if (!cat) return null;
                return (
                  <div className={`mt-12 grid gap-5 ${cat.types.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : cat.types.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                    {cat.types.map((t) => (
                      <div key={t.anchor} id={t.anchor} className="scroll-mt-28 flex flex-col p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{t.label}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">{t.desc}</p>
                        <div className="text-sm font-bold text-primary mb-4">{t.price}</div>
                        <Link href={typeHref(t)} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-primary">
                          {t.href ? `${t.label} details` : canBuy(t) ? `Buy ${t.label}` : `Get a ${t.label} quote`} <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                );
              })()}
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProjectEstimator className="py-24 bg-slate-50 border-t border-slate-200" />

      {/* Image / CTA Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <motion.div 
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" as const }}
          viewport={{ once: true }}
          className="absolute inset-0 opacity-20"
        >
          <img src="/images/server-room.jpg" alt="" aria-hidden="true" className="w-full h-full object-cover" width={1200} height={800} loading="lazy" decoding="async" />
        </motion.div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">Enterprise-grade infrastructure.</motion.h2>
          <motion.p variants={fadeInUp} className="text-slate-300 text-lg md:text-xl mb-10 leading-relaxed">
            Our hosting and cloud solutions provide the bedrock for all our digital services. Fast, secure, and monitored 24/7.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Button asChild size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 border-none shadow-lg rounded-full hover:scale-105 transition-transform">
              <Link href="/contact">
                Contact Our Engineers
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
}