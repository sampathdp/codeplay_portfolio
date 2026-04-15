import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Link } from "wouter";
import { useCurrency } from "@/context/CurrencyContext";
import { PricingTier } from "@/data/pricing";

interface WebPricingCardProps {
  tier: PricingTier;
  index: number;
}

export default function WebPricingCard({ tier, index }: WebPricingCardProps) {
  const { currency, formatPrice } = useCurrency();
  
  // Resolve price based on current currency
  const displayPrice = currency === 'LKR' && tier.startingFromLKR 
    ? tier.startingFromLKR 
    : tier.startingFrom;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative group h-full"
    >
      <div 
        className={`h-full bg-[#0a0a0d]/80 backdrop-blur-xl rounded-[2.5rem] border ${
          tier.featured ? 'border-primary shadow-[0_0_50px_rgba(var(--primary),0.1)]' : 'border-white/5'
        } p-10 flex flex-col transition-all duration-500 hover:border-primary/50 group-hover:translate-y-[-8px]`}
      >
        {tier.featured && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <Badge className="bg-primary hover:bg-primary text-white font-bold px-6 py-1.5 rounded-full shadow-lg shadow-primary/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Most Popular
            </Badge>
          </div>
        )}

        <div className="mb-10 text-center md:text-left">
          <h3 className="text-3xl font-bold mb-4 tracking-tight">{tier.service}</h3>
          <div className="flex items-baseline justify-center md:justify-start gap-1 pb-2">
            <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">
              {formatPrice(tier.startingFrom, tier.startingFromLKR)}
            </span>
          </div>
          <p className="text-muted-foreground text-sm font-medium italic opacity-80">
            {tier.description}
          </p>
        </div>

        <div className="space-y-5 mb-12 flex-1 overflow-y-auto custom-scrollbar">
          {tier.includes.map((item, i) => (
            <div key={i} className="flex items-start gap-4 group/item">
              <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover/item:bg-emerald-500/20 transition-colors">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-sm leading-relaxed text-white/70 group-hover/item:text-white transition-colors tracking-wide">
                {item}
              </span>
            </div>
          ))}
        </div>

        <Button 
          asChild
          className={`w-full rounded-2xl h-16 text-lg font-bold shadow-xl transition-all duration-500 relative overflow-hidden group/btn ${
            tier.featured 
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 border-none' 
            : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50'
          }`}
        >
          <Link href={tier.href}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              Get Started
              <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-2" />
            </span>
            {tier.featured && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
            )}
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
