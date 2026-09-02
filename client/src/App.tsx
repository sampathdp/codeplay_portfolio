import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { HelmetProvider } from "react-helmet-async";
import Home from "@/pages/Home";
import WebDevelopment from "@/pages/WebDevelopment";
import MobileDevelopment from "@/pages/MobileDevelopment";
import AiDevelopment from "@/pages/AiDevelopment";
import ErpSystems from "@/pages/ErpSystems";
import UnityDevelopment from "@/pages/UnityDevelopment";
import CaseStudies from "@/pages/CaseStudies";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import CaseStudyDetail from "@/pages/CaseStudyDetail";
import Tools from "@/pages/Tools";
import ImageEditorTool from "@/pages/ImageEditorTool";
import ImageConverterTool from "@/pages/ImageConverterTool";
import VideoWatermarkTool from "@/pages/VideoWatermarkTool";
import ImageWatermarkTool from "@/pages/ImageWatermarkTool";
import PdfTemplateTool from "@/pages/PdfTemplateTool";
import { useScrollToTopOnNavigate } from "@/hooks/useScrollToTopOnNavigate";
import NotFound from "@/pages/not-found";
import Preloader from "@/components/Preloader";
import { AnimatePresence } from "framer-motion";
import { CurrencyProvider } from "@/context/CurrencyContext";
import WhatsAppWidget from "@/components/WhatsAppWidget";

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
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/web-development" component={WebDevelopment} />
      <Route path="/mobile-development" component={MobileDevelopment} />
      <Route path="/ai-development" component={AiDevelopment} />
      <Route path="/erp-systems" component={ErpSystems} />
      <Route path="/unity-game-development" component={UnityDevelopment} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/case-studies/:slug" component={CaseStudyDetail} />
      <Route path="/tools" component={Tools} />
      <Route path="/tools/image-editor" component={ImageEditorTool} />
      <Route path="/tools/image-converter" component={ImageConverterTool} />
      <Route path="/tools/image-watermark" component={ImageWatermarkTool} />
      <Route path="/tools/video-watermark" component={VideoWatermarkTool} />
      <Route path="/tools/pdf-template" component={PdfTemplateTool} />
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
      <Route component={NotFound} />
    </Switch>
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
    }, 1200);
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
            <WhatsAppWidget />
            <Toaster />
            <Router />
          </TooltipProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
