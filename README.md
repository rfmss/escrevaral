# Escrevaral-Encore

Carteira de originais verificáveis com uma oficina de escrita dentro. O patrimônio da linhagem Vereda → Uairer → Escrevaral → Mass Notes → Antigravity é reconstruído em ES5, offline e com baixa RAM.

## Conteúdo

- `docs/` — documento-mestre em uma seção por arquivo (PT-BR). Comece pelo [docs/index.md](docs/index.md).
- `src/` — código ES5 do produto (represa de engines + runtime + editor).
- `knowledge/` — maturidade/SPEC por engine (modelo M0–M7).

## Estado

- Dispositivo de certificação: iPad MD531GP/A, iOS 9.3.5 (13G36). Android KitKat está adiado.
- Morfologia verbal (VERB-MORPH): ES5, M4, com gate físico 29/29 no iPad certificado.
- A página não carrega todas as engines na abertura. Cada oficina entra em um Worker próprio, mostra um achado por vez e sai da RAM ao trocar a lente ou editar o texto.
- Rode toda a regressão local com `node src/test/run-all.js`.
- A prova no browser deve ser servida por HTTP(S); Workers não são uma garantia em `file://`.

## Pilares

Editor sem IA · Texto no aparelho · Processo registrado · Anterioridade verificável · Oficina PT-BR · Um recurso por vez.
