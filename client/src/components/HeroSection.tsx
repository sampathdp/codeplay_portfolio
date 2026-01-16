import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Brain, Zap, Rocket, Code2, Database, Cloud, Cpu } from 'lucide-react';
import ParticleBackground from './ParticleBackground';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import heroImage from '@assets/generated_images/AI_neural_network_hero_background_cdbc0c35.png';
import aiImage from '@assets/generated_images/AI_analytics_visualization_be61eb13.png';
import cloudImage from '@assets/generated_images/Cloud_integration_tech_illustration_330fd769.png';

const slides = [
  {
    icon: Sparkles,
    badge: 'AI-Powered Solutions',
    title: 'Building Smart, Scalable, and AI-Driven Software Solutions',
    subtitle: 'We design intelligent systems that solve real business challenges — from ERPs to mobile apps',
    bgImage: heroImage,
  },
  {
    icon: Brain,
    badge: 'AI & Innovation',
    title: 'Harness the Power of Artificial Intelligence',
    subtitle: 'Predictive analytics, automated decision-making, and intelligent bots that transform your business',
    bgImage: aiImage,
  },
  {
    icon: Rocket,
    badge: 'Modern Tech Stack',
    title: 'Cutting-Edge Technologies for Future-Ready Solutions',
    subtitle: 'Built with React, Next.js, Node.js, and cloud infrastructure for maximum scalability',
    bgImage: cloudImage,
  },
  {
    icon: Zap,
    badge: 'Fast & Efficient',
    title: 'From Concept to Deployment in Record Time',
    subtitle: 'Agile development process delivering production-ready software that exceeds expectations',
    bgImage: heroImage,
  },
];

const floatingIcons = [
  { Icon: Code2, x: '10%', y: '20%', delay: 0 },
  { Icon: Database, x: '85%', y: '30%', delay: 0.5 },
  { Icon: Cloud, x: '15%', y: '70%', delay: 1 },
  { Icon: Cpu, x: '80%', y: '75%', delay: 1.5 },
  { Icon: Brain, x: '50%', y: '15%', delay: 2 },
];

// Typing animation hook
function useTypingAnimation(text: string, speed: number = 50) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed]);
  
  return { displayedText, isTyping };
}

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [gradientPosition, setGradientPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 3D Tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 });
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    }
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const currentSlideData = slides[currentSlide];
  const { displayedText, isTyping } = useTypingAnimation(currentSlideData.title, 40);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPosition((prev) => (prev + 1) % 200);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const autoplay = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(autoplay);
  }, []);

  const handleGetQuote = () => {
    const contactSection = document.getElementById('contact');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreWork = () => {
    const portfolioSection = document.getElementById('portfolio');
    portfolioSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const SlideIcon = currentSlideData.icon;

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {/* Background with animated gradient overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${currentSlideData.bgImage})`,
          }}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, 
                hsl(222, 47%, 8%) 0%,
                hsl(217, 91%, 20%) ${gradientPosition}%,
                hsl(262, 83%, 25%) ${(gradientPosition + 50) % 100}%,
                hsl(222, 47%, 8%) 100%)`,
              opacity: 0.92,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Morphing blob backgrounds */}
      <motion.div
        className="absolute w-[600px] h-[600px] opacity-20 blur-3xl"
        style={{
          background: 'linear-gradient(135deg, hsl(217 91% 60%), hsl(262 83% 57%))',
          left: '10%',
          top: '20%',
        }}
        animate={{
          borderRadius: [
            '60% 40% 30% 70% / 60% 30% 70% 40%',
            '30% 60% 70% 40% / 50% 60% 30% 60%',
            '60% 40% 30% 70% / 60% 30% 70% 40%',
          ],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] opacity-15 blur-3xl"
        style={{
          background: 'linear-gradient(135deg, hsl(262 83% 57%), hsl(217 91% 60%))',
          right: '10%',
          bottom: '20%',
        }}
        animate={{
          borderRadius: [
            '30% 60% 70% 40% / 50% 60% 30% 60%',
            '60% 40% 30% 70% / 60% 30% 70% 40%',
            '30% 60% 70% 40% / 50% 60% 30% 60%',
          ],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <ParticleBackground />

      {/* Floating tech icons */}
      {floatingIcons.map(({ Icon, x, y, delay }, index) => (
        <motion.div
          key={index}
          className="absolute hidden md:flex items-center justify-center w-12 h-12 rounded-xl glass-dark"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.4, 0.7, 0.4],
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            delay,
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon className="h-6 w-6 text-primary" />
        </motion.div>
      ))}

      {/* Main content with 3D tilt */}
      <motion.div 
        className="relative z-10 container mx-auto px-6 text-center perspective"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -30, rotateX: 15 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ transform: 'translateZ(50px)' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <SlideIcon className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-primary">{currentSlideData.badge}</span>
            </motion.div>

            {/* Title with typing effect */}
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 min-h-[1.2em] md:min-h-[2.4em]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ transform: 'translateZ(30px)' }}
            >
              <span className="text-gradient-animated">
                {displayedText}
                {isTyping && (
                  <motion.span
                    className="inline-block w-1 h-[0.8em] bg-primary ml-1 align-middle"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ transform: 'translateZ(20px)' }}
            >
              {currentSlideData.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ transform: 'translateZ(40px)' }}
            >
              <motion.div 
                whileHover={{ scale: 1.05, y: -3 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onClick={handleGetQuote}
                  className="bg-primary hover:bg-primary/90 backdrop-blur-sm group relative overflow-hidden glow-primary"
                  data-testid="button-get-quote"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent/30 to-transparent"
                    animate={{ x: [-200, 200] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    Get a Quote
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -3 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleExploreWork}
                  className="backdrop-blur-sm glass border-primary/30 hover:bg-primary/10"
                  data-testid="button-explore-work"
                >
                  Explore Our Work
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation arrows */}
      <motion.button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full glass border border-primary/30 flex items-center justify-center"
        onClick={prevSlide}
        whileHover={{ scale: 1.1, boxShadow: '0 0 20px hsl(217 91% 60% / 0.4)' }}
        whileTap={{ scale: 0.9 }}
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="h-6 w-6 text-primary" />
      </motion.button>

      <motion.button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full glass border border-primary/30 flex items-center justify-center"
        onClick={nextSlide}
        whileHover={{ scale: 1.1, boxShadow: '0 0 20px hsl(217 91% 60% / 0.4)' }}
        whileTap={{ scale: 0.9 }}
        data-testid="button-next-slide"
      >
        <ChevronRight className="h-6 w-6 text-primary" />
      </motion.button>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-primary glow-primary' : 'w-2 bg-primary/30'
            }`}
            onClick={() => setCurrentSlide(index)}
            whileHover={{ scale: 1.2 }}
            data-testid={`slide-indicator-${index}`}
          />
        ))}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

