import type { ReactNode } from "react";
import { useParams } from "wouter";
import { Helmet } from "react-helmet-async";
import { useScrollToTopOnNavigate } from "@/hooks/useScrollToTopOnNavigate";
import RequireAdmin from "@/components/insights/RequireAdmin";
import AdminLayout from "@/components/admin/AdminLayout";
import Dashboard from "./insights/Dashboard";
import Candidates from "./insights/Candidates";
import Articles from "./insights/Articles";
import NewArticle from "./insights/NewArticle";
import Editor from "./insights/Editor";
import Sources from "./insights/Sources";
import SettingsPage from "./insights/Settings";
import Jobs from "./insights/Jobs";
import History from "./insights/History";

/**
 * CodePlay Insights editorial admin. Every route sits behind `RequireAdmin`
 * (Supabase Auth + `insights_admins` membership); the database (RLS +
 * security-definer RPCs) is the real gate. `noindex` on every page.
 */
export default function AdminInsights() {
  useScrollToTopOnNavigate();
  const { page, id } = useParams<{ page?: string; id?: string }>();

  let title = "Dashboard";
  let nav = "";
  let body: ReactNode = <Dashboard />;

  switch (page) {
    case undefined:
      break;
    case "candidates":
      title = "Trending Candidates";
      nav = "candidates";
      body = <Candidates />;
      break;
    case "articles":
      nav = "articles";
      if (id === "new") {
        title = "New article";
        body = <NewArticle />;
      } else if (id) {
        title = "Edit article";
        body = <Editor id={id} />;
      } else {
        title = "Articles";
        body = <Articles />;
      }
      break;
    case "jobs":
      title = "AI Jobs & Errors";
      nav = "jobs";
      body = <Jobs />;
      break;
    case "sources":
      title = "Sources";
      nav = "sources";
      body = <Sources />;
      break;
    case "history":
      title = "Activity Log";
      nav = "history";
      body = <History />;
      break;
    case "settings":
      title = "Settings";
      nav = "settings";
      body = <SettingsPage />;
      break;
    default:
      title = "Not found";
      body = (
        <p className="text-sm text-muted-foreground">
          Unknown admin section “{page}”.
        </p>
      );
  }

  return (
    <>
      <Helmet>
        <title>{title} | Insights Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <RequireAdmin>
        <AdminLayout active={nav} title={title}>
          {body}
        </AdminLayout>
      </RequireAdmin>
    </>
  );
}
