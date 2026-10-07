<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-57.json -->
# Pausa limitada e vocabulário linguístico explícito

v6.57: preparação após 700 ms com prefixo de até 2.000 caracteres/400 tokens, cancelamento e três estados de pertinência. As 16 análises explicam o que identificam e seus limites. A03 continua parcial.

Base: `4e5763ec03132da3282f4f438141ae2c67565dcd`. Coordenação solo; data 07/10/2026.

## Direção do autor e decisão

Preservar o painel v6.56 aprovado, respeitar pausas e aparelhos antigos; melhorar identificação e nomenclatura. Reaproveita triagem local existente sob tetos menores, sem executar uma fila de lentes. Não exige pacotes grandes A02, novos dados ou dependências. Contrato vigente em CONTRATO-PACOTES-LINGUISTICOS.md. Prefixo é primeira etapa explícita, não implementação disfarçada de incrementalidade.

## Termos e estados

Cada análise recebe descrição de objeto/limite: ortografia, acentuação, pontuação, crase/regência parcial, concordância delimitada, classes morfológicas/contexto, funções sintáticas, relativas adjetivas, expressões, repetição, formas em -mente, diálogo, ritmo, rima, métrica e vocabulário decolonial. Separação entre forma do léxico, hipótese contextual, função sintática e observação estilística. Encontrar que não prova relativa. Indício não é diagnóstico ou erro. Nenhum indício no recorte não elimina acesso à análise; sem verificação permanece distinto.

## Custo e pendências

Um timer e um cache de recorte, sem histórico ou cópia da folha no preparador; prefixo máximo2001 UTF-16, exame2000/400tokens. Índice pequeno existente criado sob demanda. Não há timer periódico nem continuação automática no resto da folha. IME/edição/fechamento/ocultação/análise explícita cancelam o trabalho pendente. A03 geral permanece TODO: regiões alteradas, contexto seguro, offsets reservados e filtro. Mantém motores/cofre/dados sem alteração; nenhuma alegação de cobertura linguística ampliada.

## Verificações e publicação

Preparador com relógio simulado: antes/depois de700ms, reinício em rajada, um timer, cache de uma entrada, folha diferente, ocultação/cancelamento/falha. Triagem real: limites2000/400, truncamento, citações abertas, Unicode decomposto. Painel, consulta lexical e flexões aprovados; ES5 e montagem reproduzível. CI/Pages a conferir por commit. Chromium real: zero exames completos na preparação, indício lexical e relativas não verificadas, fluxo de análise/seleção/consulta preservado e zero erros de página.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

A03-regioes: fixar fronteiras e estados para trechos alterados, incluindo citações e Unicode; reservar ocorrências exatas com identidade de folha/revisão antes de filtrar análises. Preservar tetos, suspensão e acesso manual.

Plano v4: 12/25 DONE | entrega +0 marcos (nenhum) | próximo A03 | publicação: Actions por commit | limite: Somente prefixo; sem preparação incremental geral, reserva de ocorrências ou filtro automático. Limites de operações/payload não são medida de RAM total nem homologação de dispositivos.
