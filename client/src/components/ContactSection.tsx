import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="py-32 bg-background relative overflow-hidden"
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
              Ready to transform your digital presence? We are here to help.
              reach out to discuss your project, ask questions, or just say
              hello.
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
                  <h4 className="text-lg font-semibold">hello@codeplay.io</h4>
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
                  <h4 className="text-lg font-semibold">+1 (555) 123-4567</h4>
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
                  <h4 className="text-lg font-semibold">
                    123 Tech Avenue, Silicon Valley
                  </h4>
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
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    placeholder="John Doe"
                    className="h-12 rounded-xl bg-muted/30 border-primary/10 transition-colors focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="h-12 rounded-xl bg-muted/30 border-primary/10 transition-colors focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Project Inquiry"
                  className="h-12 rounded-xl bg-muted/30 border-primary/10 transition-colors focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Tell us about your project..."
                  className="min-h-[160px] rounded-xl bg-muted/30 border-primary/10 resize-none transition-colors focus:border-primary"
                />
              </div>

              <Button
                size="lg"
                className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
