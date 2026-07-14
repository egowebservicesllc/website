import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Server, Smartphone, Globe, PenTool, BarChart, Shield } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";

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
    icon: Server,
    title: "Enterprise Hosting",
    description: "Secure, high-performance hosting infrastructure with 24/7 monitoring and guaranteed uptime for critical business applications.",
    path: "/services#enterprise-hosting"
  },
  {
    icon: Globe,
    title: "Web Development",
    description: "Custom web applications and responsive sites built with modern, scalable technologies that perform reliably under pressure.",
    path: "/services#web-development"
  },
  {
    icon: Smartphone,
    title: "Mobile Development",
    description: "Native and cross-platform mobile applications designed for intuitive user experiences and rock-solid performance.",
    path: "/services#mobile-development"
  },
  {
    icon: PenTool,
    title: "Branding & Design",
    description: "Professional brand identity, UI/UX design, and design systems that communicate trust and clarity to your customers.",
    path: "/services#branding-design"
  },
  {
    icon: BarChart,
    title: "Digital Marketing",
    description: "Data-driven SEO, content, and campaign strategies focused on measurable ROI rather than vanity metrics.",
    path: "/services#digital-marketing"
  },
  {
    icon: Shield,
    title: "IT Consulting & Cloud",
    description: "Strategic technical guidance, cloud migration, and infrastructure architecture from seasoned enterprise veterans.",
    path: "/services#it-consulting"
  }
];

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 250]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);

  const [activeService, setActiveService] = useState(0);

  return (
    <Layout>
      <Seo 
        title="Dependable Digital Agency in Columbus, OH" 
        description="EGO Web Services provides Enterprise Hosting, Web Development, Mobile Apps, Branding, and IT Consulting for businesses that value substance and reliability."
      />

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
              Columbus, Ohio
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
              Digital solutions built for <span className="text-primary">substance, not hype.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              We are a senior digital agency partnering with businesses to build, host, and grow dependable technology. No confusing jargon, just results.
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
                <Link href="/services">
                  View Our Services
                </Link>
              </Button>
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
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100"
          >
            <motion.div variants={fadeInUp} className="px-4">
              <div className="text-3xl font-bold text-slate-900 mb-2"><CountUp end={2016} duration={1.5} /></div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Founded</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="px-4">
              <div className="text-3xl font-bold text-slate-900 mb-2"><CountUp end={11} suffix="+" duration={2} /></div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Active Clients</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="px-4">
              <div className="text-3xl font-bold text-slate-900 mb-2"><CountUp end={40} suffix="+" duration={2} /></div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Global Nodes</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="px-4">
              <div className="text-3xl font-bold text-slate-900 mb-2"><CountUp end={1} suffix="M+" duration={2} /></div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Projects Deployed</div>
            </motion.div>
          </motion.div>
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
              From secure enterprise hosting to custom web applications, we provide end-to-end digital services managed by senior engineers.
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
            >
              {servicesList.map((service, i) => (
                <motion.button
                  key={i}
                  variants={fadeInUp}
                  onClick={() => setActiveService(i)}
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
                  <div className="mt-auto">
                    <Button asChild variant="outline" className="rounded-full group hover:border-primary hover:text-primary transition-all">
                      <Link href={servicesList[activeService].path}>
                        Explore Service
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
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
                  Many agencies overpromise and underdeliver. Since 2016, we've built our reputation in Columbus and beyond by doing exactly what we say we will. We bring senior-level expertise to every project, ensuring your digital infrastructure is an asset, not a liability.
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
            <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-lg bg-white text-primary hover:bg-slate-100 border-none shadow-lg rounded-full group hover:scale-105 transition-all">
              <Link href="/contact">
                Get a Free Quote
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}