import { Code2, Lightbulb, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const cards = [
    {
      icon: Lightbulb,
      title: 'Innovation First',
      description: 'Cutting-edge technology meets creative problem-solving to deliver next-generation solutions.',
      color: 'primary',
      testId: 'card-innovation',
    },
    {
      icon: Users,
      title: 'Client-Focused',
      description: 'Your vision drives our development. Every project is tailored to your unique business needs.',
      color: 'accent',
      testId: 'card-client-focused',
    },
    {
      icon: Code2,
      title: 'Quality Code',
      description: 'Clean, scalable architecture built with industry best practices and modern frameworks.',
      color: 'chart-3',
      testId: 'card-quality-code',
    },
  ];

  return (
    <section id="about" className="py-24 px-6 bg-background" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Who We Are
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            CodePlay Studios is a full-stack software company specializing in web systems, mobile apps, and games. 
            We deliver real solutions, not just products. Every system is client-focused and tailored to your needs.
          </p>
          <motion.div
            className="relative inline-block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur"
              animate={{
                opacity: [0.25, 0.4, 0.25],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <blockquote className="relative text-2xl md:text-3xl font-bold bg-card p-8 rounded-lg border border-card-border">
              "We don't just build software — we build solutions that work."
            </blockquote>
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <motion.div whileHover={{ y: -8 }}>
                  <Card className="p-6 hover-elevate transition-all duration-300 h-full" data-testid={card.testId}>
                    <motion.div
                      className={`h-12 w-12 rounded-md bg-${card.color}/10 flex items-center justify-center mb-4`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`h-6 w-6 text-${card.color}`} />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                    <p className="text-muted-foreground">
                      {card.description}
                    </p>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
