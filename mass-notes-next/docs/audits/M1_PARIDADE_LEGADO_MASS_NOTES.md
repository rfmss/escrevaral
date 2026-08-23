# M1 — Auditoria de paridade: Escrevaral legado × Mass Notes

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado: **primeira versão documental; nenhuma funcionalidade implementada neste lote**

Fonte tabular: `M1_PARIDADE_LEGADO_MASS_NOTES.csv`.

> **Eva Chara, entre em banca.**

## C — Cenário observado

O Mass Notes possui uma fundação técnica mais segura que o editor legado e já expõe os principais motores de leitura. Isso não significa que possa substituir o Escrevaral 1.0.0.

A documentação antiga mistura três espécies de promessa:

1. capacidades centrais de escrita e preservação;
2. engines linguísticas e suas superfícies;
3. recursos de ecossistema, como PWA, Prova de Autoria, formatos e áreas da oficina.

A documentação nova, por sua vez, evoluiu rapidamente por gates e corpora, mas ainda não possuía uma matriz única que separasse:

- equivalência;
- superioridade;
- ausência deliberada;
- dívida técnica;
- requisito de beta online;
- requisito de substituição integral.

Sem essa separação, havia risco de abrir Sintaxe, copiar telas antigas ou executar Gate 14 antes de decidir o que realmente precisa existir.

## L — Limites

Esta auditoria é documental e estática.

Ela usa como fontes principais do legado:

- `README.md`;
- `ARCHITECTURE.md`;
- `docs/release/RELEASE_NOTES_1.0.0.md`;
- `META_ENGINES_100.md`;
- `index.html`;
- engines e controllers citados por capacidade.

Para o Mass Notes, usa:

- `mass-notes-next/README.md`;
- `mass-notes-next/docs/M1_0_ENGINES_SUPERIORES.md`;
- `mass-notes-next/docs/PLAN.md`;
- `mass-notes-next/docs/personas/EVA_CHARA_SCORECARD.md`;
- `mass-notes-next/docs/linguistics/verb-provenance.json`;
- componentes, engines e testes citados na planilha.

A existência de arquivo, botão ou teste não comprova utilidade humana. A ausência de equivalente nominal também não prova que a tarefa antiga precise ser portada. As decisões finais sobre aposentadoria exigem deliberação de produto.

## A — Arquitetura da comparação

Cada linha recebe:

- capacidade ou promessa;
- comportamento do legado;
- comportamento do Mass Notes;
- fonte de cada lado;
- classificação principal;
- impacto na beta online;
- impacto na substituição integral;
- menor decisão seguinte.

Classificações:

- `superior` — a fundação nova oferece comportamento demonstravelmente mais seguro ou auditável;
- `presente` — existe capacidade correspondente, ainda sem prova qualitativa suficiente para superioridade;
- `parcial` — existe núcleo funcional, mas falta cobertura, experiência ou contrato relevante;
- `ausente` — a capacidade não está aprovada na nova fundação;
- `aposentada` — só poderá ser usada após decisão explícita; nenhuma linha recebeu esse estado ainda.

## R — Resultado

### Distribuição das 23 capacidades

| Classificação | Quantidade |
|---|---:|
| Superior | 6 |
| Presente | 5 |
| Parcial | 7 |
| Ausente | 5 |
| Aposentada formalmente | 0 |

### Onde o Mass Notes já é superior

1. **Editor estrutural:** Tiptap/ProseMirror e JSON autoral substituem o editor artesanal sem fragmentar o documento.
2. **Persistência:** IndexedDB, autosave, envelope emergencial e revisão explícita.
3. **Conflitos:** versões concorrentes são preservadas, não conciliadas silenciosamente.
4. **Biblioteca:** filtros, tags, favoritos, ordenação e metadados participam da mesma persistência.
5. **Importação e cópia nativa:** formatos distintos, validação integral e nenhuma substituição automática.
6. **Privacidade e autoria da decisão:** engines locais, testes de rede e ausência de aplicação automática.

Esses ganhos justificam manter a fundação Mass Notes. Não existe razão técnica para voltar ao editor legado.

### Onde existe núcleo funcional, mas ainda falta prova de superioridade

- Revisão;
- Espelho de Voz;
- RimaLab;
- mobile, drawers e rolagem;
- identidade visual e tema.

As três engines precisam de E3 humana e comparação lado a lado. Mobile e identidade precisam de uso real, mas não bloqueiam a continuidade técnica.

### Paridades incompletas

#### Léxico e polissemia

A cobertura bruta está próxima do legado, porém há 68 conflitos editoriais de definições, autorreferências, aliases técnicos e cartões ausentes. A expansão está bloqueada até a integridade mínima.

#### Contexto e Vocabulário Decolonizador

