import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Mail, MapPin, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { submitContact, isContactConfigured, ContactApiError } from "@/lib/contactApi";

const CONTACT_EMAIL = "info@codeplaystudios.com";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactSection() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const subject = String(data.get("subject") ?? "Project Inquiry");
    const message = String(data.get("message") ?? "");
    const company = String(data.get("company") ?? "");

    // No backend configured (e.g. local dev without env vars) — fall back
    // to opening the visitor's email client instead of failing silently.
    if (!isContactConfigured()) {
      const body = `${message}\n\n— ${name} (${email})`;
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus("submitting");
    setError(null);
    try {
      await submitContact({ name, email, subject, message, company });
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof ContactApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <section
      id="contact"
      className="py-32 bg-transparent relative overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-medium tracking-wide uppercase text-sm">
              Contact Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-8">
              Let's Build Something <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Amazing Together
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              Ready to transform your digital presence? We are here to
              help — reach out to discuss your project, ask questions, or
              just say hello.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email Us
                  </p>
                  <p className="text-lg font-semibold">
                    info@codeplaystudios.com
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Call Us
                  </p>
                  <p className="text-lg font-semibold">075 445 3334</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Visit Us
                  </p>
                  <p className="text-lg font-semibold">
                    115/A, Gagabada Road, Hirana, Panadura, Sri Lanka
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-card border border-border/50 p-8 md:p-10 rounded-3xl shadow-2xl shadow-primary/5"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Honeypot — hidden from real visitors via CSS, so only bots
                  that blindly fill every field trip it. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="home-contact-name" className="text-sm font-medium">Full Name</label>
                  <Input
                    id="home-contact-name"
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="John Doe"
                    className="h-12 rounded-xl bg-muted/30 border-primary/10 transition-colors focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="home-contact-email" className="text-sm font-medium">Email Address</label>
                  <Input
                    id="home-contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="john@example.com"
                    className="h-12 rounded-xl bg-muted/30 border-primary/10 transition-colors focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="home-contact-subject" className="text-sm font-medium">Subject</label>
                <Input
                  id="home-contact-subject"
                  name="subject"
                  placeholder="Project Inquiry"
                  className="h-12 rounded-xl bg-muted/30 border-primary/10 transition-colors focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="home-contact-message" className="text-sm font-medium">Message</label>
                <Textarea
                  id="home-contact-message"
                  name="message"
                  required
                  placeholder="Tell us about your project..."
                  className="min-h-[160px] rounded-xl bg-muted/30 border-primary/10 resize-none transition-colors focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={status === "submitting"}
                className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-60"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
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
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
