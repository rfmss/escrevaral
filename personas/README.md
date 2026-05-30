# Personas — Escrevaral

Pessoas que moram neste projeto. Cada uma com história, comportamento e registros de aprendizado.

## Sala de espera — testadoras

Pessoas reais (fictícias) que usam o Escrevaral e deixam rastros.

| Persona | Perfil | Status |
|---------|--------|--------|
| [Beatriz](sala-de-espera/beatriz.md) | Professora, escritora de contos, 32 anos | ✅ Auditada v356 |
| Cláudio | Escritor experiente, vem do Scrivener | 🕐 A criar |
| Fernanda | Estudante ENEM, celular como principal dispositivo | 🕐 A criar |
| Lucas | Celular como único dispositivo, sem experiência em editores | 🕐 A criar |

Cada persona auditada gera um relatório em `reports/auditoria/`.

## QG Escrevaral — personas internas

| Persona | Papel |
|---------|-------|
| [Product Owner](qg-escrevaral/product-owner.md) | Decisão de produto, priorização, voz do usuário |
| [Técnico](qg-escrevaral/tecnico.md) | Implementação, engines, CSS, service worker |

## Como uma persona entra na sala de espera

1. Definir nome, perfil, dispositivos, experiência prévia
2. Criar arquivo `sala-de-espera/nome.md`
3. Rodar sessão de auditoria (Playwright + análise manual)
4. Registrar achados em `reports/auditoria/auditoria-nome-AAAAMMDD.md`
5. PO lê o relatório e atualiza `qg-escrevaral/product-owner.md`
6. Técnico implementa o que o PO aprova
