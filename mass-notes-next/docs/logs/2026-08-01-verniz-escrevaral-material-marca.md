# CLARO — verniz material e composição da marca

## C — cenário

A primeira passada do verniz estabeleceu índigo, sépia, papel quente e o selo `SCR / VRL`, mas a revisão manual revelou dois limites visuais: as superfícies ainda pareciam digitais demais e o cabeçalho institucional da biblioteca estava comprimido. O selo, a assinatura “Oficina de escrita brasileira”, o wordmark `ESCREVARAL` e os canais competiam na mesma faixa.

## L — limites preservados

- grid de três colunas, larguras e breakpoints intactos;
- altura do cabeçalho `.brand` preservada em 142 px;
- DOM, arquitetura da informação e nomes acessíveis intactos;
- nenhuma mudança em Tiptap, toolbar, persistência, seleção, histórico ou engines;
- proprietários de rolagem e comportamento mobile intactos;
- `main`, produto público e Gate 14 protegidos;
- selo restrito à aplicação institucional já aprovada.

## A — alteração mínima

Foi criada uma segunda passada CSS, `theme-escrevaral-verniz-material.css`, que importa a primeira versão e permanece como único import final no ponto de entrada. Remover esse último import restaura integralmente a composição Blueprint.

A camada:

- reduz a saturação do índigo e aproxima as superfícies de tinta mineral;
- aquece papel e creme e converte o laranja residual em óxido;
- separa materialmente o chassi escuro e o papel por duas texturas SVG locais;
- diminui o contraste de divisórias e controles secundários;
- recompõe internamente o cabeçalho sem alterar sua caixa: selo à esquerda, assinatura e wordmark à direita, canais abaixo;
- mantém legibilidade e contraste funcional.

## R — riscos protegidos

O contrato `gate6-76-escrevaral-verniz.spec.ts` passou a verificar:

- tokens minerais da segunda passada;
- presença das duas matérias de superfície;
- contraste dos controles laterais;
- selo `SCR / VRL`, moldura e wordmark visível;
- separação vertical entre assinatura, wordmark e canais;
- ausência de colisão e overflow no viewport aprovado;
- pauta de 48 px e composição do papel preservadas.

## O — observação e reversão

A mudança é estritamente visual. A reversão consiste em remover:

```ts
import './styles/theme-escrevaral-verniz-material.css'
```

do final de `src/main.tsx`. Como a nova folha importa a primeira passada, sua remoção também elimina todo o verniz e devolve o Blueprint sem resíduos.
