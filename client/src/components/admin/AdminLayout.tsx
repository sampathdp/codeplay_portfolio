import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  LayoutDashboard,
  Flame,
  FileText,
  Rss,
  Settings2,
  History,
  ListChecks,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { signOut } from "@/lib/insights/auth";
import { ADMIN_INSIGHTS_BASE } from "@/lib/insights/routes";

const NAV = [
  { key: "", label: "Dashboard", icon: LayoutDashboard },
  { key: "candidates", label: "Trending Candidates", icon: Flame },
  { key: "articles", label: "Articles", icon: FileText },
  { key: "jobs", label: "AI Jobs & Errors", icon: ListChecks },
  { key: "sources", label: "Sources", icon: Rss },
  { key: "history", label: "Activity Log", icon: History },
  { key: "settings", label: "Settings", icon: Settings2 },
] as const;

export default function AdminLayout({
  active,
  title,
  actions,
  children,
}: {
  active: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin sections">
      {NAV.map(({ key, label, icon: Icon }) => {
        const href = key ? `${ADMIN_INSIGHTS_BASE}/${key}` : ADMIN_INSIGHTS_BASE;
        const isActive = active === key;
        return (
          <Link
            key={key || "dashboard"}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 p-4 lg:flex">
          <Brand />
          <div className="mt-6 flex-1">{nav}</div>
          <SidebarFooter />
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-white/10 bg-gray-950 p-4">
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 flex-1">{nav}</div>
              <SidebarFooter />
            </aside>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-gray-950/90 px-4 py-3 backdrop-blur md:px-6">
            <button
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 lg:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold md:text-lg">{title}</h1>
            <div className="ml-auto flex items-center gap-2">{actions}</div>
          </header>

          <main className="px-4 py-5 md:px-6 md:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link
      href={ADMIN_INSIGHTS_BASE}
      className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="font-mono text-primary">{"</>"}</span>
      <span className="text-sm font-bold tracking-tight">
        Insights <span className="text-muted-foreground">Admin</span>
      </span>
    </Link>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-4 space-y-1 border-t border-white/10 pt-4">
      <a
        href="/insights"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        View site
      </a>
      <button
        onClick={() => signOut()}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}
