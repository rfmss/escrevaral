# A01 — o que reaproveitar e como transplantar

Pesquisa do ASTRA 2 em 27–28/09/2026. Recomendação: começar por **dados lexicais convertidos em blocos próprios**, usando PortiLexicon como candidato após esclarecer a licença dos dados. Usar tokenização e corretores como referências delimitadas; não trazer seus runtimes completos para o navegador por conveniência.

O [inventário verificável](A01-FONTES.json) fixa commits, tamanhos de blobs, hashes Git e SHA-256 dos 13 textos inspecionados. Foram consultadas árvores recursivas não truncadas e os arquivos enumerados em `inspected`. Listar um arquivo não significa ler seu conteúdo. Nenhum motor externo foi executado ou integrado. Os tamanhos abaixo são fontes na árvore Git, não download comprimido, instalação, RAM nem custo de execução.

| Recurso e revisão fixa | O que podemos aproveitar | Licença/procedência verificada | Custo e decisão |
| --- | --- | --- | --- |
| [PortiLexicon-UD](https://github.com/LuceleneL/PortiLexicon-UD/tree/315e063da1f89c89e2097c6e72428ebefb9ab1d1) | Formas, lemas, classes e traços UD; preservar homógrafos | README, LICENSE e UDlexPT.py lidos; MIT na raiz, copyright Lucelene Lopes. POeTiSA anuncia dados CC-BY derivados de UNITEX-PB; escopo/versão precisam ser esclarecidos antes de redistribuir | Árvore 95.774.240 bytes; VERB.tsv 71.016.248; WORDmaster.txt 14.866.932. O acessor Python carrega as tabelas na inicialização: estudar formato e converter no build, sem transplantar esse carregamento |
| [portTokenizer](https://github.com/LuceleneL/portTokenizer/tree/3a96f320b96b870737e5eace63c4b139ee7522a7) | Referência de segmentação, contrações e clíticos; avaliar preservação do original e ambiguidades | README e LICENSE lidos; MIT na raiz. Repositório carrega cópias do léxico: a questão da licença dos dados permanece | Árvore 95.834.804 bytes; portTok.py 39.329. Avaliar casos delimitados depois do léxico; evitar cópias do acervo por lente. Opções de remover material do texto não entram como processamento neutro |
| [LanguageTool](https://github.com/languagetool-org/languagetool/tree/622328535865050c077ccb64cabb5fad77038bc4) | Inventário de regras/casos PT-BR, exceções e organização de testes | pom.xml e grammar.xml PT-BR lidos; projeto declara LGPL 2.1, cabeçalho da gramática permite 2.1 ou posterior. Recursos/dependências podem ter licenças próprias; não auditados integralmente | Árvore 273.854.084 bytes; gramática PT-BR 92.309. Java/Maven e análises dependentes; regras não são autossuficientes. Selecionar uma família e reproduzir pré-condições antes de portá-la |
| [CoGrOO 4](https://github.com/cogroo/cogroo4/tree/b6228900c20c6b37eac10a03708a9669dd562f52) | Referência brasileira de revisão gramatical e dependências entre anotação e regras | LICENSE/NOTICE da distribuição e README de regras/modelos lidos; Apache 2.0 nas regras, distribuição com avisos próprios para dependências. Não estender a licença principal automaticamente a todos os componentes | Árvore 17.178.159 bytes; rules.xml 256.374. Pipeline Java; não executado. Investigar uma regra com evidência quando classes/contexto estiverem disponíveis |
| [UD Portuguese-Porttinari](https://github.com/UniversalDependencies/UD_Portuguese-Porttinari/tree/87a07e1fb761d6d0a6e2a4d82b11b308344dabb9) | Futuro corpus de avaliação de classes/dependências e casos de fronteira | README e LICENSE.txt lidos; CC BY 4.0; português brasileiro jornalístico, Folha, anotação UD | Train+dev+test 11.679.306 bytes; árvore 23.671.500 inclui cópia em not-to-release. Não é motor nem léxico de definições. Reservar avaliação antes de consultar exemplos; não generalizar desempenho jornalístico para literatura |

A divergência PortiLexicon está na [página oficial POeTiSA](https://sites.google.com/icmc.usp.br/poetisa/resources-and-tools) e no LICENSE do commit fixado. Isso é uma pendência de documentação/proveniência, não uma conclusão de incompatibilidade. O transplante futuro deve registrar atribuição, licença exata e origem de cada componente. A prova A01 usa somente fixture própria e pode ser revisada sem resolver essa pendência.

## O que os recursos não resolvem sozinhos

PortiLexicon fornece informação lexical/morfológica; a consulta a “CARRO” aqui não devolve uma definição redigida de dicionário. Definições exigem outra fonte licenciada e outro esquema de sentidos. Um homógrafo pode ter várias leituras: encontrá-lo não escolhe a leitura correta no texto. Tokenizar “que” não demonstra oração subordinada. Dados UD também não equivalem automaticamente à análise escolar tradicional.

Nenhum tamanho de fonte desta tabela foi convertido em promessa de RAM ou compatibilidade. A prova mede a **arquitetura de transporte/consulta com dados próprios**, e não a qualidade ou velocidade dos cinco projetos. O recorte correto usa chave completa e limites de bytes; dividir somente por três letras pode criar um bloco enorme em prefixos comuns.

## Processo de transplante proposto ao A1

1. Fechar uma capacidade e seus casos positivos, negativos e ambíguos. Fixar commit, arquivos, licença, atribuição e variedade. Separar código de dados/modelos.
2. Converter fora do dispositivo em formato próprio, determinístico e versionado, com hashes, índice e limites. Inventariar transformações/perdas; não normalizar ou reescrever o manuscrito.
3. Comparar toda consulta do piloto com uma referência independente, incluindo entradas ausentes e fronteiras entre blocos. Qualquer limite/corrupção produz incompletude explícita.
4. Medir inicialização, índice, bytes lidos/decodificados, heap observado, conversão e consulta fria/quente. Aumentar o volume somente quando o gargalo anterior estiver identificado.
5. A1 revisa contrato e integra um recurso por vez com A02; atualização não troca metade dos blocos de uma consulta. Abrir avaliação reservada só após congelar regra/limiares; se os casos forem usados para desenvolvimento, retirar seu status de reservados.

Próximo piloto externo proposto: esclarecer a licença dos dados PortiLexicon e escolher uma tabela pequena com casos ambíguos. Antes de converter o conjunto todo, evoluir o índice paginado e a conversão streaming. A01 não aprova instalação dos recursos desta lista.

## Decisão de integração do recorte — 30/09/2026

A pendência operacional PortiLexicon foi decidida para o snapshot fixado: MIT da raiz conservada integralmente no módulo distribuído e atribuição aos quatro autores, sem inventar versão para o anúncio institucional CC-BY. [Decisão, escopo e evidências v6-34](../jornada/ENTREGA-V6-34.md). A comparação acima é histórica; apenas 3.009 formas/5.286 leituras foram incorporadas, sem runtime Python ou aprovação de toda a genealogia dos dados.
