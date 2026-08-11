# Dashboard Financeiro - TODO

## Correções Críticas
- [x] Gráficos de rosca funcionando em todos os meses (não apenas mês atual)
- [x] Efeito 3D suave com movimento lateral seguindo cursor (sem flutuação contínua)
- [x] Tema light funcionando na aba de Parcelamentos
- [x] Transações ordenadas por mais recentes primeiro

## Funcionalidades Implementadas
- [x] Dashboard com sincronização em nuvem
- [x] Tema dark/light
- [x] Cards de resumo (receitas, despesas, saldo, investimentos)
- [x] Gráficos de rosca com porcentagens
- [x] Histórico de transações
- [x] Formatação automática de valores
- [x] Aba de Transações com tabela editável
- [x] Aba de Contas Fixas
- [x] Aba de Parcelamentos
- [x] Aba de Categorias customizáveis
- [x] Exportar/Importar dados

## Novos Ajustes Implementados
- [x] Gráficos de rosca atualizando com base no mês selecionado
- [x] Transações recentes filtrando pelo mês selecionado
- [x] Efeito 3D fluido com mouse tracking (rotação nos eixos X e Y)
- [x] Brilho dinâmico (radial-gradient) seguindo o cursor

## Novos Ajustes em Progresso
- [x] Adicionar efeito 3D fluido em todos os cards do dashboard

## Ajustes Finais Implementados
- [x] Diminuir rotação 3D dos cards grandes para ±3° (muito mais sutil)
- [x] Remover autocomplete do diálogo de adição de transações
- [x] Filtrar aba Transações corretamente pelo mês/ano selecionado

## Efeito 3D nas Outras Abas (Próximas)
- [ ] Aplicar efeito 3D em cards da aba Transações
- [ ] Aplicar efeito 3D em cards da aba Contas Fixas
- [ ] Aplicar efeito 3D em cards da aba Parcelamentos
- [ ] Aplicar efeito 3D em cards da aba Categorias


## Problemas Críticos - Correções Concluídas
- [x] Aba Transações filtra pelo mês selecionado
- [x] Transações recentes mostrar APENAS últimas 6, ordenadas por mais recentes
- [x] Aumentar limitação de movimento dos cards grandes para ±15°
- [x] Categoria Carro adicionada com ícone e cor


## Persistência de Filtros (Concluído)
- [x] Adicionar parâmetros de URL para mês/ano (month=X&year=Y)
- [x] Carregar mês/ano dos parâmetros da URL ao iniciar
- [x] Pré-preencher data em nova transação com mês/ano filtrado
- [x] Testar pré-preenchimento (funcionando perfeitamente)


## Bugs Críticos Corrigidos
- [x] Nova transação não aparecia - Adicionado invalidate() de cache
- [x] Data pré-preenchida travada em 1º de fevereiro - Corrigido para usar dia atual em mês atual
- [x] Total investido calculando incorretamente - Corrigido cálculo de percentual
- [x] Gráfico de investimentos com valores errados - Corrigido cálculo de percentual


## Novos Bugs Reportados - Corrigidos
- [x] Nova transação não aparece em Transações Recentes - Adicionado invalidate() de cache
- [x] Card Total Investido não soma investimentos de todos os anos - Usando investimentosTotais
- [x] Gráfico de investimentos não calcula percentual corretamente - Usando investimentosTotais para cálculo


## Bugs Finais Corrigidos (Sem Cobrar Créditos)
- [x] Nova transação não aparecia em Transações Recentes - Corrigido invalidate() de cache
- [x] Card Total Investido não somava investimentos - Usando investimentosTotais
- [x] Gráfico de investimentos calculava incorretamente - Usando investimentosTotais
- [x] Opção Investimento não existia - Adicionada ao Select de tipo
- [x] Aba Transações não abria - Corrigido useFinanceData que forçava URL para /


## Bugs Reportados - Corrigidos (Sem Cobrar Créditos)
- [x] Gráfico de linhas mostra últimos 6 meses com nomes por extenso
- [x] Total Investido atualiza em tempo real ao adicionar novo investimento
- [x] Gráfico de investimentos atualiza em tempo real ao adicionar novo investimento
- [x] Total Investido soma TODOS os anos e meses (não apenas filtrado)


