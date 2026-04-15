import { useState, useEffect } from "react";
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
import CaseStudyDetail from "@/pages/CaseStudyDetail";
import { useScrollToTopOnNavigate } from "@/hooks/useScrollToTopOnNavigate";
import NotFound from "@/pages/not-found";
import Preloader from "@/components/Preloader";
import { AnimatePresence } from "framer-motion";
import { CurrencyProvider } from "@/context/CurrencyContext";

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Artificial delay to show the "cool" preloader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" enableSystem={false} attribute="class">
        <CurrencyProvider>
          <TooltipProvider>
            <AnimatePresence mode="wait">
              {isLoading && <Preloader key="preloader" />}
            </AnimatePresence>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
