import { Globe, Building2, Smartphone, Brain, Cloud } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

const services = [
  {
    icon: Globe,
    title: 'Web Systems & Portals',
    description: 'Custom web applications, dashboards, and enterprise portals built with modern frameworks',
    color: 'primary',
  },
  {
    icon: Building2,
    title: 'Enterprise Solutions',
    description: 'ERP, Payroll, Sales, Hotel, and School Management Systems tailored to your business',
    color: 'accent',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps & Games',
    description: 'Native and cross-platform mobile applications with engaging user experiences',
    color: 'chart-3',
  },
  {
    icon: Brain,
    title: 'AI Insights & Prediction Bots',
    description: 'Machine learning models and intelligent bots for forecasting and automation',
    color: 'chart-2',
  },
  {
    icon: Cloud,
    title: 'Cloud & Data Integration',
    description: 'Scalable cloud infrastructure and seamless third-party API integrations',
    color: 'chart-1',
  },
];

export default function ServicesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="services" className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">What We Do</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive software solutions powered by cutting-edge technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isHovered = hoveredIndex === index;

            return (
              <Card
                key={index}
                className="p-6 hover-elevate transition-all duration-300 cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                data-testid={`card-service-${index}`}
              >
                <div
                  className={`h-14 w-14 rounded-md flex items-center justify-center mb-4 transition-all duration-300 ${
                    isHovered ? `bg-${service.color}` : `bg-${service.color}/10`
                  }`}
                >
                  <Icon
                    className={`h-7 w-7 transition-colors duration-300 ${
                      isHovered ? 'text-white' : `text-${service.color}`
                    }`}
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground">{service.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
