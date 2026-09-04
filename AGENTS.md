# AGENTS.md — Escrevaral-Encore

Regras permanentes para qualquer agente/IA que trabalhar nesta pasta.

## Diretrizes de supervisão (obrigatório)

Antes de qualquer trabalho substancial, leia e aplique:
[`docs/11-sistema-supervisao-cognitiva.md`](docs/11-sistema-supervisao-cognitiva.md)

Regra-mãe em ação aqui: **determinar se algo precisa ser melhorado ou colocado no mundo.** Priorize a menor arquitetura que resolve o problema e termine análises com próxima ação concreta.

## Contexto do projeto

- **Escrevaral-Encore**: carteira de originais verificáveis com uma oficina de escrita dentro. O dispositivo de certificação é o iPad MD531GP/A com iOS 9.3.5 (13G36). Android KitKat está adiado e não sustenta alegação atual de compatibilidade.
- Comece pelo [`docs/index.md`](docs/index.md) — documento-mestre por seção.
- **ANTES de portar/importar engines de projetos antigos, leia [`catalogo/index.md`](catalogo/index.md)**: inventário das 5 fontes e mapa de decisão por domínio. Regra: escolher a versão mais madura por domínio; reuso de comportamento, não cópia bruta de bases duplicadas.
- Código em `src/` (ES5). Morfologia verbal (`src/core/engines/morphology.js`) está em M4; os demais níveis devem ser lidos nos respectivos `MATURITY.md`.
- Maturidade por engine em `knowledge/<domínio>/MATURITY.md` (modelo M0–M7). Níveis não podem ser pulados; sem evidência → NO PROMOTION.
- Conversas NÃO são memória institucional; o estado verdadeiro é o persistido no repo.

## Convenção técnica-alvo (ao construir código)

- ES5 puro, sem framework/bundler/`import`-`export` quando o alvo for browser legado.
- Uma oficina por vez: arquivos podem ficar no cache em disco, mas somente a cápsula selecionada entra na RAM.
- Contrato local de engine: `check(snapshot, callback)`; o contexto pertence a `snapshot.context`. Callback não implica cálculo assíncrono: o isolamento da interface é responsabilidade do Worker.
- Offline-first: todos os recursos precisam entrar no cache no primeiro acesso. Cache em disco não autoriza carregamento antecipado na RAM.
- A interface mostra um achado por vez. Enquanto as engines não tiverem cursor próprio, isso não significa que o cálculo parou no primeiro achado.

## Modo de trabalho

- Padrão para arquitetura, implementação e revisão: `gpt-5.6-sol`, esforço `high`.
- Usar `xhigh` apenas em criptografia, certificação de autoria ou revisão arquitetural de alto impacto.
- Trabalho mecânico e localizado pode usar `medium`, desde que não reabra decisões estruturais.
