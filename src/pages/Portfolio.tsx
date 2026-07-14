import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Star, Quote } from "lucide-react";

const CASE_STUDIES = [
  {
    client: "Global Tech Solutions",
    industry: "Enterprise SaaS",
    result: "350% ROI Increase",
    description: "Built a multi-region cloud infrastructure that reduced latency by 60% and reliably supported over 1 million concurrent users without downtime.",
    tags: ["Cloud Architecture", "Dedicated Hosting", "Scalability"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
  },
  {
    client: "Luxe Brand Co.",
    industry: "Retail",
    result: "50% Lead Growth",
    description: "Refreshed their visual identity and launched a high-performing, native mobile application, leading to record-breaking engagement metrics and sales.",
    tags: ["Branding", "Mobile Dev", "UX/UI"],
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800"
  },
  {
    client: "Venture Alpha",
    industry: "Financial Services",
    result: "+10 Qualified Calls/Day",
    description: "Implemented an automated, data-driven marketing and outreach system that consistently delivered qualified meetings for their executive sales team.",
    tags: ["Sales Strategy", "Automation", "Marketing"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
  }
];

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    role: "CTO, DataNexus",
    content: "EGO Web Services didn't just host our app; they completely rebuilt our infrastructure for the future. Their focus on reliability and speed is exactly what we needed.",
    rating: 5
  },
  {
    name: "Marcus Thorne",
    role: "Founder, Zenith Media",
    content: "The branding and design process was transformative. Our company's identity now truly reflects the high-tier organization we have grown to become.",
    rating: 5
  },
  {
    name: "Elena Rodriguez",
    role: "Head of Marketing, Solas",
    content: "Their technical approach to digital marketing and automation is incredibly effective. We went from struggling to find leads to having a calendar full of highly qualified meetings.",
    rating: 5
  }
];

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
      <Seo 
        title="Portfolio & Case Studies | EGO Web Services" 
        description="Explore our track record of successful digital projects, including cloud infrastructure scaling, custom mobile apps, and complete brand transformations."
      />

      {/* Header */}
      <section className="bg-slate-50 pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6">
              Our track record.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-slate-600 leading-relaxed">
              We partner with businesses to build reliable, high-performance digital solutions. Here are a few examples of the outcomes we deliver.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="space-y-32">
            {CASE_STUDIES.map((study, index) => (
              <motion.div 
                key={study.client}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className={`flex flex-col lg:flex-row gap-12 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                <motion.div variants={fadeInUp} className="w-full lg:w-1/2">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl bg-slate-100 group relative">
                    <img 
                      src={study.image} 
                      alt={study.client}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-900/10 transition-opacity group-hover:opacity-0" />
                  </div>
                </motion.div>

                <motion.div variants={staggerContainer} className="w-full lg:w-1/2 space-y-6">
                  <motion.div variants={fadeInUp} className="inline-block py-1 px-3 rounded-full bg-blue-50 text-primary text-sm font-semibold tracking-wide border border-blue-100">
                    {study.industry}
                  </motion.div>
                  
                  <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-slate-900">
                    {study.client}
                  </motion.h2>
                  
                  <motion.div variants={fadeInUp} className="text-2xl font-bold text-primary">
                    {study.result}
                  </motion.div>
                  
                  <motion.p variants={fadeInUp} className="text-lg text-slate-600 leading-relaxed">
                    {study.description}
                  </motion.p>
                  
                  <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 pt-4">
                    {study.tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What our clients say.</h2>
            <p className="text-lg text-slate-600">
              Direct feedback from the businesses that rely on our infrastructure and expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative group"
              >
                <Quote className="absolute top-8 right-8 w-8 h-8 text-slate-100 group-hover:text-blue-50 transition-colors" />
                <div className="flex mb-6">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-base leading-relaxed font-medium mb-8 relative z-10">
                  "{t.content}"
                </p>
                <div className="mt-auto">
                  <div className="font-bold text-slate-900">{t.name}</div>
                  <div className="text-sm text-slate-500 font-medium">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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