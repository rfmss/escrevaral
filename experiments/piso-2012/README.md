# Prova do Piso 2012

Experimento isolado do Escrevaral Encore para verificar o piso real no iPad mini de 2012 com iOS 9.3.5 e, depois, em Android 4.4.

## Capacidade testada

`instalar offline -> carregar uma cápsula -> carregar um fragmento -> encontrar um resultado -> parar -> terminar o Worker`

Não é engine linguística, editor nem interface candidata ao produto.

## Restrições

- HTML/CSS/JavaScript compatíveis com o alvo legado;
- ES5, sem framework, bundler, módulos, `fetch`, Promise ou Service Worker;
- Application Cache como hipótese de instalação, ainda dependente de teste no aparelho;
- um Web Worker por achado;
- uma fonte de dados por Worker;
- o Worker é terminado assim que responde;
- a posição de retomada fica na casca, não na cápsula;
- os três fragmentos são dados artificiais e não provam qualidade linguística.

## Interpretação correta

O contador de entradas comprova qual degrau foi instanciado. O tempo mede a experiência daquele ciclo. O navegador legado não expõe uma medida confiável do heap; estabilidade, travamento, recarregamento e repetição são evidências observáveis, não substitutos de instrumentação de memória.

## Gate no dispositivo

1. aguardar o estado offline pronto;
2. executar achados no degrau 1;
3. repetir no degrau 2;
4. tentar o degrau 3 apenas se os anteriores permanecerem estáveis;
5. ativar modo avião;
6. fechar e reabrir;
7. repetir;
8. registrar o primeiro degrau que apresentar travamento, recarregamento, erro ou perda de estado.

Nenhuma engine do Cofre deve ser portada a partir deste experimento antes do gate físico.
