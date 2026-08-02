from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MASS_NOTES = ROOT / "mass-notes-next"

ALGURES = (
    "Advérbio de lugar: 'em algum lugar', 'em alguma parte'. "
    "Indica um lugar que não se sabe ou não se quer nomear diretamente; "
    "em sentido estrito, refere-se ao espaço, não ao tempo."
)
OUTRORA = (
    "Advérbio de tempo: 'noutro tempo', 'antigamente', 'em tempos passados'. "
    "Situa algo em período anterior, sem exigir data precisa; "
    "pode produzir tom retrospectivo ou historicizante."
)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f"Reposição insegura em {label}: esperado 1, encontrado {count}: {old[:90]}"
        )
    return text.replace(old, new)


lexical = ROOT / "lexical-engine.js"
source = lexical.read_text(encoding="utf-8")
source = replace_once(
    source,
    "    \"algures\":      \"Advérbio de lugar: 'em algum lugar', 'em alguma parte'. Literário; mais raro que 'em algum lugar' no uso corrente.\",",
    f'    "algures":      "{ALGURES}",',
    "algures inicial",
)
source = replace_once(
    source,
    "    \"outrora\":      \"Advérbio de tempo: 'em outro tempo', 'antigamente', 'antes'. Literário; mais comum que 'antanho' e ainda funcional na ficção histórica.\",",
    f'    "outrora":      "{OUTRORA}",',
    "outrora inicial",
)
source = replace_once(
    source,
    "    \"algures\":      \"Advérbio de lugar: 'em algum lugar indefinido'. Literário; mais preciso que 'em algum lugar' quando a indeterminação é o efeito.\",",
    "    // algures consolidado acima; conflito editorial fechado em docs/logs/2026-08-01-m1-e2-algures-outrora.md",
    "algures sobrescrito",
)
source = replace_once(
    source,
    "    \"outrora\":      \"Advérbio temporal literário: 'em outro tempo', 'antes', 'antigamente'. Útil em ficção histórica e narrativas de memória.\",",
    "    // outrora consolidado acima; conflito editorial fechado em docs/logs/2026-08-01-m1-e2-algures-outrora.md",
    "outrora sobrescrito",
)
lexical.write_text(source, encoding="utf-8")

old_version = "20260801-lexical-quica-dedup-v1"
new_version = "20260801-lexical-algures-outrora-v1"

index = ROOT / "index.html"
index_text = index.read_text(encoding="utf-8")
if old_version not in index_text:
    raise SystemExit("Versão anterior ausente em index.html")
index.write_text(index_text.replace(old_version, new_version), encoding="utf-8")

worker = ROOT / "service-worker.js"
worker_text = worker.read_text(encoding="utf-8")
worker_text = replace_once(
    worker_text,
    'const CACHE_NAME = "vereda-offline-v970";',
    'const CACHE_NAME = "vereda-offline-v971";',
    "cache público",
)
if old_version not in worker_text:
    raise SystemExit("Versão anterior ausente no service worker")
worker.write_text(worker_text.replace(old_version, new_version), encoding="utf-8")

tests = MASS_NOTES / "tests"
(tests / "m1-e2-algures-outrora-source.spec.ts").write_text(
    f'''import {{ readFileSync }} from 'node:fs'
import {{ expect, test }} from '@playwright/test'

const SOURCE = new URL('../../lexical-engine.js', import.meta.url)

const CASES = [
  {{ key: 'algures', definition: {ALGURES!r} }},
  {{ key: 'outrora', definition: {OUTRORA!r} }},
] as const

for (const lexicalCase of CASES) {{
  test(`E2 mantém uma única declaração ativa de ${{lexicalCase.key}}`, () => {{
    const content = readFileSync(SOURCE, 'utf8')
    const declarations = content
      .split('\\n')
      .filter((line) => line.trimStart().startsWith(`"${{lexicalCase.key}}":`))

    expect(declarations, SOURCE.pathname).toHaveLength(1)
    expect(declarations[0]).toContain(JSON.stringify(lexicalCase.definition))
  }})
}}
'''.replace("'Advérbio", '"Advérbio').replace("tempo.' }", 'tempo." }').replace("historicizante.' }", 'historicizante." }'),
    encoding="utf-8",
)

