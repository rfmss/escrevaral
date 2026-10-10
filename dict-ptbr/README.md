# dict-ptbr

Fase 0: contrato e prova sintética, ainda sem aceite nos aparelhos-alvo.
Leia primeiro [PLAN.md](../PLAN.md) inteiro, depois [SPEC.md](SPEC.md).
As decisões de 09/10/2026 em SPEC prevalecem sobre opções abertas no plano.

O subprojeto é independente do editor Escrevaral: não importa seu léxico,
não modifica a montagem e não está integrado ao site. Não iniciar a Fase 1
nem mesclar na main sem autorização explícita de Rafael.

Na raiz do repositório:

```sh
node dict-ptbr/build/fixture.cjs
node dict-ptbr/tests/contract.cjs
node dict-ptbr/tests/browser.cjs
python3 dict-ptbr/tests/serve.py
```

Abra `http://127.0.0.1:8765/demo/index.html` para a consulta exata de `café`.
A página contém apenas dados sintéticos. `demo/offline.html` é um ensaio
separado de AppCache, não uma instalação homologada.
Veja [protocolo de aparelhos](tests/DEVICES.md) e
[relatório da fase](../docs/dict-ptbr/FASE-0.md).
