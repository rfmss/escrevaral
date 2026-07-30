# M1 E2 — Inventário lexical e integridade das bases

Data: 2026-07-29

## Objetivo

Medir as bases linguísticas reais antes de qualquer expansão lexical e transformar divergências históricas em achados reproduzíveis.

Nenhuma regra linguística, definição, sinônimo ou dado de runtime foi alterado nesta tranche.

## Implementação da medição

Foram criados:

- `scripts/audit-lexical-inventory.mjs`;
- `scripts/audit-definition-duplicates.mjs`;
- comando `npm run audit:lexicon`;
- etapa obrigatória `Inventariar bases linguísticas do E2` na CI;
- retenção dos quatro relatórios gerados no artefato da workflow.

O auditor executa as estruturas reais de `lexical-engine.js` e `synonym-data.js` em ambiente isolado e combina o resultado com as bases JSON. A medição distingue declarações brutas, chaves efetivas e itens únicos após normalização.

## Primeira cabeça de medição

Cabeça:

`a326a8026109bee417880c1486dff686267c0766`

Workflow Mass Notes:

`30502779282`

Resultado da auditoria:

- 1.343 entradas efetivas de sinônimos;
- 936 definições efetivas;
- 175 regras de polissemia;
- 606 entradas contextuais;
- 2.045 formas regulares brutas no presente;
- uma família P0, duas P1 e três P2 de achados mecânicos.

A auditoria e o build passaram. A matriz terminou 287/288 porque um teste antigo do Gate 9 expirou após oito segundos aguardando a persistência direta no IndexedDB no Firefox. A falha ocorreu no caso HTML e não tocou código ou comportamento linguístico.

## Classificação das definições repetidas

Cabeça:

`d55940cf9a2b1d0a789ba3dabc919eb664816885`

Workflow Mass Notes:

`30503599280`

A segunda auditoria preservou linha, redação descartada e redação retida de cada ocorrência.

Resultado:

- 1.011 declarações brutas;
- 936 chaves efetivas;
- 69 grupos repetidos;
- 75 declarações sobrescritas;
- um grupo idêntico: `quica`;
- zero grupos apenas equivalentes após normalização;
- 68 grupos conflitantes.

A auditoria e o build passaram novamente. A matriz terminou 287/288 pelo mesmo helper de persistência, agora no caso TXT. A migração da falha entre dois casos que compartilham `waitPersistedText`, sem qualquer alteração em persistência ou exportação, confirmou instabilidade temporal da prova e não regressão funcional.

## Estabilização do teste antigo

Em `tests/gate9-export.spec.ts`, a prova continua:

- lendo o documento diretamente do IndexedDB;
- exigindo o ID ativo correto;
- exigindo que `plainText` contenha a frase esperada;
- mantendo os testes independentes de HTML, Markdown e TXT.

A única alteração foi ampliar a janela de convergência de oito para vinte segundos e definir intervalos explícitos de consulta. Nenhuma asserção foi removida e nenhum resultado de produto foi relaxado.

## Inventário efetivo

| Área | Histórico | Efetivo |
|---|---:|---:|
| Sinônimos | ~1.350 | 1.343 |
| Definições | 1.020+ | 936 |
| Polissemia | 110+ | 175 |
| Contexto | 600+ | 606 |
| Verbos regulares no presente | 2.045 | 2.045 brutos / 2.028 normalizados |
| RimaLab enciclopédia | 50 | 50 |
| RimaLab `grammarWords` | 348 | 407 |

Cobertura adicional:

- 7.766 alternativas brutas de sinônimos;
- 7.763 pares direcionados normalizados;
- 527 entradas completas no léxico editorial local;
- 95 locuções brutas, 94 normalizadas;
- 2.000 formas verbais irregulares brutas, 1.936 normalizadas;
- 1.685 alternativas contextuais.

## Achados

### P0 — colisão de definições

Sessenta e oito das 69 chaves repetidas têm textos diferentes. O JavaScript retém apenas a última definição, ocultando 75 declarações anteriores. Esses itens não contam como cobertura disponível.

### P1 — autorreferência e aliases

- oito sinônimos retornam à própria entrada após normalização;
- quatro aliases numéricos aparecem como verbetes efetivos.

### P2 — qualidade e transparência

- `leitor_modelo` está vazio;
- quatro definições efetivas compartilham texto com outra chave;
- 124 regras de polissemia não possuem cartão explícito de alternativas.

## Decisão

- E2 quantitativo está aberto com baseline reproduzível;
- não ampliar listas antes de tratar integridade;
- não remover conflitos em massa sem revisão editorial;
- consolidar primeiro lotes pequenos, preservando ou combinando a melhor redação;
- criar teste para cada verbete corrigido;
- separar alias ortográfico de sinônimo editorial;
- manter superioridade global não comprovada.

## Evidência versionada

- `docs/audits/M1_E2_LEXICAL_INVENTORY.json`;
- `docs/audits/M1_E2_LEXICAL_INVENTORY.md`;
- relatórios completos gerados por `npm run audit:lexicon`;
- artefatos das workflows Mass Notes.

## Governança

- PR `#155` permanece aberto e em rascunho;
- `main` e produto público permanecem intactos;
- branch de preview não recebeu edição direta;
- Gate 14 não foi iniciado;
- nenhuma promoção ou substituição foi autorizada.
