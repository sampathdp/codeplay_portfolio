import { motion } from "framer-motion";
import { ArrowRight, Target } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "wouter";

export default function AboutTeaser() {
  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary">
              Our Philosophy
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black mb-8 tracking-tighter"
          >
            Smart Software <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-cyan-400">
              Real Solutions
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            We replace digital complexity with high-performance engineering. 
            CodePlay Studios builds software that empowers your vision 
            while delivering industrial-grade power.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full h-14 px-10 text-lg border-primary/20 hover:bg-primary/5 cursor-pointer group"
            >
              <Link href="/about">
                The CodePlay Story
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
