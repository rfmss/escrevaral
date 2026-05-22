# Meta Vereda 100% — Engines e Verificacao

Este arquivo deve ser lido no inicio de toda sessao de desenvolvimento do Vereda.

Objetivo: manter no radar a meta de levar cada engine a 100% de maturidade, por etapas, sem trocar clareza de produto por excesso tecnico.

Frase-guia:

> Tudo existe desde o começo; cada coisa no seu lugar, nada invade antes da hora.

## Pilar transversal: portugues brasileiro integral

Toda interface visivel do Vereda deve estar em portugues brasileiro. Nenhum motor chega a 100% se depender de estrangeirismo para se explicar.

Regra de produto:

- Falar primeiro com escritor, depois com tecnico.
- Usar beneficio humano na tela principal.
- Guardar mecanismo tecnico para detalhes, ajuda, exportacao tecnica ou documentacao.
- Trocar estrangeirismos visiveis por palavras brasileiras: copia de seguranca, salvamento automatico, sem internet, guia da forma, olhar do texto, situacao, janela, dica, baixar, trazer arquivo, assinatura do texto.

Evidencia de maturidade:

- Uma escritora entende a promessa sem saber ingles tecnico.
- A tela nao usa backup, autosave, offline, toggle, blueprint, template, inspector, precision, status, modal, tooltip, upload, download, hash, cache ou browser como copy visivel.
- O tom continua claro, adulto e simpatico; nao vira explicacao infantil.

## Protocolo de abertura

Ao abrir o projeto, antes de propor alteracoes:

1. Ler este arquivo junto com `CLAUDE.md`.
2. Identificar se a tarefa atual toca protecao, preservacao, edicao, revisao, verificacao ou oficio.
3. Declarar qual engine sera beneficiada.
4. Propor o menor passo que aumenta maturidade sem inflar a interface.
5. Se a tarefa nao mover nenhuma engine em direcao a 100%, dizer isso explicitamente.

Pergunta padrao da sessao:

> Qual engine vamos aproximar de 100% hoje, e por qual evidencia?

## Regua de maturidade

- 0%: ideia solta, sem implementacao.
- 25%: prototipo funcional, sem integracao confiavel.
- 50%: funciona em fluxo feliz, mas quebra em bordas comuns.
- 70%: usavel em produto, com promessa limitada e linguagem cuidadosa.
- 85%: confiavel para uso recorrente, com estados vazios, erro, importacao/exportacao e QA responsivo.
- 95%: robusto, testado em cenarios reais, com copy clara e falhas previsiveis.
- 100%: pode ser prometido publicamente sem ressalva escondida.

100% nao significa complexidade maxima. Significa: promessa certa, comportamento consistente, UX limpa, dados preservados e limites honestos.

## Estado em 2026-05-20

| Area / engine | Maturidade | Promessa atual |
|---|---:|---|
| Prova de autoria | 76% | Protecao local do processo de escrita |
| Validacao da prova | 58% | Conferencia tecnica basica de arquivo e hash |
| `.vrda` / envelope nativo | 72% | Integridade local de pacote Vereda |
| Backup / restore | 78% | Preservacao do acervo |
| Backup externo via File System | 64% | Copia local avancada dependente do navegador |
| Versionamento | 67% | Historico simples de snapshots |
| Offline / PWA | 78% | Uso local/offline com cache versionado |
| Editor / documento | 74% | Escrita e edicao principal |
| Paginacao / modo pagina | 62% | Visualizacao editorial alternativa |
| Exportacao / impressao | 80% | Saida limpa de texto/documento |
| Arquivo / acervo | 82% | Organizacao de manuscritos e notas |
| Templates / guias | 70% | Oficio orientado por modelos |
| Precision / aderencia ao guia | 63% | Leitura heuristica do texto contra o guia |
| Lexico / Biblioteca | 78% | Analise local de palavra, campo e funcao |
| Sintaxe | 70% | Pistas sintaticas locais |
| Pontuacao | 73% | Regras locais de pontuacao e norma |
| Analise geral | 72% | Leitura editorial de economia, clareza, ritmo, voz, POV e lexico |
| Espelho de Voz | 68% | Reconhecimento de padroes de voz |
| RimaLab | 55% | Beta de silabificacao, tonicidade e rima |
| Decolonial / vocabulario | 60% | Observador e repertorio de linguagem |
| Direitos / publicacao | 57% | Guia de cautela, nao motor juridico |

