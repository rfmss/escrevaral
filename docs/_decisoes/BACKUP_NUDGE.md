# Backup Nudge — Educação gentil sobre localStorage

**Versão introduzida:** v454 (2026-06-09)  
**Arquivo principal:** `backup-controller.js` → `_checkReloadBackupNudge()`

---

## Problema

O localStorage é forte e silencioso. A pessoa escreve, fecha, reabre — e tudo voltou. Isso cria uma falsa sensação de segurança: sem nuvem, sem redundância, a mesa depende de um único navegador num único aparelho. Limpar dados do site, trocar de dispositivo, usar modo privado ou uma extensão limpadora apaga tudo sem aviso.

## Decisão de produto

Não bloquear nem assustar. Educar no momento certo, com tom de cinto de segurança, não de alarme.

**Regra:** a partir do primeiro reload (a mesa "voltou" — a pessoa viu que funciona), se há manuscritos com conteúdo e o backup está ausente ou velho (7+ dias), mostrar um banner discreto no topo com CTA direto para exportar.

## O que não fazer

- Não mostrar modal bloqueante.
- Não navegar o usuário para longe do que ele estava fazendo.
- Não repetir o aviso a cada reload da mesma sessão (o banner só aparece uma vez por sessão de tab — `sessionStorage`).
- Não mostrar se não há conteúdo real.
- Não mostrar se o backup está em dia.

## Implementação

**`sessionStorage['vrda-reload-count']`** — contador que sobrevive a reloads mas não a fechamento de aba/sessão. Diferente de `localStorage`, não vai embora junto com os dados que quer proteger.

- `count = 1`: primeiro carregamento — silencioso.
- `count >= 2`: primeiro reload em diante — verifica condições e mostra banner se necessário.

**Infraestrutura reutilizada:**

- `getBackupWarningState()` já decide se o backup está em risco (sem `exportedAt` ou com mais de `BACKUP_WARNING_DAYS` dias).
- `exportBackup()` já executa o download e atualiza `backupMeta.exportedAt`.
- Banner HTML segue o mesmo padrão de `#update-banner` e `#tab-conflict-banner`.

**Texto do banner:**

> Sua mesa voltou.  
> O Escrevaral guarda tudo neste navegador, mas não é nuvem. Salve uma cópia para proteger seus manuscritos.

Botões: `Guardar cópia` | `×` (fechar)

## Por que sessionStorage, não localStorage

O contador de reloads não pode ficar em `localStorage` porque quando os dados são apagados o contador some junto — e a lógica de proteção nunca dispara. `sessionStorage` persiste nos reloads da mesma sessão (tab), que é exatamente o ciclo que queremos monitorar.

## Evolução possível (não implementada)

- Reforçar aviso quando `state.manuscripts` tiver muitas palavras acumuladas sem backup.
- Periodicidade configurável pelo usuário.
- Integrar com `filesystem-backup-engine.js`: se cópia automática estiver ativa, dispensar o nudge.
