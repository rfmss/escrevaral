/* lexico-adversarial-corpus.js — banca de ATAQUE do classificador léxico:
 * fronteiras ambíguas, neologismos, texte degradado (teclado/Unicode/emoji),
 * nomes próprios, vazios, palavras gigantes e locuções no limite. Ouro próprio
 * (lexical-golden-adversarial.json) gerado da FONTE original com fetch stub.
 */
exports.cases = [
  {
    id: "adv-ambiguos-fronteira",
    text: "O a do dado o consome como a que se dá para o a. Para o se, o que e o como de novo. Ele a viu; o livro a quem ela o deu; se fosse, que fosse.",
    probes: ["a", "o", "se", "que", "como", "para", "foi", "deu", "ele", "Ela"]
  },
  {
    id: "adv-neologismos",
    text: "escrevaral cafeteirar zumbilogia despoetizar neurolinguístico-turbo desencaminhar programático-prático desinforzar.",
    probes: ["escrevaral", "cafeteirar", "zumbilogia", "despoetizar", "neurolinguístico-turbo", "desinforzar", "a", "o"]
  },
  {
    id: "adv-teclado-ruim",
    text: "casaabertoo;porta. ��! １ ２ ٣. cora\u0307a pe\u0327)e o\u0302lho. 🐟 o gato 🐟 é viral. \u200Fa\u200F. 1 2 3.",
    probes: ["casaabertoo", "porta", "corac\u0327a", "o", "gato", "1", "2", "🐟", "a", "é"]
  },
  {
    id: "adv-nomes-proprios",
    text: "D'Ávila, Robson Macário, Jean-Jacques, ABNT, XIV, WWF, São Paulo, Duque de Caxias, Novo Hamburgo, Nossa Senhora do Rosário.",
    probes: ["D'Ávila", "Robson", "Macário", "Jean-Jacques", "ABNT", "XIV", "WWF", "São", "Paulo", "Hamburgo"]
  },
  {
    id: "adv-vazios",
    text: "   ",
    probes: ["", "   ", "a", "1", "?!", "o", "que", "se"]
  },
  {
    id: "adv-longo",
    text: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcccc-cccc-cccc-dddd e FIM.",
    probes: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "cccc", "dddd", "e", "FIM", "o", "a"]
  },
  {
    id: "adv-locucoes-limite",
    text: "Ao invés de correr, a fim de que chegue; antes que chova, de modo que saia e em frente a casa, para com a família, por mais que custe, visto que é urgente, apesar de que duvide.",
    probes: ["Ao", "invés", "a", "fim", "que", "antes", "modo", "frente", "para", "por", "visto", "apesar"]
  }
];