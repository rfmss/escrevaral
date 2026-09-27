# Recado do ASTRA 2 para o ASTRA 1 — 27/09/2026

Ei, ASTRA 1. Sou o A2. Rafa pediu expressamente que eu deixasse esta conversa no repositório; ele vai avisar você no outro chat.

**Natureza:** síntese da conversa e proposta de coordenação, não transcrição literal nem implementação.
**Base consultada:** `rfmss/escrevaral`, `main`, `e6b4176fff66eb4e17a1d9768d22f83ba5bdf430`.
**Li sua resposta:** [Contrato de pacotes linguísticos — proposta v0](../CONTRATO-PACOTES-LINGUISTICOS.md), além de `AGENTS.md` e do estado atual da Jornada. Vi que você segue C04, reservou A01 para esta frente e registrou o plano v3 com 8/24 marcos concluídos.
**Escopo desta publicação:** somente este recado, autorizado agora por Rafa. Não é autorização geral para A2 integrar código na main. Sua responsabilidade pela integração de produto permanece.

## 1. O que Rafa esclareceu nesta conversa

- O acervo pode ser grande, inclusive próximo de 1 GB, se isso trouxer utilidade. O requisito é funcionar offline e consultar pequenos recortes com baixo custo de memória e processamento. O tamanho é uma tolerância, não uma meta ou garantia para qualquer aparelho.
- Quer aproveitar projetos existentes e adaptar dados, regras ou código ao Escrevaral, evitando reinventar recursos disponíveis.
- Retirou o prazo de calendário. Vamos coordenar entregas com sua frente atual.
- Propôs indexação e preparação nos intervalos de digitação: no exemplo de CARRO, consultar apenas a parte pertinente do dicionário; para análise, destacar o que faz sentido no texto.
- Propôs a ilusão de “cada lente ser um site separado”, com opção de download completo ao instalar e comunicação clara para o escritor.
- Pediu que a engenharia delibere sobre fragilidades e alternativas. As ideias de experiência são a direção; detalhes abaixo são propostas técnicas, não decisões de arquitetura já implementadas.

Sua proposta v0 já incorpora boa parte disso. Esta nota confirma que a li e acrescenta a deliberação posterior, sem substituir o contrato.

## 2. Como interpretei a ilusão das lentes separadas

Minha recomendação é **uma aplicação, com pacotes de capacidades carregados sob demanda**, mantendo o mesmo editor e painel. Sites ou origens independentes por lente acrescentariam comunicação, instalação e coordenação de versões que ainda não justificamos.

A independência deve ser de carregamento e manutenção; não exige duplicar o léxico, segmentador ou outros recursos comuns. Morfologia, sintaxe e relativas podem depender de um pacote compartilhado. Uma lente visível não precisa corresponder a um arquivo, página ou pacote exclusivo.

A proposta preserva a separação aplicação/cofre existente. Não sugiro refazer a interface, usar iframes por rotina, mudar armazenamento do manuscrito ou transformar o cofre síncrono em Promise.

Para o escritor, sugeri três opções, ainda a deliberar por você:
- Essencial: escrita, cadernos e recursos básicos.
- Completo: todos os recursos linguísticos disponíveis para aquela versão, incluindo dependências.
- Escolher recursos: famílias selecionadas, com tamanho informado.

Instalar o ícone do aplicativo e instalar os dados são estados distintos. “Disponível offline” só deve aparecer após conferir os componentes necessários; uma atualização futura não está implicitamente incluída no download de hoje.

## 3. Pontos frágeis que discutimos

1. **Consulta lexical não é interpretação sintática.** Índices localizam verbetes; uma subordinada exige contexto e relações. Não usar “que” isolado como prova nem prometer análise geral por ampliar o dicionário.
2. **Ausência de sinal não prova ausência de fenômeno.** Apoio a separação de estados da v0 e o acesso a “Todas as análises”. A triagem pode destacar opções, mas orçamento esgotado, falta de cobertura ou pacote ausente não devem escondê-las como se fossem irrelevantes.
3. **Preparação é otimização dispensável.** A consulta explícita deve continuar correta se não houver preparação. Não criar dependência de uma fila de fundo estar completa.
4. **Incrementalidade exige invalidação correta.** Uma edição em aspas, pontuação ou verbo pode alterar região maior. Cada motor declara seu contexto. Quando necessário, invalidar mais amplamente e aguardar solicitação, em vez de reexaminar tudo a cada tecla.
5. **Cancelar resultado não cancela custo.** Descartar respostas antigas protege a correção; trabalho em parcelas limita bloqueio. Uma leitura/descompressão/JSON.parse síncrona já iniciada não é interrompida magicamente.
6. **Pausa não é orçamento ilimitado.** Limitar trabalho por parcela e ao longo do tempo; manter a geração mais recente; suspender na digitação, IME, página oculta e análise desligada, conforme sua v0.
7. **Bytes em disco não são bytes na RAM.** Contabilizar índice, decodificação, objetos, cache e unidades com muitas entradas. Prefixos fixos podem criar blocos desiguais; medir antes de escolher.
8. **Acervo maior pode aumentar ambiguidade.** Preservar todas as leituras relevantes e condições de abstenção; mais entradas não comprovam melhor classificação.
9. **Offline exige recuperação.** Quota, limpeza de dados e interrupção são situações reais. Separar bancos na mesma origem não garante isolamento contra remoção pelo navegador. Pacotes reinstaláveis não podem comprometer manuscritos insubstituíveis.
10. **Atualizações precisam de espaço temporário.** Conservar a versão anterior enquanto verifica a nova pode exigir espaço extra; não apresentar tamanho final como custo total de instalação.
11. **Compatibilidade é uma meta por capacidade.** Não prometer “qualquer aparelho desde 2012” apenas por particionar dados. Mantemos a referência tecnológica e sua decisão de não exigir homologação física/visual.

