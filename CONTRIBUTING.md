# Como contribuir com o Escrevaral

Obrigado pelo interesse em melhorar o Escrevaral. O projeto é mantido de forma independente; contribuições pequenas, bem explicadas e fáceis de revisar são especialmente úteis.

## Antes de começar

1. Confira se já existe uma issue sobre o assunto.
2. Para mudanças amplas, abra primeiro uma discussão ou issue descrevendo problema, impacto e proposta.
3. Não inclua manuscritos reais, arquivos `.esc`, provas de autoria, chaves, tokens ou outros dados pessoais em exemplos e relatórios.
4. Preserve a proposta do produto: escrita, privacidade, uso local, legibilidade e proteção contra perda de texto.

## Ambiente local

```bash
git clone https://github.com/rfmss/escrevaral.git
cd escrevaral
python3 -m http.server 8799
```

Abra [http://localhost:8799](http://localhost:8799). O projeto não utiliza uma etapa de build.

## Tipos de contribuição

- correção de bug com passos reproduzíveis;
- teste automatizado para um fluxo existente;
- melhoria de acessibilidade validada por teclado ou tecnologia assistiva;
- correção de documentação;
- melhoria de desempenho acompanhada por medição;
- expansão de corpus linguístico com fonte e justificativa.

Evite propor uma troca de framework ou reescrita completa sem demonstrar um problema que não possa ser resolvido incrementalmente.

## Como relatar um bug

Inclua:

- comportamento observado e comportamento esperado;
- passos mínimos para reproduzir;
- navegador, versão, sistema operacional e resolução;
- mensagens do console, quando existirem;
- impacto sobre o texto ou o fluxo de escrita;
- dados fictícios ou anonimizados.

Se houver risco de perda de manuscrito ou vulnerabilidade, não compartilhe dados sensíveis publicamente. Siga a [`SECURITY.md`](SECURITY.md) e use **rafamass@proton.me**.

## Pull requests

Mantenha cada PR concentrado em um problema. Na descrição, informe:

- por que a mudança é necessária;
- o que foi alterado;
- como foi testado;
- limitações ou cenários não testados;
- screenshots antes/depois para mudanças visuais;
- risco de regressão em salvamento, backup ou offline.

### Verificações básicas

```bash
node scripts/testar-integridade-dados.js
bash scripts/check-version-bump.sh
git diff --check
```

Mudanças de interface devem ser verificadas, quando possível, nas larguras documentadas pelo auditor visual e usando somente teclado. Mudanças no service worker ou em arquivos carregados pela aplicação precisam atualizar a versão de assets.

## Linguagem e estilo

- interface e documentação pública em português brasileiro claro;
- nomes técnicos podem permanecer em inglês quando forem padrões da plataforma;
- prefira explicar limitações a fazer promessas absolutas;
- não altere a identidade literária para aproximar o produto de uma interface corporativa genérica;
- não trate saída automática de análise como verdade editorial.

## Licenciamento das contribuições

Ao enviar uma contribuição, você concorda que ela seja distribuída sob a [Licença MIT](LICENSE) do projeto. Não inclua material de terceiros incompatível com essa licença.

A licença do código não autoriza o uso dos nomes Escrevaral ou RafaMass, dos logotipos, do corpus autoral ou de outros materiais criativos protegidos. Consulte o [`NOTICE.md`](NOTICE.md).
