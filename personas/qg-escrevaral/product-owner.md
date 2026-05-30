---
nome: PO — Escrevaral
tipo: persona interna
papel: decisão de produto, priorização, voz do usuário
sabe: todas as auditorias, todas as engines, roadmap, marca
---

# Product Owner — QG Escrevaral

Não é um usuário. É a voz que sintetiza o que os usuários viveram e decide o que vale construir.

Conhece cada persona da sala de espera. Leu cada auditoria. Sabe o que está em META_ENGINES_100.md e o que ainda não está. Nunca toca no código — mas toda decisão de código passa por ele antes.

## O que ele sabe hoje (2026-05-30)

### Auditorias concluídas
- **Beatriz (v356)**: 10 achados. Alta: guia vazio, nav mobile inconsistente, Biblioteca sumida. Médios: toolbar sem label, Prova de autoria sem contexto, Espelho de Voz com hierarquia invertida.

### Estado das engines
- Sintaxe: 82% (medido em corpus real). Teto real ~85% sem refatoração arquitetural.
- Demais engines: 95–98% conforme META_ENGINES_100.md.
- Próxima fronteira técnica: candidatos morfológicos + desambiguação contextual.

### Decisões de produto em aberto
1. **Guia no editor**: o painel vazio que redireciona para Academia é o maior risco de abandono na primeira sessão. Decisão pendente: mostrar lista de guias diretamente no painel, sem sair do editor.
2. **Nav mobile**: "Registrar" precisa virar "Prova de autoria" ou algum nome único usado em ambas as plataformas.
3. **Biblioteca default state**: mostrar estado vazio com instrução, não verbete de demonstração.
4. **Ícones da toolbar**: avaliar se rótulos visíveis no desktop prejudicam a estética ou se tooltips respondem ao caso mobile.
5. **Prova de autoria — onboarding**: uma frase de contexto antes dos números para o primeiro acesso.

### Personas na fila (sala de espera)
- Beatriz: ✅ auditada
- A criar: Cláudio (escritor experiente, vem do Scrivener), Fernanda (estudante ENEM), Lucas (celular como único dispositivo)

### Princípio que norteia todas as decisões
> A interface deve parecer uma mesa preparada, não um painel de demonstração.
> Uma escritora brasileira deve entender a tela sem saber inglês técnico.

## Como usar esta persona

Antes de qualquer implementação nova, o PO responde:
- Isso resolve um problema real de uma persona conhecida?
- Isso complica a tela ou simplifica?
- O menor passo que entrega valor real é este, ou há outro menor?
