# Cobertura bibliográfica da calibração pt-BR

Este mapa responde a uma pergunta operacional: **temos fonte suficiente para implementar uma regra com segurança?**

Não mede prestígio de autor e não autoriza copiar obras. A classificação é sobre cobertura para o Escrevaral.

## Estados

- `PRONTO` — há base suficiente para criar banca e regra de alta confiança.
- `CONFRONTAR` — há material, mas a decisão exige comparar fontes/variação antes de codificar.
- `ESTILO` — fonte serve para descrever efeitos, não para produzir erro normativo.
- `LACUNA` — não há bibliografia específica suficiente entre as referências atualmente recebidas.

## Matriz

| domínio | estado | fontes principais disponíveis | decisão de produto |
|---|---|---|---|
| estrutura de frase / oração / período | PRONTO | Cunha & Cintra; Bechara, *Lições* | `syntax` pode ganhar bancas estruturais progressivas |
| sujeito / predicado / complementos | PRONTO | Cunha & Cintra; Bechara, *Lições* | base de pontuação e concordância |
| concordância verbal | PRONTO | Cunha & Cintra; Bechara, *Lições*; Bechara, *Dicionário de Dúvidas* | regras somente quando sujeito/forma verbal forem identificáveis com confiança |
| concordância nominal | PRONTO | Cunha & Cintra; Bechara, *Lições* | evitar inferência de gênero só por terminação quando houver léxico disponível |
| verbos impessoais | PRONTO | Bechara, *Lições*; Cunha & Cintra | C2 iniciado: `haver`, `fazer`, `existir` |
| regência verbal | CONFRONTAR | Bechara, *Lições*; Bechara, *Dicionário de Dúvidas*; Cunha & Cintra | tratar mudança de sentido e variação brasileira antes de alertar |
| regência nominal | CONFRONTAR | Cunha & Cintra; Bechara | construir por núcleos de alta frequência, sem tabela cega |
| crase | PRONTO | Bechara, *Dicionário de Dúvidas*; Cunha & Cintra; materiais práticos | C5 começou pelas impossibilidades; casos facultativos ficam fora até banca própria |
| pontuação sintática | PRONTO | Cláudio Moreno; Bechara, *Lições*; Cunha & Cintra | C1 em curso por vínculo sintático |
| pontuação expressiva / ritmo | ESTILO | Noah Lukeman + gramáticas para contraste | nunca chamar escolha rítmica de erro gramatical |
| ortografia / acentuação / hífen | PRONTO | Cunha & Cintra; Bechara, *Dicionário de Dúvidas*; obras práticas | priorizar regras produtivas e dúvidas frequentes |
| classes de palavras / morfologia | PRONTO | Cunha & Cintra; Bechara | manter política de confiança/ambiguidade existente |
| formação e flexão verbal | PRONTO | Cunha & Cintra; Bechara | ampliar `verbMorphology` com banca, não por lista solta |
| colocação pronominal | CONFRONTAR | Cunha & Cintra; Bechara | português brasileiro exige distinguir norma formal, uso corrente e estilo |
| pronomes / referenciação | PRONTO | Cunha & Cintra; Bechara; Bechara, *Compreender* | útil para coesão referencial; ambiguidade só com evidência |
| coesão referencial | PRONTO | Bechara, *Compreender* | C4 mapeia sinais; próximo passo pode localizar cadeias referenciais |
| coesão sequencial | PRONTO | Bechara, *Compreender* | mapear conectores por relação sem dizer que um é sempre intercambiável com outro |
| coesão recorrencial | PRONTO | Bechara, *Compreender* | recorrência é dado; repetição problemática depende de contexto/estilo |
| coerência global | CONFRONTAR | Bechara, *Compreender* | não criar score de coerência; exigir evidência discursiva mais forte |
| polissemia / homonímia / paronímia | PRONTO | Bechara, *Compreender*; Cunha & Cintra | fortalecer resolução contextual no Léxico |
| sinonímia / matiz | PRONTO | Nascentes para compreensão de método; Bechara para relações semânticas | corpus distribuído deve ser autoral; C3 já aplica matizes sem cópia |
| figuras de sintaxe | PRONTO | Bechara, *Compreender*; Bechara, *Lições* | classificar recurso antes de chamar desvio; figuras podem ser intencionais |
| figuras de palavra / pensamento | PRONTO | Bechara, *Compreender* | ferramenta de leitura/consciência estilística, não corretor |
| tipologia narrativa/descritiva/dissertativa | PRONTO | Bechara, *Compreender* | base pedagógica; ainda não suficiente para templates literários específicos |
| poesia: métrica e escansão pt-BR | LACUNA | referências atuais não são tratado específico de versificação | RimaLab preserva engine existente; não recalibrar núcleo métrico sem fonte própria |
| rima / fonética poética | LACUNA | gramática cobre fonética, mas não técnica poética em profundidade | precisa bibliografia de versificação/poética brasileira |
| diálogo literário brasileiro | CONFRONTAR | gramáticas/pontuação oferecem sinais, mas não uma teoria completa de construção de diálogo | pontuação pode avançar; efeitos narrativos pedem fonte literária específica |
| conto | LACUNA | referências atuais não definem contrato editorial suficiente | não inventar thresholds de `precision` |
| crônica | LACUNA | idem | buscar referência de gênero antes de recalibrar |
| romance | LACUNA | idem | distinguir estrutura narrativa de receita editorial |
| ensaio | LACUNA | tipologia ajuda, mas não basta para template | precisa bibliografia específica |
| roteiro | LACUNA | sem manual de roteiro entre as fontes atuais | não recalibrar checks específicos ainda |
| jornalismo | LACUNA | obras práticas usam exemplos jornalísticos, mas não são manual de gênero | precisa referência editorial/jornalística própria |
| escrita acadêmica | LACUNA | gramática dá língua, não convenções acadêmicas | precisa fonte específica |
| redação técnica/profissional | LACUNA | materiais de dúvidas ajudam, mas não definem gênero | precisa fonte de redação técnica/oficial/editorial conforme alvo |
| voz autoral | ESTILO | Lukeman ajuda indiretamente; `voice-engine` tem heurísticas próprias | calibrar por corpus autoral/estatístico, não por norma gramatical |

