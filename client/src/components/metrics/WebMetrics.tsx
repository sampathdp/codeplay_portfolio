import { motion } from "framer-motion";

const GlassLayer = ({ delay, y, opacity }: { delay: number; y: number; opacity: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity, y }}
        transition={{ duration: 0.8, delay }}
        className="absolute inset-x-8 h-32 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-transparent backdrop-blur-sm"
        style={{ transform: `translateY(${y}px)` }}
    />
);

const MetricOrb = ({ label, value, delay }: { label: string; value: string; delay: number }) => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay }}
        className="relative group"
    >
        <motion.div
            animate={{ boxShadow: ["0 0 20px rgba(0,255,255,0.3)", "0 0 50px rgba(0,255,255,0.6)", "0 0 20px rgba(0,255,255,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-cyan-900/40 to-cyan-950/60 border-2 border-cyan-400/40 flex flex-col items-center justify-center relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,255,0.2),transparent_60%)]" />
            <div className="text-3xl md:text-4xl font-bold text-cyan-300 font-mono z-10">{value}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-500 mt-1 z-10">{label}</div>

            {/* Rotating ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-cyan-400/50 rounded-full"
            />
        </motion.div>
    </motion.div>
);

export default function WebMetrics() {
    return (
        <div className="relative w-full py-16 overflow-hidden">
            {/* Background glass layers */}
            <div className="absolute inset-0 flex items-center justify-center">
                <GlassLayer delay={0} y={-60} opacity={0.15} />
                <GlassLayer delay={0.1} y={-30} opacity={0.25} />
                <GlassLayer delay={0.2} y={0} opacity={0.35} />
            </div>

            {/* Grid lines */}
            <div className="absolute inset-0 opacity-10">
                <div className="h-full w-full bg-[linear-gradient(90deg,cyan_1px,transparent_1px),linear-gradient(cyan_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            {/* Header */}
            <div className="text-center mb-12 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    System <span className="text-cyan-400">Metrics</span>
                </h2>
                <p className="text-gray-400">Real-time performance validation across all operational vectors.</p>
            </div>

            {/* Metrics Grid */}
            <div className="relative z-10 flex flex-wrap justify-center items-center gap-8 md:gap-16 max-w-4xl mx-auto">
                <MetricOrb label="Performance" value="99%" delay={0.3} />
                <MetricOrb label="Scalability" value="10X" delay={0.4} />
                <MetricOrb label="Security" value="ISO" delay={0.5} />

                {/* Central Server Icon */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="hidden md:flex flex-col items-center justify-center"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-20 h-28 border-2 border-cyan-500/40 rounded-lg bg-cyan-950/30 flex flex-col items-center justify-center gap-1 p-2"
                    >
                        {[1, 2, 3, 4].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                className="w-full h-2 bg-cyan-500/50 rounded-full"
                            />
                        ))}
                    </motion.div>
                    <div className="text-xs text-cyan-500 mt-2 font-mono">CORE</div>
                </motion.div>

                <MetricOrb label="Uptime" value="24/7" delay={0.7} />
                <MetricOrb label="Global" value="CDN" delay={0.8} />
            </div>

            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[size:100%_4px] pointer-events-none" />
        </div>
    );
}
