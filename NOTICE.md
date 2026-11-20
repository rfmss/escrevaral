# Atribuições e avisos — Escrevaral (base ES5 + Academia ES6/ES7)

Todo o código da aplicação principal neste repositório (`src/`, `ptbr/`, `packages/cofre/`) foi escrito exclusivamente para o Escrevaral em HTML5 + JavaScript **ES5 estrito**, sem dependências de runtime de terceiros (sem React, Lexical, Electron ou módulos Standard Notes).

## Bases linguísticas, ícones e referências incorporadas

- **OpenWordNet-PT (OWN-PT):** CC-BY-SA 4.0 — utilizado no cofre linguístico (`resources/pt-BR/own-pt/lexico.js`) e nos grupos de sinônimos do pacote P01 (`resources/pt-BR/lexico-ptbr/`).
- **PortiLexicon-UD:** Copyright (c) 2023 Lucelene Lopes, MIT License — utilizado em `resources/pt-BR/portilexicon/flexoes.js`, nas sugestões de rimas do assistente de Soneto e nas formas do pacote P01.
- **MorphoBr & Wikcionário em português (recorte P01):** CC-BY-SA 4.0 / GPL-3.0 — conforme origem e auditoria registradas em `resources/pt-BR/lexico-ptbr/FONTES.md` e `resources/pt-BR/lexico-ptbr/manifesto.json`.
- **Phosphor Icons:** MIT License (Copyright (c) 2023 Phosphor Icons) — vetores SVG incorporados no template HTML.
- **Courier Prime:** SIL Open Font License 1.1 (ver `src/ui/styles/tipografia.css` e `THIRD_PARTY.md`).
- **Modelo Redação do Enem — referência oficial:** reprodução integral autorizada com citação da fonte (*INEP/MEC, A redação do Enem 2024: cartilha do(a) participante*, texto de Amanda Teixeira Zampiris) e logotipo oficial `assets/study/enem-logo.png`.
- **StPageFlip 2.0.7 (`academia/vendor/page-flip.browser.js`):** MIT License (ver `academia/vendor/LICENSE`), adaptado para compatibilidade ES6/ES7 (`ecmaVersion: 2016`).
- **Academia e Literatura Mundial (`academia/`):** guias autorais offline e acervo histórico composto por obras em domínio público e citações curtas devidamente atribuídas.
