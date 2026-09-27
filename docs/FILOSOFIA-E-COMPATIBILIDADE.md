# Filosofia de engenharia e piso de compatibilidade

Diretriz de Rafael incorporada em 27/09/2026 a partir de **Escrevaral OS — Documento de Arquitetura e Decisões de Design.docx**, 18 páginas. Este registro consolida o anexo com as decisões posteriores da conversa e com o código real; não copia seu protocolo de “ativação de IA” nem reinicia o projeto.

## Princípio orientador

Usar capacidade de engenharia atual para construir um instrumento que exija pouco do aparelho. Criatividade, proporção, tipografia, linhas e estados discretos devem produzir a experiência de oficina e papel eletrônico. A longevidade depende também de formatos documentados, conservação de dados e verificações reproduzíveis.

- Aplicativo entregue: JavaScript clássico, HTML/CSS enxutos, sem frameworks, CDN, telemetria ou serviços obrigatórios.
- Referência tecnológica: a época do Android 4.4 KitKat e dos iPads de 2012. Ela orienta simplicidade, economia e escolha de recursos; não é uma matriz de aparelhos a homologar.
- Decisão explícita de Rafael: não realizar nem exigir testes em KitKat/iPad e não exigir teste visual antes de publicar. Ajustar o produto a partir do retorno do autor, com criatividade e baixo custo. Não apresentar a referência histórica como certificação de compatibilidade universal.
- Escrever, salvar, reabrir, exportar e usar os recortes essenciais de análise devem ter caminhos completos no piso alvo.
- A montagem e o CI podem usar ferramentas atuais fora do aparelho do escritor. A aprovação da arquitetura modular mantém Node/npm como ferramentas de desenvolvimento; nenhuma dependência npm precisa ser instalada pelo usuário final.
- Recursos posteriores ao piso não podem ser requisito escondido do fluxo essencial. A PWA atual é uma camada adicional; o caminho legado de acesso/offline deve ser revisto no código. Reescrever um service worker em ES5 não cria suporte a service workers onde ele não existe.
- Não exigir modelos grandes, rede, GPU ou novas APIs para escrever. Portparser continua experimental e deve ser julgado contra esse orçamento.

## Linguagem visual e interação

Papel sage `#CCD5C7`, tinta `#1E2320`, linhas discretas e hierarquia editorial orientam a direção. O estado atual inclui outros tons e componentes históricos; esta diretriz não declara uma revisão visual já realizada.

O movimento deve usar poucos estados e evitar trabalho visual contínuo. Evitar 3D decorativo, blur e recomposição sem necessidade. Medir o custo em vez de prometer “CPU zero”. Respeitar movimento reduzido; não adicionar flashes invertidos por padrão. O pulso visual do anexo é uma proposta a avaliar quanto a conforto/acessibilidade, não uma obrigação de piscar a tela.

A digitação não espera transições nem análises. O limite de 16 ms do anexo é uma meta a medir num cenário definido, não “latência zero” comprovada. Salvamento local precisa informar falhas e oferecer exportação; não prometer risco zero de perda.

## Como reconciliar o anexo com o projeto atual

| Tema | Decisão aplicada |
| --- | --- |
| Um único `index.html` | Fontes modulares aprovadas permanecem. O site tem assets externos; `escrevaral.html` é a distribuição única gerada. A estratégia deve ser coerente com a referência de época, sem exigir ensaio em iOS antigo. |
| PWA como arquivo autossuficiente | Cache do site e abertura de arquivo portátil são caminhos diferentes. Não afirmar que um service worker resolve o navegador antigo ou funciona via `file:`. |
| Sem npm | Sem dependência de runtime npm/CDN no produto; ferramentas de montagem/teste ficam fora do aparelho do autor. |
| Análise após pausa e filtros que escondem lentes | Prevalece uma lente por escolha explícita, sem varredura de fundo nem ocultação impeditiva de acesso manual. Contagens mecânicas não autorizam diagnóstico automático. |
| “Prosa limpa” | Não usar como aprovação linguística. Ausência de achados significa apenas ausência dentro do recorte examinado. |
| `.scrvrl` como YAML + Markdown | Os pacotes existentes são estruturados em JSON legível. Documentar o formato real e conservar importação/exportação; não migrar o acervo apenas para imitar um exemplo do anexo. |
| OPFS/IndexedDB | Possíveis camadas opcionais futuras, não pré-requisito nem implementação presumida. Preservar o armazenamento atual até uma migração própria. |
| Copiar, colar e quarentena | Conferir comportamento e decisões de autoria existentes; não acrescentar bloqueios ou mudanças de clipboard nesta frente de compatibilidade. |
| Hash como prova de autoria humana | Hash registra integridade de conteúdo; não identifica sozinho quem o escreveu. Não prometer autoria humana exclusiva nem anterioridade externa comprovada por registro somente local. |
| Alegações neurocientíficas | Tratar cadência/materialidade como intenção de design; não anunciar indução de ondas cerebrais ou benefícios clínicos como resultado demonstrado. |
| Esperar validação a cada passo | Vale a autorização posterior de execução autônoma e publicação na main com verificações essenciais. Testes visuais e em aparelhos não são requisitos; ajustes visuais seguem o retorno do autor. |

## Pendências identificadas no código

1. Painel: C02 concluída na v6-27; tabela CSS, blocos e margens substituem Grid/Flex/gap, com rolagem e seleção preservadas.
2. C03 concluída na v6-28: worker moderno isolado e opcional; arquivo portátil sem registro/cache, estados de falha e instruções de recuperação. C04 revisa as APIs de transporte do acervo.
3. Download, importação, clipboard, seleção e salvamento: revisar APIs e caminhos alternativos no código, preservando dados.
4. Relógio: animação 3D substituída na entrega C01 por duas metades estáticas, troca intermediária de 70 ms e estado final. Relógio oculto e preferência de movimento reduzido fazem troca direta; Q01 revisa simplicidade e acessibilidade no código.

As fontes técnicas já consultadas para a triagem foram os anúncios oficiais do WebKit sobre [Safari 10.1](https://webkit.org/blog/7477/new-web-features-in-safari-10-1/) e [Safari 14.1](https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/). Essas fontes orientam escolhas conservadoras de recursos; sintaxe ES5 isoladamente não garante todas as APIs. Não criar uma fila de ensaios em aparelhos.

## Regra de conclusão

Cada caixa do plano tem escopo, evidência e critério. `DONE` significa que aquela entrega delimitada foi concluída; não implica certificação de aparelhos. Não há exigência de testes nesses aparelhos ou de teste visual como condição de publicação. O avanço público usa contagens de caixas e seu delta, sem porcentagem de “língua coberta”.
