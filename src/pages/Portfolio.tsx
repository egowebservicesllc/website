import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SOLUTIONS } from "@/lib/solutions";
import { SolutionCard } from "@/pages/Solutions";
import { FreeOffersStrip } from "@/pages/FreeOffers";
import { PROJECTS } from "@/lib/portfolio";
import { ProjectCard } from "@/components/ProjectCard";



const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function Portfolio() {
  return (
    <Layout>
      <Seo path="/portfolio" />

      {/* Header */}
      <section className="bg-slate-50 pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6">
              Work we're proud of.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-slate-600 leading-relaxed">
              Websites, brands and cloud platforms we've designed, built and run for clients around the world.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Client projects */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {PROJECTS.map((p) => (
              <motion.div key={p.slug} variants={fadeInUp} className="h-full">
                <ProjectCard project={p} />
              </motion.div>
            ))}
            {/* final tile: their project could be next */}
            <motion.div variants={fadeInUp} className="h-full">
              <Link
                href="/contact"
                className="group flex flex-col justify-center items-start h-full min-h-[320px] rounded-3xl bg-primary text-white p-8 shadow-lg hover:shadow-2xl transition-shadow"
              >
                <span className="text-sm font-semibold uppercase tracking-widest text-blue-100 mb-3">Your project</span>
                <span className="text-3xl font-bold leading-tight mb-4">Could be next.</span>
                <span className="text-blue-100 mb-8">Tell us what you're building and get a free, fixed-price quote.</span>
                <span className="inline-flex items-center gap-2 bg-white text-primary font-semibold rounded-full px-6 py-3 group-hover:gap-3 transition-all">
                  Start your project <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Cloud & infrastructure: solution blueprints */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Cloud & infrastructure</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Cloud platforms we design and build</h2>
              <p className="text-lg text-slate-600 max-w-2xl">
                Solution blueprints showing exactly how we build each type of platform: the architecture, services, security and rollout plan, on Google Cloud, AWS and Azure.
              </p>
            </div>
            <Link href="/solutions" className="text-primary font-semibold inline-flex items-center gap-1.5 shrink-0">All blueprints <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SOLUTIONS.map((s) => <SolutionCard key={s.slug} s={s} />)}
          </div>
        </div>
      </section>

      <FreeOffersStrip className="bg-white" />

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to build something lasting?
          </h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 leading-relaxed">
            Let's discuss how our technical expertise can help your business grow efficiently and securely.
          </p>
          <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-lg bg-white text-primary hover:bg-slate-100 border-none shadow-lg rounded-full hover:scale-105 transition-all">
            <Link href="/contact">
              Start Your Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}