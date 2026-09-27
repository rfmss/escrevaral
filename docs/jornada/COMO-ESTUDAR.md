# Dos livros ao comportamento do Escrevaral

## Unidade de trabalho

Estudar uma unidade delimitada (capítulo, seção ou fenômeno), não afirmar “aprendi o livro todo” após extração automática. O modelo não é treinado permanentemente por receber anexos. A continuidade vem do registro verificável no projeto.

## Ciclo de aprendizado

1. **Receber:** identificar o arquivo disponível e sua integridade; guardar a referência ao material original. Não colocar livros completos ou manuscritos privados no repositório público.
2. **Catalogar:** autor, título, edição, ano, variedade e abordagem; índice e convenção de páginas. Separar página impressa de página do PDF.
3. **Conferir leitura:** checar qualidade do texto extraído/OCR, especialmente acentos, tabelas, exemplos e notas. Trecho ilegível fica pendente.
4. **Mapear:** associar capítulos às áreas e etapas em `estado.json`. Registrar quais páginas foram de fato examinadas.
5. **Compreender:** sintetizar a definição em palavras próprias; distinguir descrição do uso, prescrição normativa, classificação teórica e observação estilística.
6. **Confrontar:** registrar divergências entre obras sem resolver por votação nem fundir terminologias incompatíveis. Expor a abordagem da explicação.
7. **Operacionalizar:** formular entradas, sinais necessários, relação contextual, alcance, exceções, saída e condições de abstenção.
8. **Exemplificar:** criar exemplos próprios, negativos próximos, variações de ordem, elipses, citações, informalidade e ambiguidades. A referência ensina; o exemplo não deve ser o único padrão reconhecido.
9. **Anotar e revisar:** marcar os trechos exatos e vínculos. Revisão independente deve indicar concordâncias e discordâncias; não atribuir revisão humana ou especialista sem que tenha ocorrido.
10. **Avaliar:** separar corpus de desenvolvimento e corpus reservado. Definir metas por fenômeno antes de avaliar a parte reservada. Se falhar, corrigir e usar nova avaliação independente; registrar a exposição dos casos anteriores.
11. **Implementar:** integrar um lote pequeno, com testes de regressão, sem mexer no manuscrito. Regras determinísticas, léxico e modelos estatísticos são opções a comparar por qualidade, custo, privacidade e suporte offline.
12. **Explicar e manter:** escrever explicação curta, aprofundamento, referência e limites; registrar revisão da regra e efeitos sobre resultados anteriores.

## Registro de uma unidade estudada

- Identificador da fonte e da unidade; edição; páginas impressas/arquivo.
- Estado: recebida → extraída → conferida → estudada → sintetizada → formalizada → revisada.
- Conceitos e relações; exemplos próprios e contraexemplos.
- Exceções, limites, divergências e questões abertas.
- Regras e casos derivados, com IDs estáveis.
- Quem revisou, quando, por qual procedimento e o que não foi revisado.
- Próxima ação. Falta de fonte, revisão ou evidência é uma pendência explícita.

Use `regra-modelo.json` como contrato mínimo. Ele é um modelo em branco, não uma regra aprovada.

## Dicionário, analisador e explicação

O dicionário fornece leituras possíveis e flexões. O analisador contextual avalia relações na frase e no texto. A interface explica as evidências e a incerteza. Melhorar um desses componentes não comprova automaticamente os outros.

Começar com classes ambíguas e uma amostra de subordinação permite avaliar o percurso completo. Aumentar o número de verbetes ou regras não é medida suficiente de maturidade.

## Conhecimento verificável

“Estudado” exige registro localizável. “Implementado” exige código real. “Testado” exige casos e resultados. “Integrado” exige execução na interface real. “Publicado” exige verificação remota. Nenhum desses estados certifica toda a língua.
