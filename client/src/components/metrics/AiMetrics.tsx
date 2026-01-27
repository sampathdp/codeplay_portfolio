import { motion } from "framer-motion";

const NeuralNode = ({ label, value, x, y, delay, isPrimary }: { label: string; value: string; x: string; y: string; delay: number; isPrimary?: boolean }) => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, delay }}
        style={{ left: x, top: y }}
        className="absolute"
    >
        <motion.div
            animate={isPrimary ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`relative flex flex-col items-center justify-center rounded-full border-2 backdrop-blur-sm
                ${isPrimary
                    ? "w-32 h-32 md:w-40 md:h-40 bg-emerald-900/40 border-emerald-400/60 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                    : "w-20 h-20 md:w-24 md:h-24 bg-emerald-950/40 border-emerald-500/30"}`}
        >
            <div className={`font-bold font-mono ${isPrimary ? "text-3xl md:text-4xl text-emerald-300" : "text-xl md:text-2xl text-emerald-400"}`}>
                {value}
            </div>
            <div className={`uppercase tracking-[0.15em] ${isPrimary ? "text-xs text-emerald-500" : "text-[8px] text-emerald-600"} mt-1`}>
                {label}
            </div>

            {/* Inner pulse ring */}
            {isPrimary && (
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-2 border-emerald-400/30 rounded-full"
                />
            )}
        </motion.div>
    </motion.div>
);

const DataStream = ({ startX, startY, endX, endY, delay }: { startX: string; startY: string; endX: string; endY: string; delay: number }) => (
    <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay }}
        className="absolute inset-0 pointer-events-none"
    >
        <svg className="w-full h-full" style={{ overflow: "visible" }}>
            <motion.line
                x1={startX} y1={startY} x2={endX} y2={endY}
                stroke="rgba(16,185,129,0.3)"
                strokeWidth="2"
            />
            {/* Animated data packet */}
            <motion.circle
                r="4"
                fill="rgba(52,211,153,0.8)"
                animate={{
                    cx: [startX, endX],
                    cy: [startY, endY],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", delay }}
            />
        </svg>
    </motion.div>
);

export default function AiMetrics() {
    return (
        <div className="relative w-full h-[500px] overflow-hidden">
            {/* Background neural pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3),transparent_60%)]" />
            </div>

            {/* Header */}
            <div className="text-center pt-8 mb-4 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Intelligence <span className="text-emerald-400">Metrics</span>
                </h2>
                <p className="text-gray-400">Quantifying the impact of automated intelligence.</p>
            </div>

            {/* Neural Network Layout */}
            <div className="relative w-full h-[350px]">
                {/* Data Streams */}
                <DataStream startX="20%" startY="40%" endX="50%" endY="50%" delay={0} />
                <DataStream startX="80%" startY="30%" endX="50%" endY="50%" delay={0.5} />
                <DataStream startX="30%" startY="75%" endX="50%" endY="50%" delay={1} />
                <DataStream startX="70%" startY="80%" endX="50%" endY="50%" delay={1.5} />

                {/* Satellite Nodes */}
                <NeuralNode label="Accuracy" value="99.2%" x="10%" y="25%" delay={0.2} />
                <NeuralNode label="Speed" value="<1ms" x="75%" y="15%" delay={0.3} />
                <NeuralNode label="Models" value="12" x="15%" y="65%" delay={0.4} />
                <NeuralNode label="Data" value="10TB" x="80%" y="60%" delay={0.5} />

                {/* Central Brain Node */}
                <NeuralNode label="Neural Core" value="AI" x="calc(50% - 80px)" y="calc(50% - 80px)" delay={0.6} isPrimary />
            </div>

            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(16,185,129,0.015)_50%)] bg-[size:100%_4px] pointer-events-none" />
        </div>
    );
}
