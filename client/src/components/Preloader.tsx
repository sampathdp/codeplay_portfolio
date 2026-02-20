import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useRef } from "react";

const terminalLogs = [
    "KERNEL_INIT: [OK]",
    "BOOT_FS: ext4_ready",
    "VGA_COMP: rgba_0xff",
    "SYNC_CLOCK: 1.2ms_offset",
    "LOAD_CORE: alpha_module",
    "UPLINK: stable_node_01",
    "PROTOCOL: ws://relay.codeplay...",
    "STATUS: decrypting_assets",
    "WARN: buffer_overflow_prevented",
    "SECURITY: aes_256_active",
    "BUILD: 0x9f2e4a8d",
    "UI_ENGINE: gl_context_created",
];

export default function Preloader() {
    const [progress, setProgress] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeLogs, setActiveLogs] = useState<string[]>([]);
    const [phase, setPhase] = useState(0);

    // Parallax tracking
    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 60,
                y: (e.clientY / window.innerHeight - 0.5) * 60,
            });
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    // Ultimate Logging Feed
    useEffect(() => {
        const logInterval = setInterval(() => {
            setActiveLogs(prev => {
                const nextLog = terminalLogs[Math.floor(Math.random() * terminalLogs.length)];
                return [...prev, `> ${nextLog}`].slice(-25);
            });
        }, 100);
        return () => clearInterval(logInterval);
    }, []);

    // Boot Progress Phases
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                const step = p < 30 ? 2 : p < 70 ? 0.5 : 1.5;
                return Math.min(p + step, 100);
            });
        }, 40);

        const phaseTimer = setInterval(() => {
            setPhase(ph => (ph + 1) % 4);
        }, 800);

        return () => {
            clearInterval(timer);
            clearInterval(phaseTimer);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{
                opacity: 0,
                filter: "contrast(4) brightness(5) blur(20px)",
                transition: { duration: 1, ease: [0.76, 0, 0.24, 1] }
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000000] text-primary overflow-hidden font-mono"
        >
            {/* Background Layer 1: Terminal Kernel Feed */}
            <div className="absolute inset-0 opacity-[0.08] select-none pointer-events-none text-[9px] leading-tight overflow-hidden p-4">
                <div className="flex flex-wrap gap-x-8 gap-y-1">
                    {activeLogs.map((log, i) => (
                        <div key={i} className="w-1/4 min-w-[150px]">{log}</div>
                    ))}
                    {/* Repeat logs to fill space */}
                    {Array.from({ length: 100 }).map((_, i) => (
                        <div key={`fill-${i}`} className="w-1/4 min-w-[150px] opacity-20 leading-none">
                            {Math.random().toString(16).substring(2, 10).toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>

            {/* Layer 2: CRT Noise & Scanlines */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
                <motion.div
                    animate={{ opacity: [0.1, 0.2, 0.1], y: [-10, 10] }}
                    transition={{ duration: 0.1, repeat: Infinity }}
                    className="absolute inset-0 bg-white/5 mix-blend-overlay"
                />
            </div>

            {/* Main Construct: 3D SVG Geometry */}
            <motion.div
                animate={{
                    x: mousePos.x,
                    y: mousePos.y,
                    rotateX: -mousePos.y * 0.05,
                    rotateY: mousePos.x * 0.05,
                    scale: [1, 1.02, 1]
                }}
                transition={{ scale: { duration: 4, repeat: Infinity } }}
                style={{ perspective: 2000 }}
                className="relative z-20"
            >
                <svg width="400" height="400" viewBox="0 0 400 400" className="drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                    {/* Construction Rings */}
                    <motion.circle
                        cx="200" cy="200" r="180"
                        fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 15"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="opacity-20"
                    />
                    <motion.circle
                        cx="200" cy="200" r="195"
                        fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="100 200"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="opacity-10"
                    />

                    {/* Biometric Targetting */}
                    <g className="opacity-40">
                        <line x1="180" y1="200" x2="220" y2="200" stroke="currentColor" strokeWidth="1" />
                        <line x1="200" y1="180" x2="200" y2="220" stroke="currentColor" strokeWidth="1" />
                        <motion.rect
                            x="160" y="160" width="80" height="80"
                            fill="none" stroke="currentColor" strokeWidth="0.5"
                            animate={{ rotate: [0, 90], scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </g>

                    {/* The Geometry Construction */}
                    <motion.path
                        d="M200,50 L350,200 L200,350 L50,200 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress / 100 }}
                        className="text-primary shadow-2xl"
                    />
                    <motion.path
                        d="M50,200 L350,200 M200,50 L200,350"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="opacity-30"
                    />

                    {/* Dynamic Corner Brackets */}
                    <path d="M20,20 L60,20 M20,20 L20,60" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M380,20 L340,20 M380,20 L380,60" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M20,380 L60,380 M20,380 L20,340" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M380,380 L340,380 M380,380 L380,340" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>

                {/* Center Progress Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        className="text-4xl font-black tracking-tighter"
                    >
                        {Math.floor(progress)}%
                    </motion.div>
                    <div className="text-[8px] tracking-[0.4em] opacity-40 mt-1">SYSTEM_BOOTLOADER_v3</div>
                </div>
            </motion.div>

            {/* Floating Meta-Data */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
                <div className="absolute top-12 left-12 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${progress > 25 ? 'bg-primary' : 'bg-primary/20 animate-pulse'}`} />
                        <span className="text-[10px] opacity-60">CORE_LINK</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${progress > 50 ? 'bg-primary' : 'bg-primary/20 animate-pulse'}`} />
                        <span className="text-[10px] opacity-60">NET_UPLINK</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${progress > 75 ? 'bg-primary' : 'bg-primary/20 animate-pulse'}`} />
                        <span className="text-[10px] opacity-60">UIX_RENDER</span>
                    </div>
                </div>

                <div className="absolute bottom-12 right-12 text-right">
                    <div className="text-[9px] opacity-40 mb-1 tracking-widest uppercase">Encryption Status</div>
                    <div className="text-xs font-bold bg-primary/10 px-2 py-1 inline-block border border-primary/20">QUANTUM_LOCKED</div>
                </div>
            </div>

            {/* Scrolling Frequency Bars (Bottom) */}
            <div className="absolute bottom-4 left-0 w-full flex items-end justify-center gap-1 h-8 opacity-20">
                {Array.from({ length: 60 }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            height: [Math.random() * 5, Math.random() * 32, Math.random() * 5]
                        }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.02 }}
                        className="w-1 bg-primary"
                    />
                ))}
            </div>

            {/* RGB Split Glitch Effect (Triggered randomly) */}
            <motion.div
                animate={{
                    opacity: [0, 0.1, 0],
                    x: [-5, 5, -3, 0]
                }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 bg-red-500/10 pointer-events-none mix-blend-screen"
            />
            <motion.div
                animate={{
                    opacity: [0, 0.1, 0],
                    x: [5, -5, 3, 0]
                }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.1 }}
                className="absolute inset-0 bg-blue-500/10 pointer-events-none mix-blend-screen"
            />
        </motion.div>
    );
}
