import { ArrowRight, BarChart3, CreditCard, Goal, LineChart, Receipt, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const features = [
  { icon: BarChart3, title: "Visão geral", text: "Receitas, despesas, saldo e investimentos em uma única visão." },
  { icon: Receipt, title: "Transações", text: "Registre, edite e acompanhe suas movimentações com facilidade." },
  { icon: CreditCard, title: "Contas e parcelamentos", text: "Organize compromissos fixos e saiba o que ainda falta pagar." },
  { icon: TrendingUp, title: "Investimentos", text: "Acompanhe quanto você está construindo ao longo do tempo." },
  { icon: Goal, title: "Metas", text: "Transforme seus objetivos financeiros em planos acompanháveis." },
  { icon: Wallet, title: "Categorias do seu jeito", text: "Personalize categorias e adapte o controle à sua realidade." },
];

function MiniDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div className="absolute -inset-10 rounded-[3rem] bg-primary/15 blur-3xl" />
      <div className="relative glass-card rounded-3xl border-white/10 p-4 shadow-2xl md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Visão financeira</p>
            <p className="mt-1 text-lg font-semibold">Visão geral</p>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">Controle em um só lugar</span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Receitas", "R$ 8.420,00", "text-primary"],
            ["Despesas", "R$ 5.180,00", "text-destructive"],
            ["Saldo", "R$ 3.240,00", "text-primary"],
            ["Total investido", "R$ 39.570,50", "text-primary"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`mt-2 text-lg font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:col-span-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Evolução mensal</p>
              <LineChart className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-6 flex h-28 items-end gap-2">
              {[35, 48, 42, 65, 58, 82, 74, 91, 78, 96, 86, 100].map((height, i) => (
                <div key={i} className="flex-1 rounded-t bg-primary/50" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:col-span-2">
            <p className="text-sm font-medium">Despesas por categoria</p>
            <div className="mx-auto mt-5 h-24 w-24 rounded-full border-[14px] border-primary/70 border-r-violet-400/70 border-b-blue-400/60" />
            <p className="mt-4 text-center text-xs text-muted-foreground">Visualização rápida</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <main className="min-h-screen overflow-hidden">
      <header className="relative z-10 border-b border-white/5 bg-black/10 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold">Controle Financeiro</span>
          </div>
          <Button variant="ghost" onClick={() => setLocation("/login")}>Entrar</Button>
        </div>
      </header>

      <section className="relative px-4 pb-20 pt-20 md:pb-28 md:pt-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              Simples, visual e feito para a vida real
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Sua vida financeira,
              <span className="block bg-gradient-to-r from-primary via-emerald-300 to-cyan-300 bg-clip-text text-transparent">finalmente sob controle.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Organize receitas, despesas, investimentos, contas e metas em um único lugar — e entenda para onde seu dinheiro está indo.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" className="glow-on-hover h-12 px-7" onClick={() => setLocation("/login")}>
                Começar agora <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 border-white/10 bg-white/[0.03]" onClick={() => document.getElementById("recursos")?.scrollIntoView({ behavior: "smooth" })}>
                Conhecer recursos
              </Button>
            </div>
          </div>
          <div className="mt-16 md:mt-20"><MiniDashboard /></div>
        </div>
      </section>

      <section id="recursos" className="border-y border-white/5 bg-black/10 px-4 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Tudo em um só lugar</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Menos planilhas. Mais clareza.</h2>
            <p className="mt-4 text-muted-foreground">As ferramentas que você precisa para acompanhar sua vida financeira sem transformar isso em mais uma obrigação.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="glass-card rounded-2xl p-6">
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:py-28">
        <div className="container">
          <div className="glass-card overflow-hidden rounded-3xl p-8 md:p-12">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Decisões melhores</p>
                <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Não basta saber quanto você tem. É preciso entender o que está acontecendo.</h2>
                <p className="mt-5 leading-7 text-muted-foreground">Acompanhe seus meses, compare receitas e despesas, visualize categorias e mantenha seus investimentos separados das despesas do dia a dia.</p>
              </div>
              <div className="grid gap-3">
                {["Receitas e despesas por mês", "Investimentos acompanhados separadamente", "Contas fixas e parcelamentos organizados", "Categorias personalizáveis", "Metas para seus próximos objetivos"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm">
                    <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(16,185,129,.7)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/10 px-6 py-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,.14),transparent_55%)]" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Comece a organizar sua vida financeira.</h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Crie sua conta e tenha uma visão mais clara do seu dinheiro.</p>
              <Button size="lg" className="mt-8 h-12 px-8" onClick={() => setLocation("/login")}>Criar minha conta <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-4 py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground md:flex-row">
          <span>Controle Financeiro</span>
          <span>Organize. Entenda. Planeje.</span>
        </div>
      </footer>
    </main>
  );
}
