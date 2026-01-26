import { motion } from "framer-motion";
import {
    Globe,
    ShoppingCart,
    Layout,
    Server,
    Search,
    CheckCircle2,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HolographicHUD from "@/components/HolographicHUD";
import DigitalHorizon from "@/components/DigitalHorizon";
import futuristicDev from "@assets/generated_images/futuristic_web_dev.png";

export default function WebDevelopment() {
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
            icon: Globe,
            title: "Corporate & Business Websites",
            description: "Professional, responsive websites designed to represent your brand and build trust.",
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
        },
        {
            icon: ShoppingCart,
            title: "E-Commerce Platforms",
            description: "Secure online stores with product management, order handling, and payment integration.",
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20",
        },
        {
            icon: Layout,
            title: "Web Applications",
            description: "Custom web-based systems built for performance, reliability, and long-term use.",
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            border: "border-purple-400/20",
        },
        {
            icon: Server,
            title: "API & Third-Party Integrations",
            description: "Payment gateways, external services, and system integrations tailored to business needs.",
            color: "text-orange-400",
            bg: "bg-orange-400/10",
            border: "border-orange-400/20",
        },
        {
            icon: Search,
            title: "SEO-Ready & Mobile-Optimized",
            description: "Optimized for search engines, speed, and seamless performance across all devices.",
            color: "text-cyan-400",
            bg: "bg-cyan-400/10",
            border: "border-cyan-400/20",
        },
    ];

    const businessValues = [
        "Strong and credible online presence",
        "Easy content and data management",
        "Platforms designed to generate leads and sales",
        "Scalable solutions that grow with your business",
    ];

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/20">
            <Navigation />

            <main className="pt-24 pb-16 relative z-10">
                {/* Generative Background */}
                <div className="fixed inset-0 z-0 h-full w-full bg-[#0a0a0a]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-40"></div>
                    <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                    <DigitalHorizon />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-20"
                    >
                        {/* Hero Section */}
                        <motion.div variants={itemVariants} className="max-w-4xl mx-auto text-center space-y-8 pt-12">
                            <motion.div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                <span className="text-sm font-medium text-accent">CodePlay Studios Web Engineering</span>
                            </motion.div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                                Web Application & <br />Website Development
                            </h1>

                            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                                CodePlay Studios designs and develops modern websites and web applications that
                                combine <span className="text-primary font-medium">performance</span>,
                                <span className="text-primary font-medium"> usability</span>, and
                                <span className="text-primary font-medium"> scalability</span>.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                <Button size="lg" className="h-12 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all">
                                    Start Your Project
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 backdrop-blur-sm">
                                    View Portfolio
                                </Button>
                            </div>
                        </motion.div>

                        {/* Overview Card */}
                        <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
                            <div className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-black/60 shadow-[0_0_50px_rgba(0,255,255,0.1)] backdrop-blur-2xl">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine opacity-30" />
                                <div className="relative z-10 grid md:grid-cols-2 gap-0 items-center">
                                    <div className="p-10 md:p-14">
                                        <div className="inline-block px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono mb-6 tracking-widest uppercase">
                                            System Overview
                                        </div>
                                        <h2 className="text-4xl font-bold mb-6 text-white tracking-tight">
                                            Engineering the <span className="text-cyan-400">Digital Future</span>
                                        </h2>
                                        <p className="text-lg text-gray-400 leading-relaxed mb-8">
                                            We build ecosystem-level solutions that merge aesthetic perfection with industrial-grade performance.
                                            Our code is the infrastructure of your future growth.
                                        </p>
                                        <div className="grid grid-cols-1 gap-4">
                                            {businessValues.map((value, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    whileHover={{ x: 10, backgroundColor: "rgba(6,182,212,0.1)" }}
                                                    className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group cursor-default"
                                                >
                                                    <div className="h-2 w-2 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400 shadow-[0_0_10px_cyan]" />
                                                    <span className="font-medium text-gray-300 group-hover:text-cyan-50 font-mono text-sm tracking-wide">{value}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative h-full min-h-[500px] border-l border-cyan-500/10">
                                        <div className="absolute inset-0 bg-cyan-950/20 mix-blend-overlay z-10" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
                                        <img
                                            src={futuristicDev}
                                            alt="Futuristic Web Development"
                                            className="absolute inset-0 w-full h-full object-cover opacity-90"
                                        />
                                        {/* Overlay HUD elements on image */}
                                        <div className="absolute top-10 right-10 z-30 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                <span className="text-xs font-mono text-green-500">SYSTEM ONLINE</span>
                                            </div>
                                            <div className="text-[10px] font-mono text-cyan-500/50">
                                                Coordinates: 42.433 / 12.332
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
                                    System <span className="text-cyan-400">Metrics</span>
                                </h2>
                                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                    Real-time performance validation across all operational vectors.
                                </p>
                            </div>

                            <HolographicHUD />
                        </motion.div>

                        {/* What We Deliver Grid */}
                        <motion.div variants={itemVariants}>
                            <h2 className="text-4xl font-bold text-center mb-16">What We Deliver</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                                {services.map((service, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                        className={`group relative p-8 rounded-3xl border transition-all duration-300 ${service.bg} ${service.border} hover:border-opacity-50 hover:bg-opacity-20`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-black/40 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <service.icon className={`h-7 w-7 ${service.color}`} />
                                        </div>

                                        <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {service.description}
                                        </p>

                                        <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                                            <ArrowRight className={`h-6 w-6 ${service.color} -rotate-45 group-hover:rotate-0 transition-transform duration-300`} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* CTA Section */}
                        <motion.div variants={itemVariants} className="max-w-4xl mx-auto text-center pb-20">
                            <div className="p-12 rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
                                <div className="relative z-10">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Build Something Amazing?</h2>
                                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                        Let's discuss how we can transform your ideas into a powerful, scalable web solution.
                                    </p>
                                    <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-gray-200">
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
