import { CheckCircle2 } from 'lucide-react';
import { SiReact, SiNextdotjs, SiNodedotjs, SiFirebase, SiAmazon, SiMysql } from 'react-icons/si';

const reasons = [
  'Flexible, client-focused development process',
  'Cutting-edge technologies and modern frameworks',
  'Scalable architecture & clean, optimized code',
  'AI-powered insights for smarter business decisions',
];

const techStack = [
  { icon: SiReact, name: 'React' },
  { icon: SiNextdotjs, name: 'Next.js' },
  { icon: SiNodedotjs, name: 'Node.js' },
  { icon: SiFirebase, name: 'Firebase' },
  { icon: SiAmazon, name: 'AWS' },
  { icon: SiMysql, name: 'MySQL' },
];

export default function WhyChooseSection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-card/30 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose Us</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We combine expertise, innovation, and dedication to deliver exceptional results
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="flex items-start gap-4 animate-in fade-in slide-in-from-left duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
                data-testid={`reason-${index}`}
              >
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <p className="text-lg">{reason}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6 text-center">Our Tech Stack</h3>
            <div className="grid grid-cols-3 gap-6">
              {techStack.map((tech, index) => {
                const Icon = tech.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-card border border-card-border hover-elevate transition-all duration-300 group"
                    data-testid={`tech-${tech.name.toLowerCase()}`}
                  >
                    <Icon className="h-10 w-10 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-center">{tech.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