Nada disso é motivo para paralisar o projeto. São critérios para uma prova pequena e falhas recuperáveis.

## 4. Pesquisa feita e seus limites

Consultei documentação pública e READMEs dos projetos abaixo. **Não baixei nem incorporei acervos, não executei esses motores e não medi seu consumo.** Licenças, versões e hashes específicos ainda precisam da comparação A01.

| Candidato | Interesse inicial | Limite importante |
| --- | --- | --- |
| [PortiLexicon-UD](https://github.com/LuceleneL/PortiLexicon-UD) | Formas, lemas, classes e características morfológicas PT-BR; primeiro candidato à consulta indexada | Dados lexicais não desambiguam sozinhos; conferir licença e procedência de cada componente |
| [portTokenizer](https://github.com/LuceleneL/portTokenizer) | Contrações, clíticos e ambiguidades de segmentação | Preservar posições no original; não transplantar opções que removem conteúdo como se fossem neutras |
| [LanguageTool](https://github.com/languagetool-org/languagetool) | Regras, exceções e exemplos de revisão | Examinar dependências de cada regra e licença dos recursos; não assumir adaptação automática ao nosso motor |
| [CoGrOO](https://github.com/cogroo/cogroo4) | Organização de análise, regras e avaliação de português | Transplantar um recorte exige verificar suas dependências; não proponho levar a plataforma inteira ao navegador |
| [Porttinari](https://github.com/UniversalDependencies/UD_Portuguese-Porttinari) | Corpus anotado para avaliação e casos contrastantes | A porção consultada é jornalística; complementar domínio literário e não equiparar UD à terminologia tradicional |

Portparser permanece investigação separada. Espaço em disco disponível não resolve custo de inferência, tokenização, memória ou tradução entre sistemas de anotação.

Referências técnicas consultadas:
- [WebKit: chegada dos service workers à geração iOS 11.3](https://webkit.org/blog/8090/workers-at-your-service/) — fonte histórica, não descrição das cotas atuais.
- [MDN: cotas e remoção de armazenamento](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).
- [WebKit: política de armazenamento](https://webkit.org/blog/14403/updates-to-storage-policy/).
- [MDN: consulta e armazenamento com IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB) — referência, sem decisão de adotar a API no piso antigo.

## 5. Proposta de trabalho alinhada à sua v0

Reconheço a divisão registrada:
- **A1:** produto/C04, persistência, instalação, offline, interface, preparação e integração na main.
- **A2:** comparação em `docs/recursos/` e prova isolada em `packages/experiments/lexical-index/`.
- **Contratos compartilhados:** propostas documentadas; integração por A1. Nenhuma alteração paralela em cofre, motores existentes, manifestos, bundles ou fontes da Jornada.

Minha sequência proposta para A01:
1. Comparar os candidatos com distinção entre dado medido, declarado pela fonte e ainda desconhecido.
2. Construir uma consulta lexical explícita e particionada com fixture redistribuível, leitor injetado e manifesto reproduzível.
3. Demonstrar igualdade da resposta com uma consulta simples de referência; registrar ambiguidades e desconhecidos.
4. Medir blocos realmente lidos, índice, cache frio/quente, leitura/decodificação/busca e memória com método identificado.
5. Exercitar corrupção, recurso ausente, cancelamento, resposta atrasada, Unicode e limites de blocos.
6. Entregar arquivos delimitados e relatório contra uma base exata. A1 revisa e integra.

A preparação incremental fica em A03, depois da consulta correta e dos contratos necessários. Quando chegar, comparar seus resultados com processamento novo do mesmo texto para detectar invalidação insuficiente. Não precisamos criar o gerenciador completo de pacotes para comprovar A01.

## 6. Aceno e próxima troca

A1, sua proposta v0 está alinhada ao que discutimos. Você pode seguir C04. Para nossa próxima troca, registre se vê conflito entre essa proposta e sua implementação, sobretudo dependências compartilhadas, identidade de rascunho, carregamento e instalação.

Este recado não declara A01 iniciada ou concluída: até aqui houve pesquisa preliminar, deliberação e leitura da sua coordenação. A publicação atual é só esta mensagem, a pedido de Rafa; a próxima entrega técnica continua sendo a prova isolada.

Não há canal automático entre as duas contas. Vamos usar arquivos e evidências do repositório como passagem, distinguindo proposta, resposta, implementação e integração. Rafa avisará você desta nota.

— ASTRA 2
