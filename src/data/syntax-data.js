/* Escrevaral-Encore — dados de conjunções (off-line, embutidos).
 * Portado de escrevaral/syntax-data.json (conjunções apenas — o resto da
 * fonte não é usado pela lógica core). ES5. */
(function (global) {
  "use strict";
  var Encore = global.Encore = global.Encore || {};
  Encore.data = Encore.data || {};
  var conjuncoes = {
    coordenativas: {
        '_nota': "Bechara distingue apenas aditivas, adversativas e alternativas como coordenativas puras. Conclusivas e explicativas são valores discursivos de conectores, não classe gramatical separada — mas mantidos aqui por utilidade prática (NGB).",
        'aditivas': {palavras: ["e","nem","não só... mas também","não só... como também","bem como","assim como","tanto... como","tanto... quanto"], relacao: "adição", descricao: "Liga orações de mesmo valor sem matiz especial"},
        'adversativas': {palavras: ["mas","porém","contudo","todavia","entretanto","no entanto"], relacao: "oposição", descricao: "Acrescenta ideia de contraste, oposição ou ressalva"},
        'alternativas': {palavras: ["ou","ou... ou","ora... ora","já... já","quer... quer","seja... seja"], relacao: "alternância", descricao: "Indica que ao cumprir-se um fato o outro não se cumpre"},
        'conclusivas': {palavras: ["logo","portanto","por conseguinte","assim","então"], relacao: "conclusão", descricao: "Introduz oração que exprime conclusão ou consequência do que foi dito"},
        'explicativas': {palavras: ["pois","que","porquanto"], relacao: "explicação", descricao: "A segunda oração justifica a primeira. Frequente após imperativo e optativo"}
    },
    subordinativas: {
        'causais': {palavras: ["porque","pois que","porquanto","já que","uma vez que","visto que","visto como"], relacao: "causa", descricao: "Indica a causa ou motivo da ação principal", funcao: "adjunto adverbial de causa", valor_especial: {"como":"causal quando no início da oração (Como estava chovendo, ficamos)","que":"causal coloquial (Corre, que vai chover)"}},
        'concessivas': {palavras: ["embora","conquanto","ainda que","mesmo que","posto que","bem que","se bem que","por mais que","por menos que","apesar de que","nem que"], relacao: "concessão", descricao: "Admite fato contrário ao da principal, mas incapaz de impedi-la", funcao: "adjunto adverbial de concessão"},
        'condicionais': {palavras: ["se","caso","contanto que","salvo se","dado que","a menos que","a não ser que"], relacao: "condição", descricao: "Indica hipótese ou condição necessária para que se realize o fato principal", funcao: "adjunto adverbial de condição", valor_especial: {"desde que":"condicional quando = contanto que (Desde que estudes, passarás); temporal quando indica início de período (Desde que chegou, não parou)","sem que":"condicional negativa (= se não)"}},
        'finais': {palavras: ["para que","a fim de que","com o intuito de que","com o objetivo de que","com a finalidade de que","com vistas a que"], relacao: "finalidade", descricao: "Indica a finalidade ou objetivo da ação principal", funcao: "adjunto adverbial de finalidade", valor_especial: {"que":"final após verbo de vontade/mandato (Manda que venha = para que venha)","porque":"final arcaico/literário (= para que)"}},
        'temporais': {palavras: ["quando","enquanto","assim que","logo que","depois que","antes que","até que","sempre que","cada vez que","todas as vezes que","mal","apenas"], relacao: "tempo", descricao: "Indica circunstância de tempo em relação à ação principal", funcao: "adjunto adverbial de tempo", valor_especial: {"mal":"temporal = assim que (Mal chegou, saiu)","apenas":"temporal = assim que (Apenas terminou, foi embora)","desde que":"temporal quando indica início de período (Desde que chegou, não parou)"}},
        'consecutivas': {palavras: ["de forma que","de maneira que","de modo que","de sorte que","de jeito que","a tal ponto que","tanto que","ao ponto de"], relacao: "consequência", descricao: "Indica a consequência do que foi declarado na oração anterior", funcao: "adjunto adverbial de consequência", valor_especial: {"que":"consecutivo quando correlato de tal/tanto/tão/tamanho na oração anterior (Era tão frio que tremia). Sem correlato, que é integrante ou relativo"}},
        'comparativas': {palavras: ["como","assim como","bem como","como se","que nem","que","do que","qual","quanto"], relacao: "comparação", descricao: "Encerra o segundo membro de uma comparação ou confronto", funcao: "adjunto adverbial de comparação"},
        'conformativas': {palavras: ["conforme","segundo","consoante","de acordo com que"], relacao: "conformidade", descricao: "Exprime conformidade de um pensamento com o da oração principal (NGB; não distinguida na NGP)", funcao: "adjunto adverbial de conformidade", valor_especial: {"como":"conformativo quando = conforme (Como ia dizendo... = Conforme ia dizendo...)"}},
        'proporcionais': {palavras: ["à medida que","à proporção que","ao passo que","quanto mais... mais","quanto mais... tanto mais","quanto mais... menos","quanto menos... mais","quanto menos... tanto mais","quanto menos... menos"], relacao: "proporção", descricao: "Indica fato simultâneo e proporcional ao da oração principal (NGB; não distinguida na NGP)", funcao: "adjunto adverbial de proporção", valor_especial: {"enquanto":"proporcional/adversativo quando = ao passo que (Ele cresce enquanto eu diminuo)"}},
        'integrantes': {palavras: ["que","se"], relacao: "integração", descricao: "Introduz oração com função de substantivo em relação à principal", funcao: "oração subordinada substantiva (sujeito, OD, OI, predicativo, CN, aposto)"}
    }
  };
  Encore.data.syntaxData = { conjuncoes: conjuncoes };
  if (typeof module !== "undefined" && module.exports) module.exports = Encore.data.syntaxData;
})(typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this));
