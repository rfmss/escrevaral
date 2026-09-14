# Revisão das contribuições do AI Studio

Material recebido em 14/09/2026: `avaliação-escrevaral-—-auditoria-e-otimizações(2).zip`. Comparado com a v6 (`0dde2e9`) e com o PR 174. Os scripts do pacote foram lidos, não executados nem aplicados sobre o projeto.

O ZIP contém um painel de auditoria em React/Vite, exemplos interativos, scripts Python de substituição e uma variante do HTML. O painel serve como proposta de diagnóstico; não é uma nova base do produto. React, Tailwind, Motion e o SDK Gemini pertencem a esse painel e não foram adicionados ao Escrevaral.

| Contribuição | Decisão e motivo |
| --- | --- |
| Diálogos com marca, papel, filetes e marcas de registro | Aproveitar. O PR 174 já unifica as confirmações; recebe também as marcas de registro estáticas e centralização que permite rolagem em janela baixa. |
| Blur do fundo e animação de entrada do modal | Não incorporar. A sobreposição translúcida e o relevo estático produzem a separação visual com menos custo. |
| Troca global de `window.confirm` | Rejeitar a implementação. Ela mostra o modal, mas retorna `false` antes da resposta. Importação e confirmações de fichas ainda chamam essa função síncrona; clicar depois não retoma seus fluxos. No PR, cada ação usa continuação explícita. |
| Alvos de toque, contraste e calculadora duplicada | Confrontar com a v6. Parte do painel reproduz achados da v5 que já foram corrigidos. Não reaplicar as substituições antigas. |
| Fontes e redução do HTML | A variante entregue contém `url([INLINE_FONT_BASE64])` nas três fontes. Sua redução de bytes não demonstra otimização equivalente: perde os arquivos de fonte. Manter fontes locais embutidas e suas licenças no produto portátil. |
| Integridade do texto | A variante altera “expressão recorrente” para “express��o recorrente” no corpus. Preservar o texto válido da base; não aplicar o HTML entregue integralmente. |
| Pontuações 68/82/74/85/98 e métricas FCP/INP/LCP/CLS | Não tratar como medição. São constantes em `auditData.ts` e textos em `PerformanceAudit.tsx`; não há relatório de execução que sustente esses valores. O rótulo “análise em tempo real” não descreve essa implementação. |
| Web Worker para eliminar atraso | Hipótese para uma medição futura. A frase “resolve 100%” não tem evidência. Na base atual, `examine()` roda sob solicitação; os handlers de digitação não percorrem automaticamente todas as lentes. Worker também exigiria decidir CSP, cópia de dados e fallback. |
| IndexedDB e persistência de armazenamento | Tratar em etapa própria, com migração, recuperação e aparelhos alvo. O exemplo de migração chama uma função não implementada. Persistência não substitui exportação/backup e não autoriza prometer que os dados nunca serão apagados. |
| Aviso de atualização do service worker | A premissa está desatualizada: a v6 já chama `skipWaiting()` e `clients.claim()`. Verificar o ciclo real antes de introduzir um segundo mecanismo de atualização. |
| Simulador de seleção de lentes | Reaproveitar como hipótese de otimização, após comparação com o motor. Por exemplo, ignorar crase quando não existe “à” também pode omitir erros por ausência de acento. Não trocar a análise pelo simulador. |
| Quadro de giz | Conservar como protótipo para uma etapa própria. O código grava em `escrevaral.astra.chalk.v1`, global, sem vínculo ao caderno nem inclusão no pacote existente; isso contraria o projeto como unidade de exportação. |
| Eventos e gravação do quadro | Antes de integrar: escolher Pointer ou fallback por detecção; hoje Pointer e Touch são registrados simultaneamente. Faltam eventos de mouse para navegadores sem Pointer. A memória de traços/pontos cresce sem limite; o corte de 500 ocorre apenas ao gravar. Falhas de armazenamento são engolidas. |
| Hash/cartório/hackathon | Hash pode conferir integridade em relação a uma referência. A igualdade por si só não demonstra autor, data independente ou ausência de geração por IA. Não publicar as garantias do protótipo como capacidade comprovada. |

## Aplicação nesta entrega

Mantém-se o PR 174 concentrado em controles, confirmações e responsividade. Incorpora o detalhe de registro gráfico do modal sem blur, dependências ou mudança do modelo de dados. O quadro de giz, mudanças de armazenamento, expansão de corpus e colaboração não entram disfarçados de acabamento; possuem requisitos de integridade e escopo ainda não resolvidos pelo material.

Os testes do PR passaram em dados, pacotes, ES5, universo e recarga offline nas primeiras execuções. A verificação nova revelou que a v6 escondia `#pomodoro-task` abaixo de 760 px; corrigida a regra para manter o acesso à pausa ativa. A execução final passou em Chromium e WebKit: [run 34908613318](https://github.com/rfmss/escrevaral/actions/runs/34908613318). As capturas de Início, diálogos e pausa encerrada foram inspecionadas. Zoom real, teclado virtual e iPad físico permanecem verificações distintas da troca de viewport.
