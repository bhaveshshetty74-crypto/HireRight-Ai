import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Roles from "@/pages/roles";
import RoleDetail from "@/pages/roles/[id]";
import Candidates from "@/pages/candidates";
import CandidateDetail from "@/pages/candidates/[id]";
import Screenings from "@/pages/screenings";
import Analytics from "@/pages/analytics";
import Help from "@/pages/help";
import Pricing from "@/pages/pricing";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={() => <Dashboard />} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/roles" component={Roles} />
        <Route path="/roles/:id" component={RoleDetail} />
        <Route path="/candidates" component={Candidates} />
        <Route path="/candidates/:id" component={CandidateDetail} />
        <Route path="/screenings" component={Screenings} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/help" component={Help} />
        <Route path="/pricing" component={Pricing} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
