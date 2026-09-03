# Autoria verificável — Maturidade

**LEVEL:** M3 — TESTED
**VERSION:** 0.3.2
**LAST REVIEWED:** 2026-09-03
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
- Worker de matriz e exportação aquecida: 9/9 testes locais;
- geração visual S2 no iPad físico: responsiva, porém lenta (~1,5 s por quadro);
- geração visual S3 no iPad físico: PENDING;
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

Executar o emissor S3 no iPad certificado e medir cadência, pausa, descarte por edição e reabertura offline antes de construir a câmera receptora.

## Gate físico S1 recusado — 2026-09-02

No iPad certificado, os números avançaram, mas o QR engasgou e os comandos `Próximo` e `Anterior` responderam com atraso. Isso separa o gargalo: Worker e agenda continuaram vivos; o desenho da matriz bloqueou a thread da interface.

Correção S2:

- hash completo retirado de cada quadro e preservado uma vez na carga final;
- fragmento reduzido de 96 para 72 caracteres;
- quadro representativo reduzido de aproximadamente 191 para 102 caracteres;
- rotação ampliada de 700 para 1.800 ms;
- 40 ms de respiro visual antes do cálculo da matriz;
- chamada redundante a `clear()` removida.

## Gate físico S2 parcial — 2026-09-03

O S2 deixou de engasgar, mas levou aproximadamente 1,5 segundo por quadro. A correção tornou o fluxo utilizável, porém não atingiu a cadência desejada. O gargalo restante é o cálculo da matriz QR no fluxo visual.

Correção S3 candidata:

- pacote e primeira matriz começam a ser preparados depois do selo, antes do pedido;
- qrcode.js calcula a matriz dentro do Worker, sem DOM;
- a interface recebe apenas linhas binárias e faz um único preenchimento de Canvas;
- somente quadro anterior, atual e próximo podem permanecer aquecidos;
- rotação-alvo de 1.000 ms;
- `Guardar cópia` reaproveita o pacote já verificado e codificado;
- qualquer edição descarta o preparo obsoleto.

S3 permanece PENDING até o teste físico. S1 e S2 não contam como transporte aprovado.

## Promotion candidate

M4 — ADVERSARIAL somente após o gate físico e uma banca que ataque conteúdo, sequência, relógio e replay.
