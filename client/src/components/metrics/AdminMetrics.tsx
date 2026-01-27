import { motion } from "framer-motion";

const GaugeCard = ({ label, value, percentage, delay }: { label: string; value: string; percentage: number; delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="relative p-6 bg-amber-950/20 border border-amber-500/20 rounded-xl backdrop-blur-sm group hover:border-amber-500/40 transition-all"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="text-xs uppercase tracking-widest text-amber-600">{label}</div>
            <div className="text-2xl font-bold text-amber-300 font-mono">{value}</div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-amber-900/30 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: delay + 0.3 }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
            />
        </div>

        {/* Corner indicators */}
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-amber-500/50" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-amber-500/50" />
    </motion.div>
);

const CircularGauge = ({ value, label, delay }: { value: number; label: string; delay: number }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (value / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="flex flex-col items-center"
        >
            <div className="relative w-28 h-28 md:w-32 md:h-32">
                <svg className="w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="45%" stroke="rgba(245,158,11,0.2)" strokeWidth="8" fill="none" />
                    <motion.circle
                        cx="50%" cy="50%" r="45%"
                        stroke="url(#amberGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        whileInView={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, delay: delay + 0.2 }}
                    />
                    <defs>
                        <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-amber-300 font-mono">{value}%</div>
                </div>
            </div>
            <div className="text-xs uppercase tracking-widest text-amber-600 mt-2">{label}</div>
        </motion.div>
    );
};

export default function AdminMetrics() {
    return (
        <div className="relative w-full py-12 overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full bg-[linear-gradient(90deg,#f59e0b_1px,transparent_1px),linear-gradient(#f59e0b_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header */}
            <div className="text-center mb-12 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    System <span className="text-amber-400">Health</span>
                </h2>
                <p className="text-gray-400">Live monitoring of all critical business metrics.</p>
            </div>

            {/* Dashboard Grid */}
            <div className="relative z-10 max-w-5xl mx-auto px-4">
                {/* Circular Gauges Row */}
                <div className="flex justify-center gap-8 md:gap-16 mb-12">
                    <CircularGauge value={98} label="Uptime" delay={0.2} />
                    <CircularGauge value={85} label="Capacity" delay={0.3} />
                    <CircularGauge value={92} label="Security" delay={0.4} />
                </div>

                {/* Bar Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GaugeCard label="Active Users" value="1.2K" percentage={75} delay={0.5} />
                    <GaugeCard label="Tasks/Day" value="5.8K" percentage={92} delay={0.6} />
                    <GaugeCard label="Response" value="95ms" percentage={88} delay={0.7} />
                </div>
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/5 via-transparent to-amber-900/5 pointer-events-none" />
        </div>
    );
}