Os dados e a análise existem, mas a equivalência entre a aba Contexto e a superfície de Vocabulário Decolonizador não foi demonstrada. É necessário decidir se a experiência antiga será portada, integrada ou aposentada.

#### Morfologia verbal

A arquitetura nova é mais auditável e o infinitivo pessoal está verificado dentro de seu escopo. Ainda faltam proveniência e avaliação completas para paradigmas regulares, irregulares, clíticos, compostos, homógrafos, defectivos e particípios duplos.

#### Modos e guias de ofício

O modo concentração existe, mas os modos e guias editoriais antigos não possuem inventário de equivalência. Cada guia deve ser avaliado por tarefa, não por nostalgia de interface.

#### Exportação

TXT, Markdown, HTML e cópia nativa estão aprovados. DOCX, RTF, ePub, Obsidian e escopo múltiplo não estão. A paridade depende de necessidade real, não da quantidade de formatos do legado.

#### Anatomia do Livro

A integração funciona, mas `page-flip@2.0.7` continua remoto. Isso impede prometer autonomia offline integral.

#### Tecnologias assistivas

Há automação de foco, teclado, drawers e layout equivalente a zoom. Leitor de tela, zoom real, dispositivos físicos e uso prolongado permanecem sem validação humana.

### Capacidades ausentes

1. **Sintaxe oracional ampla.**
2. **Prova de Autoria.**
3. **Exportação editorial em escopo múltiplo.**
4. **PWA própria do Mass Notes.**
5. **Equivalentes aprovados de Ateliê, Prática e Leituras.**

Nenhuma dessas ausências autoriza implementação automática. Antes, cada uma precisa ser marcada como:

- portar;
- integrar a outra superfície;
- adiar;
- aposentar formalmente.

## Beta online e substituição são gates diferentes

### Beta online

A auditoria não encontrou uma ausência de paridade que, isoladamente, impeça uma beta **online e explicitamente limitada**.

Condições mínimas ainda necessárias:

- não prometer PWA ou autonomia offline;
- não prometer Prova de Autoria;
- não prometer sintaxe ampla;
- declarar os três formatos editoriais disponíveis;
- limitar a promessa de Morfologia ao que possui evidência;
- decidir como apresentar Palavras enquanto a integridade lexical está aberta;
- realizar QA humano básico de acessibilidade e uso prolongado;
- manter `main` e Gate 14 bloqueados até deliberação própria.

Portanto, a paridade não transforma automaticamente `NO-SHIP` em `SHIP`. Ela mostra que uma beta online pode ser definida por escopo, enquanto o lançamento substitutivo não pode.

### Substituição integral

A substituição do Escrevaral antigo continua bloqueada por decisões ou entregas em:

- integridade lexical;
- equivalência de Contexto/Decolonial;
- cobertura morfológica restante;
- Sintaxe;
- modos e guias;
- Prova de Autoria ou aposentadoria formal;
- formatos de exportação ou aposentadoria formal;
- PWA e offline;
- autonomia offline da Anatomia;
- destino de Ateliê, Prática e Leituras;
- validação humana das engines e acessibilidade.

## Parecer Eva

### Acertos

- a auditoria não confunde volume legado com qualidade;
- separa capacidade linguística de superfície de produto;
- reconhece o ganho real da fundação nova;
- não transforma ausência em obrigação automática de port;
- preserva a pessoa autora como decisora;
- mantém a nota de Morfologia abaixo de 8,0 e Validação humana crítica.

### Riscos

- chamar uma aba nova de equivalente sem comparar saídas;
- portar engines ou telas para preencher tabela;
- usar a beta online para ocultar a perda da promessa offline;
- aposentar Prova de Autoria ou áreas da oficina sem decisão pública;
- abrir Sintaxe antes de definir o corpus e o contrato `indeterminado`.

### Decisão

`PROSSEGUIR COM CONDIÇÕES`.

- prosseguir para a deliberação de destino das capacidades parciais e ausentes;
- não implementar múltiplas capacidades no mesmo lote;
- não elevar notas linguísticas por esta auditoria documental;
- não abrir Gate 14;
- não promover para `main`.

## O — O que permanece aberto

A matriz precisa de uma segunda rodada com decisão humana para cada capacidade parcial ou ausente. O próximo documento deve transformar cada uma em uma das quatro decisões:

1. `PORTAR`;
2. `INTEGRAR`;
3. `ADIAR`;
4. `APOSENTAR`.

A ordem sugerida de deliberação é:

1. promessa de beta online;
2. integridade de Palavras;
3. Contexto/Decolonial;
4. Prova de Autoria;
5. PWA/offline;
6. exportações;
7. modos e guias;
8. Ateliê, Prática e Leituras;
9. Sintaxe v1;
10. E3 humana.

Depois dessa decisão, cada capacidade escolhida recebe tranche própria, CLARO próprio, testes próprios e matriz integral.
