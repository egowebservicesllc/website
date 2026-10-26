import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Mail, MapPin, Phone, LifeBuoy, CalendarDays, Check, Clock } from "lucide-react";
import { BUSINESS } from "@/lib/site";
import { motion } from "framer-motion";
import { MailerLiteContactForm } from "@/components/MailerLiteContactForm";
import { CalendlyWidget } from "@/components/CalendlyWidget";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Contact() {
  return (
    <Layout>
      <Seo path="/contact" />

      <section className="bg-slate-50 pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6">
              Let's discuss your project.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-slate-600 leading-relaxed">
              Whether you need robust enterprise hosting or a custom application, our team is ready to help. Reach out for a free quote or consultation.
            </motion.p>
            <motion.ul variants={fadeInUp} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
              {["Free, no-obligation quote", `Reply within ${BUSINESS.responseTime}`, "Talk to a senior engineer"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </motion.ul>
            <motion.div variants={fadeInUp} className="mt-8">
              <a
                href="#book-a-call"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:underline underline-offset-4"
              >
                <CalendarDays className="w-5 h-5" />
                Prefer to talk? Book a 30-minute call
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 max-w-6xl mx-auto">
            
            {/* Contact Info */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="w-full lg:w-1/3 space-y-10"
            >
              <motion.div variants={fadeInUp}>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
                <p className="text-slate-600 mb-8">
                  We work with businesses worldwide, remotely and across time zones. Support is available 24/7 for our enterprise clients.
                </p>
              </motion.div>
              
              <div className="space-y-6">
                {[
                  {
                    icon: MapPin,
                    title: "Office",
                    content: <><p>1496 Old Henderson Rd<br />Columbus, Ohio 43220<br />USA</p></>
                  },
                  {
                    icon: Mail,
                    title: "Email",
                    content: <>
                      <a href="mailto:info@egowebservices.com" className="hover:text-primary transition-colors block mb-1">info@egowebservices.com</a>
                      <a href="mailto:support@egowebservices.com" className="hover:text-primary transition-colors block text-sm">support@egowebservices.com (24/7)</a>
                    </>
                  },
                  ...(BUSINESS.phone
                    ? [{
                        icon: Phone,
                        title: "Phone",
                        content: <a href={`tel:${BUSINESS.phone}`} className="hover:text-primary transition-colors">{BUSINESS.phoneDisplay || BUSINESS.phone}</a>
                      }]
                    : []),
                  {
                    icon: LifeBuoy,
                    title: "Support",
                    content: <p>24/7 technical support available for managed hosting clients.</p>
                  },
                  {
                    icon: Clock,
                    title: "What happens next",
                    content: <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>We review your request</li>
                      <li>A senior engineer replies within {BUSINESS.responseTime}</li>
                      <li>You get a clear, fixed-price proposal</li>
                    </ol>
                  }
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeInUp} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                      <div className="text-slate-600">
                        {item.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-2/3 order-first lg:order-none"
            >
              <div className="bg-white p-6 sm:p-8 md:p-12 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Get your free quote</h2>
                <p className="text-slate-600 mb-8">Tell us a little about your project. It takes about 2 minutes.</p>
                <MailerLiteContactForm />
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      <section id="book-a-call" className="py-20 bg-slate-50 border-t border-slate-200 scroll-mt-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Book a call</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Ready to talk right now? Pick a time on our calendar that works best for you and we'll jump on a call to discuss your needs.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
             <CalendlyWidget />
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
