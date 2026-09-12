import { motion } from "framer-motion";
import {
  Gamepad2,
  Monitor,
  Layers,
  Cpu,
  Zap,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import GameMetrics from "@/components/metrics/GameMetrics";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";
import futuristicUnity from "@assets/generated_images/futuristic_unity_game_dev.webp";

export default function UnityDevelopment() {
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
      icon: Gamepad2,
      title: "2D & 3D Game Development",
      description:
        "Full-cycle development of visually stunning 2D and 3D games.",
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      icon: Monitor,
      title: "Cross-Platform Deployment",
      description:
        "Games built to run seamlessly on PC, Web, Mobile, and VR platforms.",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      icon: Trophy,
      title: "Interactive Learning & Gamification",
      description:
        "Educational games, training simulators, and engagement-focused apps.",
      color: "text-crimson-500", // Tailwind might not have crimson, using red-600 alternate
      bg: "bg-red-600/10",
      border: "border-red-600/20",
    },
    {
      icon: Cpu,
      title: "Custom Mechanics & Features",
      description:
        "Unique gameplay mechanics, AI-driven behaviors, and multiplayer support.",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      icon: Zap,
      title: "High-Performance Optimization",
      description:
        "Ensuring smooth frame rates and efficient asset management across devices.",
      color: "text-red-400",
      bg: "bg-red-400/10",
      border: "border-red-400/20",
    },
  ];

  const businessValues = [
    "Create immersive experiences that engage users",
    "Deliver multi-platform games with high performance",
    "Incorporate gamification to boost learning",
    "Interactive storytelling for brand engagement",
  ];

  return (
    <div className="min-h-screen text-foreground selection:bg-red-500/30">
      <SEO
        title="Unity Game Development Sri Lanka"
        description="CodePlay Studios builds 2D and 3D games and interactive experiences with Unity — cross-platform titles, gamification, and training simulators for Sri Lankan and global clients."
        keywords="Unity game development, Unity game development Sri Lanka, 2D game development, 3D game development, cross-platform games, gamification, CodePlay Studios"
        schemas={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Unity Game Development",
            description:
              "2D and 3D game development, cross-platform deployment, and gamification built with Unity.",
            provider: {
              "@type": "Organization",
              name: "CodePlay Studios",
            },
            areaServed: ["Sri Lanka", "Worldwide"],
          },
        ]}
      />
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-red-400">
                  CodePlay Studios Game Engineering
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Unity Game <br />
                Development
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                We specialize in Unity-based game development that combines
                creativity, performance, and technical excellence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-8 text-lg rounded-full bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all cursor-pointer"
                >
                  <Link href="/#contact">
                    Start Creating
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 backdrop-blur-sm cursor-pointer"
                >
                  <Link href="/case-studies">See Portfolio</Link>
                </Button>
              </div>
            </motion.div>

            {/* Overview Card */}
            <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden border border-red-500/20 bg-black/60 shadow-[0_0_50px_rgba(220,38,38,0.1)] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(220,38,38,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine opacity-30" />
                <div className="relative z-10 grid md:grid-cols-2 gap-0 items-center">
                  <div className="p-10 md:p-14">
                    <div className="inline-block px-3 py-1 rounded-full border border-red-500/30 bg-red-950/30 text-red-400 text-xs font-mono mb-6 tracking-widest uppercase">
                      Interactive Experiences
                    </div>
                    <h2 className="text-4xl font-bold mb-6 text-white tracking-tight">
                      Immersive &{" "}
                      <span className="text-red-500">Captivating</span>
                    </h2>
                    <p className="text-lg text-gray-400 leading-relaxed mb-8">
                      Our solutions cater to businesses, educational
                      institutions, and entertainment brands looking to leverage
                      gamification, 3D experiences, or interactive learning
                      platforms.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      {businessValues.map((value, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{
                            x: 10,
                            backgroundColor: "rgba(220,38,38,0.1)",
                          }}
                          className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-red-500/30 transition-all duration-300 group cursor-default"
                        >
                          <div className="h-3 w-3 rounded-full bg-red-500/50 group-hover:bg-red-400 shadow-[0_0_10px_red] shrink-0" />
                          <span className="font-medium text-gray-300 group-hover:text-red-50 text-xl tracking-wide">
                            {value}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="relative h-full min-h-[500px] border-l border-red-500/10">
                    <div className="absolute inset-0 bg-red-950/20 mix-blend-overlay z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
                    <img
                      src={futuristicUnity}
                      alt="Futuristic Unity Development"
                      className="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                    {/* Overlay HUD elements on image */}
                    <div className="absolute top-10 right-10 z-30 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-mono text-red-500">
                          ENGINE: RUNNING
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-red-500/50">
                        FPS: 144 | Latency: 2ms
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
                  Performance <span className="text-red-500">Stats</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Optimized for maximum engagement and retention.
                </p>
              </div>

              <GameMetrics />
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
                    <Link href="/#contact" className="absolute inset-0 z-10" />
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-black/40 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <service.icon className={`h-7 w-7 ${service.color}`} />
                    </div>

                    <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>

                    <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
              <div className="p-12 rounded-3xl bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent border border-red-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 blur-[100px] rounded-full" />
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Ready to Play?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Build the next big gaming experience with our expert Unity
                    developers.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-gray-200 cursor-pointer"
                  >
                    <Link href="/#contact">Launch Project</Link>
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
