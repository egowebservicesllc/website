import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Server, Globe, Smartphone, PenTool, BarChart, Shield, Check } from "lucide-react";
import { motion } from "framer-motion";

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
      id: "enterprise-hosting",
      icon: Server,
      title: "Enterprise Hosting",
      description: "Business-critical infrastructure demands more than a shared server. We provide robust, scalable, and secure hosting environments tailored to your specific application requirements. With 40+ global infrastructure nodes, we ensure your digital assets are always fast, reliable, and accessible.",
      features: ["99.99% Uptime Guarantee", "Automated Daily Backups", "DDoS Protection & Mitigation", "Global CDN Integration", "24/7 Infrastructure Monitoring"]
    },
    {
      id: "web-development",
      icon: Globe,
      title: "Web Development",
      description: "We build custom web applications and marketing sites that prioritize speed, security, and user experience. Whether it's a complex SaaS platform or a high-converting corporate site, our senior developers use modern frameworks to deliver maintainable, high-performance code.",
      features: ["Custom Web Applications", "E-commerce Solutions", "Content Management Systems (CMS)", "API Development & Integration", "Performance Optimization"]
    },
    {
      id: "mobile-development",
      icon: Smartphone,
      title: "Mobile Development",
      description: "Reach your customers wherever they are with intuitive, powerful mobile applications. We build native and cross-platform apps for iOS and Android that deliver flawless performance and engage users effectively, all backed by secure backend architectures.",
      features: ["iOS & Android Apps", "Cross-Platform (React Native)", "UI/UX Mobile Design", "App Store Submission", "Ongoing Maintenance"]
    },
    {
      id: "branding-design",
      icon: PenTool,
      title: "Branding & Design",
      description: "Your visual identity should clearly communicate your competence and reliability. Our design team creates cohesive brand systems and user interfaces that build trust with your audience and make complex digital products feel simple and intuitive to use.",
      features: ["Brand Identity & Logo Design", "UI/UX Application Design", "Website Design", "Design Systems & Guidelines", "Marketing Collateral"]
    },
    {
      id: "digital-marketing",
      icon: BarChart,
      title: "Digital Marketing",
      description: "We focus on marketing strategies that generate tangible business outcomes, not just vanity metrics. From search engine optimization to targeted campaigns, we help you reach the right audience and convert them into loyal customers.",
      features: ["Search Engine Optimization (SEO)", "Technical SEO Audits", "Content Strategy", "Conversion Rate Optimization", "Analytics & Reporting"]
    },
    {
      id: "it-consulting",
      icon: Shield,
      title: "IT Consulting & Cloud",
      description: "Navigate complex technical challenges with guidance from seasoned experts. We help businesses modernize their infrastructure, migrate to the cloud safely, and architect digital solutions that align with long-term business goals without unnecessary overhead.",
      features: ["Cloud Architecture & Migration", "Technical Audits", "Security Assessments", "Technology Stack Selection", "CTO-as-a-Service"]
    }
  ];

  return (
    <Layout>
      <Seo 
        title="Our Services | Enterprise Hosting & Web Development" 
        description="Explore EGO Web Services' comprehensive digital offerings, including Enterprise Hosting, Web Development, Mobile Apps, Branding, Marketing, and IT Consulting."
      />

      {/* Header */}
      <section className="bg-slate-50 pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-200 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6">
              Comprehensive digital services for modern businesses.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-slate-600 leading-relaxed">
              We handle the technical complexity so you can focus on running your business. 
              Delivered with absolute reliability and zero jargon.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="space-y-32">
            {services.map((service, index) => (
              <motion.div 
                key={service.id} 
                id={service.id}
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
                    <p className="text-lg text-slate-600 leading-relaxed mb-8 relative z-10">
                      {service.description}
                    </p>
                    <Button asChild className="font-medium px-8 rounded-full shadow-sm relative z-10 hover:scale-105 transition-transform">
                      <Link href="/contact">
                        Discuss Your Project
                      </Link>
                    </Button>
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
            ))}
          </div>
        </div>
      </section>

      {/* Image / CTA Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <motion.div 
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" as const }}
          viewport={{ once: true }}
          className="absolute inset-0 opacity-20"
        >
          <img src="/images/server-room.jpg" alt="Data center server room" className="w-full h-full object-cover" />
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