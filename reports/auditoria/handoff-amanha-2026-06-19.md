# Handoff para 2026-06-19

## Estado final

- `main`/`origin/main`: `66d84d6`.
- Produto: `v794`, assets `20260618-v794`.
- Auditor de dados: `P0=0 P1=4 P2=0`.
- Publicação/offline: `P0=0 P1=0 P2=5`.
- Privacidade/rede: `P0=0 P1=1 P2=5`.
- Visual/navegação: `P0=0 P1=20 P2=80`.
- Pilares: verde.

## Fechado hoje

- Morfologia dos casos `larga`, `estreito` e `a/a` validada em produção.
- RimaLab com índice normalizado para chaves acentuadas.
- Decolonial sem falso positivo amplo em `normal`.
- `Plano` acessível no mobile pelo botão `Mais`.
- Cronograma mobile sem o `Out` escapando lateralmente.
- Auditor de dados rebaixou colisão `estreito/estreita` para P1 mitigado.

## Abertos reais

- P1 visuais listados em `reports/auditoria/navegacao-visual-2026-06-18.md`.
- P1 de privacidade: CSP ausente.
- Edge de Cloudflare/SW: confirmar se `/service-worker.js` sem query segue alinhado ao asset atual.

## Comandos padrão

```bash
git fetch origin --tags
git status --short
python3 scripts/auditor-dados.py
python3 scripts/auditor-publicacao.py
python3 scripts/auditor-privacidade-rede.py
python3 scripts/auditor-navegacao-visual.py
python3 scripts/auditoria-pilares.py
```

## Probes manuais essenciais

```text
A mesa larga caiu. -> larga = Adjective
O caminho estreito acabou. -> estreito = Adjective
Entreguei a carta a Maria. -> primeiro a = Determiner; segundo a = Preposition
```

## Apresentação curta

Escrevaral é uma oficina literária offline para escritoras e escritores brasileiros: um caderno de escrita no navegador, sem cadastro, com revisão em português, rima, métrica, sintaxe colorida, prova de autoria e planejamento, sem enviar o texto para servidor de terceiros.