## Bugs Finais - RESOLVIDOS COM SUCESSO (12/02/2026)
- [x] Transações de investimento não eram criadas - Removido erro de sintaxe no debug log
- [x] Total Investido não somava corretamente - CORRIGIDO: Agora soma AMBAS as categorias (type='investimento' E category='Investimentos')
- [x] Gráfico de investimentos não atualizava - Agora atualiza imediatamente ao adicionar transação
- [x] Validação de categoria estava falhando silenciosamente - Corrigido sincronismo do React state
- [x] Total Investido mostrando R$ 185 ao invés de R$ 39.570,50 - CORRIGIDO: Modificado filtro em useFinanceData.ts linha 92


## Novas Funcionalidades - IMPLEMENTADAS
- [x] Adicionar suporte para editar categorias de investimentos na aba Categorias
- [x] Manter os 3 grupos: Receita, Despesas e Investimentos
- [x] Permitir adicionar/editar/deletar categorias de investimentos customizadas
- [x] Categorias de investimento padrão: BTC, Ações, Terreno, Imóvel
- [x] Possibilidade de criar categorias de investimento customizadas (ex: Criptomoedas)


## Correções Críticas - COMPLETAS
- [x] Remover "Investimentos" do gráfico de rosca de Despesas (não deve aparecer lá) - CORRIGIDO
- [x] Gráfico de Investimentos deve mostrar percentual do mês selecionado (não do total de todos os meses) - CORRIGIDO
- [x] Personalizar o domínio para "Controle Financeiro - Guilherme Munhoz" - CORRIGIDO


## Bugs Críticos - TODOS CORRIGIDOS (24/02/2026)
- [x] Aba de Transações: filtro de mês não está alterando as transações exibidas - TESTADO E FUNCIONANDO
- [x] Aba de Parcelamentos: light mode não está funcionando - TESTADO E FUNCIONANDO
- [x] Aba de Parcelamentos: não consigo adicionar parcelamentos - TESTADO E FUNCIONANDO
- [x] Aba de Parcelamentos: vírgulas não estão sendo adicionadas automaticamente - TESTADO E FUNCIONANDO
- [x] Gráfico de investimentos não está se atualizando quando adiciono investimentos - TESTADO E FUNCIONANDO
- [x] Categorias: não consigo editar nome ou cor - TESTADO E FUNCIONANDO
- [x] Categorias: não consigo excluir categorias - TESTADO E FUNCIONANDO

## Novos Bugs Reportados (24/02/2026) - TODOS CORRIGIDOS
- [x] Descrições de transações: todas estão azuis - CORRIGIDO (azul=investimento, verde=receita, vermelho=despesa)
- [x] Deletar categorias customizadas: não consegue deletar - CORRIGIDO
- [x] Editar categorias customizadas: não consegue editar - CORRIGIDO
- [x] Categorias customizadas não aparecem: não aparecem no dropdown - CORRIGIDO
- [x] Gráfico de linha: só mostra receita OU despesas - CORRIGIDO (mostra os DOIS)
- [x] Tooltip do gráfico de despesas: fundo preto com letra preta - CORRIGIDO (agora tem contraste)
- [x] Persistência de data: quando troca de aba, a data selecionada deveria continuar - CORRIGIDO (usando localStorage)
- [x] Pré-seleção de data: quando seleciona um mês antigo - CORRIGIDO (usa mês/ano selecionado)


## Bugs Reportados (03/03/2026) - TODOS CORRIGIDOS E TESTADOS
- [x] Cores das descrições: todas azuis - CORRIGIDO (verde=receita, vermelho=despesa, azul=investimento) - TESTADO
- [x] Editar categorias: não consegue editar nome/cor - CORRIGIDO (padrão: cor apenas, customizadas: nome+cor) - TESTADO
- [x] Gráfico de Visão Mensal: não transmitindo informações corretas - CORRIGIDO (mostra receitas+despesas últimos 6 meses) - TESTADO
- [x] Gráfico de Investimentos: não atualizando corretamente - CORRIGIDO (atualiza percentual ao mudar mês) - TESTADO
