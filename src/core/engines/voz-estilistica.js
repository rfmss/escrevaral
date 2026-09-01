(function (global) {
    "use strict";

    /* Escrevaral-Encore — Engine de Voz e Estilística (ES5, baixa RAM).
     * Portada de escrevaral (voice-engine.js), 100% madura na fonte. Reuso de
     * comportamento, não cópia. "Espelho de Voz": análise heurística de prosa PT-BR —
     * métricas (TTR, densidade lexical, extensão de frase, variação, parágrafos),
     * perfil de pontuação, repetições, score de léxicos emocionais e campos
     * semânticos, diagnóstico de "gesto de voz" (11 gestos) + pontos fortes,
     * pontos cegos, público e exercícios.
     *
     * Norma ES5/piso: var/functions, Sets→objetos, sem arrow/template/destructuring/
     * ??./Object.entries, sem normalize() (mapa de acentos manual).
     */

    /* Dados: stopwords e léxicos de emoção/campos (embutidos, off-line). */
    var stopwords = {
        'a':1,'o':1,'as':1,'os':1,'um':1,'uma':1,'uns':1,'umas':1,'de':1,'do':1,'da':1,'dos':1,
        'das':1,'em':1,'no':1,'na':1,'nos':1,'nas':1,'por':1,'para':1,'com':1,'sem':1,'sob':1,'sobre':1,
        'entre':1,'e':1,'ou':1,'mas':1,'que':1,'se':1,'como':1,'quando':1,'onde':1,'quem':1,'qual':1,'quais':1,
        'cujo':1,'cuja':1,'seus':1,'suas':1,'seu':1,'sua':1,'meu':1,'minha':1,'meus':1,'minhas':1,'ao':1,'aos':1,
        'a':1,'as':1,'e':1,'sao':1,'foi':1,'eram':1,'ser':1,'ter':1,'tem':1,'tinha':1,'ha':1,'havia':1,
        'nao':1,'sim':1,'mais':1,'menos':1,'muito':1,'muita':1,'muitos':1,'muitas':1,'pouco':1,'pouca':1,'poucos':1,'poucas':1,
        'todo':1,'toda':1,'todos':1,'todas':1,'este':1,'esta':1,'esse':1,'essa':1,'aquele':1,'aquela':1,'isso':1,'isto':1,
        'aquilo':1,'eu':1,'tu':1,'ele':1,'ela':1,'nos':1,'vos':1,'eles':1,'elas':1,'me':1,'te':1,'lhe':1,
        'lhes':1,'pois':1,'porem':1,'todavia':1,'contudo':1,'entretanto':1,'embora':1,'enquanto':1,'logo':1,'assim':1,'portanto':1,'porque':1,
        'tambem':1,'sempre':1,'nunca':1,'jamais':1,'apenas':1,'somente':1,'ainda':1,'ja':1,'agora':1,'depois':1,'antes':1,'aqui':1,
        'ali':1,'la':1,'ca':1,'durante':1,'atraves':1,'mediante':1,'ante':1,'perante':1,'apos':1,'ate':1,'desde':1,'contra':1,
        'alias':1,'alias':1,'outrossim':1,'ademais':1,'mesmo':1,'proprio':1,'propria':1,'la':1,'ca':1,'aqui':1,'ali':1,'ha':1,
        'faz':1,'fez':1,'fazem':1,'fazer':1,'estava':1,'estou':1,'esta':1,'estao':1,'estive':1,'esteve':1,'estiveram':1,'vou':1,
        'vai':1,'vao':1,'vir':1,'vim':1,'vamos':1,'veio':1,'foram':1,'foste':1,'fora':1,'fui':1,'sera':1,'serao':1,
        'seria':1,'seriam':1,'serei':1,'seras':1,'seriamos':1,'fosse':1,'fossem':1,'fossemos':1,'estaria':1,'estarias':1,'estariamos':1,'estarao':1,
        'estivesse':1,'estivessem':1,'terei':1,'terao':1,'teria':1,'terias':1,'teriamos':1,'tivesse':1,'tivessem':1,'deveria':1,'deveriamos':1,'poderia':1,
        'poderiamos':1,'queria':1,'queriamos':1,'quisesse':1,'quisessem':1,'ficasse':1,'ficassem':1,'parecia':1,'pareciam':1,'continuava':1,'continuavam':1,'mantinha':1,
        'mantinham':1,'revelava':1,'revelavam':1,'mostrava':1,'mostravam':1,'houvera':1,'houveram':1,'chegou':1,'chegaram':1,'voltou':1,'voltaram':1
    };

    var emotionLexicons = { 'melancolia': ['saudade','silêncio','perda','ausência','noite','vazio','memória','choro','triste','longe','sombra','tarde','cinza','ruína','fim','esquecimento','desvanecer','apagar','distância','abandono','luto','resto','vestígio','espelho','cinzas','cansaço','derrota','lágrima','sombrio','solidão','bruma','desolação','nostálgico','despedida','murchar','amargo','apagado','exausto'], 'tensao': ['medo','sangue','grito','pressa','risco','ameaça','culpa','segredo','fuga','corte','queda','tensão','perigo','escuro','susto','perseguição','armadilha','traição','disparo','confronto','urgência','crise','navalha','pânico','veneno','emboscada','cilada','alarme','nervoso','sufoco','paralisia','apreensão','gatilho','adrenalina','tremer','espreitar','aterrorizado'], 'luminosidade': ['luz','sol','claro','riso','alegria','manhã','brilho','flor','aberto','leve','calma','clareza','fresco','verde','esperança','amanhecer','celebração','leveza','plenitude','festa','graça','sorte','vitória','nascer','despertar','glória','aurora','radiante','harmonia','dançar','pleno','florir','gratidão','vitalidade','renascer','brilhante','álacre'], 'ironia': ['claro','óbvio','ridículo','quase','fingir','ninguém','todos','perfeito','sério','sorriso','naturalmente','certamente','evidentemente','justamente','realmente','singular','curioso','peculiar','conveniente','herói','exatamente','perfeitamente','lógico','inocente','coincidentemente','surpreendentemente','casualmente','espantosamente','felizmente','incrível'], 'contemplacao': ['olhar','tempo','vento','água','terra','janela','casa','corpo','mundo','devagar','espera','pausa','quieto','lento','silêncio','horizonte','repouso','contemplar','observar','meditar','divagar','profundo','névoa','crepúsculo','bruma','quietude','sereno','tranquilo','distância','pensar','imóvel','flutuante','devaneio','infinito','ecoar','eterno','sussurrar'], 'ternura': ['gentil','amor','carinho','afeto','cuidado','abraço','beijar','suave','doce','mãe','filho','criança','delicado','calor','acolher','proteção','ternura','lar','família','pertencer','bençao','amparo','beijo','sorriso','gesto','mimo','meigo','afetuoso','embrulhar','ninado','seguro','aninhar','consolar','agasalhar','colo','doçura','acarinhar'] };

    var semanticFields = { 'corpo': ['corpo','mão','olho','rosto','boca','pele','sangue','peito','braço','perna','cabeça','carne','ferida','nervos','ventre','pescoço','ombro','punho','veia','dedo','joelho','costas','língua','nuca','tornozelo','calcanhar','quadril','sobrancelha','têmpora','respiração','lágrima','suor','tremor','calafrio','músculo','costela','nariz','ouvido','cotovelo','pulso','testa','queixo','barriga','engolir','arfar','rim','fígado','pulmão','coluna','cílios','palma','seio','osso','garganta','estômago','entranhas','pálpebra','íris','articulação','cintura','hálito','entorpecimento','sufoco','soluço','espasmo'], 'casa': ['casa','porta','janela','mesa','quarto','cozinha','parede','chão','telhado','cama','corredor','varanda','quintal','porão','escada','gaveta','armário','sala','fogão','pia','espelho','prateleira','soleira','alpendre','sofá','cobertor','lençol','batente','cadeira','cortina','tapete','portão','cerca','despensa','interruptor','banheiro','toalha','torneira','candeeiro','estante','jardim','terraço','sótão','saguão','sacada','cisterna','rodapé','degrau','chave','fechadura','moldura','baú','relógio','trinco','veneziana','beirada','cimento','ferrugem','vão','solário'], 'natureza': ['terra','água','rio','mar','vento','sol','chuva','árvore','folha','barro','céu','floresta','cerrado','sertão','caatinga','raiz','pedra','galho','seca','brejo','savana','lua','estrela','nuvem','campo','serra','vale','mata','mangue','chapada','pampa','várzea','roça','brisa','relâmpago','cachoeira','lagoa','onça','arara','ipê','neblina','orvalho','maré','onda','areia','trovão','granizo','flora','fauna','planalto','encosta','penhasco','talude','barranco','córrego','gruta','abismo','precipício','borboleta','abelha','tronco','musgo','líquen','matagal','espinheiro','vereda','riacho','manguezal','brejo','charco','bambuzal','restinga','campina','buritizal','tabuleiro','taquaral','carrasco','garrafa','umidade','vapor','névoa','sereno','orvalho','geada','granizo','enxurrada','vazante','cheio','enchente','estiagem','veranico'], 'memoria': ['memória','lembrança','infância','ontem','passado','antigo','voltar','recordar','saudade','crescer','época','foto','carta','diário','cheiro','cicatriz','marca','história','reviver','apagar','herança','origem','trauma','esquecimento','nostalgia','recordação','antes','rever','evocação','antepassado','genealogia','vestígio','retrato','álbum','relíquia','bilhete','brinquedo','velório','hábito','endereço','data','aniversário','calçada de antes','escola antiga','amigo de criança','pertence','objeto guardado','fotografia amarelada','cheiro da avó','voz perdida','rua de antes','sussurro guardado','tempo que não volta','feito com as mãos','lugar de sempre','pessoa que foi'], 'conflito': ['medo','culpa','segredo','briga','guerra','dívida','ameaça','perigo','morte','fuga','violência','crime','faca','golpe','sangue','traição','ódio','raiva','punição','silêncio','mentira','ferida','desespero','ruptura','rancor','explosão','colapso','crise','arma','prisão','opressão','abuso','injustiça','perseguição','vingança','disputa','confronto','acusação','humilhação','abandono','rejeição','derrota','chantagem','cerco','julgamento','condenação','luto','catástrofe','assassinato','extorsão','trajetória','ruptura','tensão','emboscada','sequestro','coerção','represália','cicatriz','revanche','máscara'], 'pensamento': ['penso','ideia','verdade','talvez','sentido','mundo','tempo','pergunta','entender','reflexão','dúvida','certeza','consciência','razão','intuição','dilema','escolha','questão','saber','argumento','crença','princípio','paradoxo','mente','percepção','imaginar','concluir','suposição','teoria','conceito','abstrato','filosofia','sentença','premissa','pensar','meditar','hipótese','descoberta','clareza','confusão','ponderar','questionar','lógica','raciocínio','meditação','conhecimento','análise','deliberação','cogitação','inferência','crer','suspeitar','examinar','criticar','interpretar','projetar','especular','questionar','investigar','refutar'], 'cidade': ['rua','praça','ônibus','prédio','cidade','calçada','mercado','trânsito','bairro','favela','morro','periferia','beco','esquina','asfalto','metrô','buzina','sirene','multidão','anonimato','povo','movimento','barulho','laje','calçamento','poste','semáforo','vitrine','concreto','vidraça','calor','poluição','sinalização','fila','hospital','escola','farmácia','bar','ponto','apito','sacola','viaduto','ponte','terminal','aeroporto','estação','condomínio','avenida','garagem','viela','feira','gueto','subúrbio','lote','passeio','mureta','portaria','elevador','interfone','comércio','calçadão'], 'sobrenatural': ['fantasma','magia','espírito','sonho','encantado','místico','visão','ritual','oculto','assombração','destino','presságio','feitiço','entidade','sombra','orixá','terreiro','encantaria','milagre','benzedura','encantamento','aparição','transe','premonição','umbanda','pajelança','espectro','invocação','sortilejo','augúrio','vislumbre','sobrenatural','misterio','caboclo','exu','cura','adivinho','profecia','sinal','ancestral','travessia','portal','cerimônia','purificação','transcendência','cartomante','bruxo','pomba-gira','maldição','amuleto','egum','curupira','boto','caipora','zumbi','esconjuro','êxtase','revelação','possessão','encosto'], 'trabalho': ['trabalho','labor','ofício','roça','lavoura','colheita','plantio','enxada','foice','trato','salário','patrão','emprego','fábrica','serviço','operário','operária','trabalhadora','trabalhador','sindicato','greve','luta','direitos','jornada','contrato','tarefa','pagamento','demissão','aviso','reivindicação','canavial','usina','mina','construção','peão','diarista','boia-fria','meeiro','lavrador','catador','costureira','faxineira','balconista','motorista','porteiro','vigilante','servente','carteira','CLT','hora extra','exploração','suor','cansaço','madrugada','turno','ponto','produção','cota','meta','máquina','ferramenta','engenho','fumaça','barulho de fábrica','chão de fábrica','linha de montagem'] };

    var fieldLabels = {"corpo":"presença e gestualidade do corpo","casa":"intimidade dos espaços domésticos","natureza":"elementos naturais e paisagem","memoria":"memória e passado","conflito":"tensão e confronto","pensamento":"reflexão e raciocínio","cidade":"espaço urbano e cotidiano","sobrenatural":"o inexplicável e o sobrenatural","trabalho":"trabalho, labor e resistência social"};
    var emotionLabels = {"melancolia":"melancolia","tensao":"tensão","luminosidade":"luminosidade","ironia":"ironia","contemplacao":"contemplação","ternura":"ternura"};


    /* ── Acentos → ASCII (equiv. ES5 a normalize("NFD")) ─────────────────────── */
    var ACCENTS = {
        "á": "a", "à": "a", "â": "a", "ã": "a", "ä": "a", "Á": "a", "À": "a", "Â": "a", "Ã": "a",
        "é": "e", "è": "e", "ê": "e", "ẽ": "e", "ë": "e", "É": "e", "Ê": "e",
        "í": "i", "ì": "i", "î": "i", "ĩ": "i", "ï": "i", "Í": "i", "Î": "i",
        "ó": "o", "ò": "o", "ô": "o", "õ": "o", "ö": "o", "Ó": "o", "Ô": "o", "Õ": "o",
        "ú": "u", "ù": "u", "û": "u", "ũ": "u", "ü": "u", "Ú": "u", "Ü": "u",
        "ç": "c", "Ç": "c", "ñ": "n", "Ñ": "n", "ÿ": "y", "ý": "y"
    };
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

    function hasKey(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }

    function inferVoiceCtx(ctx) {
        ctx = ctx || {};
        var fmt = String(ctx.formato || ctx.oficio || ctx.editorMode || ctx.kind || ctx.type || "").toLowerCase();
        return {
            poesia: /poema|poesia|soneto|slam|haiku|cordel|verso/.test(fmt),
            roteiro: /roteiro|script|screenplay/.test(fmt)
        };
    }

    function normalize(text) {
        return String(text || "").replace(/\u00a0/g, " ").trim();
    }

    function tokenize(text) {
        return normalize(text).toLowerCase().match(/[a-záàâãéêíóôõúüç]+/gi) || [];
    }

    function splitSentences(text) {
        var parts = normalize(text).split(/[.!?]+/);
        var out = [];
        for (var i = 0; i < parts.length; i++) { var t = parts[i].trim(); if (t) out.push(t); }
        return out;
    }

    function splitParagraphs(text) {
        var parts = normalize(text).split(/\n+/);
        var out = [];
        for (var i = 0; i < parts.length; i++) { var t = parts[i].trim(); if (t) out.push(t); }
        return out;
    }

    function average(values) {
        if (!values.length) return 0;
        var total = 0;
        for (var i = 0; i < values.length; i++) total += values[i];
        return total / values.length;
    }

    function standardDeviation(values) {
        if (values.length < 2) return 0;
        var avg = average(values);
        var sum = 0;
        for (var i = 0; i < values.length; i++) sum += Math.pow(values[i] - avg, 2);
        return Math.sqrt(sum / values.length);
    }

    function countMatches(text, pattern) {
        var m = text.match(pattern);
        return m ? m.length : 0;
    }

    function round(value, precision) {
        if (precision === undefined) precision = 0;
        var factor = Math.pow(10, precision);
        return Math.round(value * factor) / factor;
    }

    function getTopItem(items) {
        return (items && items.length) ? items[0] : null;
    }

    function getPunctuation(text) {
        return {
            commas: countMatches(text, /,/g),
            semicolons: countMatches(text, /;/g),
            colons: countMatches(text, /:/g),
            questions: countMatches(text, /\?/g),
            exclamations: countMatches(text, /!/g),
            dialogue: countMatches(text, /[—"]/g)
        };
    }

    function scoreLexicons(words, lexicons) {
        var stripped = [];
        for (var i = 0; i < words.length; i++) stripped.push(stripAccent(words[i]));
        var total = Math.max(1, words.length);
        var result = [];
        var labels = objectKeys(lexicons);
        for (var li = 0; li < labels.length; li++) {
            var label = labels[li];
            var items = lexicons[label];
            var keys = [];
            for (var ki = 0; ki < items.length; ki++) keys.push(stripAccent(items[ki]));
            var hits = 0;
            for (var wi = 0; wi < stripped.length; wi++) {
                if (indexOf(keys, stripped[wi]) !== -1) hits++;
            }
            var density = (hits / total) * 100;
            var score = Math.min(100, Math.round(density * 25));
            if (hits > 0) result.push({ label: label, hits: hits, score: score });
        }
        result.sort(function (a, b) { return (b.score - a.score) || (b.hits - a.hits); });
        return result.slice(0, 6);
    }

    function getRepetitions(words) {
        var counts = {};
        for (var i = 0; i < words.length; i++) {
            var key = stripAccent(words[i]);
            if (key.length > 3) counts[key] = (counts[key] || 0) + 1;
        }
        var result = [];
        var keys = objectKeys(counts);
        for (var ki = 0; ki < keys.length; ki++) if (counts[keys[ki]] >= 3) result.push({ word: keys[ki], count: counts[keys[ki]] });
        result.sort(function (a, b) { return b.count - a.count; });
        return result.slice(0, 8);
    }

    function inferGesture(data) {
        var topEmotion = getTopItem(data.emotional) ? getTopItem(data.emotional).label : null;
        var topField = getTopItem(data.fields) ? getTopItem(data.fields).label : null;
        if (data.avgSentence > 24 && data.lexicalDensity > 0.58) return "barroco";
        if (topField === "pensamento" && data.lexicalDensity > 0.52) return "ensaístico";
        if (topField === "sobrenatural") return "sobrenatural";
        if (topField === "trabalho" && data.punctuation.dialogue < 4) return "resistência";
        if (data.avgSentence < 12 && topField !== "pensamento") return "seco";
        if (topField === "corpo" || topField === "casa" || topField === "cidade" || topField === "conflito") return "imagético";
        if (data.punctuation.dialogue >= 4) return "oral";
        if (topEmotion === "ironia" && data.lexicalDensity > 0.44) return "irônico";
        if (topEmotion === "contemplacao" || topField === "natureza") return "contemplativo";
        if (data.punctuation.dialogue >= 2) return "oral";
        if (topEmotion === "ternura") return "contemplativo";
        if (topEmotion === "tensao" && topField !== "conflito") return "narrativo";
        if (topEmotion === "melancolia" || topField === "memoria") return "introspectivo";
        return "narrativo";
    }

    var GESTURE_TITLES = {
        introspectivo: "Voz de interior aceso",
        oral: "Voz de conversa em movimento",
        "imagético": "Voz de imagem concreta",
        "ensaístico": "Voz de pensamento em marcha",
        seco: "Voz de corte limpo",
        barroco: "Voz de acúmulo e vertigem",
        contemplativo: "Voz de demora sensível",
        narrativo: "Voz de cena em avanço",
        sobrenatural: "Voz de fronteira e encantamento",
        "irônico": "Voz de distância e comentário velado",
        "resistência": "Voz de chão e luta"
    };

    var ECHOES = {
        introspectivo: ["Clarice Lispector (A Paixão segundo G.H.)", "Raduan Nassar (Lavoura Arcaica)", "Lygia Fagundes Telles (As Meninas)"],
        oral: ["João Guimarães Rosa (Primeiras Estórias)", "João Antônio (Malagueta, Perus e Bacanaço)", "Carolina Maria de Jesus (Quarto de Despejo)"],
        "imagético": ["Dalton Trevisan (O Vampiro de Curitiba)", "Rubem Fonseca (Feliz Ano Novo)", "Caio Fernando Abreu (Morangos Mofados)"],
        "ensaístico": ["Graciliano Ramos (Memórias do Cárcere)", "Clarice Lispector (A Descoberta do Mundo)", "Silviano Santiago (Uma Literatura nos Trópicos)"],
        seco: ["Dalton Trevisan (contos)", "Samuel Rawet (O Profeta e Outros Contos)", "Marcelino Freire (Contos Negreiros)"],
        barroco: ["João Guimarães Rosa (Grande Sertão: Veredas)", "Osman Lins (Avalovara)", "Hilda Hilst (A Obscena Senhora D)"],
        contemplativo: ["Lygia Fagundes Telles (Ciranda de Pedra)", "Adélia Prado (Bagagem)", "Manoel de Barros (Poesia Completa)"],
        narrativo: ["Machado de Assis (Dom Casmurro)", "Autran Dourado (Opera dos Mortos)", "Conceição Evaristo (Ponciá Vicêncio)"],
        sobrenatural: ["Mia Couto (Um Rio Chamado Tempo)", "Paulina Chiziane (O Alegre Canto da Perdiz)", "João Guimarães Rosa (A Terceira Margem do Rio)"],
        "irônico": ["Machado de Assis (Memórias Póstumas de Brás Cubas)", "Lima Barreto (Triste Fim de Policarpo Quaresma)", "João Ubaldo Ribeiro (Viva o Povo Brasileiro)"],
        "resistência": ["Carolina Maria de Jesus (Quarto de Despejo)", "Conceição Evaristo (Insubmissas Lágrimas de Mulheres)", "Eliane Brum (A Menina Quebrada)"]
    };

    function getEchoes(gesture) {
        return ECHOES[gesture] || ECHOES.narrativo;
    }

    function createVoiceReading(gesture, context) {
        var topField = getTopItem(context.fields);
        var topEmotion = getTopItem(context.emotional);
        var fieldDesc = topField ? (fieldLabels[topField.label] || topField.label) : null;
        var emotionDesc = topEmotion ? (emotionLabels[topEmotion.label] || topEmotion.label) : null;
        var fieldPart = fieldDesc ? " com foco em " + fieldDesc : "";
        var emotionPart = emotionDesc ? " e temperatura de " + emotionDesc : "";
        var description = GESTURE_TITLES[gesture] + fieldPart + emotionPart +
            ". Leitura heurística — nasce de padrões locais de vocabulário, frase, repetição e pontuação.";
        return { gesture: gesture, title: GESTURE_TITLES[gesture], description: description, echoes: getEchoes(gesture) };
    }

    function getStrengths(data) {
        var strengths = [];
        if (data.ttr > 0.48) strengths.push("Vocabulário variado o suficiente para sustentar uma assinatura própria.");
        if (data.lexicalDensity > 0.54) strengths.push("Boa densidade de palavras de conteúdo: o texto carrega matéria verbal.");
        if (data.sentenceVariation > 7) strengths.push("Ritmo com alternância perceptível entre frases curtas e longas.");
        if (data.avgSentence >= 12 && data.avgSentence <= 22) strengths.push("Frases em faixa confortável para leitura contínua.");
        if (data.punctuation.dialogue > 0) strengths.push("Presença de fala ou oralidade, útil para aproximar leitor e cena.");
        if (!strengths.length) strengths.push("O texto já oferece matéria suficiente para reconhecer padrões de voz.");
        if (data.repetitions.length && data.repetitions[0].count >= 4) strengths.push("A recorrência de \"" + data.repetitions[0].word + "\" pode funcionar como motivo, se for intencional.");
        return strengths.slice(0, 4);
    }

    function getBlindSpots(data, ctx) {
        var isPoesia = Boolean(ctx && ctx.poesia);
        var isRoteiro = Boolean(ctx && ctx.roteiro);
        var spots = [];
        if (data.words < 500) spots.push("Corpus ainda curto: a leitura da voz fica instável abaixo de 500 palavras.");
        if (data.ttr < 0.34 && data.words > 120) spots.push("Riqueza vocabular baixa: há risco de repetição não intencional.");
        if (data.avgSentence > 28 && !isPoesia && !isRoteiro) spots.push("Frases muito longas podem criar opacidade e cansaço.");
        if (data.avgSentence < 8 && data.words > 120 && !isPoesia && !isRoteiro) spots.push("Frases muito curtas podem reduzir nuance e música interna.");
        if (data.sentenceVariation < 4 && data.words > 120 && !isPoesia) spots.push("Ritmo pouco variado: o texto pode soar plano.");
        if (data.lexicalDensity < 0.42 && data.words > 120) spots.push("Densidade lexical baixa: muitos conectores e palavras funcionais podem diluir imagem e ação.");
        if (data.paragraphs.length <= 1 && data.words > 180 && !isPoesia) spots.push("Pouca respiração em parágrafos: o leitor pode perder orientação visual.");
        for (var i = 0; i < data.repetitions.slice(0, 2).length; i++) {
            spots.push("Verifique a repetição de \"" + data.repetitions[i].word + "\" (" + data.repetitions[i].count + " ocorrências).");
        }
        return spots.slice(0, 5);
    }

    function getAudience(gesture, data) {
        var topFieldItem = getTopItem(data.fields);
        var topEmotionItem = getTopItem(data.emotional);
        var topFieldLabel = topFieldItem ? (fieldLabels[topFieldItem.label] || topFieldItem.label) : null;
        var topEmotionLabel = topEmotionItem ? (emotionLabels[topEmotionItem.label] || topEmotionItem.label) : null;
        var demanding = data.avgSentence > 24 || data.lexicalDensity > 0.6;
        var parts = [];
        if (topFieldLabel) parts.push(topFieldLabel);
        if (topEmotionLabel) parts.push(topEmotionLabel);
        var secondary = parts.length ? "Leitores atraídos por " + parts.join(" e ") + "." : "Leitores com interesse em prosa de voz marcada.";
        return {
            core: demanding ? "Leitores de prosa literária que aceitam densidade, ambiguidade e atenção ao gesto verbal." : "Leitores que buscam narrativa legível com marca de voz e imagens recorrentes.",
            secondary: secondary,
            risk: demanding ? "Leitores que procuram ação imediata ou linguagem transparente podem abandonar cedo." : "Leitores que esperam alta experimentação formal podem achar a superfície direta demais."
        };
    }

    var EXERCISES = {
        introspectivo: "Reescreva um parágrafo inteiro trocando explicação emocional por gesto físico.",
        oral: "Leia uma página em voz alta e corte toda fala que não muda a relação entre as pessoas.",
        "imagético": "Escolha uma imagem recorrente e faça ela voltar três vezes com sentido diferente.",
        "ensaístico": "Transforme a tese central em uma pergunta e veja se cada parágrafo responde a uma parte dela.",
        seco: "Acrescente uma frase sensorial depois de cada ação decisiva, sem explicar sentimento.",
        barroco: "Corte 20% de um parágrafo longo e observe o que ainda pulsa.",
        contemplativo: "Introduza uma perturbação concreta no meio da atmosfera.",
        narrativo: "Marque o ponto exato em que algo muda de estado na cena.",
        sobrenatural: "Descreva o elemento inexplicável pelos sentidos físicos de quem o vive — sem explicar o que é.",
        "irônico": "Reescreva uma passagem séria como se o narrador soubesse mais do que admite — sem quebrar a cena."
    };

    function getExercises(gesture, repetitions) {
        var repetitionExercise = repetitions.length
            ? "Faça uma versão substituindo metade das ocorrências de \"" + repetitions[0].word + "\" por imagem, ação ou silêncio."
            : "Faça uma versão destacando três palavras-chave que deveriam voltar como motivo.";
        return [EXERCISES[gesture] || EXERCISES.narrativo, repetitionExercise];
    }

    function analyze(text, ctx) {
        var voiceCtx = ctx && objectKeys(ctx).length ? inferVoiceCtx(ctx) : {};
        var normalized = normalize(text);
        var words = tokenize(normalized);
        var sentences = splitSentences(normalized);
        var paragraphs = splitParagraphs(normalized);

        var contentWords = [];
        var uniqueWords = {};
        var uniqueWordsCount = 0;
        for (var wi = 0; wi < words.length; wi++) {
            var sw = stripAccent(words[wi]);
            if (!uniqueWords[sw]) { uniqueWords[sw] = 1; uniqueWordsCount++; }
            if (!hasKey(stopwords, sw) && sw.length > 2) contentWords.push(words[wi]);
        }

        var uniqueContentSet = {};
        var uniqueContentCount = 0;
        for (var cwi = 0; cwi < contentWords.length; cwi++) {
            var scw = stripAccent(contentWords[cwi]);
            if (!uniqueContentSet[scw]) { uniqueContentSet[scw] = 1; uniqueContentCount++; }
        }

        var sentenceLengths = [];
        for (var si = 0; si < sentences.length; si++) {
            var len = tokenize(sentences[si]).length;
            if (len) sentenceLengths.push(len);
        }

        var punctuation = getPunctuation(normalized);
        var repetitions = getRepetitions(contentWords);
        var emotional = scoreLexicons(words, emotionLexicons);
        var fields = scoreLexicons(words, semanticFields);

        var ttr = words.length ? uniqueWordsCount / words.length : 0;
        var lexicalDensity = words.length ? contentWords.length / words.length : 0;
        var avgSentence = average(sentenceLengths);
        var sentenceVariation = standardDeviation(sentenceLengths);
        var paragraphAverage = paragraphs.length ? sentences.length / paragraphs.length : 0;

        var gesture = inferGesture({
            avgSentence: avgSentence, lexicalDensity: lexicalDensity, ttr: ttr,
            punctuation: punctuation, emotional: emotional, fields: fields, repetitions: repetitions
        });

        var confianca = words.length >= 500 ? "alta" : words.length >= 200 ? "média" : "baixa";
        var confiancaNote = confianca === "baixa"
            ? "Corpus muito curto: a leitura de voz é instável abaixo de 200 palavras. Resultados como hipótese inicial."
            : confianca === "média"
            ? "Corpus médio: a leitura ganha estabilidade acima de 500 palavras."
            : null;

        return {
            counts: { words: words.length, uniqueWords: uniqueWordsCount, sentences: sentences.length, paragraphs: paragraphs.length },
            metrics: {
                ttr: round(ttr * 100), lexicalDensity: round(lexicalDensity * 100),
                avgSentence: round(avgSentence, 1), sentenceVariation: round(sentenceVariation, 1),
                paragraphAverage: round(paragraphAverage, 1)
            },
            confianca: confianca, confiancaNote: confiancaNote,
            punctuation: punctuation, repetitions: repetitions, emotional: emotional, fields: fields,
            voice: createVoiceReading(gesture, { avgSentence: avgSentence, lexicalDensity: lexicalDensity, sentenceVariation: sentenceVariation, emotional: emotional, fields: fields }),
            strengths: getStrengths({ avgSentence: avgSentence, lexicalDensity: lexicalDensity, ttr: ttr, sentenceVariation: sentenceVariation, repetitions: repetitions, punctuation: punctuation }),
            blindSpots: getBlindSpots({ words: words.length, avgSentence: avgSentence, lexicalDensity: lexicalDensity, ttr: ttr, sentenceVariation: sentenceVariation, repetitions: repetitions, paragraphs: paragraphs }, voiceCtx),
            audience: getAudience(gesture, { avgSentence: avgSentence, lexicalDensity: lexicalDensity, fields: fields, emotional: emotional }),
            exercises: getExercises(gesture, repetitions),
            disclaimer: "Métricas como TTR, extensão de frase e repetição são calculadas localmente. Voz, público e ecos literários são leituras heurísticas, úteis como hipótese de trabalho, não como diagnóstico definitivo."
        };
    }

    /* helpers ES5: Object.keys sem depender de Object.keys (disponível desde ES5) */
    function objectKeys(obj) {
        var keys = [];
        for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) keys.push(k); }
        return keys;
    }
    function indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) if (arr[i] === item) return i;
        return -1;
    }

    /* ── Engine no contrato do Encore: check(snapshot, done) ─────────────────── */
    function VoiceEngine() {
        this.id = "VOICE";
        this.domain = "estilistica";
        this.version = "1.0.0";
    }

    VoiceEngine.prototype.check = function (snapshot, done) {
        var findings = [];
        var text = String(snapshot.text || "");
        var ctx = snapshot.context || {};
        var result = analyze(text, ctx);
        var Finding = global.Encore.contracts.Finding;

        findings.push(new Finding(
            this.id, [0, Math.max(1, text.length)],
            "Voz: " + result.voice.title + " (" + result.voice.gesture + "). " + result.voice.description,
            0, 0.8
        ));
        findings.push(new Finding(
            this.id, [0, Math.max(1, text.length)],
            "Métricas: " + result.counts.words + " palavras, " + result.counts.sentences + " frases · TTR " + result.metrics.ttr +
                " · densidade " + result.metrics.lexicalDensity + " · frase média " + result.metrics.avgSentence +
                " · confiança " + result.confianca + ".",
            0, 0.8
        ));

        if (result.fields.length) {
            var f = result.fields[0];
            findings.push(new Finding(this.id, [0, Math.max(1, text.length)], "Campo dominante: " + fieldLabels[f.label] + ".", 0, 0.7));
        }
        for (var s = 0; s < result.strengths.length; s++) {
            findings.push(new Finding(this.id, [0, Math.max(1, text.length)], "Força: " + result.strengths[s], 0, 0.6));
        }
        for (var b = 0; b < result.blindSpots.length; b++) {
            findings.push(new Finding(this.id, [0, Math.max(1, text.length)], "Atenção: " + result.blindSpots[b], 1, 0.6));
        }

        done(findings);
    };

    /* Mantém analyze() e helpers expostos para testes. */
    VoiceEngine.prototype.analyze = analyze;
    VoiceEngine.prototype.inferGesture = inferGesture;
    VoiceEngine.prototype.scoreLexicons = scoreLexicons;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = VoiceEngine;
    } else {
        global.Encore = global.Encore || {};
        global.Encore.core = global.Encore.core || {};
        global.Encore.core.engines = global.Encore.core.engines || {};
        global.Encore.core.engines.VoiceEngine = VoiceEngine;
    }
})(typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this));
