import { motion } from "framer-motion";
import {
  Smartphone,
  Layers,
  Zap,
  Shield,
  Globe,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MobileMetrics from "@/components/metrics/MobileMetrics";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";
import futuristicMobileDev from "@assets/generated_images/futuristic_mobile_dev.webp";

export default function MobileDevelopment() {
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
      icon: Smartphone,
      title: "Android & iOS Applications",
      description:
        "A single, unified application built for both platforms using Flutter, ensuring consistency and efficiency.",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
    },
    {
      icon: Layers,
      title: "Business, Service & Educational",
      description:
        "Mobile solutions tailored for operational efficiency, service delivery, and digital learning.",
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      border: "border-pink-400/20",
    },
    {
      icon: Zap,
      title: "Real-Time Features",
      description:
        "Push notifications, live updates, and interactive features to improve user engagement.",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20",
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description:
        "Robust login systems with role-based access and data protection.",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
    {
      icon: Globe,
      title: "App Store Deployment",
      description:
        "End-to-end support for Google Play Store and Apple App Store submission.",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/20",
    },
  ];

  const businessValues = [
    "Direct access to customers on mobile",
    "Faster engagement and brand loyalty",
    "Reduced cost with cross-platform solution",
    "Secure, scalable architecture",
  ];

  return (
    <div className="min-h-screen text-foreground selection:bg-purple-500/30">
      <SEO
        title="Mobile App Development - iOS & Android"
        description="Native-quality cross-platform mobile apps built with Flutter. We deliver secure, scalable apps for Android and iOS with real-time features."
        keywords="mobile app development, Flutter development, iOS apps, Android apps, cross-platform apps, CodePlay Studios"
        schemas={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Mobile App Development",
            description:
              "Native-quality cross-platform mobile apps for iOS and Android using Flutter.",
            provider: {
              "@type": "Organization",
              name: "CodePlay Studios",
            },
            areaServed: "Worldwide",
          },
        ]}
      />
      <Navigation />

      <main className="pt-24 pb-16 relative z-10">
        {/* Generative Background */}
        <div className="fixed inset-0 z-0 h-full w-full bg-background">
          <MatrixRain />
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-sm font-medium text-purple-300">
                  CodePlay Studios Mobile Engineering
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Mobile App <br />
                Development
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Native-quality cross-platform mobile apps that deliver seamless
                experiences on iOS and Android.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button
                  size="lg"
                  className="h-12 px-8 text-lg rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all"
                >
                  Start Your App
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 backdrop-blur-sm"
                >
                  View Apps
                </Button>
              </div>
            </motion.div>

            {/* Overview Card */}
            <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-black/60 shadow-[0_0_50px_rgba(168,85,247,0.1)] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(168,85,247,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine opacity-30" />
                <div className="relative z-10 grid md:grid-cols-2 gap-0 items-center">
                  <div className="p-10 md:p-14">
                    <div className="inline-block px-3 py-1 rounded-full border border-purple-500/30 bg-purple-950/30 text-purple-400 text-xs font-mono mb-6 tracking-widest uppercase">
                      Mobile Ecosystem
                    </div>
                    <h2 className="text-4xl font-bold mb-6 text-white tracking-tight">
                      Next-Gen{" "}
                      <span className="text-purple-400">
                        Mobile Experiences
                      </span>
                    </h2>
                    <p className="text-lg text-gray-400 leading-relaxed mb-8">
                      CodePlay Studios develops high-performance mobile
                      applications for Android and iOS using modern
                      cross-platform technology. Our mobile solutions are
                      designed to enhance customer engagement, improve
                      accessibility, and support scalable business growth.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      {businessValues.map((value, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{
                            x: 10,
                            backgroundColor: "rgba(168,85,247,0.1)",
                          }}
                          className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all duration-300 group cursor-default"
                        >
                          <div className="h-3 w-3 rounded-full bg-purple-500/50 group-hover:bg-purple-400 shadow-[0_0_10px_purple] shrink-0" />
                          <span className="font-medium text-gray-300 group-hover:text-purple-50 text-xl tracking-wide">
                            {value}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="relative h-full min-h-[500px] border-l border-purple-500/10">
                    <div className="absolute inset-0 bg-purple-950/20 mix-blend-overlay z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
                    <img
                      src={futuristicMobileDev}
                      alt="Futuristic Mobile Development"
                      className="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                    {/* Overlay HUD elements on image */}
                    <div className="absolute top-10 right-10 z-30 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-xs font-mono text-purple-500">
                          DEVICE SYNC
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-purple-500/50">
                        Status: Connected
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
                  App <span className="text-purple-400">Performance</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Real-time analytics and engagement tracking.
                </p>
              </div>

              <MobileMetrics />
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
              <div className="p-12 rounded-3xl bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent border border-purple-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full" />
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Ready to Go Mobile?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Launch your app on iOS and Android with a single, powerful
                    codebase.
                  </p>
                  <Button
                    size="lg"
                    className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-gray-200"
                  >
                    Get a Quote
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
