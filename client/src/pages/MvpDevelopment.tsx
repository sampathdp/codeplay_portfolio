import { motion } from "framer-motion";
import {
  Rocket,
  Timer,
  Layers,
  TrendingUp,
  Users,
  ArrowRight,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MvpMetrics from "@/components/metrics/MvpMetrics";
import MatrixRain from "@/components/MatrixRain";
import futuristicMvp from "@assets/generated_images/futuristic_mvp_launch.png";

export default function MvpDevelopment() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const services = [
    {
      icon: Rocket,
      title: "Rapid Prototyping",
      description:
        "Turn concepts into clickable prototypes in days, not months.",
      color: "text-magenta-500", // Using fuchsia/pink alternates
      bg: "bg-fuchsia-500/10",
      border: "border-fuchsia-500/20",
    },
    {
      icon: Layers,
      title: "Scalable Architecture",
      description:
        "Built on a solid foundation that grows with your user base.",
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
    {
      icon: Users,
      title: "User-Centric Design",
      description:
        "Focus on core features that solve real user problems immediately.",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      icon: TrendingUp,
      title: "Market Validation",
      description:
        "Launch quickly to gather feedback and iterate based on real data.",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      icon: Target,
      title: "Core Feature Focus",
      description:
        "Prioritizing high-impact features to maximize initial value.",
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-400/10",
      border: "border-fuchsia-400/20",
    },
  ];

  const businessValues = [
    "Faster Time-to-Market",
    "Reduced Development Costs",
    "Early User Feedback Loops",
    "Lower Investment Risk",
  ];

  return (
    <div className="min-h-screen text-foreground selection:bg-fuchsia-500/30">
      <Navigation />

      <main className="pt-24 pb-16 relative z-10">
        {/* Generative Background */}
        <div className="fixed inset-0 z-0 h-full w-full bg-background">
          <MatrixRain />
          <div className="absolute inset-0 bg-background/80 z-0 pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-20"
          >
            {/* Hero Section */}
            <motion.div
              variants={itemVariants}
              className="max-w-4xl mx-auto text-center space-y-8 pt-12"
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
                <span className="text-sm font-medium text-fuchsia-300">
                  CodePlay Studios Launchpad
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                MVP Development & <br />
                Prototyping
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Validate your ideas fast. We build scalable MVPs that get you to
                market quickly without compromising on quality.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button
                  size="lg"
                  className="h-12 px-8 text-lg rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(192,38,211,0.3)] hover:shadow-[0_0_30px_rgba(192,38,211,0.5)] transition-all"
                >
                  Launch Idea
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 backdrop-blur-sm"
                >
                  How It Works
                </Button>
              </div>
            </motion.div>

            {/* Overview Card */}
            <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden border border-fuchsia-500/20 bg-black/60 shadow-[0_0_50px_rgba(192,38,211,0.1)] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(192,38,211,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine opacity-30" />
                <div className="relative z-10 grid md:grid-cols-2 gap-0 items-center">
                  <div className="p-10 md:p-14">
                    <div className="inline-block px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-950/30 text-fuchsia-400 text-xs font-mono mb-6 tracking-widest uppercase">
                      Startup Accelerator
                    </div>
                    <h2 className="text-4xl font-bold mb-6 text-white tracking-tight">
                      From Concept to{" "}
                      <span className="text-fuchsia-400">Launch</span>
                    </h2>
                    <p className="text-lg text-gray-400 leading-relaxed mb-8">
                      Don't waste months building features users might not want.
                      Our MVP approach focuses on validating your core value
                      proposition with a lean, scalable product.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      {businessValues.map((value, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{
                            x: 10,
                            backgroundColor: "rgba(192,38,211,0.1)",
                          }}
                          className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-fuchsia-500/30 transition-all duration-300 group cursor-default"
                        >
                          <div className="h-3 w-3 rounded-full bg-fuchsia-500/50 group-hover:bg-fuchsia-400 shadow-[0_0_10px_fuchsia] shrink-0" />
                          <span className="font-medium text-gray-300 group-hover:text-fuchsia-50 text-xl tracking-wide">
                            {value}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="relative h-full min-h-[500px] border-l border-fuchsia-500/10">
                    <div className="absolute inset-0 bg-fuchsia-950/20 mix-blend-overlay z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
                    <img
                      src={futuristicMvp}
                      alt="Futuristic MVP Launch"
                      className="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                    {/* Overlay HUD elements on image */}
                    <div className="absolute top-10 right-10 z-30 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                        <span className="text-xs font-mono text-pink-500">
                          TRAJECTORY: OPTIMAL
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-fuchsia-500/50">
                        Growth Rate: +400%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Business Value & Metrics - Full Width HUD */}
            <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">
                  Growth <span className="text-fuchsia-400">Metrics</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Tracking the pulse of your product's market adoption.
                </p>
              </div>

              <MvpMetrics />
            </motion.div>

            {/* What We Deliver Grid */}
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold text-center mb-16">
                What We Deliver
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className={`group relative p-8 rounded-3xl border transition-all duration-300 ${service.bg} ${service.border} hover:border-opacity-50 hover:bg-opacity-20`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-black/40 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <service.icon className={`h-7 w-7 ${service.color}`} />
                    </div>

                    <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>

                    <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                      <ArrowRight
                        className={`h-6 w-6 ${service.color} -rotate-45 group-hover:rotate-0 transition-transform duration-300`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              variants={itemVariants}
              className="max-w-4xl mx-auto text-center pb-20"
            >
              <div className="p-12 rounded-3xl bg-gradient-to-r from-fuchsia-500/20 via-fuchsia-500/10 to-transparent border border-fuchsia-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 blur-[100px] rounded-full" />
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Have an Idea?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Let's turn your vision into a working product in weeks, not
                    years.
                  </p>
                  <Button
                    size="lg"
                    className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-gray-200"
                  >
                    Start Building
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
