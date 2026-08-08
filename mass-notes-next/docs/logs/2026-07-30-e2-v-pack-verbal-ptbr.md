# E2-V — Pack Verbal PT-BR

Data: 2026-07-30  
PR: `#155`, aberto e em rascunho  
Branch: `experiment/mass-notes-tiptap`  
Estado inicial: **aprovado para implementação; baseline precisa voltar ao verde antes da feature**

## C — Cenário

O suplemento de `varrê-lo-ei` provou que a interface consegue explicar tempo, colocação pronominal, formação e grafia sem substituir o manuscrito. A nova observação mostrou que o produto ainda classifica formas como `carregá-lo-ia` de maneira genérica ou incorreta.

O piloto atual reconhece uma única string normalizada. Ele não constitui uma engine verbal geral.

## L — Limite e impacto

Sem uma camada verbal sistemática, a área Palavras:

- confunde tempos verbais;
- não analisa paradigmas regulares;
- não resolve pessoa e número;
- não separa próclise, ênclise e mesóclise;
- não explica ajustes ortográficos;
- depende de a engine lexical devolver um verbete;
- não trata locuções, tempos compostos, voz e aspecto;
- pode analisar a ocorrência errada quando a mesma forma aparece mais de uma vez.

Isso impede usar a leitura verbal como evidência forte na banca comparativa E3.

## A — Arquitetura aprovada

Criar uma engine verbal local, tipada e independente em `src/engines/verbMorphology/`.

Contratos:

- regras para paradigmas regulares;
- léxico irregular explícito e auditável;
- parser de clíticos;
- ortografia separada;
- construções compostas e locuções;
- resolução contextual pela ocorrência selecionada;
- ambiguidades apresentadas, nunca apagadas;
- nenhuma rede em runtime;
- nenhuma alteração automática do manuscrito;
- nenhuma preferência ou análise gravada no JSON autoral.

A leitura verbal deve rodar em paralelo à leitura lexical. Uma resposta verbal válida pode aparecer mesmo que não exista verbete lexical.

## Tranches

1. **B0 — baseline verde:** estabilizar provas do dock e da persistência sem reduzir critérios.
2. **V0 — contrato e corpus:** tipos, inventário, controles negativos e banca vermelha.
3. **V1 — formas simples regulares:** indicativo, subjuntivo, imperativo e formas nominais.
4. **V2 — clíticos e ortografia:** próclise, ênclise, mesóclise e transformações de `o/a`.
5. **V3 — irregulares frequentes:** dados explícitos, versionados e auditáveis.
6. **V4 — locuções:** tempos compostos, futuro perifrástico, progressivo e voz passiva.
7. **V5 — contexto exato:** usar seleção, janela local e evidências para resolver ambiguidades.
8. **V6 — integração e acessibilidade:** cartão genérico, estados, alternativas e não regressões.
9. **V7 — fechamento CLARO:** cobertura medida, limitações, workflows e artefato.

## Guardrails

- não editar `main`;
- não executar Gate 14;
- não promover preview vermelha;
- não transformar o suplemento em lista de exceções;
- não alterar `lexical-engine.js` durante a construção do pack;
- não misturar os 68 conflitos de definições com esta intervenção;
- não adicionar retries ou aumentar timeouts sem diagnóstico;
- manter breadcrumbs aditivos de tentativas rejeitadas;
- interromper quando a próxima mudança depender de hipótese ainda não provada.

## Definição de pronto

O pack só será fechado quando:

- `varrê-lo-ei` e `carregá-lo-ia` forem casos da mesma arquitetura;
- a cobertura regular for gerada por regras;
- irregularidades forem dados auditáveis;
- formas simples, clíticos e locuções tiverem corpus positivo e negativo;
- ambiguidades forem explicitadas;
- a ocorrência selecionada governar o contexto;
- o editor e seu HTML permanecerem intactos;
- não houver chamadas de rede;
- Chromium, Firefox, publicação, cache, smoke, Argila e coerência estiverem verdes;
- o PR permanecer em rascunho.
