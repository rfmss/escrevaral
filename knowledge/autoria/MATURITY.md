# Autoria verificável — Maturidade

**LEVEL:** M3 — TESTED
**VERSION:** 0.2.1
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
- gate físico no iPad MD531GP/A, iOS 9.3.5: PARTIAL;
- geração do pacote chegou à tela no aparelho;
- cópia por `execCommand` falhou e o Safari não ofereceu `Selecionar tudo`.

## Runtime

- SHA-256 local, sem CDN;
- debounce de 1.100 ms;
- uma cápsula Worker por selo;
- Worker descartado após resposta;
- pacote persistido em `localStorage` somente no experimento;
- exportação/importação no Worker;
- cópia de recuperação fica em compartimento `localStorage` separado da folha;
- arquivo baixável somente quando o navegador realmente oferece o caminho moderno;
- transporte para fora do iPad 2012: PENDING;
- custo e pico de memória no aparelho: UNKNOWN.

## Limites

- M3 comprova testes locais, não robustez forense;
- hora civil é declarada pelo aparelho;
- não há assinatura nem testemunha independente;
- `localStorage` não é o armazenamento final da carteira;
- a cópia separada prova recuperação local, não portabilidade entre aparelhos;
- copiar/colar foi recusado como transporte primário no Safari do iOS 9;
- segurança adversarial permanece UNKNOWN.

## Highest-value gap

Executar o gate físico da cópia separada no iPad: guardar, recomeçar, trazer e recuperar a mesma raiz em modo avião.

## Promotion candidate

M4 — ADVERSARIAL somente após o gate físico e uma banca que ataque conteúdo, sequência, relógio e replay.
