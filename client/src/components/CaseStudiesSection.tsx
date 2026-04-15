import { motion } from "framer-motion";
import { Link } from "wouter";
import { CASE_STUDIES } from "@/data/caseStudies";
import CaseStudyCard from "./CaseStudyCard";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export default function CaseStudiesSection() {
  const featuredCases = CASE_STUDIES.filter((c) => c.featured).slice(0, 3);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-medium tracking-widest uppercase text-sm mb-4 block"
            >
              Selected Works
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold leading-tight"
            >
              Our Engineering{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                Masterpieces
              </span>
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link href="/case-studies">
              <Button variant="ghost" className="group text-primary hover:text-primary hover:bg-primary/10 rounded-full px-6">
                View All Projects
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCases.map((cs, index) => (
            <CaseStudyCard
              key={cs.id}
              {...cs}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
