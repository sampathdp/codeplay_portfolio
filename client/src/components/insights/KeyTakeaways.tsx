import { CheckCircle2, Sparkles } from "lucide-react";

export default function KeyTakeaways({ points }: { points: string[] }) {
  if (!points || points.length === 0) return null;
  return (
    <aside
      aria-labelledby="key-takeaways-heading"
      className="my-10 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-[#0e1526]/90 to-[#0e1526]/90 p-6 sm:p-7 shadow-xl shadow-primary/5 backdrop-blur-md"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <h2
          id="key-takeaways-heading"
          className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-primary"
        >
          Key Executive Takeaways
        </h2>
      </div>
      <ul className="space-y-3">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-3 text-base sm:text-[1.05rem] leading-relaxed text-slate-200">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <span className="font-normal">{p}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
