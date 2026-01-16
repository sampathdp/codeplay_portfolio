import { ExternalLink, ArrowUpRight, Eye } from 'lucide-react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import schoolSystem from '@assets/generated_images/School_system_mockup_5bc4568f.png';
import erpSystem from '@assets/generated_images/Enterprise_ERP_system_mockup_480d7812.png';
import mobileApp from '@assets/generated_images/Mobile_app_mockup_preview_b1e7a9f7.png';

const projects = [
  {
    title: 'School Management System',
    description: 'Complete student, staff, and academic management platform with real-time analytics',
    image: schoolSystem,
    tags: ['Education', 'Dashboard', 'Analytics'],
    category: 'enterprise',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    title: 'ERP & Payroll System',
    description: 'Enterprise resource planning with integrated payroll processing and HR modules',
    image: erpSystem,
    tags: ['Enterprise', 'Finance', 'HR'],
    category: 'enterprise',
    color: 'from-purple-500 to-pink-400',
  },
  {
    title: 'Mobile Apps & Games',
    description: 'Cross-platform mobile applications with engaging UX and gamification',
    image: mobileApp,
    tags: ['Mobile', 'Gaming', 'UX'],
    category: 'mobile',
    color: 'from-green-500 to-emerald-400',
  },
  {
    title: 'Hotel Booking Platform',
    description: 'Reservation system with real-time availability, payments, and guest management',
    image: erpSystem,
    tags: ['Hospitality', 'Booking', 'Payments'],
    category: 'web',
    color: 'from-orange-500 to-amber-400',
  },
  {
    title: 'Medical Center System',
    description: 'Patient management, appointments, medical records, and billing integration',
    image: schoolSystem,
    tags: ['Healthcare', 'Records', 'Scheduling'],
    category: 'enterprise',
    color: 'from-red-500 to-rose-400',
  },
  {
    title: 'Sales & Distribution',
    description: 'Inventory, order management, and sales analytics platform with AI insights',
    image: mobileApp,
    tags: ['Sales', 'Inventory', 'Analytics'],
    category: 'enterprise',
    color: 'from-indigo-500 to-violet-400',
  },
];

const categories = [
  { id: 'all', label: 'All Projects' },
  { id: 'enterprise', label: 'Enterprise' },
  { id: 'web', label: 'Web Apps' },
  { id: 'mobile', label: 'Mobile' },
];

interface ProjectCardProps {
  project: typeof projects[0];
  index: number;
  isInView: boolean;
}

function ProjectCard({ project, index, isInView }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 20);
    mouseY.set(y * -20);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ perspective: 1500 }}
    >
      <motion.div
        ref={cardRef}
        className="relative h-[400px] cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          rotateX: mouseY,
          rotateY: mouseX,
          transformStyle: 'preserve-3d',
        }}
        data-testid={`card-portfolio-${index}`}
      >
        {/* Front of card */}
        <motion.div
          className="absolute inset-0 rounded-2xl glass overflow-hidden backface-hidden"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <motion.img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
              animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.4 }}
            />
            {/* Overlay gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${project.color} mix-blend-overlay`}
              animate={isHovered ? { opacity: 0.5 } : { opacity: 0.2 }}
            />
            {/* View indicator */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            >
              <motion.div
                className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/30"
                initial={{ scale: 0.8 }}
                animate={isHovered ? { scale: 1 } : { scale: 0.8 }}
              >
                <Eye className="h-4 w-4 text-white" />
                <span className="text-white text-sm font-medium">Click to view details</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6">
            <motion.h3
              className="text-xl font-bold mb-2"
              animate={isHovered ? { color: 'hsl(217 91% 60%)' } : {}}
            >
              {project.title}
            </motion.h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, tagIndex) => (
                <motion.span
                  key={tagIndex}
                  className="text-xs px-3 py-1 rounded-full glass border border-primary/20 text-primary"
                  whileHover={{ scale: 1.05, borderColor: 'hsl(217 91% 60%)' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + tagIndex * 0.1 }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Animated border */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, hsl(217 91% 60% / 0.3), transparent 50%, hsl(262 83% 57% / 0.3))',
              opacity: 0,
            }}
            animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
          />
        </motion.div>

        {/* Back of card */}
        <motion.div
          className="absolute inset-0 rounded-2xl glass overflow-hidden p-6 flex flex-col justify-between backface-hidden"
          animate={{ rotateY: isFlipped ? 0 : -180 }}
          transition={{ duration: 0.6 }}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div>
            <div className={`w-16 h-1 rounded-full bg-gradient-to-r ${project.color} mb-4`} />
            <h3 className="text-2xl font-bold mb-3 text-gradient">{project.title}</h3>
            <p className="text-muted-foreground mb-4">{project.description}</p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Key Features:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Real-time analytics dashboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Multi-user role management
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  API integrations
                </li>
              </ul>
            </div>
          </div>
          <motion.button
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium"
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px hsl(217 91% 60% / 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            View Case Study
            <ArrowUpRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <section id="portfolio" className="py-24 px-6 bg-background relative overflow-hidden" ref={ref}>
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-5"
          style={{
            background: 'radial-gradient(circle, hsl(217 91% 60%), transparent)',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block px-4 py-1 rounded-full glass border border-accent/30 text-sm text-accent mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            Featured Work
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">Our Portfolio</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Delivering innovative solutions across industries
          </p>
        </motion.div>

        {/* Category filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-primary to-accent text-white glow-primary'
                  : 'glass border border-border hover:border-primary/50'
              }`}
              onClick={() => setActiveCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.title}
                project={project}
                index={index}
                isInView={isInView}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

