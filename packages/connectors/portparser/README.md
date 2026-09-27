# Portparser.v2 — avaliação isolada

**Estado:** documentação e snapshot seletivo recebidos; adaptador de transporte testado; inferência do modelo **não executada**; integração com o editor **não feita**.

Upstream: https://github.com/LuceleneL/Portparser.v2

Commit fixado: `9a76e8d3dd8564182ff5cb4b3884b68d1b5fa79d`. `upstream.lock.json` registra arquivos e SHA-256. `vendor/` preserva sem alterações README, licença MIT, opções e três arquivos Python de pós-processamento. Os arquivos não entram no build do site. Não é uma cópia completa do repositório nem uma instalação executável do modelo.

## Por que avaliar este candidato

O README do autor declara treinamento com Porttinari-base v2 e BERTimbau. A escolha é de um modelo voltado ao português brasileiro sobre um runtime reutilizável (LatinPipe). Isso não torna todas as bibliotecas de execução exclusivas do Brasil nem prova que o modelo rejeita outras variedades. Os números de qualidade do upstream não são resultados medidos pelo Escrevaral.

## O que falta para executar

Conforme o README preservado, a inferência depende de Python 3.11, LatinPipe e do arquivo de pesos externo de aproximadamente 1,53 GB. LatinPipe recebe texto já tokenizado em CoNLL-U; não fornece o tokenizador. O upstream aponta portTokenizer e portSentencer. O pós-processamento ainda requer os léxicos Portilexicon-UD, inclusive VERB.tsv (71 MB), ausentes deste snapshot.

Não baixamos pesos nem léxicos e não instalamos esse ambiente. Antes disso: fixar versões das dependências de inferência/tokenização, verificar licenças dos pesos/dados separadamente, registrar hashes e medir requisitos reais. A licença MIT deste código não autoriza presumir a licença de todos os componentes externos.

## Adaptador disponível

Com uma saída CoNLL-U produzida localmente:

```sh
node scripts/evaluate-portparser.cjs texto.txt saida.conllu
```

O comando só lê os dois arquivos e imprime JSON. Código de saída 1 indica abstenção de alinhamento; 2 indica uso incorreto. Strings são comparadas literalmente, com posições UTF-16. Não transmite dados e não executa código Python. Contrações/multiword tokens e nós vazios ainda são recusados.

`tests/portparser-connector.cjs` usa anotação **manual própria**, não saída do modelo, para verificar Unicode, repetição, vínculos e rejeição de arquivos incompatíveis. Não confundir teste do adaptador com validação do analisador linguístico.

## Critério da próxima decisão

1. Preparar ambiente local isolado e inventário completo de dependências/licenças.
2. Definir corpus reservado brasileiro com domínio literário, diálogos, contrações, elipses e variação; evitar usar apenas exemplos que orientaram nossas regras.
3. Medir separadamente tokenização, morfologia, dependências, alinhamento no original, falhas/abstenções e custo de CPU/memória.
4. Comparar os resultados com as lentes locais, registrar discordâncias e revisar o mapeamento UD/tradicional.
5. Só então deliberar sobre distribuição local, Worker/WASM viável ou serviço opcional. Hospedar serviço ou enviar manuscritos exige decisão de produto própria.

Não há, nesta entrega, evidência suficiente para prometer motores prontos exclusivamente brasileiros para pragmática, coerência ou interpretação literária.