## Prioridades por camada

### 1. Protecao

Engines: `proof-engine.js`, `proof-controller.js`, `vrda-engine.js`

Meta de curto prazo:

- Prova de autoria desde o primeiro caractere.
- Validacao mais clara: arquivo confere, texto mudou, arquivo desconhecido.
- Copy emocional: proteger processo humano, sem prometer valor juridico automatico.

Evidencia de avancar:

- Um escritor entende o valor sem saber o que e hash.
- O arquivo exportado pode ser reimportado e comparado com o manuscrito ativo.
- Estados "sem texto", "texto alterado" e "arquivo invalido" sao claros.

### 2. Preservacao

Engines: `backup-engine.js`, `filesystem-backup-engine.js`, `version-engine.js`, `state-store.js`

Meta de curto prazo:

- Estado vazio real quando nao ha notas.
- Backup que nunca ressuscita exemplos.
- Historico de versoes compreensivel como seguranca de escrita, nao painel tecnico.

Evidencia de avancar:

- Apagar a ultima nota deixa o estojo limpo.
- Importar/exportar acervo preserva manuscritos, provas, versoes e metadados.
- Falhas de arquivo sao recuperaveis e explicadas.

### 3. Escrita

Engines: `document-engine.js`, `pagination-engine.js`, `editor-controller.js`, `editor-modes.js`

Meta de curto prazo:

- Primeiros 60 segundos focados em escrever.
- Modo pagina como visualizacao, nao outro produto.
- Foco e Ler com diferencas nitidas de intencao.

Evidencia de avancar:

- Manuscrito vazio nao mostra ferramentas antes da primeira frase.
- Fluxo e Pagina mantem as mesmas features, sem herdar estilos indevidos.
- Impressao sai como documento tecnico, sem firula visual do site.

### 4. Revisao local

Engines: `analise-engine.js`, `syntax-engine.js`, `punctuation-engine.js`, `lexical-engine.js`, `precision-engine.js`

Meta de curto prazo:

- Revisao aparece como consequencia do texto.
- Heuristicas se apresentam como pistas, nao sentencas.
- Inspector e classes ficam discretos ate haver material suficiente.

Evidencia de avancar:

- Nao ha zeros ou paineis vazios na primeira abertura.
- Falsos positivos sao tratados com linguagem de possibilidade.
- Cada alerta oferece acao util, nao apenas diagnostico.

### 5. Oficio profundo

Engines: `voice-engine.js`, `rimalab-engine.js`, `decolonial-engine.js`, `rights-engine.js`, `template-engine.js`

Meta de curto prazo:

- Academia aparece por sinal real do texto, nao por contagem arbitraria.
- Guias ficam no painel, nunca invadem o editor.
- RimaLab tratado como beta ate a precisao poetica subir.

Evidencia de avancar:

- O escritor descobre ferramentas porque o proprio texto pede.
- Templates orientam sem preencher a folha por ele.
- Direitos e publicacao orientam cautela sem parecer consultoria juridica.

## Regras para subir porcentagem

Uma engine so sobe de maturidade quando houver pelo menos uma evidencia concreta:

- fluxo testado em desktop, celular ou TV portrait;
- estado vazio definido;
- erro recuperavel;
- exportacao/importacao validada;
- copy alinhada ao limite real da promessa;
- comportamento documentado em auditoria;
- teste manual ou automatizado registrado.

Nao subir porcentagem por:

- aumentar numero de componentes;
- adicionar texto explicativo demais;
- esconder problema de UX atras de termo tecnico;
- criar ferramenta antes de ela ter momento de uso.

## Proxima pergunta de produto

Se a sessao estiver sem foco, escolher uma:

1. Qual engine esta prometendo mais do que entrega?
2. Qual engine entrega valor mas aparece cedo demais?
3. Qual engine ja funciona, mas ainda nao sabe se explicar?
4. Qual engine precisa de evidencia real em celular/TV portrait?
5. Qual engine deve ficar mais silenciosa para o escritor escrever?
