import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CountUp } from "@/components/ui/count-up";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function About() {
  return (
    <Layout>
      <Seo 
        title="About Us | EGO Web Services" 
        description="Founded in 2016 in Columbus, Ohio, EGO Web Services is a senior digital agency providing dependable technology solutions for businesses."
      />

      {/* Header */}
      <section className="bg-slate-50 pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.span variants={fadeInUp} className="inline-block py-1.5 px-3 rounded-full bg-blue-100/50 text-blue-800 text-sm font-semibold mb-6 tracking-wide uppercase border border-blue-200">
              Our Story
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6">
              Substance over hype since 2016.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-slate-600 leading-relaxed">
              We started EGO Web Services with a simple premise: businesses need technology partners they can actually trust to deliver on their promises.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
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
                  src="/images/consulting.jpg" 
                  alt="EGO Web Services professionals consulting" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="w-full lg:w-1/2 space-y-6"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-slate-900 mb-6">Rooted in Columbus, operating globally.</motion.h2>
              
              <motion.p variants={fadeInUp} className="text-lg text-slate-700 leading-relaxed">
                Founded in Columbus, Ohio, EGO Web Services was built as an antidote to the typical digital agency experience. We saw too many businesses dealing with vendors who used confusing jargon, missed deadlines, and delivered fragile technology.
              </motion.p>
              
              <motion.p variants={fadeInUp} className="text-lg text-slate-700 leading-relaxed">
                We believe that enterprise-grade technology shouldn't be a mystery. We speak in plain English, we hire senior engineers, and we build systems designed to run reliably for years, not just until the end of the contract.
              </motion.p>

              <motion.p variants={fadeInUp} className="text-lg text-slate-700 leading-relaxed">
                Today, we provide secure hosting, custom development, and strategic consulting to clients across industries. Our team manages infrastructure and deploys digital products with a focus on stability, security, and measurable business value.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        {/* Subtle motion background pattern */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.03] border border-white/[0.05] rounded-full opacity-50"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/[0.05] rounded-full opacity-50"
        />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-6">Our track record speaks for itself.</motion.h2>
            <motion.p variants={fadeInUp} className="text-blue-100 text-lg">
              We measure our success by the longevity and reliability of the systems we build and host for our clients.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-blue-400/30"
          >
            <motion.div variants={fadeInUp} className="py-6 md:py-0 px-4 group">
              <div className="text-5xl md:text-6xl font-black mb-4 group-hover:scale-110 transition-transform"><CountUp end={11} suffix="+" duration={2} /></div>
              <div className="text-lg text-blue-100 font-medium">Active Enterprise Clients</div>
              <p className="mt-2 text-sm text-blue-200/80">Long-term partnerships built on trust</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="py-6 md:py-0 px-4 group">
              <div className="text-5xl md:text-6xl font-black mb-4 group-hover:scale-110 transition-transform"><CountUp end={40} suffix="+" duration={2} /></div>
              <div className="text-lg text-blue-100 font-medium">Global Infrastructure Nodes</div>
              <p className="mt-2 text-sm text-blue-200/80">Secure, high-availability hosting</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="py-6 md:py-0 px-4 group">
              <div className="text-5xl md:text-6xl font-black mb-4 group-hover:scale-110 transition-transform"><CountUp end={1} suffix="M+" duration={2} /></div>
              <div className="text-lg text-blue-100 font-medium">Projects & Modules Deployed</div>
              <p className="mt-2 text-sm text-blue-200/80">Proven delivery at scale</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16"
          >
            How we operate.
          </motion.h2>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {[
              {
                title: "Plain English Only",
                desc: "We don't hide behind \"quantum\" or \"orbital\" buzzwords. We explain complex technical decisions in clear business terms so you can make informed choices."
              },
              {
                title: "Built to Last",
                desc: "We don't chase the newest shiny framework unless it solves a real problem. We build on battle-tested, secure technologies that won't require a total rewrite in two years."
              },
              {
                title: "Senior Expertise",
                desc: "Your project won't be sold by a senior partner and then handed off to a junior team. You work directly with experienced professionals who know how to deliver."
              },
              {
                title: "Reliability First",
                desc: "Whether it's a marketing site or enterprise hosting, if we build it or host it, we ensure it stays up, stays fast, and stays secure. Period."
              }
            ].map((value, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05)" }}
                className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-4"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Looking for a reliable technical partner?</h2>
          <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full hover:scale-105 transition-transform">
            <Link href="/contact">
              Let's Talk
            </Link>
          </Button>
        </motion.div>
      </section>
    </Layout>
  );
}