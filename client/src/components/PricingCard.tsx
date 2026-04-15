import { motion } from "framer-motion";
import { Check, ArrowRight, Globe, Smartphone, Brain, Rocket, Gamepad2, LayoutDashboard, Layers } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Link } from "wouter";
import { useCurrency } from "@/context/CurrencyContext";

const icons = {
  Globe,
  Smartphone,
  Brain,
  Rocket,
  Gamepad2,
  LayoutDashboard,
  Layers
};

interface PricingCardProps {
  service: string;
  iconName: keyof typeof icons;
  startingFrom: number;
  startingFromLKR?: number;
  currency: string;
  timeline: string;
  includes: string[];
  accentColor: string;
  href: string;
  featured: boolean;
  index: number;
}

export default function PricingCard({
  service,
  iconName,
  startingFrom,
  startingFromLKR,
  currency: _currency,
  timeline,
  includes,
  accentColor,
  href,
  featured,
  index,
}: PricingCardProps) {
  const Icon = icons[iconName];
  const { formatPrice } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative group h-full`}
    >
      <div className={`h-full glass rounded-3xl border ${featured ? 'border-primary/50' : 'border-white/10'} p-8 flex flex-col transition-all duration-500 hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]`}>
        {featured && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground font-bold px-4 py-1 rounded-full shadow-lg shadow-primary/20">
              Most Popular
            </Badge>
          </div>
        )}

        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-500`}>
          <Icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-1">{service}</h3>
          <p className="text-sm text-muted-foreground">Starting from</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-4xl font-bold tracking-tight">
              {formatPrice(startingFrom, startingFromLKR)}
            </span>
          </div>
        </div>

        <Badge variant="secondary" className="w-fit mb-8 bg-white/5 border-white/5 text-xs">
          Est. {timeline}
        </Badge>

        <div className="space-y-4 mb-10 flex-1">
          {includes.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm text-white/80">{item}</span>
            </div>
          ))}
        </div>

        <Link href={href}>
          <Button 
            className={`w-full group/btn rounded-2xl h-12 transition-all duration-300 ${featured ? 'bg-primary hover:bg-primary/90' : 'bg-white/10 hover:bg-primary'}`}
          >
            Explore Service
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
