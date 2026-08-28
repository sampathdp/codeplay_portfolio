import { Check } from "lucide-react";

export default function KeyTakeaways({ points }: { points: string[] }) {
  if (!points || points.length === 0) return null;
  return (
    <aside
      aria-labelledby="key-takeaways-heading"
      className="my-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
    >
      <h2
        id="key-takeaways-heading"
        className="mb-4 text-xs font-mono uppercase tracking-[0.3em] text-primary"
      >
        Key Takeaways
      </h2>
      <ul className="space-y-2.5">
        {points.map((p, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
