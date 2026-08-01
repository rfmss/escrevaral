# Plano vivo — Mass Notes Next

Atualizado em: 2026-08-01

## Norte do produto

Construir uma oficina de escrita para português brasileiro sobre infraestrutura consolidada, preservando identidade editorial, processamento local, controle integral dos dados e decisão autoral.

O objetivo não é apenas portar o Escrevaral antigo: é demonstrar, por corpus, proveniência, comparação reproduzível e avaliação humana, que as engines novas preservam o útil e superam o legado em contexto, explicabilidade e segurança.

## Fundação atual

- React, TypeScript, Vite e Tiptap/ProseMirror;
- JSON estrutural, IndexedDB, autosave, recuperação e conflitos;
- engines locais por adaptadores tipados;
- snapshot vivo do Tiptap para análises acionadas pela interface;
- Revisão inline e Palavras/Léxico somente de leitura;
- Espelho de Voz, Contexto, RimaLab e Morfologia verbal integrados;
- exportação TXT, Markdown e HTML;
- cópia nativa versionada;
- biblioteca consultável e metadados editoriais editáveis;
- importador auditável do `.esc` legado;
- verniz visual Escrevaral sobre o Blueprint sem alterar a geometria;
- preview isolada e PR rascunho `#155`.

## Gates e auditoria concluídos

- Gates 1 a 13;
- Gate 10.5 — fronteiras de distribuição;
- M0.9 — auditoria integrada, não funcional e decisões de P2;
- primeira tranche contextual de M1.0;
- inventário quantitativo E2;
- Pack Verbal E2-V v1;
- avaliação adversarial separada do infinitivo pessoal.

Estado de referência:

- Chromium e Firefox obrigatórios;
- matriz integral: **176 cenários por navegador, 352 execuções**;
- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- Gate 14 suspenso.

## Milestone atual — M1.0: Engines superiores ao Escrevaral legado

Fonte operacional:

- `M1_0_ENGINES_SUPERIORES.md`.

Contrato global:

- `../../docs/product/MASS_NOTES_ENGINES_SUPERIORES.md`.

### Definição de vitória

Superioridade exige simultaneamente:

1. preservação de manuscrito, metadados e revisão;
2. processamento local e nenhuma transmissão autoral;
3. melhor acerto contextual que consulta isolada por palavra;
4. ambiguidade e indeterminação honestas;
5. explicação útil em português brasileiro;
6. cobertura inventariada e auditável;
7. utilidade editorial humana;
8. convivência segura entre engines;
9. desempenho aceitável sem transformar CI em SLA;
10. nenhuma substituição automática.

## Estado das frentes

### E0 — baseline e corpus

Estado: **concluída**.

- corpus morfossintático inicial;
- falhas medidas antes da correção;
- Chromium e Firefox;
- comparação reproduzível com o comportamento legado.

### E1 — léxico e sintaxe contextual

Estado: **primeira tranche estabilizada; fase aberta**.

Entregue:

- locuções temporais;
- decisões sensíveis a diacrítico;
- particípio, adjetivo, substantivo e forma verbal em fronteiras registradas;
- controles negativos;
- explicação da evidência usada;
- nenhuma mutação do manuscrito.

Pendente:

- ordem marcada;
- oralidade e regionalismos;
- relações oracionais mais amplas;
- superfície sintático-morfológica integrada.

### E2 — profundidade lexical auditável

Estado: **inventário concluído; integridade em execução**.

Cobertura efetiva:

- 1.343 entradas de sinônimos;
- 936 definições efetivas;
- 175 regras de polissemia;
- 606 entradas contextuais;
- 2.045 formas regulares brutas no presente.

Dívidas prioritárias:

1. 68 conflitos editoriais de definições;
2. oito autorreferências de sinônimos;
3. quatro aliases numéricos expostos;
4. `leitor_modelo` vazio;
5. 124 regras de polissemia sem cartão explícito.

Regra: não expandir volume antes de estabilizar integridade.

### E2-V — morfologia verbal

Estado: **Pack v1 estabilizado; primeira família verificada**.

Entregue:

- engine verbal própria e tipada;
- 34 casos de desenvolvimento;
- conjunto adversarial separado com 24 casos em sete fenômenos;
- auditoria de fontes, escopo, divergências, licença e separação dos corpora;
- métricas VP, VN, FP, FN, precisão, recall e acurácia.

#### Infinitivo pessoal

Estado: **fechado no escopo contratado**.

- 12 casos por navegador;
- oito positivos e quatro negativos por navegador;
- Chromium `12/12`;
- Firefox `12/12`;
- total `24/24`;
- precisão, recall e acurácia de 100%;
- caso `É melhor sairmos agora` aprovado nos dois navegadores;
- matriz integral `352/352`;
- cinco fontes bibliográficas registradas;
- estado `verified` em `docs/linguistics/verb-provenance.json`.

