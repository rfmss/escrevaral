# Tokenização — Especificação 1.0.1

## Missão

Transformar uma fatia de texto em tokens de palavra sem alterar o texto e preservando posições UTF-16 exatas para o editor.

## Contrato

Entrada: uma string.

Saída: uma lista ordenada de objetos:

```json
{"value":"d’água","span":[0,6]}
```

O início do `span` é inclusivo; o fim é exclusivo. String vazia ou valor falso retorna lista vazia.

## Cobertura deliberada

- Letras ASCII e vogais acentuadas usadas no português brasileiro.
- Cedilha maiúscula e minúscula.
- `ü/Ü` para nomes próprios e grafias preservadas.
- Hífen interno.
- Apóstrofo reto U+0027 e tipográfico U+2019 internos.
- Pontuação, espaços e quebras de linha como separadores, preservando os índices do original.

## Não objetivos

- Detectar sentenças, morfologia ou função sintática.
- Normalizar grafia, caixa, hífen ou apóstrofo.
- Cobrir todos os sistemas de escrita Unicode.
- Modificar o manuscrito.

## Critério de aceite

- `src/test/run-tokenizer.js` verde.
- Todas as regressões linguísticas verdes.
- Gate morfológico 29/29 repetido no iPad MD531GP/A após qualquer mudança no tokenizador.
