import { Code2, Lightbulb, Users, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

export default function AboutSection() {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [isPlaying, setIsPlaying] = useState(false);

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

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      console.log('Video toggled:', !isPlaying);
    }
  };

  return (
    <section id="about" className="py-24 px-6 bg-background" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            className="relative group"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg blur-xl"
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="relative rounded-lg overflow-hidden aspect-video bg-card border border-card-border">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                loop
                muted
                playsInline
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect fill='%23111827' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='24' fill='%236366f1'%3ECodePlay Studios%3C/text%3E%3C/svg%3E"
                data-testid="about-video"
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
              </video>
              <motion.button
                className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm group-hover:bg-background/30 transition-colors"
                onClick={toggleVideo}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                data-testid="button-play-video"
              >
                {!isPlaying && (
                  <motion.div
                    className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Play className="h-10 w-10 text-white ml-1" fill="white" />
                  </motion.div>
                )}
              </motion.button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Who We Are
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              CodePlay Studios is a full-stack software company specializing in web systems, mobile apps, and games. 
              We deliver real solutions, not just products. Every system is client-focused and tailored to your needs.
            </p>
            <motion.div
              className="relative inline-block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur"
                animate={{
                  opacity: [0.25, 0.4, 0.25],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <blockquote className="relative text-xl md:text-2xl font-bold bg-card p-6 rounded-lg border border-card-border">
                "We don't just build software — we build solutions that work."
              </blockquote>
            </motion.div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
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
