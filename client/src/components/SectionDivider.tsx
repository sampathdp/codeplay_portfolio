import { motion } from 'framer-motion';

interface SectionDividerProps {
  variant?: 'wave' | 'curve' | 'angle';
  flip?: boolean;
  className?: string;
}

export default function SectionDivider({ 
  variant = 'wave', 
  flip = false,
  className = '' 
}: SectionDividerProps) {
  const paths = {
    wave: 'M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
    curve: 'M0,160L80,176C160,192,320,224,480,213.3C640,203,800,149,960,138.7C1120,128,1280,160,1360,176L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z',
    angle: 'M0,224L1440,96L1440,320L0,320Z',
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className={`w-full h-auto block ${flip ? 'rotate-180' : ''}`}
        preserveAspectRatio="none"
        style={{ marginBottom: '-1px' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <defs>
          <linearGradient id="dividerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <motion.stop
              offset="0%"
              animate={{
                stopColor: [
                  'hsl(217 91% 60% / 0.3)',
                  'hsl(262 83% 57% / 0.3)',
                  'hsl(217 91% 60% / 0.3)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.stop
              offset="50%"
              animate={{
                stopColor: [
                  'hsl(262 83% 57% / 0.2)',
                  'hsl(217 91% 60% / 0.2)',
                  'hsl(262 83% 57% / 0.2)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.stop
              offset="100%"
              animate={{
                stopColor: [
                  'hsl(217 91% 60% / 0.3)',
                  'hsl(262 83% 57% / 0.3)',
                  'hsl(217 91% 60% / 0.3)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </linearGradient>
        </defs>
        <motion.path
          d={paths[variant]}
          fill="url(#dividerGradient)"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          viewport={{ once: true }}
        />
      </motion.svg>
      
      {/* Floating particles on divider */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            style={{
              left: `${20 + i * 15}%`,
              top: '50%',
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
