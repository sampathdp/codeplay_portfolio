import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function Card({
  children,
  className = "",
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border border-white/10 bg-white/[0.03] ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Kpi({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "warn" | "good";
}) {
  const toneCls =
    tone === "warn"
      ? "text-amber-400"
      : tone === "good"
        ? "text-emerald-400"
        : "text-foreground";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${toneCls}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

type BtnVariant = "primary" | "ghost" | "danger" | "subtle";

export function Btn({
  children,
  onClick,
  variant = "subtle",
  disabled,
  loading,
  type = "button",
  className = "",
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
  title?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  const styles: Record<BtnVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    danger: "bg-destructive/15 text-destructive hover:bg-destructive/25",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-white/5",
    subtle:
      "border border-white/10 bg-white/5 text-foreground/90 hover:border-white/20",
  };
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

const STATUS_TONE: Record<string, string> = {
  idea: "bg-white/10 text-muted-foreground",
  researching: "bg-sky-500/15 text-sky-300",
  research: "bg-sky-500/15 text-sky-300",
  draft: "bg-amber-500/15 text-amber-300",
  review: "bg-violet-500/15 text-violet-300",
  approved: "bg-teal-500/15 text-teal-300",
  scheduled: "bg-blue-500/15 text-blue-300",
  published: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-destructive/15 text-destructive",
  archived: "bg-white/5 text-muted-foreground",
  queued: "bg-white/10 text-muted-foreground",
  running: "bg-sky-500/15 text-sky-300",
  succeeded: "bg-emerald-500/15 text-emerald-300",
  failed: "bg-destructive/15 text-destructive",
  cancelled: "bg-white/5 text-muted-foreground",
  discovered: "bg-white/10 text-muted-foreground",
  filtered: "bg-white/5 text-muted-foreground",
  selected: "bg-teal-500/15 text-teal-300",
  ignored: "bg-white/5 text-muted-foreground",
  converted: "bg-emerald-500/15 text-emerald-300",
  verified: "bg-emerald-500/15 text-emerald-300",
  likely: "bg-teal-500/15 text-teal-300",
  community_rumor: "bg-amber-500/15 text-amber-300",
  unverified: "bg-white/10 text-muted-foreground",
  generated: "bg-emerald-500/15 text-emerald-300",
  stock: "bg-blue-500/15 text-blue-300",
  fallback: "bg-amber-500/15 text-amber-300",
  none: "bg-white/5 text-muted-foreground",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${
        STATUS_TONE[status] ?? "bg-white/10 text-muted-foreground"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function ScoreBar({
  value,
  label,
}: {
  value: number | null | undefined;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, Number(value ?? 0)));
  const tone =
    v >= 70 ? "bg-emerald-400" : v >= 45 ? "bg-amber-400" : "bg-destructive";
  return (
    <div className="min-w-[7rem]">
      {label && (
        <div className="mb-0.5 flex justify-between text-[0.65rem] text-muted-foreground">
          <span>{label}</span>
          <span className="tabular-nums">{v.toFixed(0)}</span>
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full ${tone}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[0.7rem] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorNote({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <span className="min-w-0 break-words">{error}</span>
      {onRetry && (
        <Btn variant="danger" onClick={onRetry} className="ml-auto">
          Retry
        </Btn>
      )}
    </div>
  );
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function relTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = Date.now() - Date.parse(iso);
  if (Number.isNaN(diff)) return "—";
  const m = Math.round(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
