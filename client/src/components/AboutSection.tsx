import { motion } from "framer-motion";
import { Check, Users, Trophy, Code, Clock } from "lucide-react";

interface StatsCardProps {
  icon: any;
  value: string;
  label: string;
  delay: number;
}

const StatsCard = ({ icon: Icon, value, label, delay }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    className="flex flex-col items-center justify-center p-6 bg-secondary/20 rounded-2xl text-center"
  >
    <Icon className="w-8 h-8 text-primary mb-3" />
    <span className="text-3xl font-bold mb-1">{value}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </motion.div>
);

export default function AboutSection() {
  return (
    <section id="about" className="py-32 bg-muted/20 relative overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/30 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-medium tracking-wide uppercase text-sm">
              About CodePlay
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 leading-tight">
              We Craft Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Masterpieces
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Founded on the principles of clarity and precision, CodePlay
              Studios is more than just a dev shop. We are your strategic
              partners in the digital age.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We focus on "Calm Computing" — creating software that respects
              human attention while delivering powerful results. No clutter, no
              noise, just pure functionality wrapped in elegance.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                "User-Centric Methodology",
                "Pixel-Perfect Implementation",
                "Cloud-Native Architecture",
                "24/7 Dedicated Support",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              className="space-y-4 mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
                alt="Team collaboration"
                className="rounded-3xl shadow-xl object-cover h-64 w-full"
              />
              <div className="glass p-6 rounded-3xl">
                <h4 className="font-bold text-lg mb-2">Our Mission</h4>
                <p className="text-sm text-muted-foreground">
                  To simplify the complex and beautify the functional.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="glass p-6 rounded-3xl bg-primary">
                <h4 className="font-bold text-lg mb-2 text-white">Vision</h4>
                <p className="text-sm text-white/90">
                  Building the digital infrastructure of tomorrow, today.
                </p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80"
                alt="Office workspace"
                className="rounded-3xl shadow-xl object-cover h-64 w-full"
              />
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <StatsCard
            icon={Users}
            value="50+"
            label="Happy Clients"
            delay={0.1}
          />
          <StatsCard
            icon={Code}
            value="120+"
            label="Projects Done"
            delay={0.2}
          />

          <StatsCard
            icon={Clock}
            value="5+"
            label="Years Experience"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
}
