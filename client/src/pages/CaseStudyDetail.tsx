import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";
import { CASE_STUDIES } from "@/data/caseStudies";
import { useScrollToTopOnNavigate } from "@/hooks/useScrollToTopOnNavigate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Cpu, Rocket, Target, Zap } from "lucide-react";
import NotFound from "./not-found";

export default function CaseStudyDetail() {
  useScrollToTopOnNavigate();
  const { slug } = useParams();
  const cs = CASE_STUDIES.find((item) => item.slug === slug);

  if (!cs) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative selection:bg-primary/20">
      <SEO
        title={`${cs.title} | Case Studies | CodePlay Studios`}
        description={cs.description}
      />
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="relative z-10">
        <Navigation />

        <main className="pt-40 pb-24">
          <div className="container mx-auto px-6">
            <Link href="/case-studies">
              <span className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-12 cursor-pointer group">
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to Case Studies
              </span>
            </Link>

            {/* Hero Section */}
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Badge className="bg-primary/20 text-primary border-primary/30 mb-6 font-bold px-4 py-1 rounded-full">{cs.tag}</Badge>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                  {cs.title}
                </h1>
                <p className="text-muted-foreground text-xl leading-relaxed mb-10">
                  {cs.description}
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {cs.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="bg-white/5 border-white/5 px-4 py-1 rounded-full text-xs font-medium">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className={`aspect-video rounded-[2.5rem] bg-gradient-to-br ${cs.gradient} border border-white/10 shadow-2xl relative overflow-hidden group p-12 flex items-center justify-center`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <Rocket className="w-32 h-32 text-white/20 animate-pulse" />
              </motion.div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
              {[
                { val: cs.metric, label: cs.metricLabel, icon: Zap },
                { val: cs.metric2, label: cs.metric2Label, icon: Target },
                { val: cs.metric3, label: cs.metric3Label, icon: Cpu },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="glass p-8 rounded-3xl border border-white/10 text-center flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-4xl font-bold mb-2 tracking-tight text-white">{item.val}</h3>
                  <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">{item.label}</p>
                </motion.div>
              ))}
            </div>

            {/* 3-Column Grid: Challenge, Solution, Result */}
            <div className="grid lg:grid-cols-3 gap-8 mb-24">
              {[
                { title: "The Challenge", content: cs.challenge, color: "from-blue-500/10" },
                { title: "The Solution", content: cs.solution, color: "from-primary/10" },
                { title: "The Result", content: cs.results, color: "from-green-500/10" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`p-10 rounded-[2rem] bg-gradient-to-b ${item.color} to-transparent border border-white/5 h-full`}
                >
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-primary rounded-full" />
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.content}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass p-12 rounded-[3rem] border border-white/10 text-center max-w-4xl mx-auto relative overflow-hidden"
            >
              {/* Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to achieve similar results?</h2>
                <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
                  Let's discuss how we can apply our engineering expertise to solve your business's most pressing technical challenges.
                </p>
                <Link href="/#contact">
                  <Button size="lg" className="rounded-2xl px-12 h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105">
                    Start Your Project
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
