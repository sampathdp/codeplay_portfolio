import { motion } from "framer-motion";

const TimelineBar = ({ label, value, percentage, delay }: { label: string; value: string; percentage: number; delay: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
        className="relative"
    >
        <div className="flex justify-between items-center mb-2">
            <div className="text-xs uppercase tracking-widest text-fuchsia-500">{label}</div>
            <div className="text-lg font-bold text-fuchsia-300 font-mono">{value}</div>
        </div>
        <div className="h-3 bg-fuchsia-950/30 rounded-full overflow-hidden border border-fuchsia-500/20">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-fuchsia-600 to-pink-500 rounded-full relative"
            >
                {/* Acceleration glow */}
                <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
            </motion.div>
        </div>
    </motion.div>
);

const RocketSpeedometer = ({ delay }: { delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="relative flex flex-col items-center"
    >
        {/* Speedometer arc */}
        <div className="relative w-40 h-20 overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border-8 border-fuchsia-500/30" />
            <motion.div
                initial={{ rotate: -90 }}
                whileInView={{ rotate: 45 }}
                transition={{ duration: 1.5, delay: delay + 0.3, type: "spring" }}
                className="absolute bottom-0 left-1/2 origin-bottom w-1 h-16 bg-gradient-to-t from-fuchsia-500 to-pink-400 rounded-full"
                style={{ transformOrigin: "bottom center" }}
            />
        </div>

        {/* Speed reading */}
        <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-4xl md:text-5xl font-black text-fuchsia-400 font-mono mt-2"
        >
            400%
        </motion.div>
        <div className="text-xs uppercase tracking-widest text-fuchsia-600 mt-1">Growth Rate</div>

        {/* Ignition particles */}
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                animate={{ y: [0, -30], opacity: [1, 0], scale: [1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                className="absolute bottom-0 w-2 h-2 bg-pink-500 rounded-full"
                style={{ left: `${40 + i * 5}%` }}
            />
        ))}
    </motion.div>
);

export default function MvpMetrics() {
    return (
        <div className="relative w-full py-12 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-900/10 via-transparent to-fuchsia-900/10" />

            {/* Header */}
            <div className="text-center mb-12 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Growth <span className="text-fuchsia-400">Metrics</span>
                </h2>
                <p className="text-gray-400">Tracking the pulse of your product's market adoption.</p>
            </div>

            {/* Launch Dashboard */}
            <div className="relative z-10 max-w-4xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                    {/* Timeline Progress Bars */}
                    <div className="flex-1 space-y-6 w-full">
                        <TimelineBar label="Time to Market" value="4 Weeks" percentage={95} delay={0.2} />
                        <TimelineBar label="Cost Savings" value="60%" percentage={60} delay={0.3} />
                        <TimelineBar label="User Feedback" value="Active" percentage={85} delay={0.4} />
                        <TimelineBar label="Scalability" value="Ready" percentage={100} delay={0.5} />
                    </div>

                    {/* Central Speedometer */}
                    <RocketSpeedometer delay={0.6} />
                </div>
            </div>

            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(192,38,211,0.015)_50%)] bg-[size:100%_4px] pointer-events-none" />
        </div>
    );
}
