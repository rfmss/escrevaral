# Prompt para colar no Astra — auditoria de cache/offline do produto

```
## Sua vez — auditoria de cache/offline do produto (pré-cápsulas)

Leia `docs/tarefas/2026-09-13-cache-offline-produto.md` na branch
`supervisao/cache-offline-produto` do repo escrevaral (encore): ela é a sua tarefa
completa, com PIN, cenários e regras. `git fetch && git log -1 origin/supervisao/cache-offline-produto`.

Objeto: repo escrevaral, branch main, commit pinado 816ca7ea… (estado publicado,
escrevaral.com). NÃO use a árvore local do dono (/home/rafamass/projetos/escrevaral) —
está 1545 commits atrás com mudanças não commitadas; conciliação é decisão do dono.

Rode em ambiente limpo: `python3 -m http.server` + chromium/playwright, seguindo o
doc. Prefira `scripts/auditor-mesa-portatil.py`; nunca edite o produto. Simule a nova
versão em branch de teste: ASSET_VERSION 20260913-<slug> + CACHE_NAME v972, tags ?v=
coerentes, e valide os 5 cenários (população, recarga, nova versão/prune,
sem rede, dados locais intactos).

Aplique docs/11 (regra-mãe). Persista parecer + evidência em commit/doc (estado
verdadeiro é o persistido), termine com próxima ação concreta, e emita parecer de bump:
**sim/não + argumento** com o valor exato recomendado. NÃO push, NÃO merge, NÃO tocar
main — o dono decide e ordena.
```