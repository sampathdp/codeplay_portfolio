import { Code2, Lightbulb, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Who We Are
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            CodePlay Studios is a full-stack software company specializing in web systems, mobile apps, and games. 
            We deliver real solutions, not just products. Every system is client-focused and tailored to your needs.
          </p>
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-25" />
            <blockquote className="relative text-2xl md:text-3xl font-bold bg-card p-8 rounded-lg border border-card-border">
              "We don't just build software — we build solutions that work."
            </blockquote>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="p-6 hover-elevate transition-all duration-300" data-testid="card-innovation">
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Innovation First</h3>
            <p className="text-muted-foreground">
              Cutting-edge technology meets creative problem-solving to deliver next-generation solutions.
            </p>
          </Card>

          <Card className="p-6 hover-elevate transition-all duration-300" data-testid="card-client-focused">
            <div className="h-12 w-12 rounded-md bg-accent/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Client-Focused</h3>
            <p className="text-muted-foreground">
              Your vision drives our development. Every project is tailored to your unique business needs.
            </p>
          </Card>

          <Card className="p-6 hover-elevate transition-all duration-300" data-testid="card-quality-code">
            <div className="h-12 w-12 rounded-md bg-chart-3/10 flex items-center justify-center mb-4">
              <Code2 className="h-6 w-6 text-chart-3" />
            </div>
            <h3 className="text-xl font-bold mb-2">Quality Code</h3>
            <p className="text-muted-foreground">
              Clean, scalable architecture built with industry best practices and modern frameworks.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