(tests / "m1-e2-algures-outrora-regression.spec.ts").write_text(
    f'''import {{ expect, test, type Page }} from '@playwright/test'

const CASES = [
  {{
    key: 'algures',
    manuscript: 'A carta estava algures entre os papéis.',
    definition: {ALGURES!r},
  }},
  {{
    key: 'outrora',
    manuscript: 'Outrora, a estação recebia trens todas as manhãs.',
    definition: {OUTRORA!r},
  }},
] as const

async function waitReady(page: Page) {{
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
}}

async function openWords(page: Page) {{
  const opener = page.getByRole('button', {{ name: 'Abrir ferramentas' }})
  if (await opener.isVisible()) await opener.click()
  await page.getByRole('tab', {{ name: 'palavras', exact: true }}).click()
  await expect(page.locator('#panel-palavras')).toBeVisible()
}}

for (const lexicalCase of CASES) {{
  test(`E2 apresenta a definição consolidada de ${{lexicalCase.key}} sem alterar o manuscrito`, async ({{ page }}) => {{
    await waitReady(page)
    const editor = page.getByLabel('Texto do documento')
    await editor.fill(lexicalCase.manuscript)
    const before = await editor.evaluate((element) => element.innerHTML)

    await openWords(page)
    await page.getByLabel('Palavra ou expressão curta').fill(lexicalCase.key)
    await page.getByRole('button', {{ name: 'Consultar' }}).click()

    await expect(page.getByRole('status')).toContainText(/leitura lexical concluída/i)
    const reading = page.locator('.lexical-reading')
    await expect(reading).toBeVisible()
    await expect(reading.locator('.lexical-definition')).toHaveText(lexicalCase.definition)
    await expect(page.getByRole('button', {{ name: /substituir|trocar|aplicar/i }})).toHaveCount(0)
    expect(await editor.evaluate((element) => element.innerHTML)).toBe(before)
  }})
}}
'''.replace("'Advérbio", '"Advérbio').replace("tempo.',", 'tempo.",').replace("historicizante.',", 'historicizante.",'),
    encoding="utf-8",
)

logs = MASS_NOTES / "docs" / "logs"
logs.mkdir(parents=True, exist_ok=True)
(logs / "2026-08-01-m1-e2-algures-outrora.md").write_text(
    f'''# M1 E2 — consolidação editorial de `algures` e `outrora`

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado: **banca específica verde; matriz integral oficial pendente**

> **Eva Chara, entre em banca.**

## C — Cenário observado

A auditoria registrava 68 grupos conflitantes. O primeiro par editorial coerente era formado por dois advérbios de localização:

- `algures`: duas redações concorrentes sobre lugar indefinido;
- `outrora`: duas redações concorrentes sobre tempo passado.

A semântica do objeto JavaScript fazia a última declaração sobrescrever a primeira. A redação descartada ficava invisível no produto e as duas versões misturavam definição lexical com afirmações editoriais não demonstradas.

Baseline:

- 1.010 declarações brutas;
- 936 chaves efetivas;
- 68 grupos repetidos;
- 74 declarações sobrescritas;
- zero grupos idênticos;
- 68 grupos conflitantes.

## L — Limite

O lote consolida somente `algures` e `outrora`. Não altera os outros 66 conflitos, sinônimos, aliases, polissemia, regras contextuais, interface, `main` ou Gate 14.

## A — Fundamentação e ação mínima

### `algures`

As fontes lexicográficas convergem em dois pontos: é advérbio de lugar e designa algum lugar, especialmente um lugar não sabido ou não nomeado diretamente. A orientação espacial foi preservada porque consultas linguísticas registram como não estrito o emprego temporal em construções como “algures no ano”.

> {ALGURES}

### `outrora`

As fontes convergem em `noutro tempo`, `antigamente` e `em tempos passados`. Foram retiradas as restrições artificiais a ficção histórica e narrativas de memória. A nota sobre efeito retrospectivo ou historicizante é orientação editorial do Escrevaral, não ampliação do significado lexical.

> {OUTRORA}

Fontes consultadas e parafraseadas:

- Caldas Aulete, verbetes `algures` e `outrora`;
- Michaelis, verbete `outrora`;
- Priberam, verbetes `algures` e `outrora`;
- Infopédia, verbetes `algures` e `outrora`;
- Ciberdúvidas, consulta “O uso do advérbio algures”.

Ação técnica:

1. uma única declaração ativa por verbete;
2. sínteses novas e explícitas;
3. linhas desativadas convertidas em comentários de rastreabilidade, preservando as linhas do restante do inventário;
4. auditoria lexical regenerada;
5. contratos estáticos e regressões de produto nos dois navegadores;
6. versão pública `{new_version}` e cache `v971`.

## R — Resultado específico

Executor efêmero: `__RUN_ID__`.

- contratos de fonte e produto: **__TARGETED_RESULT__**;
- TypeScript e build: verdes;
- auditoria E2 completa: verde;
- contagem final:
  - 1.008 declarações brutas;
  - 936 chaves efetivas;
  - 66 grupos repetidos;
  - 72 declarações sobrescritas;
  - zero grupos idênticos;
  - 66 grupos conflitantes.

A matriz integral, a publicação da preview e o smoke público permanecem como gate oficial seguinte.

## O — O que permanece aberto

- 66 conflitos editoriais de definições;
- oito autorreferências de sinônimos;
- quatro aliases técnicos;
- `leitor_modelo` vazio;
- cartões de polissemia ausentes;
- expansão lexical bloqueada;
- nota lexical mantida em 6,5 até ganho qualitativo mais amplo e banca humana.

## Parecer Eva

- dimensão: Léxico e polissemia;
- escopo: dois advérbios, sem generalização;
- ganho: remoção de sobrescrita silenciosa e orientação editorial mais precisa;
- nota: **6,5**, mantida;
- decisão: `PROSSEGUIR COM CONDIÇÕES` para a matriz integral;
- condição: preview somente com todos os contratos oficiais verdes.
''',
    encoding="utf-8",
)