## Frentes autorizadas com a biblioteca atual

1. **Pontuação + sintaxe:** ampliar vínculos, vocativo, aposto, intercalação, deslocamentos e orações.
2. **Concordância:** sujeito/verbo e grupos nominais de alta confiança.
3. **Impessoalidade:** ampliar tempos/locuções depois da banca C2.
4. **Crase:** avançar de impossibilidades para obrigatória/facultativa somente com contexto sintático suficiente.
5. **Morfologia verbal:** usar gramática para melhorar classificação de formas, não correção por sufixo isolado.
6. **Léxico contextual:** ampliar polissemia, registro e matizes; corpus sempre autoral.
7. **Coesão:** evoluir mapa observável sem produzir nota de coerência.
8. **Figuras:** reconhecer recursos expressivos antes de diagnosticar como erro.

## Frentes bloqueadas por falta de fonte específica

Não recalibrar de forma normativa/quantitativa ainda:

- métrica/versificação do RimaLab;
- templates de conto, crônica, romance, ensaio e roteiro;
- convenções de jornalismo, escrita acadêmica e técnica;
- thresholds estilísticos de gênero no `precision-engine`.

A ausência de fonte não impede a ferramenta atual de funcionar. Ela impede apenas que uma heurística existente seja promovida a **regra calibrada** sem evidência.

## Próximas referências que realmente agregariam

Quando a biblioteca atual tiver sido explorada, as lacunas prioritárias são:

1. versificação e poética em português brasileiro;
2. teoria/prática do conto e da crônica brasileira;
3. narrativa longa / romance e construção de cena;
4. diálogo literário e discurso direto/indireto;
5. roteiro em português brasileiro;
6. redação jornalística/editorial;
7. escrita acadêmica/técnica conforme os templates que o produto realmente oferecer.

Não é necessário adicionar livros apenas para aumentar volume. Uma nova referência entra quando cobre uma lacuna identificada acima ou ajuda a resolver uma divergência concreta.
