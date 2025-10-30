import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Targets from "./pages/Targets";
import TargetDetail from "./pages/TargetDetail";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import { useAuth } from "./_core/hooks/useAuth";

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      {isAuthenticated && (
        <>
          <Route path={"/dashboard"}>
            {() => (
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            )}
          </Route>
          <Route path={"/targets"}>
            {() => (
              <DashboardLayout>
                <Targets />
              </DashboardLayout>
            )}
          </Route>
          <Route path={"/targets/:id"}>
            {(params) => (
              <DashboardLayout>
                <TargetDetail id={parseInt(params.id)} />
              </DashboardLayout>
            )}
          </Route>
          <Route path={"/alerts"}>
            {() => (
              <DashboardLayout>
                <Alerts />
              </DashboardLayout>
            )}
          </Route>
          <Route path={"/settings"}>
            {() => (
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            )}
          </Route>
        </>
      )}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
