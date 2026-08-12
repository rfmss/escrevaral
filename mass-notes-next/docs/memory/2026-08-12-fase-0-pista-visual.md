# FASE 0 — Pista visual antes da tela de escrever

Atualizado em: 2026-08-12  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — deve permanecer aberto e draft  
Decisão: **M1-R0 entra em pausa documentada; a frente ativa passa a ser a experiência de escrita, uma tela por vez.**

## 1. Por que esta FASE 0 existe

O novo Plano de Voo define uma mudança de método: antes de continuar aprofundando a linguagem computacional, o Escrevaral precisa provar a experiência mais básica e mais importante do produto — abrir um texto e querer escrever nele.

Isso não autoriza recomeçar o produto, trocar Tiptap, construir uma nova aplicação nem abandonar o trabalho linguístico. A intenção é exatamente a oposta: preservar a fundação já provada e alterar o mínimo necessário para que a casca atual saiba desaparecer durante a escrita.

A pergunta da FASE 1 é:

> **Eu abriria o Escrevaral agora e teria vontade de escrever aqui?**

## 2. Baseline que não pode ser destruída

A aplicação atual já possui uma fundação funcional relevante. O redesign não parte de um mockup vazio.

### Shell atual

`App.tsx` monta hoje:

```text
Library | workspace/manuscrito | RightRail
```

O workspace inclui:

- cabeçalho técnico de registro;
- estado de salvamento;
- título editável;
- estado do documento;
- editor `MassNotesEditor` baseado em Tiptap;
- ferramentas de revisão ligadas ao contrato de posição;
- botão de leitura do texto.

No mobile, Acervo e ferramentas já podem operar como drawers transitórios.

### Persistência e segurança autoral

Preservar integralmente:

- documento estruturado do Escrevaral;
- persistência em IndexedDB;
- autosave automático;
- recovery local de emergência;
- proteção contra conflito entre abas via `BroadcastChannel`;
- cópia de segurança quando há conflito;
- invalidação de leituras linguísticas quando o manuscrito muda;
- nenhuma substituição automática do manuscrito.

O autosave atual agenda persistência depois de aproximadamente 650 ms de inatividade, sem exigir um botão Salvar como interação primária.

### Editor e contratos

Preservar:

- Tiptap/ProseMirror;
- contrato estrutural de posições do editor;
- navegação de ocorrências da revisão;
- decorations já existentes;
- snapshot vivo usado pelas engines;
- importação/exportação já provadas;
- atalhos e comportamento funcional que não pertençam ao alvo visual desta fase.

### Estados já existentes

O produto já conhece, entre outros:

- modo Foco;
- tema claro/escuro;
- Acervo;
- RightRail;
- revisão;
- conflito;
- autosave;
- documento novo/duplicado;
- Anatomia como experiência separada dentro do mesmo shell.

A FASE 1 não deve redesenhar tudo isso. Ela decide apenas o **estado de repouso da escrita**.

## 3. O que aprendemos com o iA Writer e será testado

A referência é de disciplina, não de cópia visual.

Hipóteses a testar na primeira tela:

1. o texto pode ser praticamente a interface inteira durante a escrita;
2. espaço vazio é parte funcional da ergonomia;
3. a largura do manuscrito deve ser deliberada, não simplesmente ocupar toda a janela;
4. tipografia de escrita deve ser escolhida pela permanência e ergonomia, não por parecer uma página impressa;
5. ferramentas podem existir sem permanecer visíveis;
6. o Blueprint pode recuar durante `ESCREVER` e reaparecer quando a pessoa entra em `EXAMINAR`.

## 4. O que está fora da FASE 1

Não pedir ao Stitch e não implementar ainda:

- Acervo aberto;
- Palavras;
- Revisão;
- Contexto;
- Voz;
- RimaLab;
- Anatomia;
- mobile;
- site público;
- nova navegação global;
- nova arquitetura de dados;
- nova engine;
- novo framework/editor;
- gamificação;
- layout final pós-Cofre.

## 5. O que a primeira exploração visual precisa decidir

Somente:

- largura da coluna de escrita;
- posição vertical inicial do manuscrito;
- tipografia de escrita;
- tamanho e presença do título;
- fundo e contraste;
- cursor/seleção;
- quantidade mínima de chrome;
- apresentação discretíssima do autosave;
- eventual presença ou ausência de uma toolbar em repouso.

## 6. Método com Stitch

Stitch é laboratório visual, não memória do produto.

A primeira solicitação deve produzir **uma única tela desktop de escrita em repouso**, preferencialmente em 1440×900, sem tentar resolver outras áreas do aplicativo.

Se a geração regressar Acervo, ferramentas, marca, mobile ou outro elemento fora do alvo, a regressão pode ser ignorada no mockup. Só o alvo solicitado será julgado.

Regressões no produto real, testes, acessibilidade, persistência ou contratos jamais podem ser ignoradas.

## 7. Gate para sair da FASE 1

A tela só é aprovada quando:

- a humana responsável disser explicitamente que quer escrever ali;
- o manuscrito for a primeira coisa percebida;
- nenhum elemento de software competir com o texto sem necessidade;
- a largura e a hierarquia funcionarem em 1440×900 e 1366×768;
- autosave continuar compreensível e tranquilizador;
- o protótipo não inventar features para compensar falta de composição;
- a implementação posterior preservar toda a fundação descrita acima.

## 8. Pausa limpa de M1-R0

A frente linguística **não foi cancelada nem considerada concluída**.

Ela fica congelada exatamente após a infraestrutura reproduzível da pré-banca sintética:

- contrato cego sintético;
- harness de três perfis;
- candidatos de modelos locais registrados;
- rotação multi-modelo auditável;
- seletor determinístico privado de 16 casos;
- montador reproduzível Porttinari `train + dev`;
- `test` continua fechado;
- nenhuma validação humana foi produzida;
- Sintaxe de produção continua `not_authorized`.

Ponto de retomada futuro:

```text
obter/validar localmente train + dev
        ↓
montar pool observado
        ↓
selecionar pacote privado de 16
        ↓
verificar hardware/modelos locais
        ↓
smoke de 4 casos
        ↓
pré-banca sintética completa
        ↓
Eva
```

Nenhuma nota linguística sobe por causa da pausa ou do redesign.

## 9. Próxima ação única

> **Gerar e avaliar a primeira tela de escrita silenciosa. Nada mais.**

Depois que essa tela for aprovada visualmente, o próximo passo será mapear o mockup para a casca React/Tiptap existente e implementar o menor diff possível. A FASE 2 — Foco — só abre depois de aprovação explícita da tela real da FASE 1.
