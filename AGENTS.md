# AGENTS.md — Escrevaral-Encore

Regras permanentes para qualquer agente/IA que trabalhar nesta pasta.

## Diretrizes de supervisão (obrigatório)

Antes de qualquer trabalho substancial, leia e aplique:
[`docs/11-sistema-supervisao-cognitiva.md`](docs/11-sistema-supervisao-cognitiva.md)

Regra-mãe em ação aqui: **determinar se algo precisa ser melhorado ou colocado no mundo.** Priorize a menor arquitetura que resolve o problema e termine análises com próxima ação concreta.

## Contexto do projeto

- **Escrevaral-Encore**: nova encarnação da linhagem de escrita (Vereda → Uairer → Escrevaral → Mass Notes → Antigravity). Offline, democrática (iPad 2012/iOS 9 + Android 4/KitKat), baixa RAM, future-proof, visual "Standard Notes + IA writing".
- Comece pelo [`docs/index.md`](docs/index.md) — documento-mestre por seção.
- **ANTES de portar/importar engines de projetos antigos, leia [`catalogo/index.md`](catalogo/index.md)**: inventário das 5 fontes e mapa de decisão por domínio. Regra: escolher a versão mais madura por domínio; reuso de comportamento, não cópia bruta de bases duplicadas.
- Código em `src/` (ES5). Primeira engine: morfologia verbal (`src/core/engines/morphology.js`), M3, seed 11 formas.
- Maturidade por engine em `knowledge/<domínio>/MATURITY.md` (modelo M0–M7). Níveis não podem ser pulados; sem evidência → NO PROMOTION.
- Conversas NÃO são memória institucional; o estado verdadeiro é o persistido no repo.

## Convenção técnica-alvo (ao construir código)

- ES5 puro, sem framework/bundler/`import`-`export` quando o alvo for browser legado.
- Um engine por vez (roletagem ao acionar a análise) — baixa RAM.
- Contrato de engine: `check(snapshot, context, callback) → findings[]` (ver docs/03).
- Offline-first: tudo o que for carregar, prever 1º acesso.
