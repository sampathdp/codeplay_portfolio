import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Send,
  MessageSquare,
  Globe,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";
import { submitContact, isContactConfigured, ContactApiError } from "@/lib/contactApi";

const CONTACT_EMAIL = "info@codeplaystudios.com";

type Status = "idle" | "submitting" | "success" | "error";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "info@codeplaystudios.com",
    href: "mailto:info@codeplaystudios.com"
  },
  {
    icon: Phone,
    title: "Phone / WhatsApp",
    value: "+94 75 445 3334",
    href: "tel:+94754453334"
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Panadura, Sri Lanka",
    href: "https://maps.google.com/?q=115/A+Gagabada+Road+Hirana+Panadura+Sri+Lanka"
  },
  {
    icon: Clock,
    title: "Response Time",
    value: "Within 24 Hours",
    href: null
  }
];

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const service = String(data.get("service") ?? "Other Custom Solution");
    const message = String(data.get("message") ?? "");
    const company = String(data.get("company") ?? "");

    if (!isContactConfigured()) {
      const body = `Service: ${service}\n\n${message}\n\n— ${name} (${email})`;
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Project Inquiry — ${service}`)}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus("submitting");
    setError(null);
    try {
      await submitContact({ name, email, subject: service, message, company });
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof ContactApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 relative">
      <SEO
        title="Contact CodePlay Studios | Sri Lanka Software Company"
        description="Ready to build your next high-performance system? Reach out to CodePlay Studios, a software development company based in Panadura, Sri Lanka, for a free consultation. We respond within 24 hours."
      />

      <div className="fixed inset-0 z-0 h-full w-full bg-background pointer-events-none">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/90 z-0" />
      </div>

      <Navigation />

      <main className="relative z-10 pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-24"
          >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
              <span className="text-primary font-mono tracking-widest uppercase text-sm mb-4 block">
                [ Get in Touch ]
              </span>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                Initiate <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                  Discovery
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Whether you're looking for a full ERP suite or a high-end web presence, let's discuss how we can engineer your vision.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-16">
              {/* Contact Info Column */}
              <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-12">
                  <h3 className="text-2xl font-bold">Contact Details</h3>
                  <div className="space-y-10">
                    {contactInfo.map((info, i) => {
                      const content = (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors duration-500">
                            <info.icon className="w-6 h-6 text-primary group-hover:text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-mono uppercase text-muted-foreground tracking-widest mb-1">{info.title}</p>
                            <p className="text-lg font-bold group-hover:text-primary transition-colors">{info.value}</p>
                          </div>
                        </>
                      );
                      return info.href ? (
                        <a
                          key={i}
                          href={info.href}
                          target={info.href.startsWith("http") ? "_blank" : undefined}
                          rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="flex items-start gap-5 group hover:translate-x-2 transition-all duration-300"
                        >
                          {content}
                        </a>
                      ) : (
                        <div key={i} className="flex items-start gap-5 group">
                          {content}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20">
                  <h4 className="font-bold flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Free Consultation
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All discovery calls are completely free of charge. We'll analyze your requirements and provide an industrial-grade scoped quote.
                  </p>
                </div>
              </motion.div>

              {/* Form Column */}
              <motion.div variants={itemVariants} className="lg:col-span-8">
                <div className="p-8 md:p-12 rounded-[2.5rem] bg-[#0a0a0d] border border-white/5 shadow-2xl">
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
                    {/* Honeypot — hidden from real visitors, only bots fill it. */}
                    <input
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />
                    <div className="space-y-4">
                      <label htmlFor="contact-name" className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Full Name</label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        placeholder="John Doe"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 focus:outline-none focus:border-primary transition-colors text-white"
                      />
                    </div>
                    <div className="space-y-4">
                      <label htmlFor="contact-email" className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Email Address</label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="john@example.com"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 focus:outline-none focus:border-primary transition-colors text-white"
                      />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                      <label htmlFor="contact-service" className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Select Service</label>
                      <select id="contact-service" name="service" defaultValue="Web Development" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 focus:outline-none focus:border-primary transition-colors text-white appearance-none cursor-pointer">
                        <option value="Web Development" className="bg-black">Web Development</option>
                        <option value="Mobile Engineering" className="bg-black">Mobile Engineering</option>
                        <option value="ERP & Enterprise Systems" className="bg-black">ERP & Enterprise Systems</option>
                        <option value="Unity Game Dev" className="bg-black">Unity Game Dev</option>
                        <option value="AI & Automation" className="bg-black">AI & Automation</option>
                        <option value="Other Custom Solution" className="bg-black">Other Custom Solution</option>
                      </select>
                    </div>
                    <div className="space-y-4 md:col-span-2">
                      <label htmlFor="contact-message" className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Project Vision</label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Briefly describe your requirements..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-primary transition-colors text-white"
                      />
                    </div>
                    <div className="md:col-span-2 pt-4 space-y-4">
                      <Button
                        type="submit"
                        disabled={status === "submitting"}
                        className="w-full md:w-auto h-16 px-12 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 group cursor-pointer disabled:opacity-60"
                      >
                        {status === "submitting" ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" aria-hidden="true" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Transmit Inquiry
                            <Send className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </>
                        )}
                      </Button>
                      <div role="status" aria-live="polite">
                        {status === "success" && (
                          <p className="flex items-center gap-2 text-sm font-medium text-emerald-500">
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            Message sent — we'll reply within 24 hours.
                          </p>
                        )}
                        {status === "error" && (
                          <p className="text-sm font-medium text-red-500">{error}</p>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
            
            {/* Map Integration (Placeholder for now) */}
            <motion.div variants={itemVariants} className="rounded-[3rem] overflow-hidden grayscale brightness-75 border border-white/10 h-[400px] relative">
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
              {/* This would be an iframe for Google Maps */}
              <div className="absolute inset-0 bg-background flex items-center justify-center">
                <p className="text-muted-foreground font-mono">MAP_ID: 12.332 / 42.433 - Panadura Operational Center</p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
