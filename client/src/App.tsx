import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
