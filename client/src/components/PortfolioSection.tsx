import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
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

  return (
    <section id="portfolio" className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Portfolio</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Delivering innovative solutions across industries
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Card
              key={index}
              className="overflow-hidden hover-elevate transition-all duration-300 group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              data-testid={`card-portfolio-${index}`}
            >
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <ExternalLink className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
