import { useState } from "react";
import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";
import { ADMIN_INSIGHTS_BASE } from "@/lib/insights/routes";
import { INSIGHTS_CATEGORIES } from "@/lib/insights/categories";
import { listSettings, setSetting } from "@/lib/insights/admin";
import { useAsync, useAction } from "@/components/admin/useAsync";
import { Card, Btn, Field, inputCls, Spinner, ErrorNote } from "@/components/admin/ui";

type Bag = Record<string, Record<string, unknown>>;

export default function Settings() {
  const load = useAsync(() => listSettings(), []);
  const action = useAction();

  if (load.loading) return <Spinner />;
  if (load.error) return <ErrorNote error={load.error} onRetry={load.reload} />;

  const bag: Bag = {};
  for (const row of load.data ?? []) {
    bag[row.key] = (row.value as Record<string, unknown>) ?? {};
  }

  return (
    <div className="max-w-2xl space-y-5">
      {action.error && <ErrorNote error={action.error} onRetry={action.clearError} />}

      <PublishingCard bag={bag} action={action} reload={load.reload} />
      <ScheduleCard bag={bag} action={action} reload={load.reload} />
      <QualityCard bag={bag} action={action} reload={load.reload} />
      <BudgetCard bag={bag} action={action} reload={load.reload} />
      <CategoriesCard bag={bag} action={action} reload={load.reload} />

      <Card title="Models & secrets">
        <p className="text-sm text-muted-foreground">
          Gemini model IDs are set via environment variables and are{" "}
          <strong>never editable here</strong>:
        </p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>
            <code>GEMINI_TEXT_MODEL</code> — article outline &amp; draft
          </li>
          <li>
            <code>GEMINI_FAST_MODEL</code> — research, fact-check, SEO
          </li>
          <li>
            <code>GEMINI_IMAGE_MODEL</code> — featured images
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          API keys — the Gemini key, the Supabase service-role key and the
          cron secret — live only in server / CI environment variables and are
          never sent to the browser or shown in this UI.
        </p>
      </Card>

      <Card title="Source preferences">
        <p className="text-sm text-muted-foreground">
          Enable/disable sources and adjust trust &amp; priority on the{" "}
          <Link href={`${ADMIN_INSIGHTS_BASE}/sources`} className="text-primary hover:underline">
            Sources
          </Link>{" "}
          page.
        </p>
      </Card>
    </div>
  );
}

function num(v: unknown, d: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : d;
}

function SaveRow({
  action,
  keyName,
  build,
  reload,
}: {
  action: ReturnType<typeof useAction>;
  keyName: string;
  build: () => Record<string, unknown>;
  reload: () => void;
}) {
  return (
    <Btn
      variant="primary"
      className="mt-4"
      loading={action.pending === keyName}
      onClick={() => action.run(keyName, () => setSetting(keyName, build()), reload)}
    >
      Save
    </Btn>
  );
}

function PublishingCard({ bag, action, reload }: { bag: Bag; action: ReturnType<typeof useAction>; reload: () => void }) {
  const p = bag.publishing ?? {};
  const [autoPublish, setAutoPublish] = useState(Boolean(p.autoPublish));
  const [min, setMin] = useState(String(num(p.minPerDay, 1)));
  const [max, setMax] = useState(String(num(p.maxPerDay, 1)));

  return (
    <Card title="Publishing">
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <label className="text-sm">
          <span className="flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={autoPublish}
              onChange={(e) => setAutoPublish(e.target.checked)}
            />
            Enable automated publishing
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Default is <strong>off</strong> — the system generates drafts and an
            editor approves publication. Even when on, articles that fail the
            quality gates stay in review.
          </span>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Minimum articles / day">
          <input type="number" min={0} className={inputCls} value={min} onChange={(e) => setMin(e.target.value)} />
        </Field>
        <Field label="Maximum articles / day">
          <input type="number" min={1} className={inputCls} value={max} onChange={(e) => setMax(e.target.value)} />
        </Field>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Diversity target: 1 tech/AI/dev · 1 broader tech/business/security · 1
        gaming/game-dev/community. Breaking news may override.
      </p>
      <SaveRow
        action={action}
        keyName="publishing"
        reload={reload}
        build={() => ({
          ...p,
          autoPublish,
          minPerDay: Number(min),
          maxPerDay: Number(max),
        })}
      />
    </Card>
  );
}

