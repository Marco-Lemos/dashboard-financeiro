import { useEffect, useState } from "react";
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
import { FinancialStory, hasSeenStoryToday } from "./components/FinancialStory";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import FixedAccounts from "./pages/FixedAccounts";
import Installments from "./pages/Installments";
import Categories from "./pages/Categories";
import Goals from "./pages/Goals";
import Investments from "./pages/Investments";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";

function Router() {
  useHashLocation();
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/transactions"} component={Transactions} />
      <Route path={"/fixed-accounts"} component={FixedAccounts} />
      <Route path={"/installments"} component={Installments} />
      <Route path={"/categories"} component={Categories} />
      <Route path={"/goals"} component={Goals} />
      <Route path={"/investments"} component={Investments} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Só libera a navegação normal depois que existe uma sessão válida do Supabase Auth.
// Sem isso, qualquer pessoa acessaria as telas antes mesmo de logar.
function AppShell() {
  const { isAuthenticated, loading, user } = useAuth();

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

  if (user && !user.onboardingCompleted) {
    return <Onboarding />;
  }

  return (
    <>
      <Navigation />
      <div className="pb-20 md:pb-0">
        <Router />
      </div>
      {user && <StoryOverlay userId={user.id} />}
    </>
  );
}

// Mostra o recap animado uma vez por dia, por cima do painel (que já carrega
// normalmente por baixo). Não bloqueia nada — some ao terminar ou ao pular.
function StoryOverlay({ userId }: { userId: string }) {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!checked) {
      setVisible(!hasSeenStoryToday(userId));
      setChecked(true);
    }
  }, [checked, userId]);

  if (!visible) return null;
  return <FinancialStory onDismiss={() => setVisible(false)} />;
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
