import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityProvider, AccessibilityPanel } from "@/components/AccessibilityFeatures";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Forums from "@/pages/forums";
import Events from "@/pages/events";
import News from "@/pages/news";
import Petitions from "@/pages/petitions";
import Representatives from "@/pages/representatives";
import Analytics from "@/pages/analytics";
import Budget from "@/pages/budget";
import AIRecommendationsPage from "@/pages/ai-recommendations";
import Profile from "@/pages/profile";
import PolicySimulationPage from "@/pages/policy-simulation";
import GovernmentData from "@/pages/government-data";
import SocialMedia from "@/pages/social-media";
import Organizing from "@/pages/organizing";
import Voting from "@/pages/voting";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/forums" component={Forums} />
          <Route path="/events" component={Events} />
          <Route path="/news" component={News} />
          <Route path="/petitions" component={Petitions} />
          <Route path="/representatives" component={Representatives} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/budget" component={Budget} />
          <Route path="/ai-recommendations" component={AIRecommendationsPage} />
          <Route path="/profile" component={Profile} />
          <Route path="/policy-simulation" component={PolicySimulationPage} />
          <Route path="/government-data" component={GovernmentData} />
          <Route path="/social-media" component={SocialMedia} />
          <Route path="/organizing" component={Organizing} />
          <Route path="/voting" component={Voting} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccessibilityProvider>
          <Router />
          <AccessibilityPanel />
          <Toaster />
        </AccessibilityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
