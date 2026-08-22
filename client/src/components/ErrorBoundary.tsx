import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  // Limpa qualquer service worker/cache travado antes de recarregar — cobre
  // o caso mais comum desse tipo de erro (versão antiga do app em cache
  // brigando com a mais nova) além de simplesmente recarregar a página.
  handleRetry = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch {
      // Mesmo se a limpeza falhar, ainda vale tentar recarregar.
    } finally {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-md text-center">
            <AlertTriangle size={48} className="text-destructive mb-6 flex-shrink-0" />

            <h2 className="text-xl font-display font-bold mb-2">Algo deu errado</h2>
            <p className="text-muted-foreground mb-6">
              Isso geralmente resolve sozinho ao tentar de novo — o botão abaixo já limpa qualquer versão antiga do app guardada no navegador.
            </p>

            <button
              onClick={this.handleRetry}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer smooth-transition"
              )}
            >
              <RotateCcw size={16} />
              Tentar novamente
            </button>

            <button
              onClick={() => this.setState({ showDetails: !this.state.showDetails })}
              className="mt-6 text-xs text-muted-foreground hover:text-foreground smooth-transition underline"
            >
              {this.state.showDetails ? "Ocultar detalhes técnicos" : "Ver detalhes técnicos"}
            </button>

            {this.state.showDetails && (
              <div className="mt-4 p-4 w-full rounded bg-muted overflow-auto text-left">
                <pre className="text-xs text-muted-foreground whitespace-break-spaces">
                  {this.state.error?.stack || this.state.error?.message}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
