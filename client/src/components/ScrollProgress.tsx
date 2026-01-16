import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-[60] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, hsl(217 91% 60%), hsl(262 83% 57%), hsl(217 91% 60%))',
        backgroundSize: '200% 100%',
      }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(90deg, hsl(217 91% 60%), hsl(262 83% 57%), hsl(217 91% 60%))',
          backgroundSize: '200% 100%',
        }}
      />
      {/* Glow effect */}
      <div 
        className="absolute inset-0 blur-sm opacity-70"
        style={{
          background: 'linear-gradient(90deg, hsl(217 91% 60%), hsl(262 83% 57%))',
        }}
      />
    </motion.div>
  );
}
