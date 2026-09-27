# Leitura inicial do primeiro conjunto — 25/09/2026

**Estado:** oito arquivos catalogados, metadados e trechos selecionados inspecionados. Nenhuma leitura integral concluída. Não há novo motor integrado por causa deste estudo.

O inventário em `fontes.json` registra SHA-256, tamanho, linhas e intervalos efetivamente consultados. As linhas abaixo referem-se ao TXT recebido, contado por LF, preservando form feed; a referência depende do hash. A presença de marcador de página no TXT não equivale à conferência da imagem da página.

## O que o conjunto oferece

| ID | Obra | Contribuição inicial | Limite |
| --- | --- | --- | --- |
| B01 | A descoberta do mundo — Clarice Lispector | Escolhas expressivas e reflexão sobre o fazer literário | Não é tratado gramatical; edição não identificada no arquivo |
| B02 | Preconceito linguístico — Marcos Bagno | Língua, norma, variação e ensino | Leitura inicial; não usar um prefácio como síntese de toda a obra |
| B03 | Novo manual da redação — Folha | Convenções editoriais e organização de uma consulta | OCR ruidoso; edição e completude precisam de conferência |
| B04 | Manual de redação e estilo — Eduardo Martins | Consulta gramatical em escopo jornalístico | Edição de 1997; não transportar toda convenção editorial para qualquer gênero |
| B05 | Manual da redação — Folha | Estilo e anexo gramatical de uma edição posterior | 12ª edição de 2007; distinto de B03; colunas e cabeçalhos exigem revisão |
| B06 | Linguagem jornalística — Nilson Lage | Registro, comunicação e organização sintática | Edição/ano não confirmados; terminologia precisa de confronto |
| B07 | Por que escrevo — George Orwell | Reflexões sobre escrita, clareza e finalidade | Tradução e originais em inglês; ensaios e materiais adicionais separados |
| B08 | Crítica genética — Cecilia Almeida Salles | Vestígios, versões e transformação da criação | Vestígios não revelam integralmente a intenção ou o processo mental |

Este conjunto dá uma boa partida para variação, estilo e processo de escrita. A cobertura sistemática de todas as classes e estruturas sintáticas ainda precisa ser mapeada e complementada onde houver lacunas. Não atribuímos ao conjunto cobertura gramatical exaustiva.

## Unidade inicial: convenções, contexto e escolha autoral

### Observação F01 — delimitar o alcance de uma norma

**Lido:** B02, linhas 180–222; B04, 204–263; B05, 145–166; B06, 915–960.

**Síntese própria:** Bagno distingue a língua de sua descrição normativa. Os manuais explicitam objetivos editoriais de seus veículos. Lage discute a relação entre registro formal, coloquial e comunicação jornalística. São perspectivas que precisam ser identificadas, não fundidas numa única noção de “português correto”.

**Decisão proposta para o produto:** cada observação declara o critério e o contexto em que ele vale. Uma preferência de jornal deve ser apresentada como preferência daquele perfil, selecionado pelo escritor. Não presumir gênero pela idade ou pelo vocabulário.

**Ainda falta:** estudo integral das unidades, comparação de conceitos de norma e registro e casos de avaliação revisados.

### Observação F02 — repetição pode ser uma escolha expressiva

**Lido:** B01, linhas 6667–6687, especialmente a reflexão sobre repetição na linha 6679.

**Síntese própria:** no trecho, a autora comenta um efeito procurado pela recorrência e pela monotonia. Esse testemunho é um contraexemplo à ideia de que repetir implica necessariamente falha de escrita.

**Decisão para o produto:** conservar a lente de repetição como observação descritiva. O autor interpreta o efeito; a ferramenta não manda cortar, substituir por sinônimo ou atribui deficiência de vocabulário.

**Ainda falta:** estudar a unidade completa e construir casos próprios com ritmos e finalidades diferentes. Um testemunho literário não cria sozinho um detector de intenção.

### Observação F03 — recomendação de estilo precisa de escopo e ressalvas

**Lido:** B07, linhas 685–731, na unidade “A política e a língua inglesa”.

**Síntese própria:** a passagem apresenta recomendações para a expressão de ideias em inglês e ressalvas sobre seu uso; também delimita a discussão em relação ao uso literário. A tradução não transforma automaticamente esses critérios em regras gramaticais do português.

**Decisão proposta:** não criar alertas universais contra voz passiva, palavra longa, metáfora ou repetição. Uma lente de clareza precisa considerar finalidade declarada e oferecer descrição fundamentada, sem executar cortes.

**Ainda falta:** leitura dos ensaios completos, separação entre original, tradução e anexos, avaliação contextual e contraste com usos PTBR.

### Observação F04 — o processo criativo deixa vestígios, não uma explicação total

**Lido:** B08, linhas 403–442, demarcação do campo da crítica genética, com marcadores das páginas 25–26.

**Síntese própria:** a criação é tratada como transformação em processo; documentos e versões permitem investigação, mas não dão acesso integral ao ato criador.

**Decisão proposta:** preservar a autoria e os registros existentes; futuras leituras de versões devem descrever diferenças observáveis. Não fabricar intenção, diagnóstico psicológico ou nota de qualidade a partir do texto final.

**Ainda falta:** estudar as unidades sobre documentos de processo. Nenhuma mudança no histórico ou armazenamento foi implementada neste lote.

### Observação F05 — a qualidade da extração faz parte da evidência

**Inspecionado:** B03, metadados, organização do manual (linhas 326–355) e término do arquivo; B05, metadados e introdução; B06, linhas 1428–1464.

**Síntese própria:** o OCR de B03 contém substituições de caracteres, palavras quebradas e interferência de colunas. O fim do arquivo não comprova integridade editorial. B05 é outra edição, com anexo gramatical identificado no sumário. A seção sintática de B06 é um resumo vinculado ao gênero jornalístico.

**Decisão de trabalho:** não gerar regras a partir de caracteres corrompidos ou verbetes intercalados. Confirmar edição, sequência e contexto do trecho. Não confundir arquivo processado com obra integralmente lida.

## Corpus inicial

`corpus-inicial.json` contém 11 exemplos próprios para classes em contexto e três situações de autoria/estilo. São propostas de anotação para desenvolvimento, ainda sem revisão independente e sem avaliação do motor. Não são corpus reservado e não há taxa de acerto a reportar.

## Próximo lote de estudo

1. B02: unidade completa de distinção entre língua, norma e uso, com mapa de termos e limites.
2. B04 e B05: localizar e estudar verbetes delimitados de artigo/pronome e conectivos; documentar convergências e divergências.
3. B06: completar a leitura das unidades de registro e pontuação, confrontando a terminologia sintática.
4. B01, B07 e B08: ampliar os contraexemplos que protegem a escrita literária e as escolhas autorais.
5. Conferir B03 antes de usar sua extração para formalização. Identificar edições pendentes e lacunas de fontes para morfossintaxe sistemática.

## Adendo do escritor: interação controlada

Uma lente por vez, escolhida explicitamente. Ligar abre opções. Trocar de lente cancela a anterior. A aplicação não dispara um diagnóstico geral nem reanalisa tudo ao digitar. O editor jamais recebe substituições da análise. Essa é uma decisão do autor, não uma regra deduzida das obras.

**Publicado hoje no editor:** painel anterior com execução serial. **Neste lote:** mapa e demonstração separados do editor; nenhum motor novo e nenhuma alteração em manuscritos.
