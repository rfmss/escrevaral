(function (global) {
    "use strict";

    /* Escrevaral-Encore — Engine de Sintaxe e Funções Sintáticas (ES5, baixa RAM).
     * Portada de escrevaral (syntax-engine.js, fonte A, ~100% madura). Reuso de
     * comportamento, não cópia. Analisa o período: morfologia heurística (fallback
     * puro, sem pt-compromise), conjunções, tempos verbais, advérbios e a máquina
     * de estados das funções sintáticas (sujeito, objeto, predicativo, vocativo,
     * oração adjetiva, voz passiva, concordância verbal/nominal).
     *
     * Norma ES5/piso: var/functions, Sets→objetos de flags, sem arrow/template/
     * destructuring/??./?./Object.entries/Object.values/...spread/find/includes/
     * normalize()/regex \p{L}\p{Lu} (classes explícitas). Dados off-line embutidos
     * em Encore.data.syntaxData / Encore.data.normaData.
     */

    var Encore = global.Encore = global.Encore || {};
    Encore.core = Encore.core || {};
    Encore.data = Encore.data || {};

    var syntaxData = Encore.data.syntaxData || { conjuncoes: { subordinativas: {}, coordenativas: {} } };
    var normaData  = Encore.data.normaData  || {};

    /* ── helpers ES5 ────────────────────────────────────────────────────────── */
    function hasKey(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }
    function makeSet(values) {
        var s = {};
        for (var i = 0; i < values.length; i++) s[values[i]] = 1;
        return s;
    }
    function arrayIndexOf(arr, value) {
        for (var i = 0; i < arr.length; i++) if (arr[i] === value) return i;
        return -1;
    }
    function arrayIncludes(arr, value) {
        return arrayIndexOf(arr, value) >= 0;
    }
    function arrayFind(arr, fn) {
        for (var i = 0; i < arr.length; i++) if (fn(arr[i])) return arr[i];
        return undefined;
    }
    function strIncludes(str, sub) {
        return String(str).indexOf(sub) >= 0;
    }
    function strStartsWith(str, prefix) {
        str = String(str);
        return str.lastIndexOf(prefix, 0) === 0;
    }
    function strEndsWith(str, suffix) {
        str = String(str);
        return str.length >= suffix.length && str.slice(str.length - suffix.length) === suffix;
    }
    function strContainsWord(str, word) {
        return strIndexOfWord(String(str), word);
    }

    /* Remoção de acentos/cedilha — equivale a normalize("NFD").replace(/[comb]/,"")
     * (manter lowercase→lowercase; inputs já estão em minúsculas no consumo). */
    var ACCENTS = {
        "á":"a","à":"a","â":"a","ã":"a","ä":"a","å":"a",
        "é":"e","è":"e","ê":"e","ẽ":"e","ë":"e","ě":"e",
        "í":"i","ì":"i","î":"i","ĩ":"i","ï":"i",
        "ó":"o","ò":"o","ô":"o","õ":"o","ö":"o","ø":"o",
        "ú":"u","ù":"u","û":"u","ũ":"u","ü":"u",
        "ý":"y","ÿ":"y","ñ":"n","ç":"c"
    };
    var ACCENT_KEYS = null;
    function stripAccent(value) {
        var s = String(value || "");
        var out = "";
        for (var i = 0; i < s.length; i++) {
            var ch = s.charAt(i);
            var rep = ACCENTS[ch];
            out += rep === undefined ? ch : rep;
        }
        return out;
    }

    /* ── listões fixos (Sets→objetos) — transcritos da fonte A ─────────────── */
    var PRONOMES_SUBJ = {
        "eu":1,"tu":1,"ele":1,"ela":1,"nós":1,"vós":1,"vocês":1,"eles":1,"elas":1,"você":1
    };
    var PRONOMES_OBL = {
        "me":1,"te":1,"lhe":1,"lhes":1,"mim":1,"ti":1,"si":1,"conosco":1,"convosco":1,"vos":1,
        "comigo":1,"contigo":1,"consigo":1
    };
    var PRONOMES_INDF = {
        "alguém":1,"ninguém":1,"tudo":1,"nada":1,"algo":1,"qualquer":1,"todo":1,"toda":1,"todos":1,"todas":1,
        "outrem":1,"outro":1,"outra":1,"outros":1,"outras":1,"cada":1,"nenhum":1,"nenhuma":1,
        "algum":1,"alguma":1,"alguns":1,"algumas":1,
        "muitos":1,"muitas":1,"poucos":1,"poucas":1,"tantos":1,"tantas":1,
        "certo":1,"certa":1,"tal":1,"tais":1,
        "mesmo":1,"mesma":1,"mesmos":1,"mesmas":1,
        "próprio":1,"própria":1,"próprios":1,"próprias":1,
        "quem":1,"cujo":1,"cuja":1,"cujos":1,"cujas":1,
        "qual":1,"quais":1,"quanto":1,"quanta":1,"quantos":1,"quantas":1
    };
    var PRONOMES_DEM = {
        "este":1,"esta":1,"estes":1,"estas":1,"esse":1,"essa":1,"esses":1,"essas":1,
        "aquele":1,"aquela":1,"aqueles":1,"aquelas":1,"isto":1,"isso":1,"aquilo":1
    };
    var CONTRACOES_PREP_DEM = {
        "deste":1,"desta":1,"destes":1,"destas":1,"desse":1,"dessa":1,"desses":1,"dessas":1,
        "daquele":1,"daquela":1,"daqueles":1,"daquelas":1,"disto":1,"disso":1,"daquilo":1,
        "neste":1,"nesta":1,"nestes":1,"nestas":1,"nesse":1,"nessa":1,"nesses":1,"nessas":1,
        "naquele":1,"naquela":1,"naqueles":1,"naquelas":1,"nisto":1,"nisso":1,"naquilo":1,
        "àquele":1,"àquela":1,"àqueles":1,"àquelas":1,"àquilo":1
    };
    var PRONOMES_POSS = {
        "meu":1,"minha":1,"meus":1,"minhas":1,
        "teu":1,"tua":1,"teus":1,"tuas":1,
        "seu":1,"sua":1,"seus":1,"suas":1,
        "nosso":1,"nossa":1,"nossos":1,"nossas":1,
        "vosso":1,"vossa":1,"vossos":1,"vossas":1
    };
    var NUM_CARDINAIS = {
        "dois":1,"duas":1,"três":1,"quatro":1,"cinco":1,"seis":1,"sete":1,"oito":1,"nove":1,"dez":1,
        "onze":1,"doze":1,"treze":1,"quatorze":1,"catorze":1,"quinze":1,
        "dezesseis":1,"dezessete":1,"dezoito":1,"dezenove":1,
        "vinte":1,"trinta":1,"quarenta":1,"cinquenta":1,"sessenta":1,"setenta":1,"oitenta":1,"noventa":1,
        "cem":1,"cento":1,"mil":1,"ambos":1,"ambas":1
    };
    var ADJETIVOS_PRIM = {
        "bom":1,"boa":1,"bons":1,"boas":1,"mau":1,"má":1,"maus":1,"más":1,
        "belo":1,"bela":1,"belos":1,"belas":1,"lindo":1,"linda":1,"lindos":1,"lindas":1,
        "feio":1,"feia":1,"feios":1,"feias":1,"livre":1,"livres":1,
        "triste":1,"tristes":1,"forte":1,"fortes":1,"fraco":1,"fraca":1,"fracos":1,"fracas":1,
        "novo":1,"nova":1,"novos":1,"novas":1,"velho":1,"velha":1,"velhos":1,"velhas":1,
        "rico":1,"rica":1,"ricos":1,"ricas":1,"pobre":1,"pobres":1,
        "frio":1,"fria":1,"frios":1,"frias":1,"quente":1,"quentes":1,
        "raro":1,"rara":1,"raros":1,"raras":1,"claro":1,"clara":1,"claros":1,"claras":1,
        "escuro":1,"escura":1,"escuros":1,"escuras":1,"quieto":1,"quieta":1,"quietos":1,"quietas":1,
        "leve":1,"leves":1,"suave":1,"suaves":1,"grave":1,"graves":1,"breve":1,"breves":1,
        "jovem":1,"jovens":1,"simples":1,"único":1,"única":1,"únicos":1,"únicas":1,
        "sério":1,"séria":1,"sérios":1,"sérias":1,"feliz":1,"felizes":1,
        "difícil":1,"difíceis":1,"fácil":1,"fáceis":1,"ruim":1,"ruins":1,
        "ótimo":1,"ótima":1,"ótimos":1,"ótimas":1,"alto":1,"alta":1,"altos":1,"altas":1,
        "baixo":1,"baixa":1,"baixos":1,"baixas":1,"grande":1,"grandes":1,
        "largo":1,"larga":1,"largos":1,"largas":1,"longo":1,"longa":1,"longos":1,"longas":1,
        "curto":1,"curta":1,"curtos":1,"curtas":1,"duro":1,"dura":1,"duros":1,"duras":1,
        "doce":1,"doces":1,"calmo":1,"calma":1,"calmos":1,"calmas":1,
        "bravo":1,"brava":1,"bravos":1,"bravas":1,"fino":1,"fina":1,"finos":1,"finas":1,
        "nobre":1,"nobres":1,"ágil":1,"ágeis":1,"fértil":1,"férteis":1,"útil":1,"úteis":1,
        "certos":1,"certas":1,"leal":1,"leais":1,"fiel":1,"fiéis":1,"frugal":1,"frugais":1,
        "bonito":1,"bonita":1,"bonitos":1,"bonitas":1,"atrasado":1,"atrasada":1,
        "animado":1,"animada":1,"animados":1,"animadas":1,"fechado":1,"fechada":1,
        "pensativo":1,"pensativa":1,"pensativos":1,"pensativas":1,
        "rápido":1,"rápida":1,"rápidos":1,"rápidas":1,"lento":1,"lenta":1,"lentos":1,"lentas":1,
        "complexo":1,"complexa":1,"complexos":1,"complexas":1,"justa":1,"justo":1,"justos":1,"justas":1,
        "úmido":1,"úmida":1,"úmidos":1,"úmidas":1,"imediato":1,"imediata":1,"imediatos":1,"imediatas":1,
        "próximo":1,"próxima":1,"próximos":1,"próximas":1,"eficaz":1,"eficazes":1,
        "público":1,"pública":1,"públicos":1,"públicas":1,"chato":1,"chata":1,"chatos":1,"chatas":1,
        "gostoso":1,"gostosa":1,"gostosos":1,"gostosas":1,"cansativo":1,"cansativa":1,
        "preocupante":1,"rigoroso":1,"rigorosa":1,"solidário":1,"solidária":1,
        "detalhado":1,"detalhada":1,"coletado":1,"coletada":1,"coletados":1,"coletadas":1,
        "obrigado":1,"obrigada":1,
        "social":1,"sociais":1,"federal":1,"federais":1,"natural":1,"naturais":1,
        "cultural":1,"culturais":1,"nacional":1,"nacionais":1,"regional":1,"regionais":1,
        "global":1,"globais":1,"formal":1,"formais":1,"normal":1,"normais":1,
        "oficial":1,"oficiais":1,"especial":1,"especiais":1,"pessoal":1,"pessoais":1,
        "atual":1,"atuais":1,"fundamental":1,"fundamentais":1,"central":1,"centrais":1,
        "digital":1,"digitais":1,"ambiental":1,"ambientais":1,"judicial":1,"judiciais":1,
        "legal":1,"legais":1,"moral":1,"morais":1,"mental":1,"mentais":1,"visual":1,"visuais":1,
        "verbal":1,"verbais":1,"horizontal":1,"horizontais":1,"vertical":1,"verticais":1,
        "tropical":1,"tropicais":1,"rural":1,"rurais":1,"vital":1,"vitais":1,
        "total":1,"totais":1,"real":1,"reais":1,"local":1,"locais":1,
        "original":1,"originais":1,"parcial":1,"parciais":1,"racial":1,"raciais":1,
        "brutal":1,"brutais":1,"criminal":1,"criminais":1,"leal":1,"leais":1,
        "banal":1,"banais":1,"fatal":1,"fatais":1,"ideal":1,"ideais":1,
        "comercial":1,"comerciais":1,"industrial":1,"industriais":1,"material":1,"materiais":1
    };
    var INTERJEICOES = {
        "ah":1,"oh":1,"ih":1,"uh":1,"eh":1,"ei":1,
        "oba":1,"ufa":1,"xi":1,"vixe":1,"epa":1,"ué":1,"opa":1,"poxa":1,"bah":1,"hem":1,"hein":1,
        "caramba":1,"eita":1,"eta":1,"arre":1,"ena":1,"uai":1,"credo":1,"ave":1,
        "alô":1,"tchau":1,"psiu":1,"oxalá":1,
        "ora":1,"pronto":1,"eis":1
    };
    var NUM_ORDINAIS = {
        "primeiro":1,"primeira":1,"primeiros":1,"primeiras":1,
        "terceiro":1,"terceira":1,"terceiros":1,"terceiras":1,
        "sétimo":1,"sétima":1,"sétimos":1,"sétimas":1,
        "oitavo":1,"oitava":1,"oitavos":1,"oitavas":1,
        "décimo":1,"décima":1,"décimos":1,"décimas":1,
        "vigésimo":1,"vigésima":1,"vigésimos":1,"vigésimas":1,
        "trigésimo":1,"trigésima":1,"trigésimos":1,"trigésimas":1,
        "centésimo":1,"centésima":1,"centésimos":1,"centésimas":1,
        "milésimo":1,"milésima":1,"milésimos":1,"milésimas":1
    };
    var _SUFIXOS_NOM_RE = /(?:cao|sao|oes|dade|tude|eza|ez|ismo|ncia|mento|agem|ista|ura|aria|orio)$/;
    var _SUFIXOS_NOM_PLURAL_RE = /(?:emas|omas|imas|uras|ores|ares|anes|etes|otes|umas|ersas|ivas|amas)$/;
    var _BIGRAM_NOUN_PREV = { "Determiner":1, "Numeral":1 };
    var _POSSESSIVOS = { "meu":1,"minha":1,"meus":1,"minhas":1,"seu":1,"sua":1,"seus":1,"suas":1,"teu":1,"tua":1,"teus":1,"tuas":1,"nosso":1,"nossa":1,"nossos":1,"nossas":1,"vosso":1,"vossa":1,"vossos":1,"vossas":1 };
    var _PRON_PESSOAL = makeSet(["eu","tu","ele","ela","nos","nós","vos","vós","eles","elas","voce","vocês","voces","a gente"]);
    var _SUBST_INF_LIKE = makeSet(["lugar","jantar","prazer","lazer","mulher","colher","mar","lar","luar","altar","pilar","acucar","talher","elixir","mister","carater"]);
    var _ADJ_FLAT_ADV = makeSet(["alto","alta","baixo","baixa","claro","clara","rapido","rapida","errado","errada","certo","certa","largo","larga","longe","perto","duro","dura","fundo","funda","forte","firme","limpo","limpa","livre","leve","grave","suave"]);
    var _DIACRITICO_ADJ_AMBIG = makeSet(["publica","publicas","publico","publicos"]);
    var _SERIA_ADJ_AMBIG = makeSet(["seria","serias"]);
    var _ADV_INTENS_ADJ_CTX = makeSet(["demais","muito","muita","pouco","pouca","bastante","mais","menos","tao","tão","quase"]);
    var _COPULAS_ADJ_CTX = makeSet([
        "ser","e","é","sao","são","era","eras","eram","foi","fomos","foram",
        "fora","foras","fosse","fossem","for","forem","seja","sejam","serei",
        "sera","será","serao","serão","seria","seriam","sendo","sido",
        "estar","esta","está","estao","estão","estava","estavam","esteve",
        "estivera","estaria","estivesse","fique",
        "ficar","fica","ficou","ficava","ficavam","ficara","ficaram","ficará","ficaria","ficasse",
        "parecer","parece","pareceu","parecia","continuar","continua","continuava",
        "permanecer","permanece","permanecia","tornar","tornou","tornava",
        "sentiu","sente","sentia","sentira","sentiria","sentir",
        "achou","acha","achava","achara","achar",
        "mostrou","mostra","mostrava","mostrara","mostrar",
        "revelou","revela","revelava","revelara","revelar",
        "julgou","julga","julgava","julgar",
        "considerou","considera","considerava","considerar"
    ]);
    var _PARTICIPIOS_IRR_CTX = makeSet([
        "aberto","aberta","abertos","abertas",
        "coberto","coberta","cobertos","cobertas",
        "dito","dita","ditos","ditas",
        "escrito","escrita","escritos","escritas",
        "feito","feita","feitos","feitas",
        "pago","paga","pagos","pagas",
        "posto","posta","postos","postas",
        "visto","vista","vistos","vistas",
        "preso","presa","presos","presas",
        "expulso","expulsa","expulsos","expulsas",
        "aceito","aceita","aceitos","aceitas",
        "oculto","oculta","ocultos","ocultas",
        "tido","tida","tidos","tidas",
        "eleito","eleita","eleitos","eleitas",
        "contido","contida","contidos","contidas",
        "mantido","mantida","mantidos","mantidas",
        "obtido","obtida","obtidos","obtidas",
        "retido","retida","retidos","retidas",
        "conduzido","conduzida","conduzidos","conduzidas",
        "previsto","prevista","previstos","previstas",
        "salvo","salva","salvos","salvas",
        "entregue","entregues",
        "incluso","inclusa","inclusos","inclusas",
        "excluso","exclusa"
    ]);

    function _isParticipleLike(normNoAccent) {
        return _PARTICIPIOS_IRR_CTX[normNoAccent] === 1 ||
            /(?:ado|ada|ados|adas|ido|ida|idos|idas)$/.test(normNoAccent);
    }
    function _addUniqueTag(tags, tag) {
        if (!arrayIncludes(tags, tag)) tags.push(tag);
    }

    /* ── listões normativos carregados dos dados embutidos ──────────────────── */
    /* Os dados off-line já vêm como objetos de flags ({palavra:1}); usamos direto. */
    var _PRENOMES_F  = normaData.prenomes_femininos || {};
    var _PRENOMES_M  = normaData.prenomes_masculinos || {};
    var _VERBOS_IRR  = normaData.formas_verbais_irr || {};
    var _TOPONIMOS   = normaData.toponimos_pt_br || {};
    var _SIGLAS      = normaData.siglas_pt_br || {};
    var _SUBST_IA    = normaData.substantivos_ia || {};
    var _VERBOS_PRES = normaData.verbos_pres_reg || {};
    var _ADJ_EXT     = normaData.adjetivos_comuns || {}; // já sem acento (gerado)

    var _objFromList = function(){ return {}; };

    var VERBOS_LIGACAO = makeSet([
        "ser","estar","ficar","parecer","continuar","permanecer",
        "tornar","revelar","mostrar","andar","viver","acabar","chegar",
        "é","foi","era","será","seria","fosse","seja","estou","está","estão",
        "estava","esteve","estará","estaria","estivesse","esteja",
        "fica","ficou","ficava","ficará","ficaria","ficasse","fique",
        "parece","pareceu","parecia","parecerá","pareceria","parecesse","pareça",
        "continua","continuou","continuava","continuará","continuaria",
        "permanece","permaneceu","permanecia","permanecerá",
        "são","eram","foram","serão","seriam","fossem","sejam"
    ]);
    var VERBOS_AUX = makeSet([
        "ter","tem","têm","tinha","tinham","tive","teve","tivemos","tiveram",
        "terá","terão","teria","teriam","tivesse","tivessem","tenha","tenham",
        "haver","há","havia","houve","houveram","haverá","haveria","haja"
    ]);
    var PREPS_OI = makeSet([
        "a","ao","à","aos","às","de","do","da","dos","das","em","no","na","nos","nas",
        "para","por","pelo","pela","pelos","pelas",
        "com","sem","sobre","sob","entre","contra","ante","após","desde","até","perante","durante",
        "através","atraves","apesar","mediante","conforme","segundo","exceto","salvo","senão","senao","malgrado",
        "acerca","acerca de","além de","aquém de"
    ]);
    var ARTIGOS_DEF = makeSet(["o","os","as","um","uma","uns","umas"]);
    var VERBOS_PRED_OBJ = makeSet([
        "chamar","chamar de","intitular","denominar","apelidar",
        "eleger","nomear","constituir","declarar","proclamar",
        "considerar","julgar","achar","crer","supor","imaginar",
        "tornar","fazer","deixar","manter","ter","tomar",
        "reconhecer","designar","qualificar","classificar",
        "chamou","chamava","chamará","chamaram",
        "elegeu","elegeram","nomeou","nomearam",
        "considerou","considerava","consideraram",
        "deixou","deixava","deixaram","deixará",
        "tornou","tornava","tornaram","tornará"
    ]);
    var VERBOS_OI_DATIVO = makeSet([
        "dar","dei","deu","davam","darão","entregou","entregaram","enviou","enviaram",
        "mandou","mandaram","oferecer","ofereceu","ofereceram","passar","passou","passaram",
        "mostrar","mostrou","mostraram","contar","contou","contaram",
        "revelar","revelou","revelaram","explicar","explicou","explicaram",
        "dizer","disse","disseram","pedir","pediu","pediram"
    ]);
    var VERBOS_OI_POSSE = makeSet([
        "tirar","tirou","tiraram","cortar","cortou","cortaram",
        "roubar","roubou","roubaram","arrancar","arrancou","arrancaram",
        "tomar","tomou","tomaram","retirar","retirou","retiraram"
    ]);
    var VERBOS_OI_INTERESSE = makeSet([
        "prejudicar","prejudicou","prejudicaram","beneficiar","beneficiou","beneficiaram",
        "servir","serviu","serviram","ajudar","ajudou","ajudaram",
        "convir","conveio","convieram","interessar","interessou","interessaram",
        "bastar","bastou","bastaram","faltar","faltou","faltaram",
        "acontecer","aconteceu","aconteceram","ocorrer","ocorreu","ocorreram"
    ]);
    var ADV_TEMPO = makeSet(["ontem","hoje","amanhã","agora","antes","depois","cedo","tarde","logo","já","sempre","nunca","jamais","antigamente","outrora","então","enfim","finalmente","ainda","brevemente","imediatamente","doravante"]);
    var ADV_LUGAR = makeSet(["aqui","ali","lá","cá","aí","abaixo","acima","dentro","fora","atrás","adiante","perto","longe","onde","alhures","algures","acolá","além","aquém","acima","abaixo","adiante","atrás","defronte","acolá","diante"]);
    var ADV_MODO = makeSet(["assim","bem","mal","melhor","pior","devagar","depressa","rapidamente","lentamente","facilmente","dificilmente","calmamente"]);
    var ADV_NEGACAO = makeSet(["não","nem","jamais","nunca","tampouco"]);
    var ADV_AFIRM = makeSet(["sim","certamente","decerto","efetivamente","realmente","também","inclusive","outrossim"]);
    var ADV_INTENS = makeSet(["muito","muita","pouco","pouca","bastante","mais","menos","tão","tanto","quão","quase","demais","apenas","somente","só"]);
    var ADV_DUVIDA = makeSet(["talvez","provavelmente","possivelmente","porventura","quiçá","eventualmente"]);

    /* Punctuation tokens (ES5 regex para \p{L}) */
    var PUNCT_RE = /^[.,;:!?—]$/;
    var TOKEN_RE = /[A-Za-zÀ-ÖØ-öø-ÿ'’-]+|[.,;:!?—]/g;
    var UPPER_RE = /^[A-ZÀ-ÖØ-Þ]$/;
    function isSentenceEnd(tok) { return /^[.!?]$/.test(tok); }
    function isUpperStart(word) {
        var c = String(word || "").charAt(0);
        return UPPER_RE.test(c);
    }

    /* ── Desambiguação contextual (segunda passagem) ────────────────────────── */
    var _cliSet0 = makeSet(["me","te","se","o","a","lo","la","lhe","nos","vos","lhes","los","las"]);
    var _CLITICOS = makeSet(["me","te","se","o","a","lo","la","lhe","nos","vos","lhes","los","las"]);

    function resolverAmbiguidade(tks) {
        for (var i = 0; i < tks.length; i++) {
            var t = tks[i];
            if (!t || PUNCT_RE.test(t.text)) continue;
            var na = stripAccent(t.normal);
            var prevNorm = i > 0 ? stripAccent(tks[i - 1].normal || "") : "";
            var nextNorm = i + 1 < tks.length ? stripAccent(tks[i + 1].normal || "") : "";
            var prevTags = i > 0 ? (tks[i - 1].tags || []) : [];
            var nextTags = i + 1 < tks.length ? (tks[i + 1].tags || []) : [];
            var prevIsDet = arrayIncludes(prevTags, "Determiner");
            var prevIsCtx = prevIsDet || arrayIncludes(prevTags, "Preposition");
            var prevHighNoun = false;
            for (var pi = 0; pi < prevTags.length; pi++) {
                if (_BIGRAM_NOUN_PREV[prevTags[pi]]) { prevHighNoun = true; break; }
            }
            var prevLooksNominal = arrayIncludes(prevTags, "Noun") || arrayIncludes(prevTags, "Pronoun") || arrayIncludes(prevTags, "Adjective");

            if (t.tags.length === 0 && na.length > 4 && _SUFIXOS_NOM_RE.test(na))
                t.tags.push("Noun");

            if (t.tags.length === 0 && na.length > 2
                && arrayIncludes(prevTags, "Verb") && !_COPULAS_ADJ_CTX[prevNorm])
                t.tags.push("Noun");

            if (t.tags.length === 0 && prevIsCtx)
                t.tags.push("Noun");

            if (t.tags.length === 1 && t.tags[0] === "Verb" && prevIsDet)
                t.tags[0] = "Noun";

            if (prevHighNoun && arrayIncludes(t.tags, "Verb") && !arrayIncludes(t.tags, "Noun")) {
                var filtered = [];
                for (var fi = 0; fi < t.tags.length; fi++) if (t.tags[fi] !== "Verb") filtered.push(t.tags[fi]);
                t.tags = filtered;
                t.tags.push("Noun");
            }

            if (na === "por" && nextNorm === "enquanto") {
                var noNoun1 = [];
                for (var n1 = 0; n1 < t.tags.length; n1++) if (t.tags[n1] !== "Noun") noNoun1.push(t.tags[n1]);
                t.tags = noNoun1;
            }
            if (na === "enquanto" && (prevNorm === "por" || nextNorm === "isso")) {
                var noConjNoun = [];
                for (var n2 = 0; n2 < t.tags.length; n2++) {
                    if (t.tags[n2] !== "Conjunction" && t.tags[n2] !== "Noun") noConjNoun.push(t.tags[n2]);
                }
                t.tags = noConjNoun;
                _addUniqueTag(t.tags, "Adverb");
            }

            var nextVerbToken = null;
            for (var si = i + 1; si < tks.length; si++) {
                if (tks[si] && tks[si].tags && arrayIncludes(tks[si].tags, "Verb")) { nextVerbToken = tks[si]; break; }
            }
            var nextVerbNorm = nextVerbToken ? stripAccent(nextVerbToken.normal || "") : "";
            var nextVerbIsInfinitive = /(?:ar|er|ir)$/.test(nextVerbNorm);
            var nextLooksObject = arrayIncludes(nextTags, "Determiner")
                || (arrayIncludes(nextTags, "Pronoun") && !arrayIncludes(nextTags, "Preposition"))
                || (arrayIncludes(nextTags, "Noun") && !arrayIncludes(nextTags, "Verb") && !arrayIncludes(nextTags, "Adjective"));

            if (t.tags.length === 1 && t.tags[0] === "Adjective"
                && VERBOS_LIGACAO[na] === undefined && VERBOS_AUX[na] === undefined
                && _VERBOS_PRES[na] === undefined && _VERBOS_IRR[na] === undefined
                && arrayIncludes(prevTags, "Noun")
                && !arrayIncludes(prevTags, "Pronoun")
                && !arrayIncludes(prevTags, "Preposition")) {
                if (na === "precisa" && nextNorm === "de") {
                    t.tags[0] = "Verb";
                } else if (nextLooksObject) {
                    t.tags[0] = "Verb";
                } else if (na === "precisa"
                    && arrayIncludes(["de","do","da","dos","das"], nextNorm)
                    && (!nextVerbNorm || nextVerbIsInfinitive)) {
                    t.tags[0] = "Verb";
                }
            }

            if (_DIACRITICO_ADJ_AMBIG[na] && arrayIncludes(t.tags, "Verb") && arrayIncludes(prevTags, "Noun") && arrayIncludes(nextTags, "Verb")) {
                _addUniqueTag(t.tags, "Adjective");
            }
            if (_SERIA_ADJ_AMBIG[na] && arrayIncludes(t.tags, "Verb") && arrayIncludes(prevTags, "Noun")
                && !arrayIncludes(prevTags, "Pronoun") && (_ADV_INTENS_ADJ_CTX[nextNorm] || arrayIncludes(nextTags, "Verb"))) {
                _addUniqueTag(t.tags, "Adjective");
            }

            if (t.tags.length === 0 && _COPULAS_ADJ_CTX[prevNorm]
                && (_PARTICIPIOS_IRR_CTX[na] || _ADJ_FLAT_ADV[na])) {
                _addUniqueTag(t.tags, "Adjective");
            }

            if (arrayIncludes(t.tags, "Verb") && _isParticipleLike(na)) {
                if ((prevLooksNominal && !arrayIncludes(prevTags, "Preposition")) || _COPULAS_ADJ_CTX[prevNorm]) {
                    _addUniqueTag(t.tags, "Adjective");
                }
            }

            if (na === "cedo" && arrayIncludes(t.tags, "Adverb") && _POSSESSIVOS[nextNorm]) {
                var noAdv2 = [];
                for (var a2 = 0; a2 < t.tags.length; a2++) if (t.tags[a2] !== "Adverb") noAdv2.push(t.tags[a2]);
                t.tags = noAdv2;
                _addUniqueTag(t.tags, "Verb");
            }

            if (_ADJ_FLAT_ADV[na] && t.tags.length === 1 && t.tags[0] === "Adjective"
                && arrayIncludes(prevTags, "Verb") && !_COPULAS_ADJ_CTX[prevNorm]) {
                _addUniqueTag(t.tags, "Adverb");
            }

            if (_ADJ_FLAT_ADV[na] && arrayIncludes(t.tags, "Verb") && !arrayIncludes(t.tags, "Adjective")
                && arrayIncludes(prevTags, "Verb") && !_COPULAS_ADJ_CTX[prevNorm]
                && !arrayIncludes(nextTags, "Noun") && !arrayIncludes(nextTags, "Pronoun") && !arrayIncludes(nextTags, "Determiner")) {
                _addUniqueTag(t.tags, "Adverb");
            }

            /* R7b — pronome indefinido em _ADJ_FLAT_ADV como predicativo após cópula */
            if (_COPULAS_ADJ_CTX[prevNorm] && _ADJ_FLAT_ADV[na]
                && (arrayIncludes(t.tags, "Pronoun") || arrayIncludes(t.tags, "Noun"))
                && !arrayIncludes(t.tags, "Adjective")) {
                _addUniqueTag(t.tags, "Adjective");
            }

            /* R7c — adj plano com leitura verbal após intensificador → Adjective */
            if (_ADJ_FLAT_ADV[na] && arrayIncludes(t.tags, "Verb") && !arrayIncludes(t.tags, "Adjective")
                && _ADV_INTENS_ADJ_CTX[prevNorm]) {
                _addUniqueTag(t.tags, "Adjective");
            }

            /* R11 — "certo/certa" como advérbio plano após verbo não-cópula */
            if ((na === "certo" || na === "certa")
                && (arrayIncludes(t.tags, "Pronoun") || arrayIncludes(t.tags, "Noun"))
                && arrayIncludes(prevTags, "Verb") && !_COPULAS_ADJ_CTX[prevNorm]) {
                _addUniqueTag(t.tags, "Adverb");
            }

            /* R11b — "certo/certa" pós-nominal → Adjective adnominal */
            if ((na === "certo" || na === "certa")
                && (arrayIncludes(t.tags, "Pronoun") || arrayIncludes(t.tags, "Noun"))
                && !arrayIncludes(t.tags, "Adjective")
                && (arrayIncludes(prevTags, "Noun") || arrayIncludes(prevTags, "Adjective"))
                && !arrayIncludes(prevTags, "Verb")) {
                _addUniqueTag(t.tags, "Adjective");
            }

            /* R_SALVO — "salvo/exceto/menos/senão" como preposição excludente após pontuação */
            if ((na === "salvo" || na === "exceto" || na === "menos" || na === "senao" || na === "senão")
                && arrayIncludes(t.tags, "Verb") && !arrayIncludes(t.tags, "Adjective")
                && (prevNorm === "," || prevNorm === ";" || prevNorm === "")
                && (arrayIncludes(nextTags, "Pronoun") || arrayIncludes(nextTags, "Noun") || arrayIncludes(nextTags, "Determiner"))) {
                _addUniqueTag(t.tags, "Preposition");
            }

            /* R10 — palavra sem tags após pronome pessoal sujeito → leitura verbal */
            if (t.tags.length === 0 && _PRON_PESSOAL[prevNorm]) {
                _addUniqueTag(t.tags, "Verb");
            }

            /* R12 — palavra de conteúdo ainda sem tag → substantivo (classe aberta padrão) */
            if (t.tags.length === 0 && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(t.text)) {
                t.tags.push("Noun");
            }

            /* R13 — "que" relativo após demonstrativo neutro */
            if (na === "que" && (prevNorm === "o" || prevNorm === "tudo" || prevNorm === "aquilo" || prevNorm === "isso" || prevNorm === "isto")) {
                _addUniqueTag(t.tags, "Pronoun");
            }

            if (i === 0 && arrayIncludes(t.tags, "Verb") && arrayIncludes(t.tags, "Noun") && _SUBST_INF_LIKE[na]) {
                var noVerb0 = [];
                for (var v0 = 0; v0 < t.tags.length; v0++) if (t.tags[v0] !== "Verb") noVerb0.push(t.tags[v0]);
                t.tags = noVerb0;
            }
        }
        return tks;
    }

    /* ── Conjunções ─────────────────────────────────────────────────────────── */
    function identificarConjuncao(texto, contexto) {
        var norm = String(texto || "").toLowerCase().trim();
        if (norm.length === 0) return null;
        var subord = syntaxData.conjuncoes.subordinativas;
        var tipos = Object.keys(subord);
        var ti, pi, match, p;
        for (ti = 0; ti < tipos.length; ti++) {
            var tipo = tipos[ti];
            if (tipo.charCodeAt(0) === 95) continue; // "_"
            var grupo = subord[tipo];
            var lista = grupo.palavras || [];
            match = null;
            for (pi = 0; pi < lista.length; pi++) {
                p = lista[pi];
                if (norm === p || strStartsWith(norm, p + " ") || strEndsWith(norm, " " + p)) { match = p; break; }
            }
            if (match) {
                if (match === "desde que") {
                    if (contexto && contexto.posInicio) return { palavra: match, classe: "subordinativa", tipo: "temporal", relacao: "tempo", descricao: "início de período temporal" };
                    return { palavra: match, classe: "subordinativa", tipo: "condicional", relacao: "condição", descricao: "= contanto que" };
                }
                if (match === "como") {
                    if (contexto && contexto.posInicio && !contexto.temCorrelato) return { palavra: match, classe: "subordinativa", tipo: "causais", relacao: "causa", descricao: "causal — no início da oração" };
                }
                return { palavra: match, classe: "subordinativa", tipo: tipo, relacao: grupo.relacao, funcao: grupo.funcao, descricao: grupo.descricao };
            }
            if (grupo.valor_especial && hasKey(grupo.valor_especial, norm)) {
                return { palavra: norm, classe: "subordinativa", tipo: tipo, relacao: grupo.relacao, descricao: grupo.valor_especial[norm] };
            }
        }
        var coord = syntaxData.conjuncoes.coordenativas;
        var ct = Object.keys(coord);
        var ci, cpi, cmatch;
        for (ci = 0; ci < ct.length; ci++) {
            var ctipo = ct[ci];
            if (ctipo.charCodeAt(0) === 95) continue;
            var cgrupo = coord[ctipo];
            var clista = cgrupo.palavras || [];
            cmatch = null;
            for (cpi = 0; cpi < clista.length; cpi++) {
                if (norm === clista[cpi]) { cmatch = clista[cpi]; break; }
            }
            if (cmatch) return { palavra: cmatch, classe: "coordenativa", tipo: ctipo, relacao: cgrupo.relacao, descricao: cgrupo.descricao };
        }
        return null;
    }

    /* ── Tempo verbal ───────────────────────────────────────────────────────── */
    var PARTICIPIOS_IRR = {
        "aberto":1,"coberto":1,"dito":1,"escrito":1,"feito":1,"pago":1,"posto":1,
        "visto":1,"vindo":1,"ganho":1,"gasto":1,"preso":1,"expulso":1,"aceito":1,
        "aceso":1,"eleito":1,"entregue":1,"impresso":1,"limpo":1,"morto":1,
        "salvo":1,"solto":1,"tinto":1
    };
    function identificarTempoVerbal(palavra, tags, contexto) {
        contexto = contexto || {};
        var tagMap = {
            "FutureTense": "Futuro do presente",
            "PastTense": "Pretérito perfeito",
            "PresentTense": "Presente do indicativo",
            "Infinitive": "Infinitivo",
            "Gerund": "Gerúndio",
            "Imperative": "Imperativo"
        };
        var tagKeys = Object.keys(tagMap);
        for (var k = 0; k < tagKeys.length; k++) {
            if (tags && arrayIncludes(tags, tagKeys[k])) return tagMap[tagKeys[k]];
        }
        var w = String(palavra || "").toLowerCase();
        if (PARTICIPIOS_IRR[w]) return "Particípio";
        if (/(?:ando|endo|indo)$/.test(w)) return "Gerúndio";
        if (/(?:ados?|idas?|idos?)$/.test(w) && !(tags && arrayIncludes(tags, "Noun"))) return "Particípio";
        if (/(?:aria|arias|ariam|eria|erias|eriam|iria|irias|iriam)$/.test(w)) return "Futuro do pretérito (condicional)";
        if (/(?:arei|arás|ará|aremos|arão|erei|erás|erá|eremos|erão|irei|irás|irá|iremos|irão)$/.test(w)) return "Futuro do presente";
        if (/(?:asse|asses|assem|esse|esses|essem|isse|isses|issem)$/.test(w)) return "Pretérito imperfeito do subjuntivo";
        if (/(?:armos|ardes|arem|ermos|erdes|erem|irmos|irdes|irem)$/.test(w)) {
            if (contexto.conjTempCond) return "Futuro do subjuntivo";
            if (contexto.posPrep) return "Infinitivo pessoal";
            return "Futuro do subjuntivo / Infinitivo pessoal";
        }
        if (/(?:ar|er|ir|or)$/.test(w) && w.length > 3) {
            if (contexto.conjTempCond) return "Futuro do subjuntivo";
            return "Infinitivo";
        }
        if (/(?:ava|avas|avam|ia|ias|iam)$/.test(w)) return "Pretérito imperfeito";
        if (/(?:ou|eu|iu|ei|aste|este|iste|aram|eram|iram)$/.test(w)) return "Pretérito perfeito";
        return null;
    }

    /* ── Morfologia heurística (fallback puro) ──────────────────────────────── */
    function analisarMorfologiaFallback(texto) {
        var tokens = String(texto || "").match(TOKEN_RE) || [];
        var resultado = [];
        for (var i = 0; i < tokens.length; i++) {
            var word = tokens[i];
            var norm = word.toLowerCase();
            var tags = [];
            if (ARTIGOS_DEF[norm]) {
                tags.push("Determiner");
            } else if (norm === "a") {
                var _nextTok = i + 1 < tokens.length ? tokens[i + 1] : null;
                var _nextIsProper = _nextTok !== null && isUpperStart(_nextTok) && i > 0;
                tags.push(_nextIsProper ? "Preposition" : "Determiner");
            } else if (PREPS_OI[norm]) {
                tags.push("Preposition");
            } else if (CONTRACOES_PREP_DEM[norm]) {
                tags.push("Preposition");
            }
            if (syntaxData && identificarConjuncao(word, { posInicio: i === 0 })) tags.push("Conjunction");
            if (PRONOMES_SUBJ[norm]) { tags.push("Pronoun"); tags.push("Noun"); }
            else if (PRONOMES_OBL[norm]) { tags.push("Pronoun"); }
            else if (PRONOMES_INDF[norm]) { tags.push("Pronoun"); tags.push("Noun"); }
            else if (PRONOMES_DEM[norm]) { tags.push("Pronoun"); }
            else if (PRONOMES_POSS[norm]) { tags.push("Pronoun"); tags.push("Possessive"); }
            else if (NUM_CARDINAIS[norm]) { tags.push("Noun"); tags.push("Numeral"); }
            else if (NUM_ORDINAIS[norm]) { tags.push("Adjective"); tags.push("Numeral"); }
            else if (INTERJEICOES[norm]) { tags.push("Interjection"); }
            else if (VERBOS_AUX[norm]) { tags.push("Verb"); }
            else if (!PREPS_OI[norm] && _VERBOS_IRR[stripAccent(norm)]) { tags.push("Verb"); }
            else if (norm === "integra"
                && i >= 2
                && !PREPS_OI[tokens[i - 1].toLowerCase()]
                && !ARTIGOS_DEF[tokens[i - 1].toLowerCase()]
                && i + 1 < tokens.length
                && !PREPS_OI[tokens[i + 1].toLowerCase()]
                && !CONTRACOES_PREP_DEM[tokens[i + 1].toLowerCase()]
                && !PUNCT_RE.test(tokens[i + 1])) { tags.push("Verb"); }
            else if (_VERBOS_PRES[stripAccent(norm)] && i > 0 && !PREPS_OI[tokens[i - 1].toLowerCase()]
                && !ARTIGOS_DEF[tokens[i - 1].toLowerCase()]
                && !(i >= 2 && (ARTIGOS_DEF[tokens[i - 2].toLowerCase()] || tokens[i - 2].toLowerCase() === "a"))) { tags.push("Verb"); }
            else if (ADJETIVOS_PRIM[norm] || _ADJ_EXT[stripAccent(norm)]) { tags.push("Adjective"); }
            else if (ADV_NEGACAO[norm]) { tags.push("Adverb"); tags.push("Negative"); }
            else if (ADV_AFIRM[norm]) { tags.push("Adverb"); }
            else if (ADV_TEMPO[norm]) { tags.push("Adverb"); }
            else if (ADV_LUGAR[norm]) { tags.push("Adverb"); }
            else if (ADV_MODO[norm]) { tags.push("Adverb"); }
            else if (ADV_INTENS[norm]) { tags.push("Adverb"); }
            else if (ADV_DUVIDA[norm]) { tags.push("Adverb"); }
            else {
                var prevToken = i > 0 ? tokens[i - 1] : null;
                var prevEndsSentence = prevToken !== null && isSentenceEnd(prevToken);
                var midSentenceProper = isUpperStart(word) && i > 0 && !prevEndsSentence;
                if (midSentenceProper) {
                    tags.push("ProperNoun");
                    tags.push("Noun");
                } else if (i === 0 && isUpperStart(word)) {
                    var normNacc = stripAccent(norm);
                    var isFemNome = _PRENOMES_F[normNacc] === 1;
                    var isMascNome = _PRENOMES_M[normNacc] === 1;
                    if (isFemNome || isMascNome) {
                        tags.push("ProperNoun"); tags.push("Noun");
                        if (isFemNome) tags.push("FemaleName");
                        if (isMascNome) tags.push("MaleName");
                    } else if (_TOPONIMOS[normNacc] === 1 || _SIGLAS[normNacc] === 1) {
                        tags.push("ProperNoun"); tags.push("Noun");
                    } else if (_SUBST_IA[normNacc] === 1) {
                        tags.push("Noun");
                    } else if (VERBOS_LIGACAO[norm] || (!PREPS_OI[norm] && _VERBOS_IRR[normNacc] === 1)) {
                        tags.push("Verb");
                    } else if (/(?:oso|osa|avel|ivel)$/.test(normNacc) && normNacc.length > 5) {
                        tags.push("Adjective");
                    } else if (_VERBOS_PRES[normNacc] === 1) {
                        tags.push("Verb");
                    } else {
                        var _clParts0 = norm.split("-");
                        if (_clParts0.length >= 2 && _allIn(_clParts0.slice(1), _cliSet0)) {
                            tags.push("Verb");
                            if (/(?:ar|er|ir)$/.test(_clParts0[0])) tags.push("Noun");
                        }
                        else if (/(?:ando|endo|indo)$/.test(norm)) { tags.push("Verb"); tags.push("Gerund"); }
                        else if (norm.length > 4 && /(?:aram|eram|iram|ava|avam|ará|erá|irá|asse|esse|isse|ou|eu|iu|ei)$/.test(norm)) tags.push("Verb");
                        else if (/mente$/.test(norm) && norm.length > 6) tags.push("Adverb");
                        else if (/(?:ar|er|ir)$/.test(norm) && norm.length > 3 && !PREPS_OI[norm]) { tags.push("Verb"); tags.push("Noun"); }
                        else tags.push("Noun");
                    }
                } else {
                    if (/mente$/.test(norm) && norm.length > 6) tags.push("Adverb");
                    var _na = stripAccent(norm);
                    if (/(?:oso|osa)$/.test(_na) && _na.length > 5) tags.push("Adjective");
                    if (/(?:avel|ivel)$/.test(_na) && _na.length > 5) tags.push("Adjective");
                    if (/(?:ante|ente)$/.test(_na) && _na.length > 6) tags.push("Adjective");
                    if (/(?:udo|uda|udos|udas)$/.test(_na) && _na.length > 5) tags.push("Adjective");
                    if (/(?:ento|enta)$/.test(_na) && _na.length > 6 && !/ment[oa]$/.test(_na)) tags.push("Adjective");
                    var _SUBST_EXC_IVO = { "arquivo":1,"arquivos":1,"dispositivo":1,"dispositivos":1 };
                    if (/(?:ivo|iva|ivos|ivas)$/.test(_na) && _na.length > 5 && !_SUBST_EXC_IVO[_na]) tags.push("Adjective");
                    var _clParts = norm.split("-");
                    if (_clParts.length >= 2 && _allIn(_clParts.slice(1), _CLITICOS)) {
                        tags.push("Verb");
                    } else if (/(?:ando|endo|indo)$/.test(norm)) { tags.push("Verb"); tags.push("Gerund"); }
                    else if (/(?:ar|er|ir)$/.test(norm) && norm.length > 3 && !PREPS_OI[norm]) tags.push("Verb");
                    else if (/(?:arao|erao|irao|avamos|iamos|ariamos|eriamos|iriamos|assemos|essemos|issemos|aramos|eramos|iramos|ado|ada|ados|adas|ido|ida|idos|idas)$/.test(_na) && _na.length > 4) {
                        tags.push("Verb");
                    } else if (/(?:ou|eu|iu|ei|aram|eram|iram|ava|avam|ia|iam|ará|erá|irá|aria|eria|iria|asse|esse|isse)$/.test(norm) && norm.length > 3) {
                        var nacc = stripAccent(norm);
                        if (/ia$/.test(norm) && _SUBST_IA[nacc] === 1) tags.push("Noun");
                        else tags.push("Verb");
                    } else if (VERBOS_LIGACAO[norm]) tags.push("Verb");
                    else if (!PREPS_OI[norm] && _VERBOS_IRR[_na] === 1) tags.push("Verb");
                    else if (_VERBOS_PRES[_na] === 1) {
                        var _prevNorm = prevToken ? prevToken.toLowerCase() : null;
                        var _prevIsNounCtx = _prevNorm !== null && (ARTIGOS_DEF[_prevNorm] || _prevNorm === "a" || PREPS_OI[_prevNorm]);
                        if (!_prevIsNounCtx) tags.push("Verb");
                    }
                }
            }
            resultado.push({ text: word, tags: tags, normal: norm });
        }
        return resolverAmbiguidade(resultado);
    }

    function _allIn(arr, setObj) {
        for (var i = 0; i < arr.length; i++) if (setObj[arr[i]] !== 1) return false;
        return true;
    }

    function analisarMorfologia(texto) {
        return analisarMorfologiaFallback(texto);
    }

    var TAG_LEGIVEL = {
        "Noun":"Substantivo","ProperNoun":"Nome próprio","Person":"Pessoa",
        "Verb":"Verbo","Adjective":"Adjetivo","Adverb":"Advérbio",
        "Preposition":"Preposição","Conjunction":"Conjunção",
        "Determiner":"Artigo/Determinante","Pronoun":"Pronome",
        "Possessive":"Possessivo","Numeral":"Numeral","Negative":"Negação","Interjection":"Interjeição",
        "FutureTense":"Futuro","PastTense":"Pretérito perfeito",
        "PresentTense":"Presente","Infinitive":"Infinitivo",
        "Gerund":"Gerúndio","Imperative":"Imperativo",
        "FirstPerson":"1ª pessoa","SecondPerson":"2ª pessoa","ThirdPerson":"3ª pessoa",
        "Singular":"Singular","Plural":"Plural",
        "FemaleName":"Nome feminino","MaleName":"Nome masculino"
    };
    function mapearTag(tags) {
        var out = [];
        for (var i = 0; i < tags.length; i++) {
            if (TAG_LEGIVEL[tags[i]]) out.push(TAG_LEGIVEL[tags[i]]);
        }
        return out;
    }
    function tipoAdverbio(norm) {
        if (ADV_NEGACAO[norm]) return "Adjunto adverbial de negação";
        if (ADV_AFIRM[norm]) return "Adjunto adverbial de afirmação";
        if (ADV_TEMPO[norm]) return "Adjunto adverbial de tempo";
        if (ADV_LUGAR[norm]) return "Adjunto adverbial de lugar";
        if (ADV_MODO[norm]) return "Adjunto adverbial de modo";
        if (ADV_INTENS[norm]) return "Adjunto adverbial de intensidade";
        if (ADV_DUVIDA[norm]) return "Adjunto adverbial de dúvida";
        if (/mente$/.test(norm)) return "Adjunto adverbial de modo";
        return "Adjunto adverbial";
    }

    /* ── Verificação de concordância ────────────────────────────────────────── */
    function verificarConcordancia(sujeito, verbo) {
        if (!sujeito || !verbo) return null;
        var sNorm = String(sujeito).toLowerCase();
        var vNorm = String(verbo).toLowerCase();
        var sujPlural = /[^ã](s|ns|is|ões|ães|ãos)$/.test(sNorm);
        var verbPlural = /(am|em|im|iam|eram|aram|estão|são|vão|têm|vêm|foram|estavam|serão)$/.test(vNorm);
        var verbSing = /(ou|eu|iu|ei|ava|ia|á|a|e|o|á)$/.test(vNorm) && !verbPlural;
        if (sujPlural && verbSing) return { tipo: "concordância", descricao: "Possível erro: sujeito '" + sujeito + "' parece plural; verbo '" + verbo + "' singular" };
        return null;
    }
    function verificarConcordanciaGenero(artigo, substantivo) {
        if (!artigo || !substantivo) return null;
        var art = String(artigo).toLowerCase();
        var sub = String(substantivo).toLowerCase();
        var artFem = arrayIncludes(["a","as","uma","umas","da","das","na","nas","à","às","pela","pelas"], art);
        var artMasc = arrayIncludes(["o","os","um","uns","do","dos","no","nos","ao","aos","pelo","pelos"], art);
        var subTermMasc = /[^a](or|ão|or|ar|er|ir|ês|il|ol|ul|al)$/.test(sub) && !/ora$/.test(sub);
        var subTermFem = /(a|ã|oa|eira|essa|esa|isa|ista|triz|dade|ção|são|gem|agem)$/.test(sub);
        if (artFem && subTermMasc && sub.length > 3)
            return { tipo: "concordância de gênero", descricao: "Possível discordância: artigo feminino '" + artigo + "' com substantivo '" + substantivo + "'" };
        if (artMasc && subTermFem && sub.length > 3 && !/(tema|dia|mapa|cinema|planeta|cometa|dilema|programa)$/.test(sub))
            return { tipo: "concordância de gênero", descricao: "Possível discordância: artigo masculino '" + artigo + "' com substantivo '" + substantivo + "'" };
        return null;
    }
    function subtipoOI(verbAnteriorNorm) {
        if (VERBOS_OI_DATIVO[verbAnteriorNorm]) return "Objeto indireto — dativo (destinatário/beneficiário)";
        if (VERBOS_OI_POSSE[verbAnteriorNorm]) return "Objeto indireto — dativo de posse";
        if (VERBOS_OI_INTERESSE[verbAnteriorNorm]) return "Objeto indireto — dativo de interesse";
        return "Objeto indireto (provável)";
    }
    function analisarSe(termos, idx) {
        var proximo = null;
        for (var i = idx + 1; i < termos.length; i++) {
            var tt = termos[i];
            if (tt && tt.tags && arrayIncludes(tt.tags, "Verb")) { proximo = tt; break; }
        }
        if (!proximo) return { funcao: "partícula (se)", tipo: "indeterminado ou apassivador" };
        var anterior = [];
        for (var a = 0; a < idx; a++) anterior.push((termos[a].text || "").toLowerCase());
        var found = false;
        for (var c2 = 0; c2 < anterior.length; c2++) {
            if (arrayIncludes(["quando","enquanto","assim que","logo que","antes que","após"], anterior[c2])) { found = true; break; }
        }
        if (found) return { funcao: "Conjunção condicional", tipo: "condicional" };
        return { funcao: "partícula (se)", tipo: "apassivador / indeterminação — verificar transitividade" };
    }

    /* ── Apostos e locuções ─────────────────────────────────────────────────── */
    function detectarApostos(texto) {
        var apostos = [];
        var re = /([A-ZÁÉÍÓÚ][a-záàâãéèêíîóòôõúùûç]+),\s+(o|a|os|as|meu|minha|seu|sua|nosso|nossa)\s+([a-záàâãéèêíîóòôõúùûç]{3,})/g;
        var m;
        re.lastIndex = 0;
        while ((m = re.exec(texto)) !== null) {
            apostos.push({ antecedente: m[1], aposto: m[2] + " " + m[3], pos: m.index });
        }
        var re2 = /\b(o presidente|a presidente|o ministro|a ministra|o escritor|a escritora|o poeta|a poetisa|o rei|a rainha|o general|o coronel)\s+([A-ZÁÉÍÓÚ][a-záàâãéèêíîóòôõúùûç]+(?:\s+[A-ZÁÉÍÓÚ][a-záàâãéèêíîóòôõúùûç]+)*)/g;
        re2.lastIndex = 0;
        while ((m = re2.exec(texto)) !== null) {
            apostos.push({ antecedente: m[1], aposto: m[2], tipo: "especificativo", pos: m.index });
        }
        return apostos;
    }

    var LOCUCOES_ADVERBIAIS = [
        { locucao: "por enquanto", relacao: "tempo", descricao: "locução adverbial temporal: por ora, até este momento", classe: "adverbial" },
        { locucao: "enquanto isso", relacao: "tempo", descricao: "conector temporal de simultaneidade", classe: "adverbial" }
    ];
    function detectarLocucoes(texto) {
        var norm = String(texto).toLowerCase();
        var encontradas = [];
        var i, g;
        for (i = 0; i < LOCUCOES_ADVERBIAIS.length; i++) {
            if (strIncludes(norm, LOCUCOES_ADVERBIAIS[i].locucao)) encontradas.push(LOCUCOES_ADVERBIAIS[i]);
        }
        var todos = [];
        var subKeys = Object.keys(syntaxData.conjuncoes.subordinativas);
        for (i = 0; i < subKeys.length; i++) {
            g = syntaxData.conjuncoes.subordinativas[subKeys[i]];
            if (g && String(subKeys[i]).charCodeAt(0) !== 95 && strIncludes(norm, "")) {}
            if (g) todos.push(g);
        }
        var coordsKeys = Object.keys(syntaxData.conjuncoes.coordenativas);
        for (i = 0; i < coordsKeys.length; i++) {
            g = syntaxData.conjuncoes.coordenativas[coordsKeys[i]];
            if (g && String(coordsKeys[i]).charCodeAt(0) !== 95) todos.push(g);
        }
        for (i = 0; i < todos.length; i++) {
            var group = todos[i];
            var palavras = group.palavras || [];
            for (var pi = 0; pi < palavras.length; pi++) {
                var p = palavras[pi];
                if (strIncludes(p, " ") && strIncludes(norm, p)) {
                    encontradas.push({ locucao: p, relacao: group.relacao, descricao: group.descricao });
                }
            }
        }
        return encontradas;
    }

    function classificarPeriodo(nOracoes, conjuncoes, locucoes) {
        if (nOracoes <= 1) return "Período simples";
        var todasConj = conjuncoes.concat(locucoes);
        var temSubord = false, temCoord = false;
        for (var i = 0; i < todasConj.length; i++) {
            var c = todasConj[i];
            if (c && (c.classe === "subordinativa" || c.relacao)) temSubord = true;
        }
        for (var j = 0; j < todasConj.length; j++) {
            var c2 = todasConj[j];
            if (c2 && c2.classe === "coordenativa") temCoord = true;
        }
        if (temSubord && temCoord) return "Período composto misto (coordenação + subordinação)";
        if (temSubord) return "Período composto por subordinação";
        if (temCoord) return "Período composto por coordenação";
        return "Período composto (assindético)";
    }

    /* ── Análise de funções sintáticas (máquina de estados) ─────────────────── */
    function analisarFuncoes(termos) {
        var resultado = [];
        var estado = "inicio";
        var verboVisto = false;
        var ultimoVerboIsLigacao = false;
        var ultimoSujeito = null;
        var ultimoVerboText = null;
        var prepVistaAntes = false;
        var emSubordinada = false;

        // Pré-detectar vocativo
        var vocativoPosicoes = {};
        var i0 = 0;
        while (i0 < termos.length && PUNCT_RE.test((termos[i0].text || "").trim())) i0++;
        if (i0 + 1 < termos.length) {
            var cand = termos[i0];
            var prox = termos[i0 + 1];
            if ((prox.text || "").trim() === ",") {
                var vtxt = (cand.text || "").trim();
                var vnorm = vtxt.toLowerCase();
                var vtags = cand.tags || [];
                var isConj = syntaxData ? !!identificarConjuncao(vtxt, { posInicio: true }) : false;
                var isAdv = arrayIncludes(vtags, "Adverb") || ADV_TEMPO[vnorm] || ADV_LUGAR[vnorm] ||
                    ADV_MODO[vnorm] || ADV_NEGACAO[vnorm] || ADV_AFIRM[vnorm] ||
                    ADV_INTENS[vnorm] || ADV_DUVIDA[vnorm];
                if (!isConj && !isAdv && !PREPS_OI[vnorm]) vocativoPosicoes[i0] = 1;
            }
        }

        var textoPeriodo = "";
        for (var tp = 0; tp < termos.length; tp++) {
            if (tp > 0) textoPeriodo += " ";
            textoPeriodo += String((termos[tp].text || "").toLowerCase());
        }
        var conjTempCond = false;
        var tempPalavras = (syntaxData.conjuncoes.subordinativas.temporais || {}).palavras || [];
        var condPalavras = (syntaxData.conjuncoes.subordinativas.condicionais || {}).palavras || [];
        var allTempCond = tempPalavras.concat(condPalavras);
        for (var tc = 0; tc < allTempCond.length; tc++) {
            if (strIncludes(textoPeriodo, allTempCond[tc])) { conjTempCond = true; break; }
        }

        for (var i = 0; i < termos.length; i++) {
            var t = termos[i];
            var tags = t.tags || [];
            var txt = (t.text || "").trim();
            var norm = txt.toLowerCase();

            if (!txt || PUNCT_RE.test(txt)) {
                var punctEntry = _extend(t, "funcao");
                punctEntry.funcao = null;
                resultado.push(punctEntry);
                prepVistaAntes = false;
                continue;
            }

            if (vocativoPosicoes[i] === 1) {
                var vocEntry = _extend(t, "funcao");
                vocEntry.funcao = "Vocativo";
                vocEntry.tagsLegiveis = mapearTag(tags);
                resultado.push(vocEntry);
                continue;
            }

            if (norm === "se") {
                var seInfo = analisarSe(termos, i);
                var seEntry = _extend(t, "funcao");
                seEntry.funcao = seInfo.funcao;
                seEntry.tipo_se = seInfo.tipo;
                seEntry.tagsLegiveis = mapearTag(tags);
                resultado.push(seEntry);
                continue;
            }

            var conj = identificarConjuncao(txt, { posInicio: i === 0 || estado === "inicio", conjTempCond: conjTempCond });
            if (conj || arrayIncludes(tags, "Conjunction")) {
                var cjEntry = _extend(t, "funcao");
                cjEntry.funcao = "Conjunção";
                cjEntry.conjuncao = conj;
                cjEntry.tagsLegiveis = mapearTag(tags);
                resultado.push(cjEntry);
                if (conj && conj.classe === "subordinativa") emSubordinada = true;
                else if (conj && conj.classe === "coordenativa") { emSubordinada = false; verboVisto = false; }
                estado = "inicio";
                prepVistaAntes = false;
                continue;
            }

            var isPrep = arrayIncludes(tags, "Preposition") || (PREPS_OI[norm] && norm !== "a");
            if (isPrep || (arrayIncludes(tags, "Determiner") && !arrayIncludes(tags, "Pronoun"))) {
                var prepEntry = _extend(t, "funcao");
                prepEntry.funcao = (isPrep && !arrayIncludes(["o","a","os","as","um","uma","uns","umas"], norm))
                    ? "Preposição" : "Artigo / contração";
                prepEntry.tagsLegiveis = mapearTag(tags);
                resultado.push(prepEntry);
                if (isPrep) prepVistaAntes = true;
                continue;
            }

            if (arrayIncludes(tags, "Adverb") && !arrayIncludes(tags, "Verb")) {
                var advEntry = _extend(t, "funcao");
                advEntry.funcao = tipoAdverbio(norm);
                advEntry.tagsLegiveis = mapearTag(tags);
                resultado.push(advEntry);
                prepVistaAntes = false;
                continue;
            }

            if (arrayIncludes(tags, "Verb") && !arrayIncludes(tags, "Negative")) {
                var eraSubord = emSubordinada;
                if (emSubordinada) emSubordinada = false;
                if (!eraSubord) verboVisto = true;
                var vctx = { conjTempCond: conjTempCond, posPrep: prepVistaAntes };
                var tempo = identificarTempoVerbal(txt, tags, vctx);
                var verbBase = norm.replace(/(ar|er|ir|ou|eu|iu|ei|ava|ia|ará|erá|irá|aria|eria|iria)$/, "");
                var isLig = VERBOS_LIGACAO[norm] || VERBOS_LIGACAO[verbBase];

                var proxTermos = [];
                if (i + 1 < termos.length) proxTermos.push((termos[i + 1].text || "").toLowerCase());
                if (i + 2 < termos.length) proxTermos.push((termos[i + 2].text || "").toLowerCase());
                var isParticipioNext = false;
                for (var pn = 0; pn < proxTermos.length; pn++) {
                    var pp = proxTermos[pn];
                    if (/(ado|ada|ados|adas|ido|ida|idos|idas|to|ta|tos|tas)$/.test(pp) && pp.length > 3) { isParticipioNext = true; break; }
                }
                if ((norm === "foi" || norm === "é" || norm === "era" || norm === "será" || norm === "está" || norm === "estava" || norm === "ficou") && isParticipioNext) {
                    var vpEntry = _extend(t, "funcao");
                    vpEntry.funcao = "Voz passiva — auxiliar";
                    vpEntry.tempo = tempo;
                    vpEntry.tagsLegiveis = mapearTag(tags);
                    resultado.push(vpEntry);
                    ultimoVerboIsLigacao = false;
                    ultimoVerboText = txt;
                    estado = "voz_passiva";
                    prepVistaAntes = false;
                    continue;
                }

                ultimoVerboIsLigacao = isLig;
                ultimoVerboText = txt;
                var vbEntry = _extend(t, "funcao");
                vbEntry.funcao = isLig ? "Verbo de ligação" : "Núcleo do predicado";
                vbEntry.tempo = tempo;
                vbEntry.tagsLegiveis = mapearTag(tags);
                resultado.push(vbEntry);
                estado = eraSubord ? "inicio" : "apos_verbo";
                prepVistaAntes = false;
                continue;
            }

            if (norm === "que" && estado === "apos_sujeito") {
                var qEntry = _extend(t, "funcao");
                qEntry.funcao = "Pronome relativo (oração adjetiva)";
                qEntry.tagsLegiveis = mapearTag(tags);
                resultado.push(qEntry);
                estado = "oração_adjetiva";
                continue;
            }

            if (arrayIncludes(tags, "Noun") || arrayIncludes(tags, "Pronoun") || arrayIncludes(tags, "Person") || arrayIncludes(tags, "Adjective")) {
                var entry = _extend(t, "funcao");
                if (!verboVisto) {
                    var funcaoSuj = emSubordinada ? "Sujeito da oração subordinada" : "Sujeito (provável)";
                    entry.funcao = funcaoSuj;
                    if (!emSubordinada) ultimoSujeito = txt;
                    estado = "apos_sujeito";
                } else if (estado === "voz_passiva") {
                    entry.funcao = "Sujeito paciente (voz passiva)";
                } else if (ultimoVerboIsLigacao) {
                    entry.funcao = "Predicativo do sujeito";
                } else if (prepVistaAntes) {
                    entry.funcao = subtipoOI(String(ultimoVerboText || "").toLowerCase());
                } else if (estado === "apos_od" && VERBOS_PRED_OBJ[String(ultimoVerboText || "").toLowerCase()]) {
                    entry.funcao = "Predicativo do objeto";
                } else {
                    if (arrayIncludes(tags, "Adjective") && estado === "apos_od") {
                        entry.funcao = "Predicativo do objeto (adjetivo)";
                    } else {
                        entry.funcao = "Objeto direto (provável)";
                        estado = "apos_od";
                    }
                }
                entry.tagsLegiveis = mapearTag(tags);
                resultado.push(entry);
                prepVistaAntes = false;
                continue;
            }

            var otherEntry = _extend(t, "funcao");
            otherEntry.funcao = null;
            otherEntry.tagsLegiveis = mapearTag(tags);
            resultado.push(otherEntry);
            prepVistaAntes = false;
        }

        var concord = verificarConcordancia(ultimoSujeito, ultimoVerboText);
        var alertasGenero = [];
        for (var gi = 0; gi < resultado.length - 1; gi++) {
            var r = resultado[gi];
            var proxT = resultado[gi + 1];
            if (r.funcao === "Artigo / contração" && proxT && strIncludes(proxT.funcao || "", "Sujeito")) {
                var alert = verificarConcordanciaGenero(r.text, proxT.text);
                if (alert) alertasGenero.push(alert);
            }
        }

        return { resultado: resultado, concordancia: concord, alertasGenero: alertasGenero };
    }

    /* clona termo + atribui propriedade no clone */
    function _extend(t, key) {
        var clone = {};
        var k;
        for (k in t) { if (hasKey(t, k)) clone[k] = t[k]; }
        clone[key] = undefined; // placeholder (evita warning); definido pelo chamador
        return clone;
    }

    function analisarPeriodo(texto) {
        var morfologia = analisarMorfologia(texto);
        var funcoes = analisarFuncoes(morfologia);
        var termos = funcoes.resultado;
        var concordancia = funcoes.concordancia;
        var alertasGenero = funcoes.alertasGenero;
        var locucoes = detectarLocucoes(texto);
        var apostos = detectarApostos(texto);

        var verbos = [];
        for (var i = 0; i < termos.length; i++) {
            if (arrayIncludes(termos[i].tags || [], "Verb") && !arrayIncludes(termos[i].tags || [], "Negative")) verbos.push(termos[i]);
        }
        var conjuncoes = [];
        for (var j = 0; j < termos.length; j++) {
            if (termos[j].conjuncao) conjuncoes.push(termos[j]);
        }
        var vocativos = [];
        for (var v = 0; v < termos.length; v++) {
            if (termos[v].funcao === "Vocativo") vocativos.push(termos[v].text);
        }
        var nOracoes = Math.max(1, verbos.length);
        var temPassiva = false, temRelativa = false;
        for (var f = 0; f < termos.length; f++) {
            if (strIncludes(termos[f].funcao || "", "passiva")) temPassiva = true;
            if (strIncludes(termos[f].funcao || "", "adjetiva")) temRelativa = true;
        }
        var tipoPeriodo = classificarPeriodo(nOracoes, _mapConj(conjuncoes), locucoes);

        var alertas = [];
        if (concordancia) alertas.push(concordancia);
        for (var a = 0; a < alertasGenero.length; a++) alertas.push(alertasGenero[a]);

        var verbosResumo = [];
        for (var vr = 0; vr < verbos.length; vr++) {
            var vv = verbos[vr];
            var pessoa = null;
            var leg = vv.tagsLegiveis || [];
            for (var pl = 0; pl < leg.length; pl++) if (strIncludes(leg[pl], "pessoa")) { pessoa = leg[pl]; break; }
            verbosResumo.push({ forma: vv.text, tempo: vv.tempo, pessoa: pessoa, funcao: vv.funcao });
        }
        var conjuncoesResumo = [];
        for (var cr = 0; cr < conjuncoes.length; cr++) {
            var cc = conjuncoes[cr];
            var item = { palavra: cc.text };
            var cj = cc.conjuncao;
            for (var ck in cj) { if (hasKey(cj, ck)) item[ck] = cj[ck]; }
            conjuncoesResumo.push(item);
        }

        return {
            texto: texto,
            termos: termos,
            locucoes: locucoes,
            apostos: apostos,
            resumo: {
                nOracoes: nOracoes,
                tipo: tipoPeriodo,
                vozePassiva: temPassiva,
                temRelativa: temRelativa,
                vocativos: vocativos,
                verbos: verbosResumo,
                conjuncoes: conjuncoesResumo,
                locucoes: locucoes,
                apostos: apostos,
                alertas: alertas
            }
        };
    }

    function _mapConj(conjuncoes) {
        var out = [];
        for (var i = 0; i < conjuncoes.length; i++) {
            var cc = conjuncoes[i];
            if (cc.conjuncao) {
                var copy = {};
                for (var k in cc.conjuncao) { if (hasKey(cc.conjuncao, k)) copy[k] = cc.conjuncao[k]; }
                out.push(copy);
            }
        }
        return out;
    }

    /* ── API pública ────────────────────────────────────────────────────────── */
    function SintaxeEngine() {
        this.id = "SINTAXE";
        this.domain = "sintaxe-funcao";
        this.version = "1.0.0";
    }

    SintaxeEngine.prototype.check = function (snapshot, done) {
        var findings = [];
        var text = String(snapshot.text || "");
        var result = analisarPeriodo(text);
        var Finding = global.Encore.contracts.Finding;
        var r = result.resumo;

        findings.push(new Finding(this.id, [0, Math.max(1, text.length)],
            "Período " + r.tipo.toLowerCase() + " · " + r.nOracoes + " oração(ões)" +
            (r.vozePassiva ? " · voz passiva" : "") +
            (r.temRelativa ? " · oração adjetiva" : "") +
            (r.vocativos.length ? " · vocativo: " + r.vocativos.join(", ") : "") +
            ".",
            0, 0.8));

        for (var i = 0; i < r.verbos.length; i++) {
            var vb = r.verbos[i];
            var tv = vb.tempo ? " · tempo: " + vb.tempo : "";
            findings.push(new Finding(this.id, [0, Math.max(1, text.length)],
                "Verbo '" + vb.forma + "': " + vb.funcao + tv + ".", 0, 0.7));
        }
        for (var j = 0; j < r.conjuncoes.length; j++) {
            var cj = r.conjuncoes[j];
            findings.push(new Finding(this.id, [0, Math.max(1, text.length)],
                "Conjunção '" + cj.palavra + "' (" + cj.relacao + "): " + cj.descricao + ".", 0, 0.7));
        }
        for (var a = 0; a < r.alertas.length; a++) {
            findings.push(new Finding(this.id, [0, Math.max(1, text.length)],
                r.alertas[a].descricao, 1, 0.6));
        }

        done(findings);
    };

    SintaxeEngine.prototype.analisarPeriodo = analisarPeriodo;
    SintaxeEngine.prototype.analisarMorfologia = analisarMorfologia;
    SintaxeEngine.prototype.analisarFuncoes = analisarFuncoes;
    SintaxeEngine.prototype.identificarConjuncao = identificarConjuncao;
    SintaxeEngine.prototype.identificarTempoVerbal = identificarTempoVerbal;
    SintaxeEngine.prototype.tipoAdverbio = tipoAdverbio;
    SintaxeEngine.prototype.classificarPeriodo = classificarPeriodo;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = SintaxeEngine;
    } else {
        global.Encore.core.engines = global.Encore.core.engines || {};
        global.Encore.core.engines.SintaxeEngine = SintaxeEngine;
    }
})(typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this));
