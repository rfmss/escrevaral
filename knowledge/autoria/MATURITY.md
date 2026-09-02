# Autoria verificável — Maturidade

**LEVEL:** M3 — TESTED
**VERSION:** 0.2.0
**LAST REVIEWED:** 2026-09-02
**STEWARD:** ainda não nomeado

## Mission

Criar prova privada de integridade e continuidade com baixa RAM, sem registrar o conteúdo no rastro comportamental.

## Quality

- vetores SHA-256 conhecidos: 3/3;
- protocolo de autoria e pacote: 20/20;
- texto adulterado: rejeitado;
- evento adulterado: rejeitado;
- elo adulterado: rejeitado;
- sintaxe ES5 dos serviços e scripts: verificada localmente;
- gate físico no iPad MD531GP/A, iOS 9.3.5: PENDING.

## Runtime

- SHA-256 local, sem CDN;
- debounce de 1.100 ms;
- uma cápsula Worker por selo;
- Worker descartado após resposta;
- pacote persistido em `localStorage` somente no experimento;
- exportação/importação no Worker; transferência por arquivo moderno ou copiar/colar legado;
- custo e pico de memória no aparelho: UNKNOWN.

## Limites

- M3 comprova testes locais, não robustez forense;
- hora civil é declarada pelo aparelho;
- não há assinatura nem testemunha independente;
- `localStorage` não é o armazenamento final da carteira;
- segurança adversarial permanece UNKNOWN.

## Highest-value gap

Executar o gate físico de integridade, continuidade e pacote no iPad certificado, inclusive reabertura offline, exportação/importação e alteração deliberada.

## Promotion candidate

M4 — ADVERSARIAL somente após o gate físico e uma banca que ataque conteúdo, sequência, relógio e replay.
