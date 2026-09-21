# Gavetas e fluidez — G1

Entrega de 21/09/2026. Esta etapa transforma a antiga apresentação de caixas em gavetas e reduz a densidade de comandos sem alterar o modelo persistido.

## Hierarquia visível

`Gabinete > Gaveta opcional > Caderno > Texto`

- O caderno continua sendo a unidade principal do trabalho e pode permanecer solto no gabinete.
- A gaveta é uma entrada visual e organizacional para uma obra com um ou mais cadernos.
- Textos, capítulos, fichas, lugares, personagens, universo, quadro e demais dados continuam vinculados ao caderno já existente.
- Os identificadores `originals` e `originalId` permanecem internos para preservar pacotes `.scrvrl`, armazenamento local e arquivos antigos.

## Princípio de navegação

Cada contexto mostra primeiro a próxima ação provável e recolhe operações ocasionais:

- Gabinete: `Novo caderno` é primário; `Nova gaveta` vive em `Organizar`.
- Gaveta aberta: `Novo caderno` é primário; renomear, exportar e mover ficam em `Opções da gaveta`.
- Caderno: `Novo texto` é primário; Universo e Quadro permanecem à mão; renomear, exportar e mover ficam em `Mais`.
- Início: três caminhos imediatos (`Cadernos e gavetas`, `Mesa de escrita`, `Novo caderno`) e dois grupos progressivos (`Ferramentas`, `Organizar e guardar`).

Os menus usam `aria-expanded` e `aria-controls`, fecham por clique externo ou `Esc` e devolvem o foco ao acionador. Diálogos abertos a partir de uma ação recolhida também devolvem o foco ao botão que revela o grupo.

## Linguagem e visual

- A interface usa `gaveta` e `texto`; os nomes técnicos legados não aparecem no percurso normal.
- Gavetas semi-fechadas mostram até quatro lombadas, usando as cores dos cadernos existentes.
- Ao abrir, a gaveta sinaliza seu estado e revela os cadernos; não existe uma cópia manipulável separada dos dados.
- O acabamento conserva a paleta sálvia/tinta e usa profundidade estática de baixo custo, sem dependência ou animação obrigatória.

## Compatibilidade e segurança

- Nenhuma migração de esquema.
- Exportação e importação v1/v2 continuam aceitas.
- A estrutura permanece ES5 e portátil em `index.html` e `escrevaral.html`.
- Os alvos principais têm pelo menos 44 × 44 px; a referência mínima de acessibilidade permanece 24 × 24 px com espaçamento.
- Regressões cobrem 320 px, teclado, toque, foco, recarga, exportação, lixeira, restauração e pacote legado.

## Próximas camadas

Timelines, resumos e exportação de livro devem consumir cópias derivadas dos dados existentes. A fonte permanece intacta; qualquer manipulação editorial futura acontece em instâncias duplicadas e rastreáveis.
