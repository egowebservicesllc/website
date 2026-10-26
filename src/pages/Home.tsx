import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Server, Smartphone, Globe, PenTool, BarChart, Cloud, Check, MessageSquareText, FileText, Rocket, CalendarDays } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";
import { BUSINESS, HOME_FAQ } from "@/lib/site";
import { FaqSection } from "@/components/FaqSection";
import { GoogleCloudPartnerBadge } from "@/components/PartnerBadge";
import { PromoVideo } from "@/components/PromoVideo";
import { PlatformLogos } from "@/components/PlatformLogos";
import { ProjectEstimator } from "@/components/ProjectEstimator";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/lib/portfolio";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const servicesList = [
  {
    icon: Cloud,
    title: "Cloud Consulting & Migration",
    description: "As a Google Cloud Partner, we plan, migrate and run your workloads on Google Cloud, AWS or Microsoft Azure, with secure foundations, controlled costs and 24/7 support.",
    path: "/google-cloud",
    serviceId: "consulting"
  },
  {
    icon: Server,
    title: "Enterprise Hosting",
    description: "Secure, high-performance hosting infrastructure with 24/7 monitoring and guaranteed uptime for critical business applications.",
    path: "/services#enterprise-hosting",
    serviceId: "hosting"
  },
  {
    icon: Globe,
    title: "Web Development",
    description: "Custom web applications and responsive sites built with modern, scalable technologies that perform reliably under pressure.",
    path: "/services#web-development",
    serviceId: "web-dev"
  },
  {
    icon: Smartphone,
    title: "Mobile Development",
    description: "Native and cross-platform mobile applications designed for intuitive user experiences and rock-solid performance.",
    path: "/services#mobile-development",
    serviceId: "mobile"
  },
  {
    icon: PenTool,
    title: "Branding & Design",
    description: "Professional brand identity, UI/UX design, and design systems that communicate trust and clarity to your customers.",
    path: "/services#branding-design",
    serviceId: "branding"
  },
  {
    icon: BarChart,
    title: "Digital Marketing",
    description: "Data-driven SEO, content, and campaign strategies focused on measurable ROI rather than vanity metrics.",
    path: "/services#digital-marketing",
    serviceId: "marketing"
  }
];

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 250]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);

  const [activeService, setActiveService] = useState(0);

  return (
    <Layout>
      <Seo path="/" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-20 pb-28 md:pt-32 md:pb-40">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.span variants={fadeInUp} className="inline-block py-1.5 px-3 rounded-full bg-blue-100/50 text-blue-800 text-sm font-semibold mb-6 tracking-wide uppercase border border-blue-200">
              Google Cloud Partner · Serving Clients Worldwide
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
              Cloud, hosting &amp; web development built for <span className="text-primary">substance, not hype.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              A Google Cloud Partner serving businesses worldwide. Senior engineers who migrate, host, and run your cloud, websites, and apps on Google Cloud, AWS, or Azure. No confusing jargon, just results.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-lg group rounded-full overflow-hidden relative">
                <Link href="/contact">
                  <motion.span 
                    className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" 
                  />
                  <span className="relative flex items-center">
                    Get a Free Quote
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-white rounded-full hover:bg-slate-50 transition-colors">
                <Link href="/pricing">
                  See Pricing
                </Link>
              </Button>
            </motion.div>
            <motion.ul variants={fadeInUp} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
              {["Free, no-obligation quote", `Reply within ${BUSINESS.responseTime}`, "Fixed pricing, no hidden fees"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </motion.ul>
            <motion.div variants={fadeInUp} className="mt-5">
              <a href="#estimator" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                Not sure what you need? Get a price estimate in 30 seconds
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
            <motion.div variants={fadeInUp} className="mt-10">
              <PlatformLogos />
            </motion.div>
          </motion.div>
        </div>
        
        {/* Subtle background decoration with parallax */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <motion.div style={{ y: y1 }} className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-50/50 blur-3xl" />
          <motion.div style={{ y: y2 }} className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-slate-100/80 blur-3xl" />
        </div>
      </section>

      {/* Trust/Credibility Section */}
      <section className="py-16 bg-white border-y border-slate-100 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-y-10 md:gap-8 text-center md:divide-x divide-slate-100"
          >
            <motion.div variants={fadeInUp} className="px-4">
              <div className="text-3xl font-bold text-slate-900 mb-2"><CountUp end={BUSINESS.projectsDelivered} suffix="+" duration={2} /></div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Projects Delivered</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="px-4">
              <div className="text-3xl font-bold text-slate-900 mb-2"><CountUp end={BUSINESS.activeClients} suffix="+" duration={2} /></div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Active Clients</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="px-4">
              <div className="text-3xl font-bold text-slate-900 mb-2"><CountUp end={new Date().getFullYear() - BUSINESS.foundingYear} suffix="+" duration={1.5} /></div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Years in Business</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="px-4">
              <div className="text-3xl font-bold text-slate-900 mb-2"><CountUp end={24} suffix="/7" duration={1.5} /></div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Support & Monitoring</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Google Cloud Partner + promo video */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <GoogleCloudPartnerBadge />
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                Your cloud, in expert hands.
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-slate-600 leading-relaxed mb-6">
                As a Google Cloud Partner, we design, migrate and manage Google Cloud environments, and we deliver the same senior engineering on AWS and Microsoft Azure. We deploy on cloud regions around the world, close to your customers.
              </motion.p>
              <motion.ul variants={staggerContainer} className="space-y-3 mb-8">
                {["Cloud migration with a tested plan and rollback", "Cost optimization that lowers your monthly bill", "Help checking Google Cloud migration incentives", "24/7 monitoring and support"].map((item) => (
                  <motion.li key={item} variants={fadeInUp} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="rounded-full h-12 px-6 group">
                  <Link href="/google-cloud">
                    Google Cloud Services
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full h-12 px-6 bg-white">
                  <Link href="/cloud-migration">Cloud Migration</Link>
                </Button>
              </motion.div>
              <motion.p variants={fadeInUp} className="mt-5 text-sm text-slate-500">
                Also: <Link href="/aws" className="text-primary font-semibold hover:underline">AWS</Link> ·{" "}
                <Link href="/azure" className="text-primary font-semibold hover:underline">Microsoft Azure</Link> ·{" "}
                <Link href="/managed-cloud" className="text-primary font-semibold hover:underline">Managed Cloud</Link>
              </motion.p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
            >
              <PromoVideo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Overview Section (Interactive Tabs) */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Everything your business needs to operate online.</h2>
            <p className="text-lg text-slate-600">
              From cloud migration and enterprise hosting to custom web applications, we provide end-to-end digital services managed by senior engineers.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Sidebar Tabs */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="w-full lg:w-1/3 flex flex-col gap-2"
              role="tablist"
              aria-label="Our services"
            >
              {servicesList.map((service, i) => (
                <motion.button
                  key={i}
                  variants={fadeInUp}
                  onClick={() => setActiveService(i)}
                  role="tab"
                  aria-selected={activeService === i}
                  id={`service-tab-${i}`}
                  aria-controls="service-panel"
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 group relative overflow-hidden",
                    activeService === i 
                      ? "bg-white shadow-md border-primary/20 border text-primary" 
                      : "hover:bg-white hover:shadow-sm border border-transparent text-slate-600 hover:text-slate-900"
                  )}
                >
                  {activeService === i && (
                    <motion.div 
                      layoutId="activeTabIndicator" 
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" 
                    />
                  )}
                  <service.icon className={cn("w-6 h-6 shrink-0 transition-transform duration-300", activeService === i ? "scale-110" : "group-hover:scale-110")} />
                  <span className="font-semibold text-lg">{service.title}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Active Content Area */}
            <div className="w-full lg:w-2/3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-xl h-full flex flex-col justify-center"
                  role="tabpanel"
                  id="service-panel"
                  aria-labelledby={`service-tab-${activeService}`}
                >
                  <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-8">
                    {(() => {
                      const Icon = servicesList[activeService].icon;
                      return <Icon className="w-8 h-8" />;
                    })()}
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">{servicesList[activeService].title}</h3>
                  <p className="text-xl text-slate-600 leading-relaxed mb-10">
                    {servicesList[activeService].description}
                  </p>
                  <div className="mt-auto flex flex-col sm:flex-row gap-3">
                    <Button asChild className="rounded-full group shadow-sm">
                      <Link href={`/contact?service=${servicesList[activeService].serviceId}`}>
                        Get a Free Quote
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full group hover:border-primary hover:text-primary transition-all">
                      <Link href={servicesList[activeService].path}>
                        Explore Service
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <ProjectEstimator />

      {/* Recent work */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Recent work</h2>
              <p className="text-lg text-slate-600 max-w-2xl">Platforms, brands and websites we've designed, built and run for clients worldwide.</p>
            </div>
            <Button asChild variant="outline" className="rounded-full bg-white self-start md:self-auto">
              <Link href="/portfolio">See all projects <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {PROJECTS.slice(0, 3).map((p) => (
              <motion.div key={p.slug} variants={fadeInUp} className="h-full">
                <ProjectCard project={p} compact />
              </motion.div>
            ))}
          </motion.div>
          <p className="mt-10 text-center text-slate-500">
            Also trusted by {PROJECTS.slice(3).map((p) => p.name).join(" and ")}.{" "}
            <Link href="/contact" className="text-primary font-semibold hover:underline">Start your project →</Link>
          </p>
        </div>
      </section>

      {/* Why Choose Us / Image Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" as const }}
              className="w-full lg:w-1/2"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl bg-slate-100"
              >
                <img 
                  src="/images/hero-office.jpg" 
                  alt="EGO Web Services team collaborating in a modern office" 
                  className="w-full h-full object-cover"
                  width={800}
                  height={600}
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </motion.div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="w-full lg:w-1/2 space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">A partner you can actually rely on.</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  Many agencies overpromise and underdeliver. Since 2016, we've delivered 100+ projects and built our reputation with clients around the world by doing exactly what we say we will. We bring senior-level expertise to every project, ensuring your digital infrastructure is an asset, not a liability.
                </p>
              </motion.div>
              
              <ul className="space-y-4">
                {[
                  "Plain English communication, no confusing jargon.",
                  "Senior engineers and designers on every project.",
                  "Transparent pricing with no hidden surprises.",
                  "24/7 dedicated support when you need it most."
                ].map((item, i) => (
                  <motion.li 
                    key={i} 
                    variants={fadeInUp}
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-3 transition-transform"
                  >
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Getting started is simple.</h2>
            <p className="text-lg text-slate-600">
              No sales runaround. You talk to an engineer, get a clear proposal, and know exactly what you're paying for.
            </p>
          </motion.div>
          <motion.ol
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              { icon: MessageSquareText, title: "Tell us what you need", desc: "Share your goals in a 2-minute form or book a 30-minute call. No technical knowledge required." },
              { icon: FileText, title: "Get a fixed, free quote", desc: `Within ${BUSINESS.responseTime} you'll receive a clear proposal with scope, timeline, and fixed pricing.` },
              { icon: Rocket, title: "We build, launch & support", desc: "Senior engineers deliver your project and stay on to host, maintain, and support it 24/7." },
            ].map((step, i) => (
              <motion.li
                key={step.title}
                variants={fadeInUp}
                className="relative bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
              >
                <span className="absolute top-8 right-8 text-5xl font-black text-slate-100 select-none" aria-hidden="true">
                  0{i + 1}
                </span>
                <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      <FaqSection
        items={HOME_FAQ}
        intro="Straight answers to the questions we hear most."
      />

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" as const }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" 
        />
        <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Ready to upgrade your digital presence?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-blue-100 text-lg md:text-xl mb-10 leading-relaxed"
          >
            Let's discuss how our robust hosting, development, and consulting services can help your business operate more effectively.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-10 text-lg bg-white text-primary hover:bg-slate-100 border-none shadow-lg rounded-full group hover:scale-105 transition-all">
                <Link href="/contact">
                  Get a Free Quote
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white rounded-full">
                <Link href="/contact#book-a-call">
                  <CalendarDays className="mr-2 w-5 h-5" />
                  Book a 30-min Call
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}