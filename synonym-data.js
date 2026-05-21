// synonym-data.js — extraído do Dicionário de Sinônimos (Antenor Nascentes, 4ª ed.) + conhecimento literário PT-BR
// Entradas marcadas "(est)" foram estimadas por conhecimento linguístico quando o verbete não constava no PDF

(function(global) {

  const SINONIMOS = {

    // ─── VERBOS DE AÇÃO NARRATIVA ─────────────────────────────────────────────

    // Nascentes: "Andar é mudar progressivamente de situação dando passos; Caminhar é ir
    // vencendo distância; Marchar é andar compassadamente"
    "andar":     ["caminhar", "marchar", "percorrer", "passear", "deambular", "vaguear"],

    // Nascentes: "Articular é pronunciar distinguindo as sílabas; Dizer é expressar por
    // palavras; Falar é exprimir pela voz; Proferir é pronunciar em voz alta"
    "falar":     ["dizer", "proferir", "pronunciar", "enunciar", "articular", "declarar"],

    // Nascentes: mesma entrada que falar
    "dizer":     ["falar", "proferir", "declarar", "afirmar", "enunciar", "pronunciar"],

    // Nascentes: "Avistar é chegar a ver; Bispar é avistar mal de longe; Discernir é
    // distinguir claramente; Lobrigar é ver com dificuldade"
    "olhar":     ["avistar", "enxergar", "observar", "contemplar", "fitar", "lobrigar"],

    // Nascentes: "Correr é mover-se seguindo sua inclinação; Fluir é forma erudita;
    // Escoar-se é passar lentamente; Dimanar é brotar serenamente"
    "correr":    ["precipitar-se", "disparar", "apressar-se", "galgar", "voar", "arrebentar"],

    // Nascentes: "Caminhar é ir vencendo distância, aproximando-se do termo"
    "caminhar":  ["andar", "trilhar", "percorrer", "marchar", "trafegar", "palmilhar"],

    // Nascentes: "Cansado, Esfalfado, Estafado, Exausto, Extenuado, Fatigado —
    // Exausto é esgotado de forças; Extenuado é enfraquecido ao extremo"
    "cansado":   ["exausto", "fatigado", "extenuado", "estafado", "esfalfado", "esgotado"],

    // Nascentes: mesma entrada que olhar
    "ver":       ["avistar", "enxergar", "discernir", "distinguir", "lobrigar", "observar"],

    // Nascentes: "Compreender é tomar conhecimento cabal; Perceber é dar-se conta;
    // Sentir é apontar o sentido, penetrar o íntimo"
    "sentir":    ["perceber", "compreender", "experimentar", "pressentir", "notar", "intuir"],

    // Nascentes: "Crer é estar propenso a admitir; Cuidar é cogitar esperando; Julgar é
    // pensar com base em argumento; Pensar é cogitar"
    "pensar":    ["refletir", "cuidar", "cogitar", "meditar", "ponderar", "considerar"],

    // est — não localizado como verbete; saber no sentido de conhecer/entender
    "saber":     ["conhecer", "entender", "compreender", "perceber", "discernir", "dominar"],

    // Nascentes: "Desejar e Querer: ambos têm vontade; quem quer depende dos meios;
    // quem deseja depende da vontade alheia"
    "querer":    ["desejar", "almejar", "ansiar", "pretender", "aspirar", "cobiçar"],

    // est — poder como verbete de ação
    "poder":     ["conseguir", "lograr", "ser capaz", "ter condições", "facultar", "ser possível"],

    // Nascentes: "Efetuar é levar a efeito; Executar é dar seguimento a um plano;
    // Realizar é tornar real"
    "fazer":     ["realizar", "executar", "efetuar", "cumprir", "elaborar", "concretizar"],

    // Nascentes: "Vir" — não encontrado como verbete direto; est
    "vir":       ["chegar", "aproximar-se", "advir", "sobrevir", "comparecer", "acorrer"],

    // est
    "ir":        ["partir", "dirigir-se", "encaminhar-se", "rumar", "deslocar-se", "seguir"],

    // Nascentes: "Alcançar é tocar com esforço; Atingir é tocar com precisão;
    // Chegar indica o fato de aproximar-se terminado o percurso"
    "chegar":    ["alcançar", "atingir", "aportar", "comparecer", "arribar", "abordar"],

    // est — sair como verbete
    "sair":      ["partir", "retirar-se", "ausentar-se", "escapar", "emergir", "evadir-se"],

    // Nascentes: "Entrar é ir para dentro; Penetrar é entrar profundamente"
    "entrar":    ["penetrar", "adentrar", "ingressar", "introduzir-se", "irromper", "imiscuir-se"],

    // est — ficar no sentido de permanecer
    "ficar":     ["permanecer", "demorar-se", "remanecer", "pousar", "instalar-se", "manter-se"],

    // Nascentes: "Regressar é voltar depois de ausência mais ou menos longa;
    // Retornar é o mesmo que voltar; Volver é literário"
    "voltar":    ["regressar", "retornar", "retroceder", "recuar", "volver", "reaparecer"],

    // Nascentes: "Começar é dar começo; Encetar é começar estreando; Iniciar é forma
    // erudita; Principiar é dar princípio"
    "começar":   ["iniciar", "principiar", "encetar", "estrear", "inaugurar", "desencadear"],

    // Nascentes: "Acabar, Concluir, Finalizar, Rematar, Terminar, Ultimar — Terminar é
    // pôr termo ao que tem de cessar; Ultimar é chegar ao termo de coisa começada"
    "terminar":  ["concluir", "finalizar", "encerrar", "rematar", "ultimar", "acabar"],

    // Nascentes: "Lembrar é reproduzir espontaneamente na memória; Recordar é fazer
    // esforço; Evocar é fazer presente na lembrança"
    "lembrar":   ["recordar", "evocar", "rememorar", "trazer à mente", "relembrar", "reminiscir"],

    // Nascentes: "Esquecer e Olvidar: perder da memória; Olvidar é literário"
    "esquecer":  ["olvidar", "apagar da memória", "obliterar", "descurar", "deixar cair no esquecimento"],

    // Nascentes: "Adorar é amar sobre todas as coisas; Idolatrar é ter como ídolo,
    // amar como ídolo; Venerar é render culto de profundo respeito"
    "amar":      ["adorar", "querer", "idolatrar", "estimar", "apreciar", "devotar-se a"],

    // Nascentes: "Abominar é repelir com horror; Aborrecer é não poder sofrer;
    // Detestar é protestar; Execrar é afastar com indignação; Odiar é o mais genérico"
    "odiar":     ["detestar", "abominar", "aborrecer", "execrar", "repudiar", "abominar"],

    // Nascentes: "Carpir-se é lamentar desgrenhando; Chorar é verter lágrimas;
    // Gemer é exprimir dor por voz inarticulada; Lagrimar é chorar de imensa dor;
    // Lamentar é queixar-se com prantos; Soluçar é chorar em soluços"
    "chorar":    ["lagrimar", "soluçar", "lamentar", "carpir-se", "prantear", "gemer"],

    // est — não encontrado como verbete; rir no sentido geral
    "rir":       ["sorrir", "gargalhar", "cachinar", "escangalhar-se", "dar risada", "zombar"],

    // Nascentes: "Acabar, Expirar, Extinguir-se, Falecer, Fenecer, Finar-se, Morrer,
    // Perecer — Expirar é soltar o último suspiro; Falecer é acabar fazendo falta;
    // Fenecer é chegar ao fim natural; Finar-se é findar-se"
    "morrer":    ["falecer", "finar-se", "expirar", "perecer", "sucumbir", "fenecer"],

    // est — nascer; brotar, desabrochar usados em sentido figurado na ficção
    "nascer":    ["brotar", "desabrochar", "surgir", "emergir", "vir ao mundo", "irromper"],

    // Nascentes: "Aumentar é tornar maior; Avolumar-se é assumir volume maior;
    // Crescer é avolumar-se por forças interiores"
    "crescer":   ["aumentar", "avolumar-se", "avultar", "desenvolver-se", "expandir-se", "medrar"],

    // Nascentes: "Abater, Cair, Desabar, Desmoronar, Despenhar-se, Ruir, Tombar —
    // Cair é o mais genérico; Desabar é cair com fracasso; Tombar é cair de comprido"
    "cair":      ["tombar", "desabar", "ruir", "despenhar-se", "precipitar-se", "desmoronar"],

    // est — levantar não encontrado como verbete direto
    "levantar":  ["erguer", "elevar", "alçar", "içar", "soerguer", "erigir"],

    // Nascentes: "Brado, Clamor, Grito, Vozes — Brado é grito esforçado que ressoa ao
    // longe; Clamor é brado de quem se queixa ou pede socorro"
    "gritar":    ["bradar", "berrar", "clamar", "vociferar", "exclamar", "bramir"],

    // est — sussurrar não consta no dicionário
    "sussurrar": ["murmurar", "cochichar", "segredar", "farfalhar", "balbuci ar", "mussitar"],

    // Nascentes: "Alcançar é tocar com esforço; Atingir é tocar com precisão;
    // Tocar é chegar pondo-se em contato"
    "tocar":     ["contatar", "tangenciar", "alcançar", "roçar", "palpar", "tanger"],

    // Nascentes: "Agarrar é segurar com firmeza; Pegar é tomar com a mão;
    // Segurar é prender de modo que não fuja"
    "pegar":     ["agarrar", "segurar", "capturar", "apanhar", "empunhar", "apoderar-se de"],

    // Nascentes: "Desatar é tirar o nó; Desligar é tirar o que está ligando;
    // Desprender é tirar o que está prendendo; Soltar é deixar livre"
    "soltar":    ["libertar", "desprend er", "desatar", "largar", "liberar", "desligar"],

    // est — abrir não encontrado como verbete de ação direta
    "abrir":     ["desfechar", "escancarar", "descerrar", "franquear", "entreabrir", "desvelar"],

    // est — fechar não encontrado como verbete direto
    "fechar":    ["cerrar", "encerrar", "trancar", "clausurar", "vedar", "selar"],

    // ─── ADJETIVOS ────────────────────────────────────────────────────────────

    // Nascentes: "Belo, Bonito, Formoso, Gentil, Lindo, Pulcro"
    "belo":      ["formoso", "bonito", "lindo", "gracioso", "gentil", "pulcro"],

    // est — feio não encontrado como verbete, mas hediondo, disforme usados no texto
    "feio":      ["horrendo", "horroroso", "disforme", "monstruoso", "repulsivo", "repelente"],

    // Nascentes: "Grande, Imane, Ingente, Magno — Grande é o mais genérico"
    "grande":    ["imenso", "vasto", "gigantesco", "amplo", "colossal", "majestoso"],

    // est
    "pequeno":   ["diminuto", "minúsculo", "ínfimo", "miúdo", "exíguo", "reduzido"],

    // Nascentes: "Ativo, Eficaz, Enérgico, Forte, Violento — Forte atua com força
    // maior que a média"
    "forte":     ["robusto", "vigoroso", "poderoso", "enérgico", "potente", "musculoso"],

    // est — fraco; débil, lânguido aparecem no texto mas não como verbete de fraco
    "fraco":     ["débil", "lânguido", "frágil", "delicado", "impotente", "frouxo"],

    // Nascentes: "Ancião, Idoso, Velho — Velho é o que conta muita idade; Idoso refere-se
    // exclusivamente à idade avançada; Ancião é o velho venerável"
    "velho":     ["idoso", "ancião", "envelhecido", "veterano", "decrépito", "longevo"],

    // Nascentes: "Novo, Recente — Novo é fato que ainda não tinha acontecido; Recente
    // é acontecido há pouco"
    "novo":      ["recente", "jovem", "novel", "fresco", "moderno", "contemporâneo"],

    // Nascentes: "Hipocondríaco, Jururu, Macambúzio, Melancólico, Sorumbático, Triste,
    // Tristonho — Melancólico é triste, calmo, cismador; Macambúzio é triste carrancudo"
    "triste":    ["melancólico", "macambúzio", "sorumbático", "tristonho", "abatido", "pesaroso"],

    // Nascentes: "Álacre, Alegre, Contente, Exultante, Jovial, Jubiloso, Ledo, Satisfeito —
    // Álacre é alegre com vivacidade; Ledo é literário"
    "alegre":    ["contente", "jubiloso", "exultante", "álacre", "jovial", "ledo"],

    // Nascentes: "Acobardar, Amedrontar, Apavorar, Assustar, Atemorizar, Aterrorizar —
    // Assustar é meter um susto; Apavorar é infundir pavor"
    "assustado": ["amedrontado", "apavorado", "atemorizado", "horrorizado", "espavorido", "aterrorizado"],

    // Nascentes: "Só, Sozinho — Sozinho tem elemento afetivo de tristeza ou compaixão"
    "sozinho":   ["só", "solitário", "isolado", "desamparado", "abandonado", "desacompanhado"],

    // est — calmo; no texto: "calmo, sereno, moderado" associados a prudente/sisudo
    "calmo":     ["sereno", "tranquilo", "plácido", "pacato", "imperturbável", "equânime"],

    // est — agitado como adjetivo
    "agitado":   ["inquieto", "turbulento", "convulsionado", "perturbado", "febril", "irrequieto"],

    // Nascentes: "Escuro, Obscuro — Escuro é mais material; Obscuro é mais figurado"
    "escuro":    ["sombrio", "tenebroso", "lôbrego", "obscuro", "penumbroso", "enegrecido"],

    // Nascentes: "Claro, Evidente, Manifesto — Claro não dá lugar a equívoco; Evidente
    // determina o assentimento; Manifesto não tem nada que o oculte"
    "claro":     ["luminoso", "translúcido", "nítido", "diáfano", "evidente", "límpido"],

    // Nascentes: "Álgido, Enregelado, Frígido, Frio, Gelado, Gélido, Glacial —
    // Gélido é muito frio; Glacial é frio como gelo"
    "frio":      ["gelado", "gélido", "glacial", "frígido", "álgido", "enregelado"],

    // Nascentes: "Abrasador, Ardente, Cálido, Candente, Quente, Tórrido —
    // Ardente é o muito quente; Tórrido implica calor extremo"
    "quente":    ["ardente", "abrasador", "tórrido", "cálido", "escaldante", "candente"],

    // Nascentes: "Calado, Mudo, Silencioso, Silente, Taciturno — Calado abstém-se de
    // falar; Taciturno é reservado por natureza; Silente é literário"
    "silencioso": ["calado", "mudo", "taciturno", "silente", "quieto", "insonoro"],

    // est — barulhento não consta
    "barulhento": ["ruidoso", "estrondoso", "tumultuoso", "vociferante", "estardalhaçante", "clamoso"],

    // Nascentes: "Brando, Macio, Mole, Tenro — Brando cede com certa consistência;
    // Macio é agradável ao tato; Tenro é o que se deixa amolecer"
    "suave":     ["brando", "macio", "tênue", "delicado", "meigo", "leve"],

    // Nascentes: "Acerbo, Acre, Acrimonioso, Agro, Amargo, Áspero — Áspero é o que
    // tem superfície rugosa ou temperamento rude"
    "áspero":    ["rude", "acre", "acerbo", "rugoso", "escabroso", "ríspido"],

    // Nascentes: "Lento, Demorado, Moroso, Tardio, Vagaroso — Lento é o que por sua
    // natureza anda com vagar; Moroso é o muito demorado"
    "rápido":    ["veloz", "ligeiro", "ágil", "célere", "expedito", "arrojado"],

    // Nascentes: mesma entrada que rápido
    "lento":     ["vagaroso", "moroso", "tardio", "demorado", "pausado", "lerdo"],

    // Nascentes: "Abastado, Apatacado, Milionário, Opulento, Rico — Abastado é provido
    // de bens bastantes; Opulento tem riqueza exuberante"
    "rico":      ["abastado", "opulento", "endinheirado", "próspero", "milionário", "remediado"],

    // Nascentes: "Indigente, Mendigo, Pedinte, Pobre — Indigente está na indigência;
    // Mendigo pede esmola"
    "pobre":     ["indigente", "miserável", "necessitado", "carente", "desprovido", "humilde"],

    // ─── SUBSTANTIVOS LITERÁRIOS ──────────────────────────────────────────────

    // Nascentes: "Afeição, Afeto, Amizade, Amor, Apego, Dedicação, Inclinação, Paixão,
    // Ternura — Amor é o sentimento mais profundo e duradouro"
    "amor":      ["afeição", "paixão", "afeto", "ternura", "devoção", "apego"],

    // Nascentes: "Apreensão, Medo, Temor — Apreensão é vaga; Medo é o perigo que o
    // espírito faz presente; Temor é o perigo provável"
    "medo":      ["temor", "pavor", "terror", "apreensão", "receio", "susto"],

    // Nascentes: "Calado, Mudo, Silencioso, Silente, Taciturno" (entrada conexa)
    "silêncio":  ["quietude", "mutismo", "sossego", "recolhimento", "calmaria", "mudez"],

    // est
    "tempo":     ["época", "era", "período", "instante", "momento", "duração"],

    // Nascentes: "Biografia, Vida — Como títulos: Vida se aplica a grandes homens"
    "vida":      ["existência", "vivência", "trajetória", "percurso", "biografia", "porvir"],

    // Nascentes: "Falecimento, Morte, Óbito, Passamento, Trânsito, Traspasse —
    // Morte é a cessação da vida; Óbito é o termo documental; Passamento é literário"
    "morte":     ["falecimento", "óbito", "passamento", "fim", "traspasse", "extinção"],

    // Nascentes: "Lume, Luz — Lume serve para cozinhar/aquecer; Luz serve para alumiar"
    "luz":       ["claridade", "lume", "fulgor", "brilho", "luminosidade", "resplendor"],

    // Nascentes: "Abantesma, Alma, Aparição, Duende, Espectro, Fantasma, Sombra,
    // Visão — Sombra é a parte imaterial quanto manifesta à visão"
    "sombra":    ["penumbra", "trevas", "escuridão", "negrume", "obscuridade", "claro-escuro"],

    // Nascentes: "Aragem, Aura, Brisa, Favônio, Viração, Zéfiro — Aragem é movimento
    // brando; Aura é vento brando e sussurrante; Brisa é mais forte; Zéfiro é literário"
    "vento":     ["brisa", "aragem", "ventania", "rajada", "viração", "vendaval"],

    // est — chuva não encontrada como verbete sinonímico
    "chuva":     ["aguaceiro", "chuvisco", "garoa", "precipitação", "temporal", "chuvarada"],

    // est
    "terra":     ["chão", "solo", "terreno", "húmus", "torrão", "pátria"],

    // est
    "mar":       ["oceano", "águas", "ondas", "largo", "abismo", "profundo"],

    // est
    "casa":      ["lar", "morada", "habitação", "domicílio", "abrigo", "teto"],

    // Nascentes: "Caminho, Estrada, Senda, Trilha, Vereda, Via — Estrada é construída
    // com mais arte; Senda é caminho estreito; Trilha é rastro; Vereda é pequeno caminho"
    "caminho":   ["vereda", "senda", "trilha", "estrada", "rota", "via"],

    // est — noite
    "noite":     ["escuridão", "trevas", "crepúsculo", "madrugada", "negrume", "lusco-fusco"],

    // est
    "dia":       ["aurora", "amanhecer", "alvorada", "jornada", "claridade", "manhã"],

    // est
    "olhos":     ["olhar", "vista", "visão", "mirada", "pupilas", "órbitas"],

    // est
    "mãos":      ["palmas", "dedos", "punhos", "garras", "mãozinhas", "dedilhares"],

    // Nascentes: "Expressão, Palavra, Termo, Vocábulo — Palavra é o vocábulo significativo
    // de uma ideia; Termo é palavra técnica; Vocábulo é o conjunto de sons articulados"
    "voz":       ["timbre", "tom", "entonação", "sonoridade", "acento", "dicção"],

    // Nascentes: mesma entrada que voz/palavra
    "palavra":   ["vocábulo", "termo", "expressão", "locução", "dicção", "verbo"],

    // Nascentes: "Fantasia, Imaginação, Imaginativa, Inventiva — Fantasia é imaginação
    // livre sem peias"
    "sonho":     ["devaneio", "fantasia", "visão", "quimera", "ilusão", "imaginação"],

    // Nascentes: "Âmago, Cerne, Coração, Imo, Interior, Íntimo, Medula — Coração
    // é a parte interior que representa a sede da vida, do sentimento"
    "coração":   ["âmago", "cerne", "íntimo", "entranhas", "peito", "alma"],

    // ─── ADVÉRBIOS E CONECTIVOS ───────────────────────────────────────────────

    // est
    "também":    ["igualmente", "outrossim", "ademais", "de igual modo", "da mesma forma", "bem como"],

    // Nascentes: "Ainda, Inda — A segunda é poética e popular"
    "ainda":     ["inda", "mesmo assim", "até agora", "por ora", "de toda forma"],

    // est
    "já":        ["agora", "logo", "imediatamente", "de imediato", "neste instante", "desde já"],

    // est
    "apenas":    ["somente", "só", "exclusivamente", "unicamente", "tão somente", "simplesmente"],

    // Nascentes: "Quiçá, Talvez — Quiçá denota possibilidade; hoje é literário/pedante"
    "talvez":    ["quiçá", "porventura", "possivelmente", "eventualmente", "acaso", "quem sabe"],

    // Nascentes: "Depois, Logo — Logo é no mesmo instante, imediatamente; Depois pode
    // ser ainda hoje, amanhã"
    "logo":      ["imediatamente", "depois", "brevemente", "em seguida", "prontamente", "já"],

    // Nascentes: "Continuamente, Sempre — Sempre, em tempo e ocasião oportuna"
    "sempre":    ["continuamente", "constantemente", "eternamente", "invariavelmente", "incessantemente"],

    // Nascentes: "Jamais, Nunca — Jamais reforça o nunca com ideia de tempo passado"
    "nunca":     ["jamais", "em tempo algum", "de forma alguma", "nunca mais", "em nenhum caso"],

    // est
    "assim":     ["desse modo", "dessa maneira", "por isso", "portanto", "logo", "conseguintemente"],

    // est
    "então":     ["portanto", "logo", "assim sendo", "nesse caso", "por conseguinte", "pois"],

    // est
    "portanto":  ["logo", "por isso", "assim", "consequentemente", "por conseguinte", "destarte"],
  };

  // Normalização: remove acentos e converte para minúsculas
  function _norm(w) {
    return w
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  // Reconstrói índice normalizado uma única vez
  const _IDX = Object.create(null);
  for (const key in SINONIMOS) {
    _IDX[_norm(key)] = SINONIMOS[key];
  }

  async function loadSynonyms(word) { /* noop — dados já carregados */ }

  function getSynonyms(word) {
    const norm = _norm(word);
    return _IDX[norm] || [];
  }

  global.SINONIMOS    = SINONIMOS;
  global.loadSynonyms = loadSynonyms;
  global.getSynonyms  = getSynonyms;

})(typeof window !== "undefined" ? window : globalThis);
