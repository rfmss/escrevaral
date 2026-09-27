# Contrato da cortina Escrevaral

## Experiência proposta pelo autor

O autor escreve no editor. O controle **Escrevaral** começa desligado. Ao ligar, abre uma área com as análises disponíveis. O autor escolhe **Orações subordinadas** e recebe, na própria área, trechos extraídos da sua versão do texto, com explicações. Nada substitui, corrige ou reescreve o editor, nem por ação de um botão de resultado.

A página `/jornada/` demonstra esse percurso com anotações manuais do parágrafo enviado. É uma especificação executável da experiência, não um novo motor de subordinação. A interface de produção continua no painel Examinar até uma integração própria.

## Uma análise por vez — decisão de 25/09/2026

Ligar apenas abre opções. Escolher uma lente inicia somente aquele exame. Não há “analisar tudo”, fila automática de outras lentes ou reanálise ao digitar. Trocar a lente cancela o trabalho anterior e substitui a área de resultados ativos. As abas organizam trechos e explicações da lente escolhida; não disparam motores simultâneos. Editar exige nova solicitação explícita.

O painel atualmente publicado ainda oferece execução serial de sinais; esta jornada especifica a próxima interação e não altera esse comportamento agora.

## Estados do controle

| Estado | Comportamento |
| --- | --- |
| Desligado | Cortina recolhida, fila cancelada e nenhum exame linguístico de fundo da cortina. Escrita e gravação normais continuam. |
| Ligado, sem lente | Mostra as lentes, seu alcance e o que ainda não está disponível. Abrir não inicia exame completo. |
| Examinando | Captura folha, revisão do texto e escopo; mostra progresso real e permite cancelar. |
| Resultado atual | Mostra apenas resultados ligados à versão examinada; cada aba identifica sua lente e seu escopo. |
| Texto alterado | Invalida resultados e fila imediatamente. Não mantém trechos antigos como se ainda fossem atuais; oferece novo exame. |
| Sem achado | Informa “Nenhuma ocorrência encontrada neste recorte” e o limite da cobertura. Não certifica ausência de erro. |
| Sem cobertura/ambíguo | Explica o que não conseguiu determinar, preservando alternativas. |
| Falha/cancelamento | Mensagem recuperável; texto e escolhas persistidas intactos. |

Desligar fecha a cortina e descarta resultados transitórios, sem apagar escolhas salvas. Trocar de folha, iniciar IME ou editar invalida o trabalho em curso. As abas da lente escolhida compartilham a mesma versão do texto; resultado de outra folha nunca é reaproveitado apenas porque o conteúdo coincide.

## Conteúdo de um resultado

1. Trecho literal e posição no original, sem reticências inseridas dentro do trecho extraído.
2. Fenômeno e leitura proposta, com alternativa quando necessária.
3. Explicação simples: o que foi observado e qual relação sustenta a leitura.
4. “Entender melhor”: termos gramaticais, contexto, exceções, fonte e limites.
5. “Localizar no original”: move foco/seleção ou destaque visual sem mudar o valor do editor.
6. “Copiar trecho” e “Copiar análise”: cópia para uso fora do editor; nunca aplicar ao manuscrito.
7. Escolhas de apresentação/dispensa quando pertinentes, com revisão acessível. Dispensar uma observação não apaga uma regra nem muda sua classificação.

Não incluir “Corrigir tudo”, “Aplicar sugestão”, “Reescrever” ou ações equivalentes neste fluxo. A proibição de substituir o manuscrito é uma decisão permanente de produto enquanto o autor não a alterar explicitamente.

## Oração dentro de oração

Os trechos podem se sobrepor legitimamente: uma relativa pode estar dentro de uma temporal. Representar `parentId` e a relação; não somar esses trechos como palavras diferentes nem escondê-los por deduplicação textual. Diferenciar oração completa de núcleo destacado; qualquer recorte parcial deve ser identificado.

No exemplo, `que escapava entre os galhos` tem leitura relativa restritiva; a construção com `como se` admite leitura comparativa hipotética. `enquanto` e `onde` introduzem construções com vínculos distintos. `convidando...` exige revisão de vínculo e sujeito. Os infinitivos associados a `parecia pintar`, `parecia hesitar` e `convidando ... a mergulhar` também exigem critérios específicos; a demonstração não é uma contagem exaustiva de todas as orações. Fontes e limites da leitura estão no mapa.

## Contrato técnico de integridade

O motor recebe uma cópia imutável do texto e metadados; não recebe referência ao elemento editável nem métodos de gravação. O resultado contém `documentId`, `textRevision`/hash, versão do motor e das regras, lente, escopo, lista de spans UTF-16, leitura, evidências, alternativas, fonte, limites e relações entre achados.

Verificação obrigatória: `snapshot.slice(start, end) === snippet`. Normalização auxiliar nunca altera o original e precisa manter mapeamento de posições. Palavra idêntica em duas posições produz referências distintas. Se a revisão já mudou, o resultado não pode ser mostrado como atual. Um destaque deve ser camada visual ou seleção, não inserção de tags no valor do editor.

A análise linguística não escreve no armazenamento do manuscrito. Preferências e escolhas usam a infraestrutura já existente, com tratamento de falha. Não criar duplicação silenciosa de documentos.

## Custo e disponibilidade

O modelo atual usa 700 ms, 8.000 caracteres e até 1.600 tokens para sinais. O novo controle deverá suspender essa triagem quando desligado; isso ainda não está integrado. O orçamento de subordinação precisa de benchmark próprio, porque uma pausa não torna um analisador pesado leve.

Preferir exame de seleção, parágrafo ou documento explicitamente escolhido. Exibir alcance parcial; manter acesso manual; processar em blocos canceláveis e carregar dados sob demanda. Sem rede por padrão. Qualquer serviço externo ou modelo remoto exige decisão específica e informação clara sobre os dados enviados. O manuscrito não é corpus de treinamento automático.

Manter o contrato existente de HTML portátil, funcionamento offline e piso de compatibilidade do editor. Não introduzir dependências modernas no caminho de escrita. Recursos avançados devem ter limite e alternativa explícitos quando não couberem no aparelho.

## Acessibilidade e simplicidade

Mesmo sistema para qualquer idade, com aprofundamento escolhido pelo usuário. Linguagem inicial simples; termos técnicos explicados; sem perfis obrigatórios “iniciante/idoso”. Controle com estado anunciado, teclado, foco previsível, abas acessíveis, zoom, contraste e rolagem sem corte de ações. Animação da cortina é opcional e respeita movimento reduzido.

## Critério de aceite

Texto idêntico antes/depois de ligar, desligar, analisar, localizar, copiar, cancelar e trocar abas. Testar seleção, acentos decompostos, emoji, múltiplas ocorrências, aspas, URLs, IME e duas folhas com texto igual. Testar cancelamento durante o exame e confirmação de alcance. A demonstração manual não substitui esses testes no motor real.

## Incremento local de 26/09/2026

O comportamento de uma lente por escolha e suspensão de triagem automática foi integrado ao painel Examinar na cópia de trabalho. A apresentação definitiva do controle Escrevaral e a validação em navegador continuam pendentes. Estado e evidências: `ptbr/CONTEXTO-1.md`. Os parágrafos sobre o painel publicado acima descrevem a base remota 1d649c2.

## Publicação de 27/09/2026

O incremento v6-23 foi publicado em `e1c9a69`; o GitHub Pages concluiu o deploy com sucesso. As descrições da execução serial acima são históricas. A versão publicada já oferece uma lente por escolha, sem triagem automática; a apresentação final e a auditoria ampla continuam pendentes.
