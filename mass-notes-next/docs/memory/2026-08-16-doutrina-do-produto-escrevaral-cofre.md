# Doutrina de Produto e Engenharia — Escrevaral e Cofre

- Registrada em: 2026-08-16
- Estado: **decisão da pessoa mantenedora**
- Produto: Escrevaral com Cofre linguístico
- Idioma: **português brasileiro (`pt-BR`) exclusivamente**
- Relação: complementa o `Plano de Voo — Cofre Core v1`

## 1. O produto que estamos construindo

O Escrevaral é uma ferramenta de escrita offline, potente e durável para pessoas que escrevem em português brasileiro, em diferentes estágios do ofício. O Cofre é seu núcleo linguístico portátil: analisa, contextualiza e explica sem tomar do autor a decisão sobre o texto.

Não estamos construindo:

- uma escola de gramática disfarçada de editor;
- um corretor que transforma toda diferença em erro;
- uma interface infantilizada ou professoral;
- uma coleção de demos que só funciona dentro de uma página específica;
- um monólito preso ao HTML, ao framework ou ao editor atual;
- uma encenação de progresso destinada a agradar a pessoa mantenedora.

Estamos construindo patrimônio técnico e linguístico capaz de sobreviver à interface atual, aceitar novos editores e continuar funcionando sem conta, nuvem ou conexão.

## 2. Regra máxima de idioma

O único locale de produto é `pt-BR`.

- O runtime rejeita locales diferentes de `pt-BR`.
- Engines, rule cards, mensagens, exemplos, corpora e avaliações pertencem ao português brasileiro.
- Português europeu não é fallback silencioso de português brasileiro.
- Inglês não é idioma-alvo, pista de avaliação nem promessa futura implícita.
- De projetos voltados ao inglês, só pode entrar código comprovadamente neutro em relação ao idioma, com licença compatível e validação própria em `pt-BR`.
- Modelo, corpus, léxico ou regra treinada para inglês não é regra pronta para português.

## 3. Cláusula contra o teatro de progresso

O trabalho técnico não existe para fazer a pessoa mantenedora “se sentir webdev”. Existe para proteger o produto e seu futuro.

Quem desenvolve ou assessora o projeto tem o dever de:

- discordar quando a decisão agradável cria dívida previsível;
- tornar riscos, limites e suposições visíveis antes de implementar;
- distinguir tela funcionando de arquitetura sustentável;
- distinguir teste verde de verdade linguística;
- recusar atalhos que empurrem um problema conhecido para uma etapa mais cara;
- registrar dívida inevitável com responsável, impacto e condição de retirada;
- dizer “ainda não sabemos” quando falta evidência;
- medir avanço por capacidades verificadas, não por volume de código, arquivos ou efeitos visuais.

Uma solução rápida é aceitável quando é pequena, reversível e declaradamente experimental. Ela não pode ser apresentada como fundação pronta.

## 4. Orquestrar em vez de amontoar

A cadeia de responsabilidade é:

```text
interface
  → adaptador do editor
    → orquestração
      → engines linguísticas
        → conhecimento e proveniência
          → resultado serializável
```

Cada camada tem uma função:

- a interface apresenta e recolhe intenção;
- o adaptador traduz posições e eventos do editor;
- o orquestrador escolhe engines, cancela, ordena e combina resultados;
- a engine calcula uma capacidade linguística delimitada;
- o `DataProvider` entrega conhecimento versionado;
- a aplicação decide como exibir; nunca altera o manuscrito automaticamente.

Regras de construção:

- HTML é casca e ponto de montagem; lógica de produto não cresce dentro dele;
- CSS, comportamento, contratos, dados e regras linguísticas vivem em módulos próprios;
- nenhum arquivo se torna depósito de responsabilidades sem relação;
- uma função coordena ou calcula; não faz as duas coisas de forma invisível;
- dependências apontam da casca para o núcleo, nunca do núcleo para a interface;
- engines não conhecem React, Tiptap, DOM, armazenamento ou rede;
- dados linguísticos não ficam embutidos em componentes;
- APIs públicas são estreitas, tipadas, serializáveis e versionadas;
- dependências cíclicas são proibidas;
- abstração só nasce de uma fronteira real ou repetição demonstrada, não de ansiedade arquitetural.

### 4.1 Orçamento de tamanho e compreensão

Linhas não medem qualidade sozinhas, mas arquivos grandes demais escondem acoplamento. Por isso:

- acima de 350 linhas não geradas, o módulo exige revisão explícita de divisão;
- acima de 600 linhas não geradas, exige justificativa arquitetural registrada ou deve ser separado;
- arquivos gerados, schemas extensos e dados são exceções identificadas, nunca desculpa para lógica monolítica;
- o critério principal é uma pessoa conseguir explicar responsabilidade, entradas, saídas, efeitos e testes do módulo sem percorrer o sistema inteiro.

