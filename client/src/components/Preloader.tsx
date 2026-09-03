import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Lean boot splash. Shown for well under a second on the first visit, so it
 * carries almost no animation weight: one CSS-spun ring plus a counting
 * percentage. (The previous version mounted ~160 framer-motion elements —
 * 60 of them animating `height` on an infinite loop — which dominated the
 * "avoid non-composited animations" and long-task audits.)
 */
export default function Preloader() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((p) => {
                if (p >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                const step = p < 30 ? 8 : p < 70 ? 4 : 6;
                return Math.min(p + step, 100);
            });
        }, 30);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] } }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-primary font-mono"
        >
            <div className="relative h-28 w-28">
                {/* Spinning ring — transform-only, GPU composited. */}
                <svg
                    viewBox="0 0 100 100"
                    className="h-full w-full origin-center animate-spin [animation-duration:1.4s]"
                >
                    <circle
                        cx="50" cy="50" r="46"
                        fill="none" stroke="currentColor" strokeWidth="2"
                        strokeDasharray="70 220" strokeLinecap="round"
                        className="opacity-70"
                    />
                    <circle
                        cx="50" cy="50" r="46"
                        fill="none" stroke="currentColor" strokeWidth="0.5"
                        className="opacity-20"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-black tracking-tighter">
                    {Math.floor(progress)}%
                </div>
            </div>
            <div className="mt-4 text-[8px] tracking-[0.4em] opacity-40 uppercase">
                System Bootloader
            </div>
        </motion.div>
    );
}
