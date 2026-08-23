# M1 — Retrato comparativo e QA de usabilidade da lateral direita

Data local: 2026-07-29

## Escopo

Este registro reúne:

1. um retrato honesto do Escrevaral legado em comparação com o Mass Notes Next;
2. o início de uma banca de QA de uso, além das provas funcionais já existentes;
3. a reprodução e a correção da rolagem da lateral direita;
4. as fronteiras que ainda impedem uma afirmação de superioridade global ou substituição integral.

## Retrato comparativo

| Dimensão | Escrevaral legado | Mass Notes Next | Veredito atual |
| --- | --- | --- | --- |
| Fundação de edição | Produto maduro e amplo, mas apoiado em engines e dados legados com contratos globais e menor isolamento. | React, TypeScript, Vite e Tiptap/ProseMirror; JSON estrutural como fonte autoral. | **Novo à frente** em arquitetura e auditabilidade. |
| Persistência | Possui mecanismos legados de arquivo e backup. | IndexedDB, revisão condicional, autosave, recuperação emergencial, conflitos explícitos e cópia nativa. | **Novo à frente** em segurança de estado e prova de conflito. |
| Integração linguística | Muitas capacidades, historicamente distribuídas em superfícies e scripts diferentes. | Revisão, Voz, Contexto, RimaLab e Palavras convivem na mesma página por adaptadores tipados. | **Novo à frente** em integração. |
| Segurança autoral | A documentação antiga não constitui prova reproduzível suficiente para cada fronteira. | Processamento local, ausência de transmissão autoral comprovada e nenhuma substituição automática. | **Novo à frente** nas provas atuais. |
| Contexto morfossintático | Baseline reproduzida em 8/14 casos críticos. | 14/14 na baseline e 16/16 no corpus integrado v1.1, com controles negativos diretos. | **Novo à frente** nas fronteiras versionadas. |
| Sinônimos | Aproximadamente 1.350 entradas declaradas. | 1.343 entradas efetivamente carregadas e 7.766 alternativas brutas. | **Próximo**, sem superioridade quantitativa declarada. |
| Definições | 1.020+ declaradas historicamente. | 936 efetivas a partir de 1.011 declarações; colisões silenciosas foram inventariadas. | **Legado ainda à frente em volume declarado**; qualidade está em revisão. |
| Polissemia | 110+ casos declarados. | 175 regras efetivas, mas somente 55 cartões explícitos de alternativas. | **Novo à frente em regras medidas**, ainda incompleto na explicação editorial. |
| Contexto/decolonial | 600+ entradas declaradas. | 606 entradas efetivas em nove categorias. | **Cobertura equivalente ou ligeiramente superior**, qualidade humana ainda pendente. |
| Morfologia regular | 2.045 formas declaradas. | 2.045 formas brutas, 2.028 normalizadas; bancada integrada autônoma ainda pendente. | **Empate de inventário**, sem veredito global. |
| QA automatizado | Não há uma matriz equivalente versionada que sustente as promessas históricas. | Chromium e Firefox obrigatórios; nesta cabeça, 147 cenários por navegador e 294 execuções. | **Novo à frente** em evidência reproduzível. |
| Maturidade de release | Produto antigo permanece a referência pública funcional. | Preview experimental; PR em rascunho; lançamento público e substituição continuam `NO-SHIP`. | **Legado à frente em maturidade de produção**. |

## Síntese honesta

O Mass Notes Next já supera o legado nas capacidades efetivamente provadas de arquitetura, preservação autoral, integração, conflito de estado, contexto morfossintático versionado e auditabilidade.

Ainda não existe autorização para afirmar superioridade global porque:

- a cobertura efetiva de definições é menor que a declaração histórica;
- restam 68 conflitos editoriais de definição;
- autorreferências, aliases técnicos e lacunas de polissemia precisam ser tratados;
- a avaliação humana comparativa das cinco engines ainda não foi concluída;
- o veredito E4 e os gates de lançamento permanecem abertos.

## Por que abrir uma tranche de QA agora

A matriz anterior verificava:

