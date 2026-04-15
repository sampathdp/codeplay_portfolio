import { motion } from "framer-motion";
import { WEB_DETAILED_TIERS } from "@/data/pricing";
import WebPricingCard from "./WebPricingCard";

export default function WebPricingSection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-bold tracking-[0.3em] uppercase text-sm mb-4 block"
          >
            Flexible Investment
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
          >
            Web Engineering <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-cyan-400">
              Pricing Packages
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Transparent, high-value packages designed to scale with your business requirements.
            Choose a foundation that fits your current vision.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {WEB_DETAILED_TIERS.map((tier, index) => (
            <WebPricingCard
              key={tier.service}
              tier={tier}
              index={index}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 p-8 glass rounded-3xl border border-white/5 text-center max-w-3xl mx-auto"
        >
          <p className="text-muted-foreground">
            Looking for something entirely custom? Our engineers can design a bespoke solution 
            tailored to your unique industrial requirements.
            <button className="text-primary font-bold ml-2 hover:underline">Talk to an expert →</button>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
