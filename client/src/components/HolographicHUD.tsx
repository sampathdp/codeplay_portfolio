import { motion } from "framer-motion";

const OrbitRing = ({ delay, duration, size, border, reverse }: any) => (
    <motion.div
        className={`absolute rounded-full border border-cyan-500/30 ${border}`}
        style={{ width: size, height: size }}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{ duration: duration, repeat: Infinity, ease: "linear", delay: delay }}
    />
);

const StatCounter = ({ label, value, color }: any) => (
    <div className="flex flex-col items-center justify-center p-4 relative group">
        <div className={`absolute inset-0 bg-${color}/5 blur-xl group-hover:bg-${color}/10 transition-all duration-500 rounded-lg`} />
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative z-10 text-center"
        >
            <div className={`text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-${color}/50 font-mono tracking-tighter`}>
                {value}
            </div>
            <div className={`text-xs uppercase tracking-[0.2em] text-${color} mt-2 font-semibold`}>
                {label}
            </div>
        </motion.div>

        {/* Decorative corners */}
        <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/50`} />
        <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/50`} />
        <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/50`} />
        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/50`} />
    </div>
);

export default function HolographicHUD() {
    return (
        <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden rounded-3xl border border-cyan-500/20 bg-black/40 backdrop-blur-sm">
            {/* Central Hologram */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <OrbitRing size={200} duration={20} border="border-dashed" />
                <OrbitRing size={300} duration={30} delay={2} reverse border="border-dotted opacity-30" />
                <OrbitRing size={450} duration={40} delay={5} border="border-double opacity-20" />
                <div className="absolute w-[500px] h-[1px] bg-cyan-500/20 rotate-45" />
                <div className="absolute w-[500px] h-[1px] bg-cyan-500/20 -rotate-45" />
            </div>

            <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
                <StatCounter label="Performance" value="99%" color="cyan-400" />
                <StatCounter label="Scalability" value="10X" color="purple-400" />
                <StatCounter label="Security" value="ISO" color="emerald-400" />

                {/* Central visual core */}
                <div className="hidden md:flex items-center justify-center">
                    <motion.div
                        animate={{ boxShadow: ["0 0 20px rgba(0,255,255,0.2)", "0 0 60px rgba(0,255,255,0.6)", "0 0 20px rgba(0,255,255,0.2)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 rounded-full border-4 border-cyan-500/50 bg-cyan-900/20 flex items-center justify-center relative"
                    >
                        <div className="text-cyan-400 font-mono text-xs animate-pulse">CORE</div>
                        <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                    </motion.div>
                </div>

                <StatCounter label="Uptime" value="24/7" color="blue-400" />
                <StatCounter label="Global" value="CDN" color="pink-400" />
            </div>

            {/* Scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[size:100%_4px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 via-transparent to-cyan-900/10 pointer-events-none" />
        </div>
    );
}
