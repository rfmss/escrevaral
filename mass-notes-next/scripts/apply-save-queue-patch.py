from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: esperado 1 trecho, encontrados {count}')
    return text.replace(old, new, 1)


app_path = Path('mass-notes-next/src/App.tsx')
app = app_path.read_text(encoding='utf-8')

app = replace_once(
    app,
    "  const dirtyKindRef = useRef<DraftMutationKind | null>(null)\n  const channelRef = useRef<BroadcastChannel | null>(null)\n",
    "  const dirtyKindRef = useRef<DraftMutationKind | null>(null)\n  const conflictRef = useRef<ConflictState | null>(null)\n  const mutationSerialRef = useRef(0)\n  const savePromiseRef = useRef<Promise<boolean> | null>(null)\n  const saveRequestedRef = useRef(false)\n  const channelRef = useRef<BroadcastChannel | null>(null)\n",
    'refs da fila',
)

app = replace_once(
    app,
    "  useEffect(() => { draftRef.current = draft }, [draft])\n  useEffect(() => { dirtyRef.current = dirty }, [dirty])\n",
    "  useEffect(() => { draftRef.current = draft }, [draft])\n  useEffect(() => { dirtyRef.current = dirty }, [dirty])\n  useEffect(() => { conflictRef.current = conflict }, [conflict])\n",
    'sincronização do conflito',
)

app = replace_once(
    app,
    "      if (dirtyRef.current) {\n        setConflict({ local: structuredClone(current), persisted })\n        setSaveState('Conflito')\n      } else {\n",
    "      if (dirtyRef.current) {\n        const nextConflict = { local: structuredClone(current), persisted }\n        conflictRef.current = nextConflict\n        setConflict(nextConflict)\n        setSaveState('Conflito')\n      } else {\n",
    'conflito remoto síncrono',
)

old_persist = """  const persistDraft = useCallback(async (): Promise<boolean> => {
    const current = draftRef.current
    if (!current || !dirtyRef.current || conflict) return !conflict
    const mutationKind = dirtyKindRef.current ?? 'manuscript'
    setSaveState('Salvando')
    try {
      const saved = await saveDocument(current, current.revision)
      setDraft(saved)
      draftRef.current = saved
      setDirty(false)
      dirtyRef.current = false
      dirtyKindRef.current = null
      setSaveState('Salvo')
      removeLocalStorage(RECOVERY_KEY)
      channelRef.current?.postMessage({ id: saved.id, revision: saved.revision, kind: mutationKind } satisfies DocumentChannelMessage)
      await refreshDocuments()
      return true
    } catch (error) {
      if (error instanceof DocumentConflictError) {
        setConflict({ local: error.local, persisted: error.persisted })
        setSaveState('Conflito')
        return false
      }
      console.error('[Escrevaral] Falha ao salvar.', error)
      setSaveState('Falha')
      return false
    }
  }, [conflict, refreshDocuments])
"""

