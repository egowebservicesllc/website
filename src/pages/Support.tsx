import { Seo } from "@/components/Seo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const supportSchema = z.object({
  organization: z.string().min(2, { message: "Organization name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  impactLevel: z.string().min(1, { message: "Please select an impact level." }),
  description: z.string().min(10, { message: "Please provide a detailed description (min 10 characters)." }),
});

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Support() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof supportSchema>>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      organization: "",
      email: "",
      impactLevel: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof supportSchema>) {
    console.log("Support Ticket Data:", values);
    // Client-side only simulation
    setIsSubmitted(true);
  }

  return (
    <Layout>
      <Seo 
        title="Technical Support | EGO Web Services" 
        description="Access enterprise assistance for your digital infrastructure. Open a support ticket directly with our engineering team."
      />

      <section className="bg-slate-50 pt-20 pb-16 md:pt-28 md:pb-24 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6">
              Support Center
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-slate-600 leading-relaxed">
              Enterprise assistance for your digital infrastructure. We're here to keep your systems running smoothly.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          
          {/* Support Channels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Email Support</h3>
              <p className="text-slate-600 text-sm mb-4 flex-grow">Direct access to our helpdesk engineering team.</p>
              <a href="mailto:support@egowebservices.com" className="text-primary font-semibold hover:underline">support@egowebservices.com</a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Live Chat</h3>
              <p className="text-slate-600 text-sm mb-4 flex-grow">Available 24/7 for Managed IT and Enterprise Hosting clients.</p>
              <span className="text-slate-400 font-medium text-sm">Client Portal Login Required</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Technical Docs</h3>
              <p className="text-slate-600 text-sm mb-4 flex-grow">API references, hosting guides, and infrastructure documentation.</p>
              <button className="text-emerald-600 font-semibold hover:underline cursor-pointer">Browse Library</button>
            </motion.div>
          </div>

          {/* Support Ticket Form */}
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-10"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                      className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Request Received</h2>
                    <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                      Your support ticket has been logged successfully. Our team will review the details and get back to you shortly.
                    </p>
                    <Button onClick={() => {
                      setIsSubmitted(false);
                      form.reset();
                    }} variant="outline" className="px-8 hover:scale-105 transition-transform">
                      Open New Ticket
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Open a Support Ticket</h2>
                    <p className="text-slate-600 mb-8">Fill out the details below to escalate an issue to our engineering team.</p>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="organization"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-900">Organization Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Acme Corp" className="h-12 bg-slate-50 border-slate-200" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="impactLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-900">Impact Level</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                                      <SelectValue placeholder="Select severity..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="general">General Inquiry</SelectItem>
                                    <SelectItem value="minor">Minor Disruption</SelectItem>
                                    <SelectItem value="critical">Critical Outage</SelectItem>
                                    <SelectItem value="security">Security Event</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-900">Contact Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="admin@acmecorp.com" className="h-12 bg-slate-50 border-slate-200" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-900">Issue Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Please provide technical details, error messages, and steps to reproduce..." 
                                  className="min-h-[150px] resize-y bg-slate-50 border-slate-200 p-4" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex items-center justify-between pt-2">
                          <p className="text-sm text-slate-500 font-medium max-w-[250px]">
                            Critical outages for managed clients are typically addressed within 30 minutes.
                          </p>
                          <Button type="submit" size="lg" className="h-12 px-8 text-base hover:scale-[1.02] transition-transform">
                            Submit Ticket
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          
        </div>
      </section>
    </Layout>
  );
}