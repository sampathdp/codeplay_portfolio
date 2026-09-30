import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { HelmetProvider } from "react-helmet-async";
import Home from "@/pages/Home";
import { useScrollToTopOnNavigate } from "@/hooks/useScrollToTopOnNavigate";
import Preloader from "@/components/Preloader";
import { AnimatePresence } from "framer-motion";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { ToolsGate } from "@/lib/toolsLink";

// Non-critical chrome — not needed for first paint or first interaction.
// Split out of the entry bundle and mounted once the browser is idle.
const Toaster = lazy(() =>
  import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })),
);
const WhatsAppWidget = lazy(() => import("@/components/WhatsAppWidget"));

/** Renders children only after the first idle window (or a 2s fallback). */
function DeferredChrome({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(t);
  }, []);
  if (!ready) return null;
  return <Suspense fallback={null}>{children}</Suspense>;
}

// Only Home is eager (it is the landing/LCP route). Every other page is
// code-split so it stays out of the initial bundle.
const WebDevelopment = lazy(() => import("@/pages/WebDevelopment"));
const MobileDevelopment = lazy(() => import("@/pages/MobileDevelopment"));
const AiDevelopment = lazy(() => import("@/pages/AiDevelopment"));
const ErpSystems = lazy(() => import("@/pages/ErpSystems"));
const UnityDevelopment = lazy(() => import("@/pages/UnityDevelopment"));
const UnityAssets = lazy(() => import("@/pages/UnityAssets"));
const UnityAssetDetail = lazy(() => import("@/pages/UnityAssetDetail"));
const CaseStudies = lazy(() => import("@/pages/CaseStudies"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const CaseStudyDetail = lazy(() => import("@/pages/CaseStudyDetail"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const Tools = lazy(() => import("@/pages/Tools"));
const ImageEditorTool = lazy(() => import("@/pages/ImageEditorTool"));
const ImageConverterTool = lazy(() => import("@/pages/ImageConverterTool"));
const VideoWatermarkTool = lazy(() => import("@/pages/VideoWatermarkTool"));
const ImageWatermarkTool = lazy(() => import("@/pages/ImageWatermarkTool"));
const PdfTemplateTool = lazy(() => import("@/pages/PdfTemplateTool"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Insights pulls in @supabase/supabase-js on the admin path — lazy-load
// so it stays out of the marketing site's main bundle.
const InsightsHome = lazy(() => import("@/pages/insights/InsightsHome"));
const InsightsArticle = lazy(() => import("@/pages/insights/InsightsArticle"));
const InsightsCategory = lazy(() => import("@/pages/insights/InsightsCategory"));
const InsightsTag = lazy(() => import("@/pages/insights/InsightsTag"));
const InsightsSearch = lazy(() => import("@/pages/insights/InsightsSearch"));
const InsightsInfoPage = lazy(() => import("@/pages/insights/InsightsInfoPage"));
const InsightsAuthor = lazy(() => import("@/pages/insights/InsightsAuthor"));
const AdminInsights = lazy(() => import("@/pages/admin/AdminInsights"));

function Router() {
  useScrollToTopOnNavigate();

  return (
    <Suspense fallback={null}>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/web-development" component={WebDevelopment} />
      <Route path="/mobile-development" component={MobileDevelopment} />
      <Route path="/ai-development" component={AiDevelopment} />
      <Route path="/erp-systems" component={ErpSystems} />
      <Route path="/unity-game-development" component={UnityDevelopment} />
      <Route path="/unity-assets" component={UnityAssets} />
      <Route path="/unity-assets/:slug" component={UnityAssetDetail} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/case-studies/:slug" component={CaseStudyDetail} />
      <Route path="/tools"><ToolsGate><Tools /></ToolsGate></Route>
      <Route path="/tools/image-editor"><ToolsGate><ImageEditorTool /></ToolsGate></Route>
      <Route path="/tools/image-converter"><ToolsGate><ImageConverterTool /></ToolsGate></Route>
      <Route path="/tools/image-watermark"><ToolsGate><ImageWatermarkTool /></ToolsGate></Route>
      <Route path="/tools/video-watermark"><ToolsGate><VideoWatermarkTool /></ToolsGate></Route>
      <Route path="/tools/pdf-template"><ToolsGate><PdfTemplateTool /></ToolsGate></Route>
      <Route path="/insights">
        <Suspense fallback={null}>
          <InsightsHome />
        </Suspense>
      </Route>
      <Route path="/insights/search">
        <Suspense fallback={null}>
          <InsightsSearch />
        </Suspense>
      </Route>
      <Route path="/insights/category/:slug">
        <Suspense fallback={null}>
          <InsightsCategory />
        </Suspense>
      </Route>
      <Route path="/insights/tag/:slug">
        <Suspense fallback={null}>
          <InsightsTag />
        </Suspense>
      </Route>
      <Route path="/insights/authors/:slug">
        <Suspense fallback={null}>
          <InsightsAuthor />
        </Suspense>
      </Route>
      <Route path="/insights/about">
        <Suspense fallback={null}>
          <InsightsInfoPage slug="about" />
        </Suspense>
      </Route>
      <Route path="/insights/editorial-policy">
        <Suspense fallback={null}>
          <InsightsInfoPage slug="editorial-policy" />
        </Suspense>
      </Route>
      <Route path="/insights/ai-policy">
        <Suspense fallback={null}>
          <InsightsInfoPage slug="ai-policy" />
        </Suspense>
      </Route>
      <Route path="/insights/corrections">
        <Suspense fallback={null}>
          <InsightsInfoPage slug="corrections" />
        </Suspense>
      </Route>
      <Route path="/insights/:slug">
        <Suspense fallback={null}>
          <InsightsArticle />
        </Suspense>
      </Route>
      <Route path="/admin/insights/:page?/:id?">
        <Suspense fallback={null}>
          <AdminInsights />
        </Suspense>
      </Route>
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-and-conditions" component={TermsAndConditions} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  // Preloader only on the very first entry to the home page. Any other
  // landing route, or a repeat visit in the same tab session, skips it.
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return false;
    const isHome = window.location.pathname === "/";
    const alreadyShown = sessionStorage.getItem("preloaderShown") === "1";
    return isHome && !alreadyShown;
  });

  useEffect(() => {
    if (!isLoading) return;
    try {
      sessionStorage.setItem("preloaderShown", "1");
    } catch {
      // ignore storage failures (private mode, etc.)
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <HelmetProvider>
      <ThemeProvider
        defaultTheme="dark"
        forcedTheme="dark"
        enableSystem={false}
        attribute="class"
      >
        <CurrencyProvider>
          <TooltipProvider>
            <AnimatePresence mode="wait">
              {isLoading && <Preloader key="preloader" />}
            </AnimatePresence>
            <Router />
            <DeferredChrome>
              <WhatsAppWidget />
              <Toaster />
            </DeferredChrome>
          </TooltipProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
