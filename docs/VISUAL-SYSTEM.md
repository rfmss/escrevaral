# Sistema visual do Escrevaral

Este documento registra as decisões compartilhadas da interface. Ele não substitui os módulos CSS nem cria uma biblioteca de componentes paralela.

## Princípios

1. **O manuscrito é o centro.** Painéis e ferramentas apoiam a escrita; não devem reduzir a folha a uma coluna residual.
2. **Papel e tinta, sem cenografia.** Cores, texturas e tipografia preservam a identidade literária sem adicionar decoração sem função.
3. **Ação visível.** A ação principal de cada fluxo permanece alcançável; menus não são usados apenas para produzir uma tela vazia.
4. **Estado explícito.** Seleção, foco, erro, aviso e sucesso não dependem somente de cor.
5. **Evolução incremental.** Um token só deve existir quando representa um padrão realmente compartilhado.

## Tipografia

- **Inter**: navegação, controles, metadados e mensagens do sistema.
- **Noto Serif**: manuscrito, títulos editoriais e leitura prolongada.
- **Cinzel**: assinatura da marca, usada com parcimônia.
- `--text-caption`: metadados breves; não deve ser usado para ações essenciais.
- `--text-interface`: controles e texto corrente da interface.
- `--text-section`: início de grupos e seções.
- `--reading-size`: tamanho configurável do manuscrito.

Texto pequeno nunca deve ser a única forma de comunicar uma ação, um erro ou o estado de salvamento.

## Espaçamento e forma

Os tokens `--space-1` a `--space-6` cobrem o ritmo compartilhado de 4, 8, 12, 16, 24 e 32 pixels. Valores específicos continuam permitidos quando pertencem à mecânica de um componente — por exemplo, paginação ou posicionamento de régua.

- `--radius-control`: botões, inputs e itens interativos;
- `--radius-panel`: painéis, caixas de diálogo e grupos maiores;
- `--control-min-size`: piso dos controles recorrentes;
- `--line`: separação estrutural;
- `--shadow`: elevação já associada ao tema, não decoração padrão.

## Hierarquia de ações

1. **Primária:** conclui a intenção principal da tela; normalmente uma por contexto.
2. **Secundária:** oferece alternativa importante sem competir com a primária.
3. **Ícone:** ação recorrente e reconhecível, sempre com nome acessível.
4. **Perigosa:** remoção ou descarte; exige texto explícito e confirmação proporcional ao risco.

Todos os controles precisam prever padrão, hover, `focus-visible`, ativo/selecionado e desabilitado. Operações assíncronas devem trocar o rótulo por uma descrição concreta, como “Confirmando gravação…”, sem apagar o contexto.

## Navegação

Os seis destinos principais permanecem na mesma ordem:

1. Escrever;
2. Palavras;
3. Autoria;
4. Acervo;
5. Ateliê;
6. Plano.

Desktop usa abas; celular usa dock; tablet usa rail. As três representações devem compartilhar nome, ordem, destino, estado ativo e nome acessível. Trocar de destino não deve apagar o manuscrito ativo nem redefinir filtros sem uma ação explícita.

## Larguras e reflow

- até 599px: dock inferior e composição de celular;
- de 600px a 819px: rail lateral e composição de tablet;
- de 821px a 1440px: composição de notebook com painéis laterais compactos;
- acima de 1440px: composição desktop ampla.

Em reflow equivalente a 200%, a prioridade é preservar navegação e ações, não manter a mesma quantidade de colunas. Rolagem horizontal só é válida dentro de um trilho explicitamente rolável.

## Mensagens de sistema

- **Sucesso:** confirma o que foi concluído e pode desaparecer sem esconder informação necessária.
- **Informação:** explica estado neutro, como preparação offline.
- **Aviso:** descreve risco e ação disponível sem alarmismo.
- **Erro:** informa o que não aconteceu e como proteger ou recuperar o trabalho.

Mensagens relacionadas a salvamento nunca devem afirmar segurança sem uma gravação confirmada. Em celular, o texto principal e a ação permanecem visíveis; detalhes podem ser reduzidos.

## Antes de criar um novo padrão

- verificar se botão, banner, estado vazio ou diálogo existente pode ser reutilizado;
- justificar qualquer novo tamanho, raio ou cor semântica;
- testar teclado, foco, 320px, 390px, 768px, 1366px e reflow de 200%;
- registrar screenshot antes/depois para mudanças perceptíveis;
- não declarar conformidade WCAG apenas porque a auditoria automática passou.
