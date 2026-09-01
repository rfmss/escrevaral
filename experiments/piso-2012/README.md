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

## Interpretação correta

O gate comprova a arquitetura de roletagem no aparelho-alvo: carregar uma engine, analisar, devolver e descartar. Não comprova cobertura linguística, corpus adversarial nem qualidade normativa da morfologia.

## Estado do gate

APROVADO no iPad alvo para:

`offline -> uma engine -> uma frase -> resposta -> descarte`

O próximo gargalo é a cobertura linguística da morfologia, não a capacidade básica do aparelho.
