import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { toast } = useToast();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('Contact form submitted:', { name, email, message });

    setTimeout(() => {
      toast({
        title: 'Message Sent!',
        description: "We'll get back to you within 24 hours.",
      });
      setName('');
      setEmail('');
      setMessage('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="contact" className="py-24 px-6 bg-gradient-to-b from-background to-card/30 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto max-w-2xl relative">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Let's Build Something Extraordinary
          </h2>
          <p className="text-xl text-muted-foreground">
            Ready to turn your idea into an intelligent system? Let's create your digital future.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                required
                data-testid="input-name"
                className="transition-all duration-300"
                style={{
                  boxShadow: focusedField === 'name' ? '0 0 0 2px hsl(var(--primary) / 0.3)' : 'none',
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                data-testid="input-email"
                className="transition-all duration-300"
                style={{
                  boxShadow: focusedField === 'email' ? '0 0 0 2px hsl(var(--primary) / 0.3)' : 'none',
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <div className="relative">
              <Textarea
                id="message"
                placeholder="Tell us about your project..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                required
                rows={6}
                data-testid="input-message"
                className="transition-all duration-300"
                style={{
                  boxShadow: focusedField === 'message' ? '0 0 0 2px hsl(var(--primary) / 0.3)' : 'none',
                }}
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              size="lg"
              className="w-full group relative overflow-hidden"
              disabled={isSubmitting}
              data-testid="button-submit-contact"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary"
                animate={{
                  x: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ opacity: 0.3 }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? 'Sending...' : 'Send Message'}
                <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
}