Cabeça funcional: `0e5177d5c801a4a9b8833af35baa059af486f6c4`.  
Banca: `30718951198`.  
Matriz: `30718951187`.

Limites:

- o conjunto não representa todo o português brasileiro;
- variação regional, registro, gênero textual e frequência permanecem sem estratificação;
- não há banca humana independente;
- as demais famílias verbais continuam `pending` ou `partial`.

### E3 — qualidade humana das engines

Estado: **planejada**.

- corpora de prosa, poesia, diálogo, ensaio, oralidade e regionalismos;
- falsos positivos e negativos por engine;
- comparação lado a lado com legado;
- avaliação humana de correção, especificidade, clareza, utilidade, respeito autoral e adequação brasileira;
- média mínima 4,0 e nenhuma engine abaixo de 3,5.

### E4 — veredito de substituição

Estado: **bloqueado**.

Responder:

1. o produto novo iguala a cobertura útil do legado?
2. supera o legado em contexto e segurança?
3. quais promessas antigas devem ser aposentadas em vez de copiadas?
4. pode substituir integralmente o Escrevaral antigo?

## Próximo gate operacional — auditoria formal de paridade

### Objetivo

Transformar a comparação informal entre o Escrevaral antigo e o Mass Notes em uma matriz versionada e verificável, sem implementar novas funções no mesmo lote.

### Classificações permitidas

Cada capacidade deve receber uma destas classificações:

- `presente`;
- `superior`;
- `parcial`;
- `ausente`;
- `aposentada`;
- `bloqueadora para beta`;
- `bloqueadora para substituição`.

### Escopo mínimo

1. editor, preservação, recuperação e biblioteca;
2. Revisão, Voz, Rimas, Léxico, Contexto e Morfologia;
3. Sintaxe e estrutura oracional;
4. Vocabulário Decolonizador;
5. modos e guias de ofício;
6. Prova de Autoria;
7. exportação e cópia de segurança;
8. PWA, instalação e uso offline;
9. Anatomia do Livro;
10. Ateliê, Prática e Leituras;
11. mobile, teclado, foco e tecnologias assistivas;
12. privacidade, rede e decisão autoral.

### Entrega

- documento de paridade com fonte legada e evidência Mass Notes por linha;
- separação entre requisito de beta e requisito de substituição;
- lista explícita de promessas aposentadas;
- lista de bloqueadores reais;
- nenhum código de produto alterado;
- parecer Eva sobre lacunas linguísticas;
- matriz integral preservada.

### Critério de saída

A auditoria termina quando for possível responder sem ambiguidade:

- o que já está melhor;
- o que está apenas equivalente;
- o que falta;
- o que não será portado;
- o que bloqueia beta;
- o que bloqueia substituir o legado.

## Sequência aprovada após a paridade

1. fechar bloqueadores documentais da auditoria;
2. retomar integridade lexical em lotes pequenos;
3. fundamentar e avaliar as famílias E2-V restantes;
4. abrir Sintaxe v1 com corpus separado desde o primeiro caso;
5. executar E3 humana;
6. produzir E4;
7. somente então deliberar Gate 14.

## Dívidas de release fora do M1.0 linguístico

Continuam ativas:

- PWA/offline próprio;
- `page-flip` local;
- Prova de Autoria ou aposentadoria formal;
- DOCX, RTF, ePub e Obsidian conforme decisão de paridade;
- zoom real, leitor de tela, tecnologias assistivas e dispositivos físicos;
- uso prolongado em hardware real.

M1.0 não apaga nem reclassifica essas dívidas.

## Governança

- PR permanece em rascunho;
- `main`, aplicação pública e service worker público permanecem intactos;
- preview nunca recebe edição direta;
- cada correção linguística exige baseline e caso reproduzível;
- toda regra nova recebe casos positivos e negativos;
- corpus de desenvolvimento e avaliação permanecem separados;
- engines acionadas pela interface usam o snapshot vivo do Tiptap;
- motores e bases legadas permanecem baseline enquanto a camada nova demonstra ganhos;
- CI completa após código e novamente após documentação final;
- SHA exato e workflows são registrados no PR sem commit autorreferente;
- Gate 14 não é executado.

## Próxima ação autorizada

1. validar a cabeça documental do fechamento E2-V;
2. registrar SHA, workflows e artefatos no PR;
3. criar a auditoria formal de paridade;
4. não alterar engines durante a auditoria;
5. não ampliar vocabulário;
6. não abrir Sintaxe ainda;
7. manter Gate 14 suspenso.
