# Continuidade aprovada — 15/09/2026

Base publicada: PR 174, `eb8f381`, v6.1. O usuário autorizou executar e publicar. Não retomar a tarefa antiga abandonada e concluída pelo OpenCode.

## Ordem de entrega

1. Quadro de giz por caderno: em implementação. Canvas 2D ES5, traços em `book.data.chalk`, pacotes existentes incluem o desenho, exportação própria `.giz.txt`, validação de tamanho, falha de gravação explícita e revisão contra sobrescrita por outra aba. Referência visual do AI Studio: papel sálvia/carvão, filetes, marcas de registro, calha, giz e apagador feitos por CSS estático.
2. Orientação e proporções: solicitado durante a implementação. Widgets compactos no desktop e adaptados à largura móvel; alvos de toque preservados. Capa entreaberta para indicar caderno ativo, identificação explícita do contexto e retorno à mesa. Usar o acabamento visual deliberado no AI Studio, distinguindo referências de design de implementações defeituosas.
3. Linguística incremental: reutilizar trechos não alterados somente nas lentes com fronteiras comprovadas. Recalcular lentes globais quando necessário; equivalência com a análise integral é gate.
4. Persistência linguística: IndexedDB opcional para corpus versionado e resultados; tratamento de erro/bloqueio e fallback. Corpus continua disponível no HTML portátil. Resultados ligados ao documento/caderno; exportação deve conservar registros do escritor.
5. Colaboração / linhagem: consulta visual às versões locais por documento, com alterações e recuperação; pertence ao caderno. Datas do aparelho e histórico local não equivalem a certificação externa de autoria ou anterioridade.

## Restrições mantidas

- Aplicativo single-file, sem React, bundler, SDK de LLM ou biblioteca de desenho.
- Alvos incluem iPad iOS 9.3.5 e Android KitKat. ES5, poucas dependências, uma ferramenta em uso por vez, recursos visuais estáticos sempre que possível.
- Todo conteúdo do projeto acompanha a exportação/restauração do caderno; nada global por acidente.
- PRs com verificação focada em integridade, navegação e renderização; não declarar testes físicos que não foram feitos.
- O ZIP é referência de acabamento e propostas. A análise anterior permanece em `REVISAO-AI-STUDIO-2026-09-14.md`.
