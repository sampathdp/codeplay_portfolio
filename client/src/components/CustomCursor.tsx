import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorVariant, setCursorVariant] = useState<'default' | 'button' | 'link' | 'text'>('default');

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('button') || target.closest('[role="button"]')) {
        setCursorVariant('button');
        setIsHovering(true);
      } else if (target.closest('a') || target.closest('[data-cursor="link"]')) {
        setCursorVariant('link');
        setIsHovering(true);
      } else if (target.closest('input') || target.closest('textarea')) {
        setCursorVariant('text');
        setIsHovering(true);
      } else {
        setCursorVariant('default');
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  const variants = {
    default: {
      width: 20,
      height: 20,
      backgroundColor: 'transparent',
      border: '2px solid hsl(217 91% 60%)',
      mixBlendMode: 'difference' as const,
    },
    button: {
      width: 60,
      height: 60,
      backgroundColor: 'hsl(217 91% 60% / 0.2)',
      border: '2px solid hsl(217 91% 60%)',
      mixBlendMode: 'normal' as const,
    },
    link: {
      width: 40,
      height: 40,
      backgroundColor: 'hsl(262 83% 57% / 0.2)',
      border: '2px solid hsl(262 83% 57%)',
      mixBlendMode: 'normal' as const,
    },
    text: {
      width: 4,
      height: 30,
      backgroundColor: 'hsl(217 91% 60%)',
      border: 'none',
      borderRadius: '2px',
      mixBlendMode: 'normal' as const,
    },
  };

  // Hide on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          ...variants[cursorVariant],
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 400,
        }}
      />

      {/* Glow effect */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full blur-xl"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovering ? 100 : 40,
          height: isHovering ? 100 : 40,
          opacity: isHovering ? 0.3 : 0.15,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 400,
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-primary to-accent rounded-full" />
      </motion.div>

      {/* Dot cursor center */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000] w-1 h-1 bg-primary rounded-full"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.5 : 1,
          opacity: cursorVariant === 'text' ? 0 : 1,
        }}
      />

      <style>{`
        @media (hover: hover) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}
