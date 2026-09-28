# Arquitetura — v6-25

## Decisão e limites

A index publicada contém marcação da interface e referências a três recursos: CSS, cofre e aplicação. Não contém motores, listas linguísticas nem código executável inline. A versão de arquivo único continua disponível como artefato portátil gerado.

O objetivo desta etapa é permitir manutenção e transporte sem reescrever o comportamento existente. Não se promete uma estrutura imune a mudanças futuras. O modelo de documentos e as chaves de armazenamento não foram migrados.

## Fronteiras

1. **Dados locais:** `resources/pt-BR/local/` e inventários já existentes em `ptbr/`. Registrar fonte, versão e cobertura antes de ampliar listas. Livros recebidos são referências, não dados automaticamente redistribuíveis.
2. **Cofre:** `packages/cofre/src/` e módulos puros indicados em `build/modules.json`. Recebe string e lente, devolve ocorrências com posições e limites. Não conhece cadernos, DOM, armazenamento ou rede.
3. **Integração do editor:** `src/editor/contrato-analise.js` associa folha/revisão e converte offsets do recorte para o original. A aplicação invalida resultados após edição, IME ou troca de folha.
4. **Interface e persistência:** `src/ui/` e `src/storage/`. Apenas esta camada apresenta resultados e mantém as escolhas do autor.
5. **Conectores experimentais:** `packages/connectors/`. Fora da montagem de produção; nenhuma dependência Python ou peso neural vai para o navegador.

## Ordem e isolamento

`build/modules.json` declara a ordem de estilos e módulos, separando `cofre` e `app`. `sourceOrder` conserva a ordem anterior para os testes de regressão. O build confere a partição. Mudar a ordem exige justificar dependências e executar as verificações.

O pacote cofre encapsula um namespace por instância. A aplicação cria sua instância e a disponibiliza ao código legado como `window.Escr`. Essa ponte é uma dívida de compatibilidade deliberada. A API pública está em `packages/cofre/README.md`; acesso direto a campos internos não é contrato estável.

Os testes do cofre copiam seu arquivo para uma pasta temporária e o executam fora do repositório, sem navegador. Comparam também a montagem isolada com a ordem anterior em 290 casos. Isso verifica portabilidade e equivalência, não a qualidade linguística geral.

## Montagem e publicação

`build/release.json` centraliza versões. `scripts/build.cjs` monta recursos com SHA-256 no nome, index, portátil e service worker. `build/assets.json` registra caminhos, tamanho e hash. `build/extraction-v6-24.json` registra a base e os hashes no momento da extração; é histórico, não lista para impedir evolução das fontes.

O site e o arquivo portátil recebem exatamente os mesmos bundles e CSS. Substituições do template usam funções para não interpretar sequências `$` existentes em código ou estilos. A montagem falha quando há marcadores não resolvidos.

A raiz gerada é mantida por compatibilidade com GitHub Pages. Para outro hospedador, publicar **todo** `dist/site/`, nunca apenas a index. Atualizações futuras devem manter os recursos de versões anteriores durante a transição de abas abertas; a limpeza de assets antigos é uma tarefa separada. Para mudar os motores, editar fontes, incrementar versão quando couber, gerar, conferir e publicar. Não fazer force push.

## Offline e endurecimento nesta etapa

- CSP da index aceita scripts locais externos, sem `unsafe-inline` para JavaScript. O portátil requer scripts inline e conserva essa permissão.
- O service worker só ativa depois de conferir por hash a index, o cofre, o aplicativo e o CSS. Um download parcial ou de outra geração falha sem substituir o worker ativo.
- A navegação do editor usa a geração completa em cache; `/jornada/` e outras páginas não são substituídas pelo editor.
- A simulação de cache cobre falha de integridade, ativação e leitura offline. Não há exigência de teste visual ou em dispositivos; a referência tecnológica orienta o código.
- O servidor de desenvolvimento restringe arquivos à sua raiz, resolve links e informa MIME correto. É local, não um servidor de produção.
- `package-lock.json` fixa as ferramentas. CI roda na `main` e em PRs: montagem reproduzível, contratos e regressões essenciais.

## Acesso offline e recuperação — C03 / v6-28

| Caminho | Dependências e estado | Recuperação |
| --- | --- | --- |
| Site | HTML + três recursos locais. Tenta cache opcional apenas com APIs disponíveis e contexto permitido. Informa preparação, ativação ou alternativa portátil; registrar um worker não basta para anunciar prontidão. | Voltar ao site conectado; trazer cópia do acervo pelos controles existentes. |
| Site instalado / PWA | Mesma aplicação e mesmo cache; instalação não substitui cópia dos textos. Cache pode ser removido pelo navegador. | Guardar mesa portátil e exportar acervo separadamente. |
| Arquivo portátil | CSS, fontes, cofre e aplicativo incorporados. Identificado pelo build, inclusive se servido por HTTP. Não registra worker nem depende de Promise, Cache API ou Web Crypto para inicializar seu caminho offline. | Abrir o HTML num navegador que aceite arquivos locais e usar “Trazer arquivo”. Não presumir que o acervo do domínio aparece na origem do arquivo. |

A seção “Escrever sem internet” oferece link de download e link comum para abrir a mesa; este último permite salvar a página onde o navegador disponibilizar essa opção. As instruções são HTML estático e não dependem do sucesso do registro/cache. Exportar tudo continua sendo uma ação explícita. Importar a cópia acrescenta textos; não substitui o acervo existente. Não há migração silenciosa entre origens.

O worker moderno permanece isolado em seu próprio arquivo. Falha de registro/instalação e ausência de APIs levam à orientação portátil. `tests/offline-access.cjs` verifica essa decisão, a ativação efetiva e a incorporação dos recursos essenciais; `tests/offline-cache.cjs` verifica geração/cache por simulação. Estes testes não certificam navegadores específicos. C04 revisará os mecanismos de download, importação, exportação e seleção; C03 não declara essa revisão concluída.

## Dívidas explícitas

`src/editor/controlador.js` ainda concentra coordenação de fluxos antigos. Os estilos mantêm a ordem histórica da cascata. Os módulos puros de `ptbr/` ainda compartilham espaço com corpus e documentação. A decomposição seguinte deve tratar um fluxo por vez, com contratos próprios, sem trocar armazenamento ou UX por conveniência.

Continuam revisão de acessibilidade e custo no código, avaliação linguística reservada e decisão sobre modelos grandes. Testes visuais e em dispositivos foram dispensados por Rafael; não são pendência de entrega. O bundle do cofre inclui os inventários atuais; carregamento por lente e execução em Worker são evoluções possíveis, não capacidades entregues.

## Transporte e seleção — C04 / v6-29

`src/ui/transferencia.js` isola capacidades do navegador; o controlador mantém a política e validação dos pacotes. Download indisponível apresenta cópia literal nos Ajustes; conteúdo colado e FileReader convergem para a mesma importação confirmada. Seleção tem alternativa e falha recuperável, sem editar o manuscrito. Exportação do rascunho não exige nova gravação. Ver [entrega e limites](jornada/ENTREGA-V6-29.md). Formatos e transações existentes foram preservados; pacotes linguísticos grandes continuam em A02.

## Pacotes opcionais — A02 parcial / v6-30

`src/storage/pacotes.js` declara uma fábrica transacional de versões/blocos; não abre banco automaticamente nem inicia downloads. Detalhes, envelope experimental, testes e pendências em [Persistência de pacotes](PERSISTENCIA-PACOTES.md). O módulo não interpreta léxico nem integra o conteúdo de A01. A02 continua TODO; o pacote de teste IndexedDB só pertence ao desenvolvimento.
