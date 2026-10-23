# Laboratório de movimento editorial

Protótipo isolado para testar a hipótese de produto:

> A folha permanece calma. As ferramentas entram como assistências de combate.

Este diretório não participa do aplicativo principal, do armazenamento de manuscritos, da PWA ou do service worker. Ele existe para validar o sistema de movimento antes de qualquer integração em produção.

## Deliberação

### O que foi mantido do brief

- movimento orientado por evento, nunca permanente ao redor do texto;
- ritmo `repouso → antecipação → entrada → acomodação → repouso`;
- entradas em direções opostas para comunicar relação entre ferramenta e folha;
- três sequências testáveis: convocar motor, mudar espaço e concluir uma sequência produtiva;
- interface compreensível sem a animação;
- `prefers-reduced-motion` e controle manual de movimento reduzido;
- nenhuma recompensa por contagem bruta de palavras, sequência diária ou pressão de retorno;
- cópia pública sem vocabulário de luta.

### O que foi corrigido

- a paleta global proposta não foi adicionada: o laboratório reutiliza os tokens já presentes em `css/00-tokens.css` (`paper`, `ink`, `primary`, `ochre`, `sienna`, `sage`);
- o “medidor de fluxo” não cresce enquanto a pessoa digita: ele só confirma uma sequência completa de intenção;
- a voz do sistema só responde a ações explícitas;
- o impacto visual fica fora do cursor e do parágrafo atual;
- não há partículas, paralaxe de ponteiro, tremor de tela, som, Canvas ou dependência externa.

### O que foi adiado

- integração com `setView()` em `app.js`;
- criação de tokens globais adicionais de movimento;
- animação dos motores reais do editor;
- persistência de métricas de fluxo;
- inclusão no cache offline;
- alterações na home, no editor de produção ou nos fluxos de release.

Esses pontos só devem avançar depois de avaliação visual e teste de atenção do laboratório.

## Reuso possível da arquitetura atual

O produto já possui os contratos necessários:

- `.app-shell[data-view]` para o espaço atual;
- controles `[data-view-target]`;
- painéis `[data-view-panel]`;
- `setView()` em `app.js` como ponto futuro de integração;
- CSS modular e tokens de material brasileiro em `css/00-tokens.css`;
- controladores de interface separados da lógica de domínio.

Uma futura integração deve envolver um controlador de movimento pequeno, chamado por eventos públicos, sem colocar regras de animação dentro das engines linguísticas.

## Conflitos encontrados

1. `setView()` troca painéis de forma síncrona e não restaura foco no título do novo espaço. O laboratório demonstra uma camada progressiva que resolve ambos sem atrasar o estado.
2. Os tokens globais atuais oferecem apenas `--motion-quick` e `--motion-calm`. A gramática de impacto precisa de durações distintas, mas ainda não deve ser promovida ao sistema global.
3. O produto ainda não usa a View Transition API. O laboratório usa a API quando presente e recorre à Web Animations API.
4. A aplicação principal carrega fontes do Google na primeira visita. O laboratório usa apenas fontes locais do sistema; a política de fontes do produto é outro problema e não deve ser misturada a este protótipo.

## Sequências

### 1. Convocar um motor

- linha de anotação;
- título entra da esquerda;
- painel entra da direita;
- controles chegam com intervalo de 45 ms;
- tudo para após a acomodação.

### 2. Mudar de espaço

- navegação permanece estável;
- apenas o painel de trabalho muda;
- View Transition API quando disponível;
- fallback por Web Animations API;
- foco retorna ao `h1` do novo espaço;
- mudança anunciada por `aria-live`.

### 3. Encadear uma cena

A resposta aparece somente após:

1. existir um parágrafo significativo;
2. o trecho ser guardado;
3. um motor ser convocado;
4. a pessoa voltar ao texto.

A confirmação dura no máximo 1 segundo e não cobre a folha.

## Como testar

Na raiz do repositório:

```bash
python3 -m http.server 8799
```

Abra:

```text
http://localhost:8799/prototypes/motion-lab/
```

Caminho de teste sugerido:

1. use “Inserir cena de teste”;
2. use “Guardar trecho”;
3. convoque “Ritmo”;
4. use “Voltar ao texto”;
5. alterne entre Escrever, Acervo e Ateliê;
6. ative “Movimento reduzido” e repita.

## Critérios antes de integrar

- nenhuma rolagem horizontal em 360 × 800, 768 × 1024 e 1366 × 768;
- foco visível em todos os controles;
- o cursor não se move durante a entrada do motor;
- o painel fica completamente imóvel após a entrada;
- a navegação funciona com teclado, mouse e toque;
- o modo reduzido preserva toda informação;
- nenhuma requisição externa;
- nenhuma mudança em armazenamento, PWA ou service worker.

## Próxima fase proposta

Depois da aprovação visual, integrar somente a mudança de espaço em um PR pequeno. A convocação de motores reais e o feedback de sequência devem permanecer em fases separadas, cada uma com auditoria de foco, responsividade e publicação offline.
