import { motion } from "framer-motion";

const AppBubble = ({ label, value, x, y, size, delay }: { label: string; value: string; x: string; y: string; size: number; delay: number }) => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, delay }}
        animate={{ y: [0, -15, 0] }}
        style={{ left: x, top: y }}
        className="absolute"
    >
        <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative group cursor-pointer"
        >
            <div
                style={{ width: size, height: size }}
                className="rounded-3xl bg-gradient-to-br from-purple-500/30 to-violet-600/20 border border-purple-400/40 backdrop-blur-md flex flex-col items-center justify-center shadow-lg shadow-purple-500/20"
            >
                <div className="text-2xl md:text-3xl font-bold text-purple-200 font-mono">{value}</div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-purple-400 mt-1">{label}</div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-purple-500/20 blur-xl -z-10 group-hover:bg-purple-500/40 transition-all" />
        </motion.div>
    </motion.div>
);

const ConnectingLine = ({ x1, y1, x2, y2, delay }: { x1: string; y1: string; x2: string; y2: string; delay: number }) => (
    <motion.svg
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.3 }}
        transition={{ duration: 1, delay }}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: "visible" }}
    >
        <motion.line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="url(#purpleGradient)"
            strokeWidth="2"
            strokeDasharray="5,5"
        />
        <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.5" />
            </linearGradient>
        </defs>
    </motion.svg>
);

export default function MobileMetrics() {
    return (
        <div className="relative w-full h-[450px] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-purple-900/10" />

            {/* Connecting lines (simplified visual) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <ConnectingLine x1="20%" y1="30%" x2="40%" y2="50%" delay={0.5} />
                <ConnectingLine x1="40%" y1="50%" x2="60%" y2="30%" delay={0.6} />
                <ConnectingLine x1="60%" y1="30%" x2="80%" y2="50%" delay={0.7} />
            </div>

            {/* Header */}
            <div className="text-center pt-8 mb-4 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    App <span className="text-purple-400">Ecosystem</span>
                </h2>
                <p className="text-gray-400">Connected experiences across all platforms.</p>
            </div>

            {/* Floating bubbles */}
            <div className="relative w-full h-[300px]">
                <AppBubble label="Downloads" value="1M+" x="10%" y="20%" size={110} delay={0.2} />
                <AppBubble label="Rating" value="4.9" x="35%" y="40%" size={100} delay={0.3} />
                <AppBubble label="Platforms" value="2" x="55%" y="15%" size={90} delay={0.4} />
                <AppBubble label="Offline" value="Yes" x="75%" y="35%" size={100} delay={0.5} />
                <AppBubble label="Updates" value="OTA" x="25%" y="65%" size={85} delay={0.6} />
                <AppBubble label="Sync" value="Real" x="65%" y="60%" size={95} delay={0.7} />
            </div>

            {/* Floating particles */}
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ y: [0, -50, 0], opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.5 }}
                    className="absolute w-2 h-2 bg-purple-400 rounded-full"
                    style={{ left: `${10 + i * 9}%`, top: `${70 + (i % 3) * 10}%` }}
                />
            ))}
        </div>
    );
}
