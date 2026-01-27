import { motion } from "framer-motion";

const StatBar = ({ label, value, color, delay }: { label: string; value: string; color: string; delay: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay }}
        className="flex items-center gap-4 p-3 bg-red-950/20 border border-red-500/20 rounded-lg hover:border-red-500/40 transition-all group"
    >
        <div className={`w-3 h-8 ${color} rounded-sm animate-pulse`} />
        <div className="flex-1">
            <div className="text-xs uppercase tracking-widest text-red-600">{label}</div>
            <div className="text-xl font-bold text-red-300 font-mono">{value}</div>
        </div>
    </motion.div>
);

const FPSCounter = ({ delay }: { delay: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="relative"
    >
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-lg bg-red-950/30 border-2 border-red-500/40 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Glitch effect overlay */}
            <motion.div
                animate={{ opacity: [0, 0.3, 0], x: [-5, 5, -5] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 bg-red-500/20"
            />

            <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-5xl md:text-6xl font-black text-red-400 font-mono"
            >
                144
            </motion.div>
            <div className="text-sm uppercase tracking-widest text-red-600 mt-1">FPS</div>

            {/* Corner brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-500/60" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-red-500/60" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-red-500/60" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-red-500/60" />
        </div>
    </motion.div>
);

const PolygonWireframe = () => (
    <motion.div
        animate={{ rotateY: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
        style={{ perspective: 1000 }}
    >
        <div className="w-64 h-64 border border-red-500/50 rotate-45" />
        <div className="absolute w-48 h-48 border border-red-500/30 rotate-12" />
        <div className="absolute w-32 h-32 border border-red-500/20 -rotate-12" />
    </motion.div>
);

export default function GameMetrics() {
    return (
        <div className="relative w-full py-12 overflow-hidden">
            {/* Wireframe background */}
            <PolygonWireframe />

            {/* Header */}
            <div className="text-center mb-12 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Performance <span className="text-red-500">Stats</span>
                </h2>
                <p className="text-gray-400">Optimized for maximum engagement and frame rates.</p>
            </div>

            {/* Gaming HUD Layout */}
            <div className="relative z-10 max-w-5xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                    {/* Left Stats */}
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <StatBar label="Latency" value="2ms" color="bg-green-500" delay={0.2} />
                        <StatBar label="Render" value="16.6ms" color="bg-yellow-500" delay={0.3} />
                        <StatBar label="VRAM" value="6.2GB" color="bg-red-500" delay={0.4} />
                    </div>

                    {/* Central FPS */}
                    <FPSCounter delay={0.5} />

                    {/* Right Stats */}
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <StatBar label="Triangles" value="2.4M" color="bg-blue-500" delay={0.6} />
                        <StatBar label="Draw Calls" value="1.2K" color="bg-purple-500" delay={0.7} />
                        <StatBar label="Physics" value="60Hz" color="bg-orange-500" delay={0.8} />
                    </div>
                </div>
            </div>

            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(239,68,68,0.02)_50%)] bg-[size:100%_4px] pointer-events-none" />
        </div>
    );
}
