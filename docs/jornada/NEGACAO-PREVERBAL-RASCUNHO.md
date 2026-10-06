# Não pré-verbal — regra testável, integração pendente

Base: `900ef4b7fa4c993d17314524aca68f3e6a54abe5`, 05/10/2026. PTBR-CTX-014 está isolada em `ptbr/experiments/negacao-preverbal/morfologia-contextual.js`. Não integra build/modules.json e não muda a distribuição v6.43.

## Decisão e correção encontrada

Reutiliza o apoio de CTX-001: pronome pessoal sujeito no início de unidade, não, clítico o/a/os/as opcional e forma indicativa compatível em pessoa/número. Exige leitura externa ADV para não. Candidatos preservados; três/quatro apoios originais e confiança moderada. Não resolve alcance semântico, intenção, verdade ou dupla negação.

O primeiro teste acusou DES13, Eu não cantar.: CTX-001 aceita indicativo/subjuntivo e o inventário admite cantar como futuro do subjuntivo. A nova regra exige ao menos uma leitura indicativa compatível, sem alterar CTX-001. Os gabaritos positivos/negativos permanecem como fixados antes da implementação. O escopo fica mais estreito; não são resolvidos usos do subjuntivo.

## Evidência e fixture

`tests/contexto-negacao-rascunho.cjs` injeta apenas no runtime isolado as duas leituras realmente consultadas no snapshot PortiLexicon `315e063da1f89c89e2097c6e72428ebefb9ab1d1`: não/ADV/_ e não/NOUN/Gender=Masc|Number=Sing. Não há importação produtiva nesta entrega e não é alegado Polarity=Neg fornecido pelos dados.

Com essa fixture, os 32 contrastes resultaram em doze decisões úteis, vinte abstenções esperadas, zero erradas e zero lacunas. As 63 expectativas anteriores foram preservadas. Resultado próprio, não independente nem cego.

Teste dirigido inclui candidato ADV ausente, pessoa/número e clítico, fronteiras/proteção, seleção com emoji/NFD, texto intacto, corte de token e teto de uma consulta por token. O CI executa o teste em Node e confere ES5 com acorn. A execução JavaScript V8 disponível também permite verificar o motor isolado; não equivale a montar e publicar esse motor no aplicativo.

Fontes de anotação lidas em 05/10/2026: https://universaldependencies.org/pt/dep/advmod.html e https://universaldependencies.org/u/feat/Polarity.html. São referências de apoio; não algoritmos de desambiguação.

## Próxima ação exata

Recuperar ambiente com filesystem, Node e Python. Conferir main e eventuais alterações locais; o rascunho local iniciado antes da indisponibilidade pode divergir deste arquivo testado.

Importar o lema não pelo conversor existente com os 12 hashes conferidos e todas as leituras das formas selecionadas. Conferir preservação integral das triplas anteriores. Transferir o patch revisado para ptbr/morfologia-contextual.js, mover os testes para o motor integrado e retirar o experimento duplicado. Não copiar HTML antigo.

Gerar release v6.44, distribuição e ficha pelo procedimento vigente; atualizar estado/plano/Jornada; conferir montagem, CI e Pages. O teste com fixture não fecha esse passo. A distribuição permanece v6.43 e M02 continua TODO, 11/25 marcos.
