import {
  SiReact, SiNextdotjs, SiFlutter, SiUnity,
  SiNodedotjs, SiPython, SiFirebase, SiMongodb,
  SiDocker, SiTypescript, SiTailwindcss, SiPostgresql,
  SiOpenai, SiGooglecloud, SiRedis, SiVercel,
} from "react-icons/si";

const row1 = [
  { icon: SiReact, name: "React", color: "#61DAFB" },
  { icon: SiNextdotjs, name: "Next.js", color: "#FFFFFF" },
  { icon: SiFlutter, name: "Flutter", color: "#54C5F8" },
  { icon: SiUnity, name: "Unity", color: "#FFFFFF" },
  { icon: SiNodedotjs, name: "Node.js", color: "#8CC84B" },
  { icon: SiPython, name: "Python", color: "#FFD43B" },
  { icon: SiOpenai, name: "OpenAI", color: "#74AA9C" },
  { icon: SiTypescript, name: "TypeScript", color: "#3178C6" },
];

const row2 = [
  { icon: SiFirebase, name: "Firebase", color: "#FFA611" },
  { icon: SiMongodb, name: "MongoDB", color: "#4DB33D" },
  { icon: SiDocker, name: "Docker", color: "#2496ED" },
  { icon: SiPostgresql, name: "PostgreSQL", color: "#4169E1" },
  { icon: SiGooglecloud, name: "Google Cloud", color: "#4285F4" },
  { icon: SiRedis, name: "Redis", color: "#FF4438" },
  { icon: SiVercel, name: "Vercel", color: "#FFFFFF" },
  { icon: SiTailwindcss, name: "Tailwind CSS", color: "#38BDF8" },
];

const double = (arr: typeof row1) => [...arr, ...arr];

function MarqueeRow({ items, reverse = false }: { items: typeof row1; reverse?: boolean }) {
  return (
    <div className="flex overflow-hidden relative">
      <div
        className={`flex gap-4 shrink-0 motion-reduce:animate-none ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {double(items).map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.08] transition-all duration-500 shrink-0 cursor-default select-none"
            >
              <Icon
                className="w-7 h-7 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                style={{ color: item.color }}
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-white/40 group-hover:text-white/80 transition-colors duration-300 whitespace-nowrap">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ClientLogosStrip() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Edge fade */}
      <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Label */}
      <div className="text-center mb-14 px-6 relative z-10">
        <p className="text-xs font-mono uppercase tracking-[0.4em] text-muted-foreground">
          Built with industry-leading technologies
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <MarqueeRow items={row1} />
        <MarqueeRow items={row2} reverse />
      </div>
    </section>
  );
}
