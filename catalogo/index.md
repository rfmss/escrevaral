# Catálogo Unificado de Engines — Escrevaral-Encore

Inventário de TODAS as engines linguísticas existentes nas 5 bases-fonte, sem copiar código.
Objetivo: enxergar o que existe, onde, e com qual maturidade, **antes** de decidir o que entra no Encore.

## Fontes inventariadas (01-ago-2026)

| Fonte | Caminho | Estilo | Estado |
|---|---|---|---|
| **A. escrevaral (main)** | `/home/rafamass/projetos/escrevaral/` | JS (engines grandes, dados hardcoded + JSON) | Engines 100% (v1061) |
| **B. escrevaral-mass-notes** | `/home/rafamass/projetos/escrevaral-mass-notes/` | TypeScript (adapters bridge) + TS nativo (verbMorphology) | M1.0, SHIP COM CONDIÇÕES |
| **C. antigravity** | `/home/rafamass/Área de trabalho/2027/escrevaral-antigravity-starter/` | **ES5 canônico** (linguistic-core, máquinas, 15 domínios M0–M7) | Léxico/Morf/Sint = M6 |
| **D. uai.rer** | `/home/rafamass/projetos/uai.rer/` | Pacote `@uairer/ptbr-engine` (portátil, 4 engines) | 71 testes/0 falhas |
| **E. eskrev** | `/home/rafamass/projetos/eskrev/` | JS vanilla (verificação normativa) + dicionário 360k | Alto (CI, PWA) |

## Arquivo por fonte (inventários detalhados)
- [fonte-A-escrevaral.md](fonte-A-escrevaral.md)
- [fonte-B-mass-notes.md](fonte-B-mass-notes.md)
- [fonte-C-antigravity.md](fonte-C-antigravity.md)
- [fonte-D-uairer.md](fonte-D-uairer.md)
- [fonte-E-eskrev.md](fonte-E-eskrev.md)
- [por-domínio.md](por-dominio.md) — mapa cruzado: cada domínio → onde está mais maduro

## Fato mais importante (leitura obrigatória)

**Há DUPLICAÇÃO massiva entre as fontes:** cada uma tem sua própria versão de sintaxe, léxico, pontuação, morfologia, rima, etc. O Encore NÃO deve copiar tudo — deve escolher a versão **mais madura por domínio** e portá-la para ES5. Ver [por-domínio.md](por-dominio.md) para o mapa de decisão.
