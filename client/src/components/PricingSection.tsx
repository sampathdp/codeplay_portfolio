import { motion } from "framer-motion";
import { Link } from "wouter";
import { PRICING_TIERS } from "@/data/pricing";
import PricingCard from "./PricingCard";
import { MessageSquareText } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "./ui/button";

export default function PricingSection() {
  const { currency } = useCurrency();

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-medium tracking-widest uppercase text-sm mb-4 block"
          >
            Pricing Guide
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold leading-tight mb-6"
          >
            Transparent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">
              Starting Points
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-lg"
          >
            Every project is custom-scoped — these are honest starting points to help you plan your investment in digital excellence.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRICING_TIERS.map((tier, index) => (
            <PricingCard
              key={tier.service}
              {...tier}
              index={index}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 p-8 glass rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="max-w-2xl">
            <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-primary" />
              Need a custom estimate?
            </h4>
            <p className="text-muted-foreground text-sm">
              All pricing is in {currency}. Final quotes depend on scope, complexity, and timeline. 
              Book a free discovery call to get a precise quote tailored to your business needs.
            </p>
          </div>
          <Button 
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 rounded-2xl shrink-0 group shadow-lg shadow-primary/25 cursor-pointer"
          >
            <Link href="/#contact">
              Get a Free Quote
              <motion.span 
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
