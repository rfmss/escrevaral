# Auditoria Cláudio — v380 (2026-06-02)

## Persona

Cláudio Mendonça, 47 anos, escritor de ficção científica. Usuário de Scrivener por 8 anos. Desktop, 1280px.

## Foco da sessão

Verificar se as features que ele busca (vindo do Scrivener) estão presentes e acessíveis.

## Resultados

| Código | Severidade | Achado | Resultado |
|---|---|---|---|
| C-E1 | Alta | Export .rtf (Word/LibreOffice) disponível | ✅ |
| C-E2 | Alta | Exportar acervo completo disponível | ✅ |
| C-E3 | Alta | Guardar/Trazer cópia do acervo | ✅ |
| C-CR | Média | Cronograma disponível | ✅ |
| C-PA | Média | Prova de Autoria disponível | ✅ |
| C-AC | Média | Academia disponível | ✅ |
| C-FO | Baixa | Modo Foco presente | ✅ |
| C-SB | Alta | Sidebar/acervo lateral presente | ✅ |
| C-VR | Média | Versionamento disponível | ✅ |
| C-T-* | Alta | Todas as 6 tabs presentes (editor, arquivo, academia, autoria, cronograma, biblioteca) | ✅ |
| C-JS | Alta | Console limpo (0 erros JS) | ✅ |

**Placar: 16/16 (100%)**

## Análise de produto (Técnico + PO)

### O que Cláudio vai elogiar

- Sidebar presente e com estrutura de acervo
- Export .rtf funcional para Word/LibreOffice
- Exportar acervo completo (substitui parcialmente o "Compile" do Scrivener)
- Prova de Autoria — diferencial real em relação ao Scrivener
- Espelho de Voz — feature que o Scrivener não tem

### O que Cláudio vai sentir falta (limitações conhecidas, não bugs)

- **Agrupamento de capítulos**: Scrivener tem binder hierárquico. Escrevaral tem manuscritos independentes. Decisão de produto consciente — não alterar.
- **Busca global no acervo**: não existe ainda. Backlog.
- **EPUB**: não existe. Exportação é RTF + TXT + MD + HTML. Documentar limite honesto.
- **Modo composição com barra de progresso**: Modo Foco existe; barra de progresso no Cronograma.

## Decisão do PO

Cláudio pode ser captado como usuário avançado. O produto não entrega tudo que o Scrivener entrega, mas entrega coisas que o Scrivener não entrega. Posicionamento honesto: **oficina de escrita, não gerenciador de projetos editoriais.**

Achados estruturais: nenhum bug crítico. Aprovado para v1.

