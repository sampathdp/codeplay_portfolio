import { Globe, Building2, Smartphone, Brain, Cloud } from 'lucide-react';
import { motion, useMotionValue } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const services = [
  {
    icon: Globe,
    title: 'Web Systems & Portals',
    description: 'Custom web applications, dashboards, and enterprise portals built with modern frameworks',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Building2,
    title: 'Enterprise Solutions',
    description: 'ERP, Payroll, Sales, Hotel, and School Management Systems tailored to your business',
    gradient: 'from-purple-500 to-pink-400',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps & Games',
    description: 'Native and cross-platform mobile applications with engaging user experiences',
    gradient: 'from-green-500 to-emerald-400',
  },
  {
    icon: Brain,
    title: 'AI Insights & Prediction Bots',
    description: 'Machine learning models and intelligent bots for forecasting and automation',
    gradient: 'from-orange-500 to-amber-400',
  },
  {
    icon: Cloud,
    title: 'Cloud & Data Integration',
    description: 'Scalable cloud infrastructure and seamless third-party API integrations',
    gradient: 'from-indigo-500 to-violet-400',
  },
];

interface ServiceCardProps {
  service: typeof services[0];
  index: number;
  isInView: boolean;
}

function ServiceCard({ service, index, isInView }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={cardRef}
        className="relative p-6 rounded-xl glass overflow-hidden group cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        whileHover={{
          y: -10,
          rotateY: 5,
          rotateX: 5,
          transition: { duration: 0.3 },
        }}
        style={{ transformStyle: 'preserve-3d' }}
        data-testid={`card-service-${index}`}
      >
        {/* Animated gradient border */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, transparent, hsl(217 91% 60% / 0.3), hsl(262 83% 57% / 0.3), transparent)`,
            backgroundSize: '200% 200%',
          }}
          animate={isHovered ? {
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          } : {}}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Spotlight effect */}
        <motion.div
          className="absolute pointer-events-none w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle, hsl(217 91% 60% / 0.15), transparent 70%)',
            x: mouseX,
            y: mouseY,
            translateX: '-50%',
            translateY: '-50%',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            className={`h-14 w-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 shadow-lg`}
            animate={isHovered ? { 
              rotate: 360, 
              scale: 1.1,
              boxShadow: '0 0 30px hsl(217 91% 60% / 0.5)',
            } : { 
              rotate: 0, 
              scale: 1,
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="h-7 w-7 text-white" />
          </motion.div>

          <motion.h3 
            className="text-xl font-bold mb-2 transition-colors"
            animate={isHovered ? { color: 'hsl(217 91% 60%)' } : {}}
          >
            {service.title}
          </motion.h3>
          
          <p className="text-muted-foreground">{service.description}</p>

          {/* Animated underline */}
          <motion.div
            className="h-0.5 bg-gradient-to-r from-primary to-accent mt-4 rounded-full"
            initial={{ width: 0 }}
            animate={isHovered ? { width: '100%' } : { width: 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Corner decorations */}
        <motion.div
          className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-primary/20 rounded-tr-lg"
          animate={isHovered ? { borderColor: 'hsl(217 91% 60% / 0.5)' } : {}}
        />
        <motion.div
          className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-accent/20 rounded-bl-lg"
          animate={isHovered ? { borderColor: 'hsl(262 83% 57% / 0.5)' } : {}}
        />
      </motion.div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="services" className="py-24 px-6 bg-background relative overflow-hidden" ref={ref}>
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{
            background: 'linear-gradient(135deg, hsl(217 91% 60%), hsl(262 83% 57%))',
            top: '10%',
            right: '-10%',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{
            background: 'linear-gradient(135deg, hsl(262 83% 57%), hsl(217 91% 60%))',
            bottom: '10%',
            left: '-10%',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.1, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block px-4 py-1 rounded-full glass border border-primary/30 text-sm text-primary mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            Our Expertise
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">What We Do</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive software solutions powered by cutting-edge technology
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              service={service}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