function ScheduleCard({ bag, action, reload }: { bag: Bag; action: ReturnType<typeof useAction>; reload: () => void }) {
  const s = bag.scheduler ?? {};
  const [tz, setTz] = useState(String(s.timezone ?? "Asia/Colombo"));
  const [windows, setWindows] = useState(
    (Array.isArray(s.publishWindowsLocal) ? (s.publishWindowsLocal as string[]) : ["08:30", "15:30", "22:30"]).join(", "),
  );
  return (
    <Card title="Scheduling">
      <div className="grid gap-4">
        <Field label="Timezone (IANA)">
          <input className={inputCls} value={tz} onChange={(e) => setTz(e.target.value)} />
        </Field>
        <Field label="Publishing windows (local, comma separated)">
          <input className={inputCls} value={windows} onChange={(e) => setWindows(e.target.value)} />
        </Field>
      </div>
      <SaveRow
        action={action}
        keyName="scheduler"
        reload={reload}
        build={() => ({
          ...s,
          timezone: tz.trim() || "Asia/Colombo",
          publishWindowsLocal: windows.split(",").map((w) => w.trim()).filter(Boolean),
        })}
      />
    </Card>
  );
}

function QualityCard({ bag, action, reload }: { bag: Bag; action: ReturnType<typeof useAction>; reload: () => void }) {
  const g = bag.generation ?? {};
  const t = (g.thresholds as Record<string, unknown>) ?? {};
  const [overall, setOverall] = useState(String(num(t.overallQuality, 70)));
  const [factual, setFactual] = useState(String(num(t.factualConfidence, 65)));
  return (
    <Card title="Quality threshold">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Overall quality (min)">
          <input type="number" min={0} max={100} className={inputCls} value={overall} onChange={(e) => setOverall(e.target.value)} />
        </Field>
        <Field label="Factual confidence (min)">
          <input type="number" min={0} max={100} className={inputCls} value={factual} onChange={(e) => setFactual(e.target.value)} />
        </Field>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Drafts below threshold are kept as review-only and never auto-published.
      </p>
      <SaveRow
        action={action}
        keyName="generation"
        reload={reload}
        build={() => ({
          ...g,
          thresholds: { ...t, overallQuality: Number(overall), factualConfidence: Number(factual) },
        })}
      />
    </Card>
  );
}

function BudgetCard({ bag, action, reload }: { bag: Bag; action: ReturnType<typeof useAction>; reload: () => void }) {
  const b = bag.ai_budget ?? {};
  const [usd, setUsd] = useState(String(num(b.dailyUsdCap, 4)));
  const [calls, setCalls] = useState(String(num(b.dailyCallCap, 400)));
  const [perArticle, setPerArticle] = useState(String(num(b.perArticleCallCap, 14)));
  return (
    <Card title="AI budget controls">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Daily USD cap">
          <input type="number" min={0} step="0.5" className={inputCls} value={usd} onChange={(e) => setUsd(e.target.value)} />
        </Field>
        <Field label="Daily call cap">
          <input type="number" min={0} className={inputCls} value={calls} onChange={(e) => setCalls(e.target.value)} />
        </Field>
        <Field label="Calls / article">
          <input type="number" min={1} className={inputCls} value={perArticle} onChange={(e) => setPerArticle(e.target.value)} />
        </Field>
      </div>
      <SaveRow
        action={action}
        keyName="ai_budget"
        reload={reload}
        build={() => ({
          ...b,
          dailyUsdCap: Number(usd),
          dailyCallCap: Number(calls),
          perArticleCallCap: Number(perArticle),
        })}
      />
    </Card>
  );
}

function CategoriesCard({ bag, action, reload }: { bag: Bag; action: ReturnType<typeof useAction>; reload: () => void }) {
  const p = bag.publishing ?? {};
  const all = INSIGHTS_CATEGORIES.map((c) => c.slug);
  const current = Array.isArray(p.allowedCategories) ? (p.allowedCategories as string[]) : all;
  const [selected, setSelected] = useState<Set<string>>(new Set(current));

  const toggle = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelected(next);
  };

  return (
    <Card title="Allowed categories">
      <p className="mb-3 text-xs text-muted-foreground">
        Categories the pipeline may publish into. Unchecked categories are still
        browsable but won&rsquo;t receive new auto-generated articles.
      </p>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {INSIGHTS_CATEGORIES.map((c) => (
          <label key={c.slug} className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={selected.has(c.slug)} onChange={() => toggle(c.slug)} />
            {c.name}
          </label>
        ))}
      </div>
      <SaveRow
        action={action}
        keyName="publishing"
        reload={reload}
        build={() => ({ ...p, allowedCategories: Array.from(selected) })}
      />
    </Card>
  );
}