new_persist = """  const persistDraft = useCallback(async (): Promise<boolean> => {
    saveRequestedRef.current = true
    if (savePromiseRef.current) return savePromiseRef.current

    const runQueue = async (): Promise<boolean> => {
      while (saveRequestedRef.current) {
        saveRequestedRef.current = false
        if (conflictRef.current) return false

        const current = draftRef.current
        if (!current || !dirtyRef.current) continue

        const snapshot = structuredClone(current)
        const mutationSerial = mutationSerialRef.current
        const mutationKind = dirtyKindRef.current ?? 'manuscript'
        setSaveState('Salvando')

        try {
          const saved = await saveDocument(snapshot, snapshot.revision)
          const latest = draftRef.current
          const changedDuringSave = mutationSerialRef.current !== mutationSerial

          if (latest && latest.id === saved.id && changedDuringSave) {
            const rebased = { ...latest, revision: saved.revision }
            setDraft(rebased)
            draftRef.current = rebased
            setDirty(true)
            dirtyRef.current = true
            setSaveState('Alterado')
            saveRequestedRef.current = true
          } else if (latest?.id === saved.id) {
            setDraft(saved)
            draftRef.current = saved
            setDirty(false)
            dirtyRef.current = false
            dirtyKindRef.current = null
            setSaveState('Salvo')
            removeLocalStorage(RECOVERY_KEY)
          }

          channelRef.current?.postMessage({ id: saved.id, revision: saved.revision, kind: mutationKind } satisfies DocumentChannelMessage)
          await refreshDocuments()
        } catch (error) {
          if (error instanceof DocumentConflictError) {
            const nextConflict = { local: error.local, persisted: error.persisted }
            conflictRef.current = nextConflict
            setConflict(nextConflict)
            setSaveState('Conflito')
            return false
          }
          console.error('[Escrevaral] Falha ao salvar.', error)
          setSaveState('Falha')
          return false
        }
      }
      return !conflictRef.current
    }

    const task = runQueue()
    savePromiseRef.current = task
    try {
      return await task
    } finally {
      if (savePromiseRef.current === task) savePromiseRef.current = null
    }
  }, [refreshDocuments])
"""
app = replace_once(app, old_persist, new_persist, 'persistDraft')

app = replace_once(
    app,
    "  ) => {\n    setDraft((current) => {\n",
    "  ) => {\n    mutationSerialRef.current += 1\n    setDraft((current) => {\n",
    'série de mutação',
)

clear_count = app.count("    setConflict(null)\n")
if clear_count != 4:
    raise SystemExit(f'limpeza de conflito: esperadas 4 ocorrências, encontradas {clear_count}')
app = app.replace(
    "    setConflict(null)\n",
    "    conflictRef.current = null\n    setConflict(null)\n",
)
app_path.write_text(app, encoding='utf-8')

integrated_path = Path('mass-notes-next/tests/m0-9-integrated.spec.ts')
integrated = integrated_path.read_text(encoding='utf-8')
integrated = replace_once(
    integrated,
    """  await page.getByLabel('Título do documento').fill('Versão textual remota do M0.9')
  await second.getByRole('tab', { name: 'pulso', exact: true }).click()
  await second.getByRole('button', { name: 'Marcar como favorita' }).click()
  await page.keyboard.press('Control+S')
""",
    """  await second.getByRole('tab', { name: 'pulso', exact: true }).click()
  const favoriteButton = second.getByRole('button', { name: 'Marcar como favorita' })
  await favoriteButton.click({ trial: true })
  await favoriteButton.click()
  await page.getByLabel('Título do documento').evaluate(async (element, title) => {
    const input = element as HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    if (!setter) throw new Error('Setter nativo do título indisponível.')
    setter.call(input, title)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }))
  }, 'Versão textual remota do M0.9')
""",
    'ordem do conflito misto',
)
integrated_path.write_text(integrated, encoding='utf-8')

queue_test = Path('mass-notes-next/tests/m1-save-queue.spec.ts')
queue_test.write_text("""import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.getByLabel('Título do documento')).toBeEditable()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

test('fila de salvamento não cria conflito contra a própria aba e preserva edição posterior', async ({ page }) => {
  await waitReady(page)
  const title = page.getByLabel('Título do documento')
  await title.fill('Primeira versão da fila')

  await page.evaluate(async () => {
    const dispatchSave = () => window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }))

    dispatchSave()

    const input = document.querySelector<HTMLInputElement>('[aria-label="Título do documento"]')
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    if (!input || !setter) throw new Error('Título indisponível para a regressão.')
    setter.call(input, 'Segunda versão preservada')
    input.dispatchEvent(new Event('input', { bubbles: true }))

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    dispatchSave()
    dispatchSave()
  })

  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(title).toHaveValue('Segunda versão preservada')

  await page.reload()
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.getByLabel('Título do documento')).toHaveValue('Segunda versão preservada')
  await expect(page.getByRole('alert')).toHaveCount(0)
})
""", encoding='utf-8')
