# Prova do Piso 2012

Experimento isolado do Escrevaral Encore para verificar o piso real no iPad mini de 2012 com iOS 9.3.5 e, depois, em Android 4.4.

## Capacidade testada

`instalar offline -> carregar uma cápsula -> carregar um fragmento -> encontrar um resultado -> parar -> terminar o Worker`

Não é editor nem interface candidata ao produto. Os fragmentos artificiais medem o mecanismo; a prova de morfologia usa a engine real M3 do Encore.

## Restrições

- HTML/CSS/JavaScript compatíveis com o alvo legado;
- ES5, sem framework, bundler, módulos, `fetch`, Promise ou Service Worker;
- Application Cache para instalação no iOS 9;
- um Web Worker por execução;
- uma fonte de dados por Worker;
- o Worker é terminado assim que responde;
- a posição de retomada fica na casca, não na cápsula;
- os três fragmentos artificiais não provam qualidade linguística.

## Evidência física — 2026-09-01

Dispositivo: iPad MD531GP/A, iOS 9.3.5 (13G36), Safari.

- instalação offline confirmada no primeiro carregamento;
- página fechada e reaberta em modo avião;
- fragmentos de 1.024, 8.192 e 32.768 entradas concluídos sem travamento observado;
- cápsulas executadas em sequência e descartadas após cada resposta;
- morfologia real encontrou `cantávamos`, `veio`, `fazê-lo` e `comam`;
- partida fria da morfologia: 2.310 ms;
- execuções seguintes: 36–48 ms (amostras informadas: 36, 47 e 48 ms);
- nenhuma cápsula permaneceu ativa após a resposta.

A partida fria inclui criação do Worker, cinco `importScripts`, interpretação dos arquivos, construção da trie, análise e descarte. A faixa de 36–48 ms representa a repetição com os recursos já armazenados pelo navegador. O teste não mede heap diretamente.

## Evidência física da morfologia 1.2.0 — 2026-09-01

No mesmo iPad alvo, a banca congelada de infinitivo pessoal concluiu 12/12 casos:

- primeira passagem: 4.774 ms;
- repetições: 1.586, 1.571 e 1.563 ms;
- mediana das repetições: 1.571 ms;
- aproximadamente 131 ms por caso na mediana, incluindo criação, carga, análise e descarte do Worker;
- um Worker foi descartado após cada caso.

A reabertura em modo avião não foi repetida especificamente para a versão 1.2.0 nesta sessão. Portanto, esta evidência aprova execução e descarte físicos da tranche; o offline permanece comprovado para a arquitetura anterior, sem extrapolação silenciosa.

## Evidência física da morfologia 1.2.1 — 2026-09-02

Após a banca negativa do legado reproduzir e corrigir os homógrafos nominais `deveres` e `olhares`, o gate ampliado foi executado no mesmo iPad alvo:

- 21/21 casos;
- primeira passagem: 4.967 ms;
- repetições: 2.662, 2.658 e 2.654 ms;
- mediana das repetições: 2.658 ms;
- aproximadamente 127 ms por caso na mediana, incluindo criação, carga, análise e descarte do Worker;
- um Worker descartado após cada caso.

O total cresceu porque a banca passou de 12 para 21 Workers. O custo quente por caso permaneceu na mesma faixa e caiu de aproximadamente 131 para 127 ms. A reabertura em modo avião não foi repetida especificamente para a versão 1.2.1.

## Evidência física da morfologia 1.2.2 — 2026-09-02

Após o corpus externo UD Portuguese-GSD reproduzir um falso positivo (`três andares`) e um falso negativo (`Ao passarem`), a versão corrigida atravessou o gate ampliado no mesmo iPad alvo:

- 29/29 casos;
- primeira passagem: 6.634 ms;
- repetições: 3.642, 3.641 e 3.642 ms;
- mediana das repetições: 3.642 ms;
- aproximadamente 126 ms por caso na mediana, incluindo criação, carga, análise e descarte do Worker;
- um Worker descartado após cada caso.

O total cresceu com a banca de 21 para 29 Workers, mas o custo quente por caso permaneceu estável: ~127 ms na versão 1.2.1 e ~126 ms na 1.2.2. A reabertura em modo avião não foi repetida especificamente para a versão 1.2.2.

## Interpretação correta

O gate comprova a arquitetura de roletagem no aparelho-alvo: carregar uma engine, analisar, devolver e descartar. Não comprova cobertura linguística, corpus adversarial nem qualidade normativa da morfologia.

## Estado do gate

APROVADO no iPad alvo para:

`offline -> uma engine -> uma frase -> resposta -> descarte`

O próximo gargalo é a cobertura linguística da morfologia, não a capacidade básica do aparelho.
