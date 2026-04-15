import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";
import { CASE_STUDIES } from "@/data/caseStudies";
import CaseStudyCard from "@/components/CaseStudyCard";
import { useScrollToTopOnNavigate } from "@/hooks/useScrollToTopOnNavigate";

export default function CaseStudies() {
  useScrollToTopOnNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative selection:bg-primary/20">
      <SEO
        title="Case Studies | CodePlay Studios"
        description="Explore our in-depth project case studies showcasing how we solve complex business challenges with AI, web, and mobile solutions."
      />
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/60" />
      </div>

      <div className="relative z-10">
        <Navigation />

        <main className="pt-40 pb-24">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mb-20">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-primary font-medium tracking-widest uppercase text-sm mb-4 block"
              >
                Our Track Record
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold leading-tight mb-8"
              >
                Deep Dives Into{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-500">
                  Engineering Excellence
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-xl"
              >
                We don't just build features; we solve critical business bottlenecks. 
                Explore how our technical implementations have driven measurable growth for our partners.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CASE_STUDIES.map((cs, index) => (
                <CaseStudyCard
                  key={cs.id}
                  {...cs}
                  index={index}
                />
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
