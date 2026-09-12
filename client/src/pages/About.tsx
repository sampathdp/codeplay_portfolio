import { motion } from "framer-motion";
import { 
  Code2, 
  Smartphone, 
  Gamepad2, 
  Rocket, 
  ShieldCheck, 
  Target, 
  Cpu, 
  Layers,
  Award
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const values = [
  {
    icon: Target,
    title: "Industrial Precision",
    description: "We don't just write code; we engineer systems. Every pixel and every line of code is optimized for industrial-grade performance."
  },
  {
    icon: Cpu,
    title: "Coding Your Vision",
    description: "Your vision is our blueprint. We transform complex requirements into intuitive, high-performance software systems."
  },
  {
    icon: ShieldCheck,
    title: "Unyielding Security",
    description: "Security isn't a feature; it's the foundation. We implement military-grade protection into every enterprise layer we build."
  }
];

const testimonials = [
  {
    quote: "CodePlay Studios transformed our manual inventory process into a high-performance digital ecosystem. Their collaborative approach really works—our staff picked it up in days.",
    author: "Operations Manager",
    company: "Industrial Logistics Corp",
    type: "ERP Solution"
  },
  {
    quote: "The mobile app they engineered for us is world-class. Fast, intuitive, and extremely stable. Sampath's engineering background clearly shows in the final product.",
    author: "Tech Lead",
    company: "Digital Ventures UK",
    type: "Mobile Engineering"
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 relative">
      <SEO
        title="About CodePlay Studios - Our Story & Vision"
        description="CodePlay Studios is a software development company based in Panadura, Sri Lanka. Founded by Sampath Dananjaya, we specialize in high-end Web, Mobile, and Game engineering with a focus on Calm Computing."
      />
      
      <div className="fixed inset-0 z-0 h-full w-full bg-background pointer-events-none">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/90 z-0" />
      </div>

      <Navigation />

      <main className="relative z-10 pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-32"
          >
            {/* Mission Hero */}
            <motion.div variants={itemVariants} className="max-w-4xl">
              <span className="text-primary font-mono tracking-widest uppercase text-sm mb-4 block">
                [ The Mission ]
              </span>
              <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
                Coding <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-cyan-400">
                  Your Vision
                </span>
              </h1>
              <p className="text-2xl text-muted-foreground leading-relaxed">
                CodePlay Studios was founded in Panadura, Sri Lanka, with a singular goal: to manifest your most ambitious ideas through high-performance engineering. We build systems that are as beautiful to look at as they are robust to run.
              </p>
            </motion.div>

            {/* Founder Spotlight */}
            <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl group-hover:bg-primary/30 transition-all duration-700 opacity-50" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-black/40 flex items-center justify-center p-12">
                   {/* This would be where his professional photo goes */}
                   <div className="text-center">
                     <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-primary to-emerald-500 mx-auto mb-8 flex items-center justify-center shadow-2xl">
                        <Code2 className="w-24 h-24 text-white" />
                     </div>
                     <h3 className="text-3xl font-bold mb-2">Sampath Dananjaya</h3>
                     <p className="text-primary font-mono tracking-widest uppercase text-sm">Founder & Lead Engineer</p>
                   </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <h2 className="text-4xl font-bold tracking-tight">Meet the Architect</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  As a Full-Stack specialist across Web, Mobile, and Game development, Sampath carries the vision of CodePlay. His approach centers on industrial-grade software that prioritizes technical excellence and real-world scalability.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Full-Stack Web</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Mobile Apps</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Unity Gaming</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">System Architect</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Core Values */}
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((val, i) => (
                <motion.div 
                  key={i}
                  variants={itemVariants}
                  className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-500">
                    <val.icon className="w-7 h-7 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{val.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{val.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Stat Section */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-6">
              {[
                { icon: ShieldCheck, value: "100%", label: "Secure Delivery" },
                { icon: Layers, value: "120+", label: "Projects Shipped" },
                { icon: Cpu, value: "24/7", label: "Client Support" },
                { icon: Award, value: "5+", label: "Years Impact" }
              ].map((stat, i) => (
                <div key={i} className="p-8 rounded-3xl bg-secondary/20 border border-white/5 text-center">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                  <p className="text-4xl font-bold mb-1 tracking-tighter">{stat.value}</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Why Choose Us Grid */}
            <motion.div variants={itemVariants} className="space-y-16">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold mb-6 italic font-black uppercase tracking-tighter">Why Industry Leaders Trust CodePlay</h2>
                <p className="text-lg text-muted-foreground">Engineering success isn't just about code—it's about reliability and scale.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Security First", desc: "Enterprise-grade security baked into every layer from day one.", icon: ShieldCheck },
                  { title: "Blazing Fast", desc: "Performance is not an afterthought. We optimize for speed and efficiency.", icon: Rocket },
                  { title: "Scalable Core", desc: "Architectures designed to grow with millions of users.", icon: Layers },
                  { title: "User Loved", desc: "Intuitive experiences that drive high engagement and retention.", icon: Target }
                ].map((item, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div variants={itemVariants} className="space-y-16 py-20">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Trusted by Industry Experts</h2>
                <p className="text-lg text-muted-foreground">Hear from the clients who have experienced our engineering philosophy firsthand.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {testimonials.map((t, i) => (
                  <div key={i} className="p-12 rounded-[2.5rem] bg-[#0a0a0d] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Rocket className="w-24 h-24 -rotate-12" />
                    </div>
                    <p className="text-xl italic leading-relaxed mb-8 relative z-10">"{t.quote}"</p>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-500" />
                      <div>
                        <p className="font-bold text-lg">{t.author}</p>
                        <p className="text-sm text-primary font-mono">{t.company} — {t.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
