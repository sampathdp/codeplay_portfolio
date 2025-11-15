import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import schoolSystem from '@assets/generated_images/School_system_mockup_5bc4568f.png';
import erpSystem from '@assets/generated_images/Enterprise_ERP_system_mockup_480d7812.png';
import mobileApp from '@assets/generated_images/Mobile_app_mockup_preview_b1e7a9f7.png';

const projects = [
  {
    title: 'School Management System',
    description: 'Complete student, staff, and academic management platform',
    image: schoolSystem,
    tags: ['Education', 'Dashboard', 'Analytics'],
  },
  {
    title: 'ERP & Payroll System',
    description: 'Enterprise resource planning with integrated payroll processing',
    image: erpSystem,
    tags: ['Enterprise', 'Finance', 'HR'],
  },
  {
    title: 'Mobile Apps & Games',
    description: 'Cross-platform mobile applications with engaging UX',
    image: mobileApp,
    tags: ['Mobile', 'Gaming', 'UX'],
  },
  {
    title: 'Hotel Booking Platform',
    description: 'Reservation system with real-time availability and payments',
    image: erpSystem,
    tags: ['Hospitality', 'Booking', 'Payments'],
  },
  {
    title: 'Medical Center System',
    description: 'Patient management, appointments, and medical records',
    image: schoolSystem,
    tags: ['Healthcare', 'Records', 'Scheduling'],
  },
  {
    title: 'Sales & Distribution',
    description: 'Inventory, order management, and sales analytics platform',
    image: mobileApp,
    tags: ['Sales', 'Inventory', 'Analytics'],
  },
];

export default function PortfolioSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="portfolio" className="py-24 px-6 bg-background" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Portfolio</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Delivering innovative solutions across industries
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{
                  y: -10,
                  rotateY: 3,
                  rotateX: 3,
                }}
                style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
              >
                <Card
                  className="overflow-hidden hover-elevate transition-all duration-300 group cursor-pointer h-full"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  data-testid={`card-portfolio-${index}`}
                >
                  <div className="relative overflow-hidden aspect-video">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                      animate={hoveredIndex === index ? {
                        background: [
                          'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
                          'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(96, 165, 250, 0.2) 100%)',
                        ],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    />
                    <motion.img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end justify-center pb-4 z-20"
                      initial={{ opacity: 0 }}
                      animate={hoveredIndex === index ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        animate={hoveredIndex === index ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ExternalLink className="h-6 w-6 text-primary" />
                      </motion.div>
                    </motion.div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, tagIndex) => (
                        <motion.span
                          key={tagIndex}
                          className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary"
                          whileHover={{ scale: 1.1 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
