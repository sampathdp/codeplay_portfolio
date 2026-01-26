import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/Home";
import WebDevelopment from "@/pages/WebDevelopment";
import MobileDevelopment from "@/pages/MobileDevelopment";
import AiDevelopment from "@/pages/AiDevelopment";
import AdminPanels from "@/pages/AdminPanels";
import UnityDevelopment from "@/pages/UnityDevelopment";
import MvpDevelopment from "@/pages/MvpDevelopment";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/web-development" component={WebDevelopment} />
      <Route path="/mobile-development" component={MobileDevelopment} />
      <Route path="/ai-development" component={AiDevelopment} />
      <Route path="/admin-panels" component={AdminPanels} />
      <Route path="/unity-game-development" component={UnityDevelopment} />
      <Route path="/mvp-development" component={MvpDevelopment} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem attribute="class">
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