- seis larguras;
- ausência de overflow horizontal bloqueador;
- abertura e fechamento dos drawers;
- legibilidade, contraste e estados de controles;
- funcionamento equivalente em Chromium e Firefox.

Ela não verificava a rolagem interna da lateral direita por diferentes meios de entrada. Uma captura de 1440 px mostrava conteúdo abaixo da dobra sem demonstrar que a região era alcançável.

## Banca criada

Arquivo:

- `tests/m1-usability-right-rail.spec.ts`.

Cenários, em Chromium e Firefox:

1. desktop baixo em `1440 × 560`;
2. drawer móvel em `390 × 640`.

Cada cenário verifica:

- altura útil do contêiner;
- existência de overflow vertical real;
- rolagem por roda do mouse;
- foco por teclado;
- tecla `End` chegando ao fim;
- último controle visível na janela.

## Baseline do defeito

Cabeça:

- `8cd43c0c29d4e80c6aee7f0bf9e652778d9998da`.

Workflow Mass Notes:

- `30509028818`.

Resultado:

- 290 testes anteriores passaram;
- quatro provas novas falharam;
- publicação foi bloqueada corretamente.

Achados:

- no desktop, `scrollHeight` e `clientHeight` eram iguais e maiores que a janela; o conteúdo crescia para fora do grid e era cortado pelo `overflow: hidden` da aplicação;
- no móvel, a rolagem por ponteiro funcionava, mas `.rail-scroll` não era focável e não aceitava navegação por teclado;
- a falha ocorreu igualmente em Chromium e Firefox.

## Primeira correção e resultado

Cabeça:

- `9382803949e9125142f89b7e3b47cbb03c7453c7`.

Mudanças:

- `.rail-scroll` recebeu flex, overflow vertical explícito, contenção de overscroll e scrollbar estável;
- a região passou a receber `tabIndex=0` e nome acessível.

Resultado:

- os dois cenários móveis passaram;
- os dois cenários desktop continuaram falhando;
- diagnóstico refinado: limitar apenas o filho não bastava porque o próprio rail ainda participava do tamanho mínimo da grade.

## Correção final

Cabeça funcional:

- `3ae8e02ecc0a5ba4132011aaca1a88700145f50b`.

Mudanças finais:

- em desktop acima de 1040 px, `.rail` passou a ter altura e altura máxima de `100vh` e `overflow: hidden`;
- `.rail-scroll` ocupa somente o espaço restante e concentra a rolagem;
- a região é focável, possui nome acessível e aceita roda, toque e teclado;
- scrollbar recebeu trilho e indicador visíveis sem alterar o manuscrito.

## Evidência funcional

- Mass Notes `30509828651`: auditoria E2, build, **294/294**, publicação, cache e smoke público aprovados;
- Argila `30509828653`: aprovada;
- coerência `30509828634`: aprovada;
- artefato `mass-notes-tiptap-30509828651`;
- digest `sha256:9b576c83188309352617f5a704d9d9cbea16b3091bc67c143c1c905952351b01`.

## Classificação do achado

- severidade: **P1 de usabilidade e acessibilidade**;
- perda de dados: não;
- mutação autoral: não;
- bloqueio de controles: sim, em alturas desktop reduzidas;
- impacto móvel: acesso por ponteiro disponível, acesso por teclado ausente;
- regressão linguística: nenhuma.

## Próximos detalhes de QA

1. legibilidade e densidade dos sete tabs em rails estreitos;
2. indicação visual de que cada rail possui rolagem independente;
3. retenção ou reinício deliberado da posição ao trocar de tab;
4. navegação completa somente por teclado entre tabs, conteúdo e fechamento;
5. uso com conteúdo longo nas cinco engines;
6. revisão humana da hierarquia, rótulos e previsibilidade dos controles;
7. dispositivos físicos e tecnologias assistivas continuam pendentes e não podem ser alegados como aprovados.

## Fronteira de release

Este QA melhora a candidata experimental e a preview, mas não altera os vereditos:

- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- PR permanece em rascunho;
- `main` e Gate 14 permanecem intactos.
