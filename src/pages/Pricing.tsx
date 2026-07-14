import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Server, Code, Smartphone, PenTool, BarChart, Shield, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    id: 'hosting',
    title: 'Enterprise Hosting',
    description: 'High-performance infrastructure including Shared, VPS, Dedicated, and Cloud solutions optimized for your business.',
    icon: Server,
    packages: [
      { name: 'Basic Hosting', price: '$9', billing: '/mo', features: ['Optimized for Small Sites', 'Free SSL & Backups', 'One-Click Installer', '10GB SSD Storage'] },
      { name: 'Performance VPS', price: '$45', billing: '/mo', features: ['Dedicated Resources', 'Full Root Access', 'Scalable CPU/RAM', '50GB NVMe Storage'], recommended: true },
      { name: 'Dedicated Server', price: '$150', billing: '/mo', features: ['Private Hardware', 'Maximum Security', 'Custom Configurable', '1Gbps Network'] },
      { name: 'Custom Cloud', price: 'Custom', billing: '', features: ['Hybrid Cloud Setup', 'Multi-region Clusters', 'Elastic Scaling', 'Managed Kubernetes'] }
    ]
  },
  {
    id: 'web-dev',
    title: 'Web Development',
    description: 'Custom web applications and sites built with modern frameworks for ultimate reliability and performance.',
    icon: Code,
    packages: [
      { name: 'Starter Website', price: '$1,500', billing: ' start', features: ['Professional UI/UX', '5 Core Pages', 'Contact Integration', 'Mobile Optimized'] },
      { name: 'Business Application', price: '$4,000', billing: ' start', features: ['Dynamic Web App', 'User Authentication', 'Admin Dashboard', 'Payment Integration'], recommended: true },
      { name: 'E-commerce Platform', price: '$8,500', billing: ' start', features: ['Full Shop System', 'Inventory Sync', 'Advanced Analytics', 'Customer Portals'] },
      { name: 'Custom Enterprise', price: 'Custom', billing: '', features: ['Microservices', 'Legacy Migration', 'API Development', 'High-Load Systems'] }
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile Development',
    description: 'Native and cross-platform mobile solutions for iOS and Android devices, built for long-term scalability.',
    icon: Smartphone,
    packages: [
      { name: 'MVP App', price: '$6,000', billing: ' start', features: ['Essential Features', 'Single Platform', 'Clean UI', 'Basic Integration'] },
      { name: 'Professional App', price: '$15,000', billing: ' start', features: ['Multi-platform', 'Social Integration', 'Cloud Database', 'Advanced UX'], recommended: true },
      { name: 'Scalable App', price: '$35,000', billing: ' start', features: ['Complex Logic', 'Biometrics / AR', 'Offline Support', 'Admin Dashboard'] },
      { name: 'Custom Ecosystem', price: 'Custom', billing: '', features: ['IoT / Hardware Sync', 'Internal Enterprise Apps', 'Massively Scalable', 'Full Maintenance'] }
    ]
  },
  {
    id: 'branding',
    title: 'Branding & Design',
    description: 'Strategic visual identities that define your brand and establish trust with your market.',
    icon: PenTool,
    packages: [
      { name: 'Logo Design', price: '$950', billing: ' flat', features: ['3 Concepts', 'High-res Exports', 'Brand Colors', 'Typography Guide'] },
      { name: 'Complete Brand', price: '$2,800', billing: ' flat', features: ['Full Design System', 'Stationery Kit', 'Social Media Guide', 'Brand Story'], recommended: true },
      { name: 'Comprehensive Strategy', price: '$5,500', billing: ' start', features: ['Market Analysis', 'Voice & Tone', 'Style Library', 'Print Assets'] },
      { name: 'Custom Corporate', price: 'Custom', billing: '', features: ['Global Brand Refresh', 'Packaging Design', 'Motion Branding', 'Full-scale UI Kits'] }
    ]
  },
  {
    id: 'marketing',
    title: 'Digital Marketing',
    description: 'Data-driven SEO, content, and campaign strategies focused on measurable ROI rather than vanity metrics.',
    icon: BarChart,
    packages: [
      { name: 'Social Starter', price: '$1,200', billing: '/mo', features: ['3 Platforms', '12 Posts / Mo', 'Basic Community Mgmt', 'Monthly Report'] },
      { name: 'Growth Marketing', price: '$3,500', billing: '/mo', features: ['Social + PPC Mgmt', 'Full SEO Audit', 'Content Creation', 'Keyword Optimization'], recommended: true },
      { name: 'Comprehensive', price: '$7,000', billing: '/mo', features: ['All Channels', 'Video Marketing', 'Influencer Outreach', 'Daily Optimization'] },
      { name: 'Custom Strategy', price: 'Custom', billing: '', features: ['Bespoke Media Buying', 'Reputation Management', 'PR Integration', 'Strategic Growth'] }
    ]
  },
  {
    id: 'consulting',
    title: 'IT Consulting & Cloud',
    description: 'Strategic technical guidance, cloud migration, and infrastructure architecture from seasoned enterprise veterans.',
    icon: Shield,
    packages: [
      { name: 'Technical Audit', price: '$2,000', billing: ' flat', features: ['Infrastructure Review', 'Security Check', 'Efficiency Report', 'Cloud Strategy'] },
      { name: 'Cloud Migration', price: '$5,500', billing: ' start', features: ['Migration Plan', 'Setup & Config', 'Staff Training', 'Backup Protocol'], recommended: true },
      { name: 'Managed IT', price: '$9,000', billing: ' start', features: ['Full CTO Advisory', 'Network Overhaul', 'Security Hardening', 'Disaster Recovery'] },
      { name: 'Enterprise Strategy', price: 'Custom', billing: '', features: ['Global IT Governance', 'Compliance Audit', 'Bespoke Solutions', 'Long-term Roadmap'] }
    ]
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Pricing() {
  const [activeCategory, setActiveCategory] = useState(SERVICES[0].id);
  const activeService = SERVICES.find(s => s.id === activeCategory) || SERVICES[0];

  return (
    <Layout>
      <Seo 
        title="Pricing & Packages | EGO Web Services" 
        description="Transparent pricing for our digital services, including Enterprise Hosting, Web Development, Mobile Apps, Branding, Marketing, and IT Consulting."
      />

      {/* Header */}
      <section className="bg-slate-50 pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6">
              Transparent, scalable pricing.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-slate-600 leading-relaxed">
              Clear tiers designed for businesses at every stage. We build and host digital infrastructure that scales with you.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          
          {/* Category Switcher */}
          <div className="flex flex-wrap justify-center gap-3 mb-16 max-w-4xl mx-auto">
            {SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => setActiveCategory(service.id)}
                className={cn(
                  "px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300",
                  activeCategory === service.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-primary/30 hover:bg-slate-50"
                )}
              >
                {service.title}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {/* Active Service Header */}
              <div className="text-center max-w-2xl mx-auto mb-16">
                <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <activeService.icon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{activeService.title}</h2>
                <p className="text-lg text-slate-600">
                  {activeService.description}
                </p>
              </div>

              {/* Packages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {activeService.packages.map((pkg, i) => (
                  <motion.div 
                    key={pkg.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "relative flex flex-col p-8 rounded-3xl transition-all duration-300 bg-white",
                      pkg.recommended 
                        ? "border-2 border-primary shadow-xl scale-105 z-10" 
                        : "border border-slate-200 shadow-sm hover:shadow-md"
                    )}
                  >
                    {pkg.recommended && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        Recommended
                      </div>
                    )}
                    
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                      <div className="flex items-baseline gap-1 text-slate-900">
                        <span className="text-4xl font-extrabold tracking-tight">{pkg.price}</span>
                        <span className="text-slate-500 font-medium">{pkg.billing}</span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-10 flex-grow">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-slate-600 font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      asChild
                      variant={pkg.recommended ? "default" : "outline"}
                      className={cn(
                        "w-full h-12 rounded-xl text-base font-semibold transition-transform",
                        pkg.recommended && "hover:scale-[1.02]",
                      )}
                    >
                      <Link href={`/contact?service=${activeCategory}`}>
                        {pkg.price === 'Custom' ? 'Discuss Requirements' : 'Get Started'}
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Need a custom solution?</h2>
          <p className="text-slate-300 text-lg md:text-xl mb-10 leading-relaxed">
            Every business is unique. Contact our senior engineers to discuss your specific requirements and receive a tailored proposal.
          </p>
          <Button asChild size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 border-none shadow-lg rounded-full hover:scale-105 transition-transform">
            <Link href="/contact">
              Contact Us Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

    </Layout>
  );
}