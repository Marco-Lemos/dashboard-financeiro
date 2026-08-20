// Categorias padrão que toda conta nova recebe automaticamente (semeadas no banco
// na primeira vez que o usuário carrega a página de categorias) — depois disso são
// linhas normais, editáveis e removíveis como qualquer categoria customizada.
export interface DefaultCategory {
  name: string;
  type: "receita" | "despesa" | "investimento";
  color: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Alimentação", type: "despesa", color: "#2563EB" },
  { name: "Entretenimento", type: "despesa", color: "#7C3AED" },
  { name: "Contas", type: "despesa", color: "#059669" },
  { name: "Saúde", type: "despesa", color: "#DC2626" },
  { name: "Transporte", type: "despesa", color: "#0891B2" },
  { name: "Carro", type: "despesa", color: "#F59E0B" },
  { name: "Educação", type: "despesa", color: "#EA580C" },
  { name: "Outros", type: "despesa", color: "#6B7280" },
  { name: "Salário", type: "receita", color: "#2563EB" },
  { name: "Freelance", type: "receita", color: "#2563EB" },
  { name: "Outros", type: "receita", color: "#2563EB" },
  { name: "BTC", type: "investimento", color: "#F7931A" },
  { name: "Ações", type: "investimento", color: "#00AA44" },
  { name: "Terreno", type: "investimento", color: "#8B4513" },
  { name: "Imóvel", type: "investimento", color: "#D4A574" },
];
