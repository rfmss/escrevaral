# E2-V — Breadcrumbs do Pack Verbal PT-BR

Data: 2026-07-30  
PR: `#155`, rascunho  
Branch: `experiment/mass-notes-tiptap`

Registro aditivo: tentativas rejeitadas não serão apagadas.

## B0 — Restabelecimento da baseline

### Cabeça inicial

`d0d12ca4f0bf1ecebaea2ddb7fa223c9be83c8d8`

A cabeça documental posterior à OBS-02/03 estava vermelha em três provas Firefox: sincronização de exportação e dock. A cabeça funcional anterior `f7c2db1` permanecia como evidência verde de produto.

### Primeira estabilização

Foram corrigidos os contratos das provas:

- dock: aguardar `data-toolbar-docked="true"` antes de medir geometria;
- exportação: observar o recovery snapshot do rascunho antes de enviar `Ctrl+S`.

Cabeça intermediária: `7bb7cd21735c4c448b91935aa19b5e54073b42c6`.

Resultado: 335/338. Dock e Gate 9 passaram. As falhas migraram para recuperação, seleção lexical e conflito integrado.

### Segunda estabilização

Correções sem aumento de timeout ou retry:

- recuperação: exigir no recovery snapshot o texto completo, incluindo o último caractere, antes de fechar a aba;
- seleção lexical: usar `Control+Home` e provar a seleção real antes de abrir Palavras;
- conflito simples: provar que as duas abas estão em `Alterado` antes de salvar a versão remota.

O conflito integrado M0.9 não foi alterado sem nova reprodução.

### Baseline aprovada

Cabeça: `81c4b0752e101ca2d9404a954cb575b9175bbffe`

- Mass Notes: `30564061964`;
- job: `90944097660`;
- matriz: **338/338**;
- auditoria lexical, TypeScript e build: aprovados;
- publicação, cache e smoke: aprovados;
- coerência: `30564062161`, aprovada;
- Argila: `30564061951`, aprovada.

Classificação: **B0 verde; feature verbal autorizada a começar**.

## Guardrails ativos

- baseline e feature permanecem em commits separáveis;
- nenhuma mudança em `lexical-engine.js`;
- nenhuma promoção para `main`;
- PR permanece rascunho;
- Gate 14 suspenso;
- nenhuma rede, substituição automática ou alteração do JSON autoral.