Esses números são guardrails de revisão, não metas para fragmentar código artificialmente.

## 5. Offline significa capacidade completa

O caminho principal de escrita e análise funciona sem conexão.

- Nenhuma engine obrigatória depende de API externa.
- Nenhum manuscrito precisa sair do dispositivo.
- Conta, telemetria e serviço remoto não são condições para acessar o patrimônio linguístico local.
- Atualizações futuras de conhecimento são pacotes explícitos, versionados, verificáveis e opcionais.
- Perder a rede não pode degradar silenciosamente a análise nem apagar uma capacidade já instalada.

Serviços externos podem existir futuramente como integrações opcionais. Nunca definem o núcleo do produto.

## 6. Pronto para expandir sem generalizar o idioma

“Pronto para expandir” significa receber novas interfaces, engines e capacidades de `pt-BR`; não significa preparar idiomas que o produto não atende.

Expandimos por:

- adaptadores de editor;
- manifestos de engine;
- contratos de resultado;
- rule packs versionados de `pt-BR`;
- providers de dados substituíveis;
- filas e Workers;
- novas capacidades linguísticas aprovadas por gate.

Não expandimos por condicionais espalhadas, cópia de engine, globais, arquivos universais ou um `index.html` que conhece o sistema inteiro.

## 7. A língua é patrimônio estável, não objeto congelado

O português brasileiro possui estrutura, tradição gramatical e referências suficientemente estáveis para sustentar um Cofre rigoroso. Ainda assim, língua, uso e norma não são imutáveis.

O produto deve suportar correção futura sem apagar a história. Cada regra registra:

- `ruleId` estável;
- versão da regra;
- versão do conhecimento;
- escopo normativo e de registro;
- fonte e edição consultadas;
- data ou contexto de vigência quando relevante;
- exemplos e contraprovas próprios;
- nível de maturidade;
- limitações e divergências conhecidas.

Atualizar uma regra não reescreve silenciosamente o passado. Resultados antigos continuam identificáveis pela versão que os produziu.

## 8. Suporte editorial sem voz professoral

O Escrevaral atende desde quem está começando até quem domina o ofício sem rotular, diminuir ou interromper a escrita com aulas não solicitadas.

A informação aparece em camadas:

1. observação curta e acionável;
2. razão contextual, quando aberta;
3. explicação técnica, quando necessária;
4. evidência, limitações e referências, quando a pessoa quiser aprofundar.

Tom do produto:

- brasileiro, contemporâneo, claro e seguro;
- próximo sem ser caricato;
- editorial, não escolar;
- conciso no fluxo e completo no aprofundamento;
- técnico quando a precisão exige, sem fingir simplicidade;
- sem bronca, pedantismo, gamificação infantil ou certeza decorativa.

“Globoplay” é referência de fluidez e familiaridade brasileira, não licença para copiar marca, voz ou interface.

## 9. Fontes externas e livros

Projetos externos aceleram infraestrutura e oferecem comparação; não governam nossa verdade linguística.

- LanguageTool só entra, se aprovado, no recorte `pt-BR` e atrás de adapter.
- Stanza só entra, se aprovado, com modelo português e como provider substituível.
- MorphoBr pode ser `DataProvider` morfológico após auditoria e pinagem.
- UD Portuguese Bosque é avaliação externa, não conteúdo do pacote.
- Código neutro vindo de projeto inglês exige licença, isolamento e teste original em `pt-BR`.
- Nenhuma regra, mensagem ou exemplo externo é copiado por conveniência.

Os livros são fallback de autoridade quando houver lacuna, divergência, exceção, falso positivo ou promoção de regra. O ciclo continua:

```text
dúvida delimitada
→ consulta mínima
→ fechar as fontes
→ síntese própria
→ exemplos e contraprovas próprios
→ rule card
→ teste
→ engine
```

## 10. O que conta como avanço

Uma capacidade só conta como avanço quando:

- resolve uma necessidade delimitada;
- possui contrato e responsabilidade claros;
- funciona offline;
- tem testes proporcionais ao risco;
- preserva offsets e revisão do texto;
- registra proveniência e limitações;
- não aumenta acoplamento oculto;
- tem desempenho medido no ambiente-alvo;
- pode ser removida ou substituída sem desmontar o editor;
- recebeu validação linguística compatível com a alegação feita.

Código escrito, tela bonita, dependência instalada ou clone executando são atividades. Não são, isoladamente, progresso de produto.

## 11. Frase de guarda

> **Não construímos para impressionar durante a obra. Construímos para que escritores brasileiros possam confiar no Escrevaral quando ninguém da equipe estiver presente para explicar como ele funciona.**
