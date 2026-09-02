# Autoria verificável — Maturidade

**LEVEL:** M3 — TESTED
**VERSION:** 0.3.1
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
- gate físico no iPad MD531GP/A, iOS 9.3.5: PASSED para recuperação local;
- `CÓPIA GUARDADA -> Recomeçar -> Trazer cópia guardada -> IMPORTADO`: confirmado no aparelho;
- texto e raiz recuperados sem seleção manual;
- repetição offline: confirmada pelo autor;
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
- protocolo de fragmentação e remontagem S2: 18/18 testes locais;
- geração visual de QR no iPad físico: PENDING;
- recepção física por outro aparelho: NOT IMPLEMENTED;
- custo e pico de memória no aparelho: UNKNOWN.

## Limites

- M3 comprova testes locais, não robustez forense;
- hora civil é declarada pelo aparelho;
- não há assinatura nem testemunha independente;
- `localStorage` não é o armazenamento final da carteira;
- a cópia separada prova recuperação local, não portabilidade entre aparelhos;
- copiar/colar foi recusado como transporte primário no Safari do iOS 9;
- os QR desta versão não são criptografados e expõem fragmentos reconstruíveis a quem os escanear;
- testes do protocolo não comprovam leitura óptica pela câmera;
- segurança adversarial permanece UNKNOWN.

## Highest-value gap

Executar o emissor QR no iPad certificado e medir rotação, pausa, descarte e reabertura offline antes de construir a câmera receptora.

## Gate físico S1 recusado — 2026-09-02

No iPad certificado, os números avançaram, mas o QR engasgou e os comandos `Próximo` e `Anterior` responderam com atraso. Isso separa o gargalo: Worker e agenda continuaram vivos; o desenho da matriz bloqueou a thread da interface.

Correção S2:

- hash completo retirado de cada quadro e preservado uma vez na carga final;
- fragmento reduzido de 96 para 72 caracteres;
- quadro representativo reduzido de aproximadamente 191 para 102 caracteres;
- rotação ampliada de 700 para 1.800 ms;
- 40 ms de respiro visual antes do cálculo da matriz;
- chamada redundante a `clear()` removida.

O S2 continua PENDING até o novo teste físico. O S1 não conta como capacidade aprovada.

## Promotion candidate

M4 — ADVERSARIAL somente após o gate físico e uma banca que ataque conteúdo, sequência, relógio e replay.
