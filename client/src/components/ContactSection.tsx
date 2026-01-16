import { Button } from '@/components/ui/button';
import { Send, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}

function FloatingInput({ 
  id, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  required = false,
  multiline = false,
  rows = 6,
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || value.length > 0;

  const inputClasses = `w-full px-4 pt-6 pb-2 rounded-xl glass border transition-all duration-300 outline-none ${
    isFocused 
      ? 'border-primary/50 shadow-[0_0_20px_hsl(217_91%_60%_/_0.2)]' 
      : 'border-border hover:border-primary/30'
  }`;

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          rows={rows}
          className={`${inputClasses} resize-none bg-transparent`}
          data-testid={`input-${id}`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          className={`${inputClasses} bg-transparent`}
          data-testid={`input-${id}`}
        />
      )}
      <motion.label
        htmlFor={id}
        className="absolute left-4 pointer-events-none text-muted-foreground transition-all duration-200"
        animate={{
          top: isActive ? '8px' : multiline ? '16px' : '50%',
          translateY: isActive ? '0%' : '-50%',
          fontSize: isActive ? '12px' : '14px',
          color: isFocused ? 'hsl(217 91% 60%)' : undefined,
        }}
      >
        {label}
      </motion.label>
      
      {/* Focus indicator line */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
        initial={{ width: 0 }}
        animate={{ width: isFocused ? '100%' : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSuccess(true);
    toast({
      title: 'Message Sent!',
      description: "We'll get back to you within 24 hours.",
    });

    // Reset after animation
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setIsSubmitting(false);
      setIsSuccess(false);
    }, 2000);
  };

  return (
    <section 
      id="contact" 
      className="py-24 px-6 relative overflow-hidden" 
      ref={ref}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(217 91% 60% / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(217 91% 60% / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at center, hsl(217 91% 60% / 0.15), transparent 50%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 
                ? 'hsl(217 91% 60% / 0.4)' 
                : 'hsl(262 83% 57% / 0.4)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto max-w-2xl relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full glass border border-primary/30 text-sm text-primary mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4" />
            Get In Touch
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Let's Build Something Extraordinary
          </h2>
          <p className="text-xl text-muted-foreground">
            Ready to turn your idea into an intelligent system? Let's create your digital future.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6 relative"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Glass card container */}
          <motion.div
            className="p-8 rounded-2xl glass border border-border/50 space-y-6"
            whileHover={{ borderColor: 'hsl(217 91% 60% / 0.3)' }}
          >
            <FloatingInput
              id="name"
              label="Your Name"
              value={name}
              onChange={setName}
              required
            />

            <FloatingInput
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />

            <FloatingInput
              id="message"
              label="Tell us about your project..."
              value={message}
              onChange={setMessage}
              required
              multiline
              rows={6}
            />

            {/* Submit button */}
            <motion.div 
              className="pt-4"
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                size="lg"
                className="w-full group relative overflow-hidden"
                disabled={isSubmitting || isSuccess}
                data-testid="button-submit-contact"
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ backgroundSize: '200% 100%' }}
                />
                
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.span
                        key="success"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <CheckCircle className="h-5 w-5" />
                        Message Sent!
                      </motion.span>
                    ) : isSubmitting ? (
                      <motion.span
                        key="loading"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Sending...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="default"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Send Message
                        <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Success particles burst */}
          <AnimatePresence>
            {isSuccess && (
              <>
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      background: i % 2 === 0 
                        ? 'hsl(217 91% 60%)' 
                        : 'hsl(262 83% 57%)',
                    }}
                    initial={{ scale: 0 }}
                    animate={{
                      x: Math.cos(i * (360 / 20) * Math.PI / 180) * 150,
                      y: Math.sin(i * (360 / 20) * Math.PI / 180) * 150,
                      scale: [0, 1, 0],
                      opacity: [1, 1, 0],
                    }}
                    transition={{
                      duration: 1,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </section>
  );
}

