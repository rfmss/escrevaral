# E2-V — banca vermelha Eva Chara 01

Data: 2026-07-30  
PR: #155, aberto e em rascunho  
Head avaliada: `2319773bb01cc532386af3f3910371f8a3355aee`  
Workflow Mass Notes: `30582685099`

## C — Cenário

A correção da infraestrutura da banca removeu o `ReferenceError` causado por uma função externa usada dentro de `locator.evaluate`. A matriz passou a alcançar o julgamento linguístico real.

Resultado: **344/350**. As seis falhas são três fronteiras determinísticas, repetidas em Chromium e Firefox:

1. `Para cantarmos juntos...` não apresenta a análise de infinitivo pessoal;
2. `Ela vai cantar...` não apresenta a locução de futuro perifrástico;
3. `A mulher sábia...` ainda apresenta um sinal verbal indeterminado.

A publicação foi bloqueada corretamente.

## L — Limite e impacto

- O infinitivo pessoal possui suporte morfológico, mas não recebe a mesma evidência contextual que o infinitivo impessoal após preposição.
- O verbo principal de uma locução está sendo ranqueado com o sujeito externo; isso pode reter formas pessoais e eliminar o infinitivo governado pelo auxiliar.
- O inventário irregular legado é normalizado sem diacríticos. Depois que o contexto rejeita os candidatos de `sabia`, o fallback de forma registrada ainda ressuscita `sábia` como verbo indeterminado.

Esses limites afetam precisão, sobregeração e cooperação entre morfologia e leitura lexical.

## A — Parecer Eva Chara

> A cobertura não deve crescer enquanto uma preposição, um auxiliar e um diacrítico ainda mudam indevidamente a classe apresentada. Corrijam a evidência e a governança da análise; não adicionem verbos, timeouts ou exceções lexicais.

Mudanças autorizadas:

1. tratar `infinitivo pessoal` como forma introduzível por preposição no resolvedor contextual;
2. analisar o verbo principal da locução com contexto local de governo do auxiliar;
3. distinguir registro irregular exato de coincidência apenas sem diacríticos e só permitir fallback seguro quando a forma registrada for exata.

## R — Contratos protegidos

- `sabia` continua reconhecida como forma de `saber` em contexto verbal;
- `sábia` não exibe cartão verbal em contexto adjetivo;
- `vai cantar` exibe locução verbal, futuro perifrástico e valor prospectivo;
- `cantarmos` após `para` exibe infinitivo pessoal, 1ª pessoa do plural;
- corpora, expectativas e timeouts permanecem inalterados;
- nenhum texto do manuscrito é substituído;
- matriz integral de 350 execuções obrigatória.

## O — Em aberto

Mesmo com a correção, o Pack Verbal não obtém excelência automática. Continuam pendentes expansão adversarial, proveniência por regra, métricas por fenômeno e validação humana independente.
