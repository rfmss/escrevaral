/* analise-literaria-adversarial-corpus.js — banca de ATAQUE (falso-positivos,
 * tokenização hostil, degenerações) para validar o port ES5 do Vereda v3 sob
 * estresse. Gera ouro próprio (analise-literaria-golden-adversarial.json).
 * strategy: cada caso mira uma dimensão de fratura hipotética do port.
 */
exports.cases = [
  { id: "adv-minimo-pontuado", text: "Sim. Não. Talvez. Vai. Fica. Corre. Pula. Olha. O que é? Quem vem? Nada de novo.", options: {} },
  { id: "adv-capmisto", text: "O rato ROEU a ROUPA do Rei de Roma. Dr. João Silva Jr., etc., visitou 3,14 dias. Ele disse: \"OI!!\" e saiu. Vamos? Não! Talvez... o valor era R$ 1.234,56, senão nada. FIM.", options: {} },
  { id: "adv-repeticao-janela", text: "Era uma vez um gato que dormia debaixo da mesa e sonhava com peixes coloridos que nadavam no mar azul. O peixe foi comido pelo gato, o gato foi visto pela menina. Era uma vez um gato que dormia debaixo da mesa e sonhava com peixes coloridos que nadavam no mar azul. O peixe foi comido pelo gato, o gato foi visto pela menina. Era uma vez um gato que dormia debaixo da mesa e sonhava com peixes coloridos que nadavam no mar azul.", options: {} },
  { id: "adv-so-passoiva", text: "O peixe foi comido pelo gato. A porta foi aberta pela chave. O céu foi pintado pelo anjo. O homem foi visto pelo vizinho. A carta foi escrita pela irmã. O livro foi lido pelo aluno. A música foi tocada pela banda.", options: {} },
  { id: "adv-html-sujo", text: "<b>parágrafo um</b> &amp; &#38; — sinal \"que\". Citação francesa «assim» e inglesa \u201Cassim\u201D. Em dash — e en dash \u2013: tudo misturado. O texto deveria ser lido sem essas marcas, mas um erro qualquer poderia quebrar a análise silenciosamente. (Parênteses aninhados (com vírgulas, ok)). Fim.", options: {} },
  { id: "adv-pleonasmo-provocado", text: "Subir para cima. Descer para baixo. Entrar para dentro. Sair para fora. Hemorragia de sangue. Elo de ligação. Acabamento final. Posso subir para cima outra vez? O elo de ligação e o acabamento final da hemorragia de sangue que eu vi saindo para fora.", options: {} },
  { id: "adv-mistura-tempos", text: "Eu ia, ele foi, nós iríamos, ele irá, ela tinha ido, eles terão ido. Se eu fosse, quando ele for, teria sido bom. Ainda vou, até que ela fosse vista. Nós fizemos, faremos, faríamos e teríamos feito.", options: {} }
];