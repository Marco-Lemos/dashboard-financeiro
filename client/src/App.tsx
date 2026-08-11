import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navigation } from "./components/Navigation";
import { MonthProvider } from "./contexts/MonthContext";
import { useAuth } from "./_core/hooks/useAuth";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import FixedAccounts from "./pages/FixedAccounts";
import Installments from "./pages/Installments";
import Categories from "./pages/Categories";
import Login from "./pages/Login";

function Router() {
  useHashLocation();
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/transactions"} component={Transactions} />
      <Route path={"/fixed-accounts"} component={FixedAccounts} />
      <Route path={"/installments"} component={Installments} />
      <Route path={"/categories"} component={Categories} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Só libera a navegação normal depois que existe uma sessão válida do Supabase Auth.
// Sem isso, qualquer pessoa acessaria as telas antes mesmo de logar.
function AppShell() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <>
      <Navigation />
      <Router />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <MonthProvider>
        <ThemeProvider defaultTheme="dark" switchable>
          <TooltipProvider>
            <Toaster />
            <AppShell />
          </TooltipProvider>
        </ThemeProvider>
      </MonthProvider>
    </ErrorBoundary>
  );
}

export default App;
