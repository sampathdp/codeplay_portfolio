import { motion } from "framer-motion";
import {
  Layers,
  Users,
  Briefcase,
  Calculator,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Warehouse,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AdminMetrics from "@/components/metrics/AdminMetrics";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";
import futuristicErp from "@assets/futuristic_erp_system.png";

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
    icon: Calculator,
    title: "Payroll & HR Systems",
    description: "Automated payroll processing, employee management, and HR operational workflows.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  {
    icon: Users,
    title: "CRM & Sales Automation",
    description: "Enterprise-grade customer relationship management and lead tracking systems.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  {
    icon: Warehouse,
    title: "Inventory & Resource Planning",
    description: "Real-time stock tracking, supply chain management, and resource allocation.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  {
    icon: BarChart3,
    title: "Financial Reporting",
    description: "Deep analytics and automated financial statements for clear business visibility.",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description: "Military-grade data protection and sophisticated role-based access controls.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

const businessValues = [
  "Centralized control of all business units",
  "Automated Payroll and Financial workflows",
  "Scalable architecture for enterprise growth",
  "Industrial-grade security and data integrity",
];

export default function ErpSystems() {
  return (
    <div className="min-h-screen text-foreground selection:bg-amber-500/30">
      <SEO
        title="ERP & Enterprise Management Systems"
        description="Custom ERP solutions, Payroll systems, CRM, and Inventory management tailored for high-growth enterprises."
        keywords="ERP development, payroll systems, CRM software, inventory management, enterprise software, CodePlay Studios"
        schemas={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "ERP & Enterprise Management Systems",
            description: "Industrial-grade enterprise resource planning and management software.",
            provider: {
              "@type": "Organization",
              name: "CodePlay Studios",
            },
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-medium text-amber-300">
                  CodePlay Studios Enterprise Engineering
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                ERP & Enterprise <br />
                Management Systems
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                We engine industrial-grade ERP systems that unify Payroll, CRM, 
                Inventory, and Financials into a single, high-performance command center.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-8 text-lg rounded-full bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
                >
                  <Link href="/#contact">
                    Scale Your Enterprise
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 backdrop-blur-sm cursor-pointer"
                >
                  <Link href="/case-studies">
                    View Enterprise Case Studies
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Overview Card */}
            <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-black/60 shadow-[0_0_50px_rgba(245,158,11,0.1)] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(245,158,11,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine opacity-30" />
                <div className="relative z-10 grid md:grid-cols-2 gap-0 items-center">
                  <div className="p-10 md:p-14">
                    <div className="inline-block px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/30 text-amber-400 text-xs font-mono mb-6 tracking-widest uppercase">
                      Industrial Scale
                    </div>
                    <h2 className="text-4xl font-bold mb-6 text-white tracking-tight">
                      Unified Business{" "}
                      <span className="text-amber-400">Intelligence</span>
                    </h2>
                    <p className="text-lg text-gray-400 leading-relaxed mb-8">
                      Stop juggling disconnected systems. Our ERP solutions provide 
                      a single source of truth for your entire organization, from 
                      automated Payroll processing to global CRM synchronization.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      {businessValues.map((value, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{
                            x: 10,
                            backgroundColor: "rgba(245,158,11,0.1)",
                          }}
                          className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all duration-300 group cursor-default"
                        >
                          <div className="h-3 w-3 rounded-full bg-amber-500/50 group-hover:bg-amber-400 shadow-[0_0_10px_amber] shrink-0" />
                          <span className="font-medium text-gray-300 group-hover:text-amber-50 text-xl tracking-wide">
                            {value}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="relative h-full min-h-[500px] border-l border-amber-500/10 text-center flex items-center justify-center p-8 bg-black/20">
                    <motion.img
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1 }}
                      src={futuristicErp}
                      alt="Futuristic ERP System"
                      className="max-w-full h-auto object-contain rounded-2xl shadow-2xl relative z-10"
                    />
                    <div className="absolute inset-0 bg-amber-950/20 mix-blend-overlay z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
                    
                    {/* Overlay HUD elements */}
                    <div className="absolute top-10 right-10 z-30 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-xs font-mono text-orange-500 uppercase tracking-widest">
                          Enterprise Core Online
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-amber-500/50 text-right">
                        System Load: 24.3%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* System Health / Metrics */}
            <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">
                  Enterprise <span className="text-amber-400">Velocity</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Live data visualization of multi-departmental performance metrics.
                </p>
              </div>

              <AdminMetrics />
            </motion.div>

            {/* What We Deliver Grid */}
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold text-center mb-16">
                Specialized Enterprise Modules
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
              <div className="p-12 rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full" />
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 italic font-black">
                    Industrial Evolution Starts Here
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Transform your organization with a custom ERP suite engineered 
                    to handle the world's most complex business workflows.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-gray-200 cursor-pointer"
                  >
                    <Link href="/#contact">
                      Contact Our Enterprise Team
                    </Link>
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
