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
    "esquecer":  ["olvidar", "apagar da memória", "obliterar", "descurar", "deixar cair no esquecimento", "perder de vista"],

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
    "ainda":     ["inda", "mesmo assim", "até agora", "por ora", "de toda forma", "até o momento"],

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
    "sempre":    ["continuamente", "constantemente", "eternamente", "invariavelmente", "incessantemente", "sem cessar"],

    // Nascentes: "Jamais, Nunca — Jamais reforça o nunca com ideia de tempo passado"
    "nunca":     ["jamais", "em tempo algum", "de forma alguma", "nunca mais", "em nenhum caso", "de jeito nenhum"],

    // est
    "assim":     ["desse modo", "dessa maneira", "por isso", "portanto", "logo", "conseguintemente"],

    // est
    "então":     ["portanto", "logo", "assim sendo", "nesse caso", "por conseguinte", "pois"],

    // est
    "portanto":  ["logo", "por isso", "assim", "consequentemente", "por conseguinte", "destarte"],

    // ─── VERBOS LITERÁRIOS ADICIONAIS ──────────────────────────────────────────

    // est
    "escrever":    ["redigir", "grafar", "compor", "lavrar", "inscrever", "traçar"],

    // Nascentes: "Criar é tirar do nada; Inventar é fazer o que não existia por combinação"
    "criar":       ["inventar", "conceber", "engendrar", "imaginar", "gerar", "fabricar"],

    // est
    "partir":      ["ir-se", "sair", "ausentar-se", "deixar", "retirar-se", "desaparecer"],

    // est
    "esperar":     ["aguardar", "antecipar", "almejar", "nutrir esperança", "aspirar", "anelar"],

    // Nascentes: "Padecer é sofrer doenças; Pena é dor moral; Sofrer é mais geral"
    "sofrer":      ["padecer", "suportar", "aguentar", "tolerar", "penar", "sentir"],

    // est
    "lutar":       ["combater", "resistir", "brigar", "contender", "pugnar", "batalhar"],

    // est
    "acordar":     ["despertar", "erguer-se", "levantar", "animar-se", "sair do sono", "abrir os olhos"],

    // Nascentes: "Sonhar é experimentar sonhos; Fantasiar é criar imagens voluntárias"
    "sonhar":      ["fantasiar", "imaginar", "alucinar", "devanear", "cismar", "divagar"],

    // est
    "transformar": ["mudar", "converter", "alterar", "metamorfosear", "transfigurar", "reformar"],

    // est
    "revelar":     ["descobrir", "expor", "mostrar", "desvendar", "declarar", "confessar"],

    // est
    "esconder":    ["ocultar", "encobrir", "dissimular", "velar", "abafar", "camuflar"],

    // est
    "resistir":    ["aguentar", "suportar", "enfrentar", "opor-se", "persistir", "insistir"],

    // ─── SUBSTANTIVOS ADICIONAIS ───────────────────────────────────────────────

    // Nascentes: "Corpo é a totalidade do ser físico; Carne é a parte mole"
    "corpo":       ["carne", "físico", "organismo", "ser", "tronco", "invólucro"],

    // est
    "cidade":      ["metrópole", "capital", "burgo", "município", "urbes", "centro urbano"],

    // est
    "floresta":    ["mata", "selva", "bosque", "mato", "arvoredo", "capoeira"],

    // est
    "memória":     ["lembrança", "recordação", "reminiscência", "evocação", "retentiva", "saudade"],

    // Nascentes: "Fogo é o fenômeno em geral; Chama é a língua de fogo; Brasa é o carvão aceso"
    "fogo":        ["chama", "brasa", "labareda", "incêndio", "faísca", "lume"],

    // ─── VERBOS NARRATIVOS COMPLEMENTARES ────────────────────────────────────

    // est
    "perder":      ["extraviar", "desperdiçar", "privar-se de", "sumir com", "desaparecer com", "desfazer-se de"],

    // Nascentes: "Achar é encontrar por acaso; Descobrir é encontrar o que estava oculto"
    "encontrar":   ["achar", "deparar-se com", "topar com", "descobrir", "localizar", "deparar"],

    // est
    "fugir":       ["escapar", "evadir-se", "evitar", "refugiar-se", "desertar", "debandear"],

    // est
    "procurar":    ["buscar", "pesquisar", "investigar", "rastrear", "perscrutar", "explorar"],

    // Nascentes: "Contar é narrar enumerando; Narrar é expor fatos em sequência; Relatar é fazer relato"
    "contar":      ["narrar", "relatar", "descrever", "reportar", "historiar", "enunciar"],

    // ─── ADJETIVOS COMPLEMENTARES ─────────────────────────────────────────────

    // est
    "perdido":     ["desgarrado", "desorientado", "extraviado", "errante", "sem rumo", "naufragado"],

    // Nascentes: "Fundo é o mais material; Profundo indica grande extensão ou intensidade"
    "profundo":    ["fundo", "abismal", "insondável", "intenso", "cavernoso", "denso"],

    // est
    "secreto":     ["oculto", "clandestino", "sigiloso", "velado", "encoberto", "misterioso"],

    // ─── SUBSTANTIVOS COMPLEMENTARES ─────────────────────────────────────────

    // Nascentes: "Dor, Pena, Sofrimento — Dor é o sofrimento físico ou moral intenso; Pena é dor moral"
    "dor":         ["sofrimento", "pena", "padecimento", "angústia", "tormento", "suplício"],

    // est
    "esperança":   ["expectativa", "anseio", "alento", "perspectiva", "fé", "aspiração"],

    // Nascentes: conexa com "só" — solidão implica ausência sentida de companhia
    "solidão":     ["isolamento", "abandono", "reclusão", "desamparo", "desolação", "separação"],

    // Nascentes: "Destino, Fado, Sina — Fado é o destino fatal; Sina é destino marcado no nascimento"
    "destino":     ["fado", "sorte", "sina", "providência", "rumo", "porvir"],

    // est
    "povo":        ["gente", "população", "multidão", "comunidade", "nação", "coletividade"],

    // ─── VERBOS COMPLEMENTARES ────────────────────────────────────────────────

    // est
    "temer":       ["recear", "trepidiar", "horrorizar-se", "apavorar-se", "tremer", "pressentir"],

    // est
    "ler":         ["percorrer", "folhear", "decifrar", "compulsar", "consultar", "devorar"],

    // est
    "construir":   ["edificar", "erguer", "levantar", "elaborar", "fundar", "erigir"],

    // est
    "destruir":    ["demolir", "arruinar", "devastar", "desfazer", "arrasar", "aniquilar"],

    // est
    "mudar":       ["alterar", "transformar", "modificar", "metamorfosear", "converter", "renovar"],

    // est
    "aprender":    ["apreender", "assimilar", "absorver", "captar", "estudar", "instruir-se"],

    // est
    "ensinar":     ["instruir", "educar", "lecionar", "doutrinar", "orientar", "iluminar"],

    // est
    "dormir":      ["repousar", "descansar", "adormecer", "cochilar", "jazer", "hibernar"],

    // ─── ADJETIVOS COMPLEMENTARES ─────────────────────────────────────────────

    // est
    "feliz":       ["alegre", "contente", "radiante", "satisfeito", "jubiloso", "afortunado"],

    // est
    "livre":       ["solto", "liberto", "independente", "desimpedido", "autônomo", "desatado"],

    // ─── SUBSTANTIVOS COMPLEMENTARES ─────────────────────────────────────────

    // est
    "ódio":        ["aversão", "rancor", "hostilidade", "repulsa", "ira", "animosidade"],

    // est
    "alegria":     ["contentamento", "júbilo", "felicidade", "prazer", "satisfação", "euforia"],

    // est
    "tristeza":    ["melancolia", "pesar", "mágoa", "angústia", "abatimento", "lamento"],

    // est
    "mundo":       ["terra", "universo", "cosmos", "orbe", "globo", "humanidade"],

    // est
    "céu":         ["firmamento", "abóbada", "éter", "azul", "empíreo", "infinito"],

    // ─── VERBOS FÍSICOS E COTIDIANOS ─────────────────────────────────────────

    // Nascentes: "Cair, Despencar, Tombar — Tombar é cair de lado; Despencar é cair de cima"
    "cair":        ["tombar", "despencar", "desabar", "ruir", "pender", "vergar"],

    // est
    "erguer":      ["levantar", "alçar", "içar", "elevar", "soerguer", "enrijecer"],

    // Nascentes: "Dar é entregar voluntariamente; Oferecer é apresentar para que se aceite"
    "dar":         ["oferecer", "entregar", "conceder", "outorgar", "ceder", "presentear"],

    // est
    "tomar":       ["pegar", "apanhar", "agarrar", "apropriar-se", "colher", "receber"],

    // est
    "pedir":       ["solicitar", "requisitar", "rogar", "implorar", "suplicar", "reclamar"],

    // Nascentes: "Nascer é vir ao mundo; Surgir é aparecer de repente"
    "nascer":      ["surgir", "brotar", "emergir", "vir ao mundo", "originar-se", "germinar"],

    // Nascentes: "Falecer é morrer, mas com maior delicadeza; Perecer é morrer de modo violento"
    "morrer":      ["falecer", "perecer", "sucumbir", "extinguir-se", "expirar", "finar-se"],

    // Nascentes: "Existir é o mais geral; Viver é existir com vida; Subsistir é persistir na existência"
    "viver":       ["existir", "subsistir", "habitar", "residir", "permanecer", "durar"],

    // est
    "tocar":       ["tangenciar", "roçar", "acariciar", "tatear", "contatar", "afagar"],

    // est
    "abrir":       ["escancarar", "entreabrir", "destapar", "descerrar", "romper", "rasgar"],

    // ─── SUBSTANTIVOS LITERÁRIOS ESSENCIAIS ──────────────────────────────────

    // est
    "tempo":       ["instante", "momento", "época", "era", "período", "duração"],

    // Nascentes: "Luz, Claridade — Claridade é qualidade do que é claro; Luz é o agente que ilumina"
    "luz":         ["claridade", "brilho", "luminosidade", "fulgor", "radiance", "clarão"],

    // est
    "sombra":      ["escuridão", "penumbra", "trevas", "negrume", "obscuridade", "breu"],

    // est
    "silêncio":    ["quietude", "mutismo", "calmaria", "inércia", "sossegow", "paz"],

    // Nascentes: "Medo, Pavor, Terror — Terror é o medo mais intenso e paralisante"
    "medo":        ["pavor", "terror", "temor", "pânico", "susto", "apreensão"],

    // est
    "sangue":      ["gore", "hemoglobina", "veias", "vida", "linhagem", "corrente"],

    // Nascentes: "Vento, Brisa, Rajada — Brisa é suave; Rajada é violenta e passageira"
    "vento":       ["brisa", "rajada", "ventania", "sopro", "aragem", "furacão"],

    // ─── ADJETIVOS LITERÁRIOS ESSENCIAIS ─────────────────────────────────────

    // est
    "velho":       ["antigo", "ancião", "envelhecido", "decrépito", "caduco", "remoto"],

    // est
    "escuro":      ["tenebroso", "lúgubre", "sombrio", "negro", "opaco", "disforme"],

    // est
    "sozinho":     ["solitário", "isolado", "só", "desamparado", "abandonado", "único"],

    // ─── VERBOS EPISTÊMICOS E COGNITIVOS ─────────────────────────────────────

    // est
    "saber":       ["conhecer", "compreender", "dominar", "entender", "reconhecer", "perceber"],

    // est
    "pensar":      ["refletir", "ponderar", "cogitar", "meditar", "raciocinar", "imaginar"],

    // est
    "acreditar":   ["crer", "confiar", "supor", "presumir", "admitir", "convencer-se"],

    // est
    "duvidar":     ["questionar", "desconfiar", "suspeitar", "hesitar", "vaciar", "ponderar"],

    // est
    "lembrar":     ["recordar", "rememorar", "evocar", "reviver", "resgatar", "trazer à mente"],

    // est
    "esquecer":    ["olvidar", "apagar", "suprimir", "negligenciar", "perder", "deixar escapar"],

    // est
    "perceber":    ["notar", "captar", "sentir", "intuir", "aperceber-se", "discernir"],

    // ─── VERBOS SOCIAIS E RELACIONAIS ────────────────────────────────────────

    // est
    "amar":        ["adorar", "querer", "venerar", "idolatrar", "estimar", "prezar"],

    // est
    "odiar":       ["detestar", "abominar", "desprezar", "aborrecer", "repudiar", "execrar"],

    // est
    "trair":       ["enganar", "ludibriar", "iludir", "tramar", "conspirar", "abandonar"],

    // est
    "perdoar":     ["absolver", "relevar", "desculpar", "remir", "compadecer-se", "reconciliar"],

    // est
    "abandonar":   ["largar", "deixar", "desertar", "renunciar", "desprender-se", "soltar"],

    // est
    "proteger":    ["amparar", "defender", "guardar", "resguardar", "abrigar", "velar"],

    // ─── ADJETIVOS DE CARÁTER ────────────────────────────────────────────────

    // est
    "corajoso":    ["bravo", "valente", "audaz", "intrépido", "destemido", "resoluto"],

    // est
    "covarde":     ["medroso", "tímido", "pusilânime", "apavorado", "receoso", "vacilante"],

    // est
    "cruel":       ["impiedoso", "brutal", "feroz", "selvagem", "desumano", "implacável"],

    // est
    "gentil":      ["delicado", "cortês", "afável", "amável", "atencioso", "bondoso"],

    // est
    "orgulhoso":   ["altivo", "soberbo", "arrogante", "vaidoso", "presunçoso", "altaneiro"],

    // est
    "humilde":     ["modesto", "singelo", "despretensioso", "simples", "recatado", "manso"],

    // est
    "fiel":        ["leal", "devotado", "comprometido", "honesto", "constante", "dedicado"],

    // ─── VERBOS DE PERCEPÇÃO E SENTIDO ───────────────────────────────────────

    // est
    "ver":         ["observar", "enxergar", "contemplar", "avistar", "distinguir", "presenciar"],

    // est
    "ouvir":       ["escutar", "perceber", "captar", "auscultar", "distinguir", "notar"],

    // est
    "sentir":      ["perceber", "experimentar", "pressentir", "intuir", "notar", "captar"],

    // est
    "tocar":       ["apalpar", "tatear", "roçar", "tanger", "afagar", "tangenciar"],

    // ─── VERBOS DE MOVIMENTO ESPECÍFICO ──────────────────────────────────────

    // est
    "correr":      ["acelerar", "disparar", "precipitar-se", "arremeter", "galgar", "desfilar"],

    // est
    "parar":       ["cessar", "deter", "interromper", "suspender", "imobilizar", "estancar"],

    // est
    "subir":       ["escalar", "ascender", "galgar", "trepar", "alçar-se", "elevar-se"],

    // est
    "descer":      ["declinar", "baixar", "abaixar-se", "cair", "deslizar", "arribar"],

    // est
    "entrar":      ["adentrar", "penetrar", "ingressar", "introduzir-se", "transpor", "aceder"],

    // est
    "sair":        ["partir", "retirar-se", "ausentar-se", "evadir", "evadir-se", "desertar"],

    // ─── VERBOS DE COMUNICAÇÃO E EXPRESSÃO ───────────────────────────────────

    // est
    "perguntar":   ["questionar", "indagar", "inquirir", "interrogar", "consultar", "interpelar"],

    // est
    "responder":   ["replicar", "retrucar", "ripostar", "contra-argumentar", "contestar", "retornar"],

    // est
    "contar":      ["narrar", "relatar", "reportar", "descrever", "expor", "referir"],

    // est
    "chamar":      ["invocar", "convocar", "nomear", "apelidar", "intitular", "designar"],

    // ─── ADJETIVOS DE ESTADOS FÍSICOS E EMOCIONAIS ───────────────────────────

    // est
    "cansado":     ["exausto", "fatigado", "esgotado", "abatido", "estafado", "desfalecido"],

    // est
    "forte":       ["robusto", "vigoroso", "potente", "resistente", "sólido", "tenaz"],

    // est
    "fraco":       ["débil", "frágil", "delicado", "enfraquecido", "vulnerável", "impotente"],

    // est
    "estranho":    ["bizarro", "incomum", "inusitado", "singular", "peculiar", "excêntrico"],

    // est
    "bonito":      ["belo", "formoso", "gracioso", "atraente", "esplêndido", "encantador"],

    // ─── VERBOS DE AVALIAÇÃO E JULGAMENTO ────────────────────────────────────

    // est
    "julgar":      ["avaliar", "apreciar", "ponderar", "arbitrar", "sentenciar", "condenar"],

    // est
    "criticar":    ["censurar", "reprovar", "questionar", "contestar", "refutar", "objetar"],

    // est
    "elogiar":     ["louvar", "enaltecer", "exaltar", "aplaudir", "encomiar", "valorizar"],

    // est
    "comparar":    ["confrontar", "cotejar", "contrastar", "equiparar", "ponderar", "medir"],

    // est
    "escolher":    ["selecionar", "optar", "preferir", "eleger", "designar", "adotar"],

    // est
    "recusar":     ["rejeitar", "negar", "declinar", "repudiar", "excluir", "vetar"],

    // ─── VERBOS DE CRIAÇÃO E TRANSFORMAÇÃO ───────────────────────────────────

    // est
    "criar":       ["gerar", "produzir", "fabricar", "compor", "inventar", "elaborar"],

    // est
    "mudar":       ["transformar", "alterar", "modificar", "converter", "metamorfosear", "reformar"],

    // est
    "destruir":    ["demolir", "arrasar", "aniquilar", "arruinar", "devastar", "exterminar"],

    // est
    "salvar":      ["resgatar", "preservar", "libertar", "proteger", "recuperar", "livrar"],

    // ─── VERBOS DE EXPRESSÃO EMOCIONAL ───────────────────────────────────────

    // est
    "sorrir":      ["esboçar", "reluzir", "acolher", "abrir-se", "desabrochar", "iluminar-se"],

    // est
    "suspirar":    ["exalar", "respirar", "gemer", "fungar", "soprar", "assoar"],

    // est
    "tremer":      ["estremecer", "tiritar", "vibrar", "sacudir", "palpitar", "trepidiar"],

    // est
    "buscar":      ["procurar", "pesquisar", "rastrear", "farejar", "perscrutar", "investigar"],

    // est
    "cuidar":      ["zelar", "preservar", "velar", "nutrir", "guardar", "dedicar-se"],

    // ─── ADJETIVOS DE ESTADO E CONDIÇÃO ──────────────────────────────────────

    // est
    "preso":       ["detido", "aprisionado", "cativo", "encarcerado", "acorrentado", "confinado"],

    // est
    "vivo":        ["animado", "vigoroso", "pulsante", "ardente", "vívido", "ativo"],

    // est
    "envelhecer":  ["caducar", "declinar", "murchar", "defasar", "desgastar-se", "amadurecer"],

    // ─── VERBOS DE REVELAÇÃO E OCULTAMENTO ───────────────────────────────────

    // est
    "mostrar":     ["exibir", "expor", "apresentar", "demonstrar", "evidenciar", "externalizar"],

    // est
    "ocultar":     ["encobrir", "camuflar", "dissimular", "velar", "mascarar", "suprimir"],

    // est
    "mentir":      ["enganar", "iludir", "falsear", "fingir", "simular", "inventar"],

    // est
    "confessar":   ["admitir", "reconhecer", "revelar", "assumir", "declarar", "desabafar"],

    // ─── ADJETIVOS DE TEMPO, DIMENSÃO E QUALIDADE ────────────────────────────

    // est
    "antigo":      ["arcaico", "secular", "ancestral", "longínquo", "imemorial", "primitivo"],

    // est
    "jovem":       ["novo", "moço", "juvenil", "adolescente", "imaturo", "incipiente"],

    // est
    "idoso":       ["ancião", "grisalho", "envelhecido", "maduro", "experiente", "venerável"],

    // est
    "lento":       ["vagaroso", "moroso", "pausado", "cadenciado", "gradual", "arrastado"],

    // est
    "rapido":      ["veloz", "ágil", "ligeiro", "acelerado", "súbito", "instantâneo"],

    // est
    "simples":     ["singelo", "puro", "despojado", "elementar", "direto", "austero"],

    // est
    "complexo":    ["intrincado", "elaborado", "labiríntico", "denso", "emaranhado", "multifacetado"],

    // est
    "verdadeiro":  ["autêntico", "genuíno", "legítimo", "real", "fiel", "concreto"],

    // est
    "falso":       ["fingido", "ilusório", "enganoso", "dissimulado", "aparente", "fictício"],

    // est
    "justo":       ["equânime", "imparcial", "honesto", "correto", "razoável", "equilibrado"],

    // est
    "injusto":     ["parcial", "arbitrário", "desigual", "cruel", "iníquo", "perverso"],

    // est
    "seguro":      ["protegido", "resguardado", "abrigado", "garantido", "estável", "firme"],

    // est
    "perigoso":    ["arriscado", "ameaçador", "temerário", "mortal", "instável", "fatal"],

    // est
    "infeliz":     ["triste", "desgraçado", "azarado", "infortunado", "desafortunado", "aflito"],
    "branco":      ["alvo", "lívido", "pálido", "cândido", "imaculado", "lácteo"],
    "negro":       ["escuro", "retinto", "azeviche", "sombrio", "ébano", "tenebroso"],
    "comecar":     ["iniciar", "principiar", "inaugurar", "abrir", "estrear", "lançar"],
    "ceder":       ["recuar", "capitular", "render-se", "dobrar-se", "abdicar", "resignar-se"],
    "confiar":     ["fiar-se", "acreditar", "apostar", "delegar", "entregar-se", "depositar fé"],
    "desistir":    ["abandonar", "largar", "renunciar", "recuar", "prescindir", "abdicar"],
    "tentar":      ["experimentar", "arriscar", "ousar", "aventurar-se", "ensaiar", "provar"],
    "conseguir":   ["obter", "alcançar", "lograr", "conquistar", "realizar", "granjear"],
    "intenso":     ["ardente", "veemente", "fervoroso", "aceso", "exaltado", "vívido"],
    "calado":      ["silencioso", "quieto", "mudo", "reservado", "reticente", "taciturno"],
    "libertar":    ["soltar", "desamarrar", "emancipar", "alforriar", "desencadear", "eximir"],
    "vencer":      ["triunfar", "derrotar", "superar", "bater", "subjugar", "sobrepujar"],
    "guardar":     ["conservar", "preservar", "zelar", "manter", "resguardar", "proteger"],
    "roubar":      ["surrupiar", "furtar", "subtrair", "extorquir", "pilhar", "desviar"],
    "aberto":      ["escancarado", "escancarado", "descerrado", "desimpedido", "franco", "expansivo"],
    "fechado":     ["trancado", "cerrado", "vedado", "lacrado", "hermético", "clausurado"],
    "cheio":       ["repleto", "lotado", "saturado", "transbordante", "recheado", "carregado"],
    "vazio":       ["oco", "esvaziado", "desprovido", "desolado", "árido", "destituído"],
    "limpo":       ["imaculado", "asseado", "higienizado", "nítido", "puro", "impecável"],
    "sujo":        ["imundo", "encardido", "enlameado", "manchado", "sórdido", "contaminado"],
    "longo":       ["extenso", "alongado", "dilatado", "prolongado", "demorado", "vasto"],
    "curto":       ["breve", "conciso", "reduzido", "exíguo", "sumário", "condensado"],
    "alto":        ["elevado", "imponente", "altaneiro", "erguido", "majestoso", "excelso"],
    "baixo":       ["raso", "rebaixado", "achatado", "humilde", "rasteiro", "miúdo"],
    "duro":        ["rígido", "resistente", "inflexível", "endurecido", "áspero", "severo"],
    "mole":        ["macio", "flácido", "frouxo", "fofo", "cede com facilidade", "amolecido"],
    "seco":        ["árido", "enxuto", "ressecado", "desidratado", "estéril", "descarnado"],
    "pesado":      ["volumoso", "denso", "sobrecarregado", "opressivo", "maciço", "ponderoso"],
    "leve":        ["ligeiro", "etéreo", "tênue", "ágil", "diáfano", "sutil"],
    "caro":        ["custoso", "valioso", "inacessível", "oneroso", "dispendioso", "exorbitante"],
    "barato":      ["acessível", "módico", "econômico", "popular", "em conta", "simples"],
    "facil":       ["simples", "singelo", "descomplicado", "acessível", "tranquilo", "intuitivo"],
    "dificil":     ["árduo", "complexo", "trabalhoso", "penoso", "espinhoso", "tortuoso"],
    "certo":       ["correto", "exato", "preciso", "adequado", "acertado", "inequívoco"],
    "errado":      ["incorreto", "equivocado", "falho", "impreciso", "inadequado", "equívoco"],
    "saltar":      ["pular", "dar um salto", "transpor", "ultrapassar", "galgar", "trancar"],
    "nadar":       ["mergulhar", "flutuar", "navegar", "remar", "deslizar na água", "bracear"],
    "voar":        ["alçar voo", "planar", "sobrevoar", "flutuar", "elevar-se", "alçar-se"],
    "comer":       ["alimentar-se", "devorar", "ingerir", "saborear", "engolir", "nutrir-se"],
    "beber":       ["tomar", "ingerir", "sorver", "engolir", "hidratar-se", "tragar"],
    "respirar":    ["inspirar", "expirar", "ar", "fôlego", "recuperar o fôlego", "tomar fôlego"],
    "fabricar":    ["produzir", "manufaturar", "confeccionar", "elaborar", "construir", "fazer"],
    "matar":       ["eliminar", "assassinar", "ceifar", "liquidar", "exterminar", "abater"],
    "curar":       ["sanar", "sarar", "tratar", "remediar", "restituir", "recuperar"],
    "doer":        ["machucar", "pungir", "queimar", "martirizar", "atormentar", "mortificar"],
    "imaginar":    ["conceber", "fantasiar", "supor", "vislumbrar", "figurar", "cogitar"],
    "vermelho":    ["escarlate", "carmesim", "rubro", "encarnado", "purpúreo", "róseo"],
    "azul":        ["anil", "safira", "celeste", "cerúleo", "ciano", "turquesa"],
    "verde":       ["esmeralda", "jade", "oliva", "viçoso", "verdejante", "matizado"],
    "amarelo":     ["dourado", "âmbar", "ocre", "palha", "cor de ouro", "cor de mel"],
    "preto":       ["negro", "escuro", "carvão", "azeviche", "breu", "retinto"],
    "aceitar":     ["concordar", "admitir", "acolher", "consentir", "aprovar", "anuir"],
    "rejeitar":    ["recusar", "repelir", "descartar", "repudiar", "negar", "desconsiderar"],
    "calar":       ["silenciar", "emudecer", "abafar", "suprimir", "conter", "engolir"],
    "ajudar":      ["auxiliar", "socorrer", "amparar", "colaborar", "cooperar", "apoiar"],
    "prejudicar":  ["danificar", "comprometer", "lesar", "arruinar", "atrasar", "sabotar"],
    "roxo":        ["violeta", "púrpura", "lilás", "lavanda", "amatista", "malva"],
    "cinza":       ["acinzentado", "cinzento", "pardo", "fosco", "nebuloso", "apagado"],
    "angustia":    ["tormento", "aflição", "inquietação", "agonia", "sofrimento", "amargura"],
    "ansiedade":   ["nervosismo", "inquietude", "apreensão", "agitação", "tensão", "preocupação"],
    "esperanca":   ["expectativa", "anseio", "otimismo", "fé", "confiança", "perspectiva"],
    "desespero":   ["desalento", "desânimo", "aflição", "agonia", "desolação", "desamparo"],
    "orgulho":     ["brio", "altivez", "vaidade", "soberba", "autoestima", "dignidade"],
    "vergonha":    ["pudor", "rubor", "constrangimento", "humilhação", "vexame", "desonra"],
    "humildade":   ["modéstia", "simplicidade", "mansidão", "abnegação", "despojamento", "discrição"],
    "coragem":     ["bravura", "audácia", "valentia", "ousadia", "determinação", "heroísmo"],
    "sabedoria":   ["prudência", "discernimento", "perspicácia", "senso", "maturidade", "ponderação"],
    "lealdade":    ["fidelidade", "dedicação", "comprometimento", "honradez", "integridade", "confiabilidade"],
    "traicao":     ["perfídia", "felonia", "infidelidade", "deslealdade", "engano", "apostasia"],
    "perdao":      ["indulgência", "clemência", "absolvição", "misericórdia", "magnanimidade", "remissão"],
    "vinganca":    ["retaliação", "represália", "desforra", "desagravo", "punição", "acerto de contas"],
    "liberdade":   ["autonomia", "independência", "emancipação", "alforria", "soberania", "libertação"],
    "paz":         ["tranquilidade", "serenidade", "harmonia", "sossego", "concórdia", "pacificidade"],
    "guerra":      ["conflito", "batalha", "combate", "luta", "contenda", "hostilidade"],
    "raiva":       ["ira", "fúria", "indignação", "revolta", "irritação", "cólera"],
    "saude":       ["bem-estar", "vitalidade", "disposição", "vigor", "sanidade", "integridade física"],
    "doenca":      ["enfermidade", "moléstia", "afecção", "mal", "achaque", "padecimento"],
    "odio":        ["aversão", "repulsa", "animosidade", "rancor", "execração", "aborrecimento profundo"],

    // sentimentos e estados internos
    "curiosidade":  ["interesse", "indagação", "inquisição", "investigação", "desejo de saber", "ânsia"],
    "tédio":        ["enfado", "fastio", "monotonia", "indiferença", "apatia", "marasmo"],
    "inveja":       ["ciúme", "cobiça", "ressentimento", "emulação", "rivalidade", "despeito"],
    "nostalgia":    ["saudade", "melancolia", "evocação", "lembrança", "acalanto", "añoranza"],
    "solidao":      ["isolamento", "reclusão", "abandono", "desolação", "retraimento", "desamparo"],
    "admiracao":    ["estima", "respeito", "reverência", "consideração", "apreço", "louvor"],
    "gratidao":     ["agradecimento", "reconhecimento", "apreço", "obrigação", "grato acolhimento"],
    "compaixao":    ["piedade", "misericórdia", "empatia", "dó", "solidariedade", "condolência"],
    "confusao":     ["desorientação", "perplexidade", "embaraço", "turbação", "caos mental", "barafunda"],
    "entusiasmo":   ["ardor", "fervor", "ânimo", "empolgação", "paixão", "exaltação"],
    "desconfianca": ["suspeita", "ceticismo", "dúvida", "cautela", "descrença", "reserva"],
    "serenidade":   ["calma", "tranquilidade", "sossego", "paz interior", "equanimidade", "placidez"],

    // ações e movimentos
    "fugir":       ["escapar", "evadir", "desertar", "abandonar", "esquivar", "debandou"],
    "lutar":       ["combater", "disputar", "batalhar", "resistir", "contender", "rivalizar"],
    "esperar":     ["aguardar", "antecipar", "aguçar expectativa", "suspirar por", "tolerar a demora"],
    "esconder":    ["ocultar", "encobrir", "disfarçar", "camuflar", "mascarar", "velar"],
    "revelar":     ["descobrir", "desvendar", "expor", "desmascarar", "divulgar", "desvelar"],
    "mudar":       ["transformar", "alterar", "modificar", "adaptar", "renovar", "reformar"],
    "crescer":     ["desenvolver", "expandir", "amadurecer", "evoluir", "progredir", "florescer"],
    "destruir":    ["aniquilar", "demolir", "arruinar", "devastar", "dizimar", "exterminar"],
    "criar":       ["originar", "conceber", "gerar", "produzir", "edificar", "forjar"],
    "conhecer":    ["saber", "reconhecer", "identificar", "aprender", "familiarizar", "inteirar-se"],

    // mais adjetivos e substantivos literários
    "antigo":      ["velho", "arcaico", "pretérito", "remoto", "ancestral", "vetusto"],
    "moderno":     ["atual", "contemporâneo", "recente", "novo", "presente", "hodierno"],
    "sutil":       ["tênue", "discreto", "leve", "imperceptível", "delicado", "refinado"],
    "intenso":     ["forte", "profundo", "veemente", "ardente", "violento", "concentrado"],
    "fragil":      ["delicado", "quebradiço", "vulnerável", "fraco", "tênue", "efêmero"],
    "eterno":      ["infinito", "perpétuo", "imortal", "inabalável", "perene", "imutável"],
    "vago":        ["impreciso", "indefinido", "nebuloso", "ambíguo", "incerto", "difuso"],
    "claro":       ["límpido", "translúcido", "transparente", "nítido", "luminoso", "evidente"],
    "complexo":    ["intrincado", "elaborado", "sofisticado", "profundo", "múltiplo", "difícil"],
    "simples":     ["singelo", "despretensioso", "direto", "básico", "elementar", "puro"],

    // verbos de escrita e pensamento
    "narrar":      ["contar", "relatar", "descrever", "retratar", "registrar", "rememorar"],
    "imaginar":    ["fantasiar", "sonhar", "conceber", "visualizar", "especular", "almejar"],
    "refletir":    ["meditar", "ponderar", "pensar", "considerar", "contemplar", "ruminar"],
    "expressar":   ["manifestar", "revelar", "demonstrar", "exteriorisar", "comunicar", "traduzir"],
    "observar":    ["notar", "perceber", "ver", "contemplar", "registrar", "apreender"],
    "construir":   ["erguer", "edificar", "erigir", "montar", "elaborar", "forjar"],
    "romper":      ["quebrar", "partir", "fragmentar", "violar", "transgredir", "irromper"],
    "atravessar":  ["cruzar", "transpor", "percorrer", "ultrapassar", "vencer", "traspor"],

    // adjetivos de caráter e temperamento
    "corajoso":    ["valente", "audacioso", "intrépido", "destemido", "ousado", "arrojado"],
    "covarde":     ["medroso", "tímido", "fraco", "pusilânime", "apavorado", "receoso"],
    "leal":        ["fiel", "dedicado", "comprometido", "honrado", "confiável", "constante"],
    "traiçoeiro":  ["desleal", "falso", "pérfido", "infiel", "enganador", "traidor"],
    "gentil":      ["amável", "cortês", "educado", "delicado", "bondoso", "atencioso"],
    "cruel":       ["brutal", "implacável", "impiedoso", "sádico", "severo", "feroz"],
    "teimoso":     ["obstinado", "persistente", "cabeça-dura", "pertinaz", "irredutível", "inflexível"],
    "humilde":     ["modesto", "singelo", "despretensioso", "simples", "discreto", "contido"],
    "arrogante":   ["presunçoso", "soberbo", "altivo", "vaidoso", "orgulhoso", "pretensioso"],
    "paciente":    ["sereno", "tolerante", "calmo", "tranquilo", "impassível", "resignado"],

    // substantivos de espaço e ambiente
    "abrigo":      ["refúgio", "acolhida", "proteção", "guarida", "covil", "repouso"],
    "prisao":      ["cárcere", "cadeia", "jaula", "encarceramento", "confinamento", "grilhão"],
    "fronteira":   ["limite", "divisa", "margem", "borda", "perímetro", "demarcação"],
    "labirinto":   ["emaranhado", "confusão", "intrincamento", "amarrado", "desvio", "armadilha"],
    "espelho":     ["reflexo", "imagem", "cópia", "sombra", "eco", "duplo"],

    // sentimentos relacionais
    "ciume":       ["possessividade", "inveja afetiva", "insegurança", "desconfiança", "suspeita", "receio"],
    "saudade":     ["nostalgia", "longing", "ausência sentida", "recordação afetiva", "melancolia doce", "anseio"],
    "abandono":    ["desamparo", "solidão forçada", "isolamento", "rejeição", "orfandade", "descaso"],
    "pertencimento":["identidade", "laço", "vínculo", "enraizamento", "comunidade", "integração"],

    // processos e transformações
    "renascer":    ["ressurgir", "reviver", "reerguer", "brotar de novo", "recomeçar", "reconstituir"],
    "envelhecer":  ["amadurecer", "deteriorar", "marcar", "avançar em anos", "desgastar", "maturar"],
    "cicatrizar":  ["curar", "sarar", "fechar ferida", "superar", "recompor", "restabelecer"],
    "transformar": ["metamorfosear", "converter", "moldar", "reformar", "alterar profundamente", "transmutar"],

    // adjetivos narrativos
    "profundo":    ["denso", "fundo", "intenso", "marcante", "penetrante", "abissal"],
    "superficial": ["raso", "vago", "ligeiro", "frívolo", "sem consistência", "epidérmico"],
    "sombrio":     ["escuro", "lúgubre", "melancólico", "tenebroso", "obscuro", "carregado"],
    "luminoso":    ["claro", "brilhante", "radiante", "iluminado", "fulgente", "resplandecente"],

    // verbos de escrita e narração
    "escrever":    ["redigir", "compor", "traçar", "registrar", "narrar", "relatar", "anotar", "grafar"],
    "ler":         ["decifrar", "percorrer", "devorar", "folhear", "interpretar", "apreciar", "examinar"],
    "contar":      ["narrar", "relatar", "descrever", "expor", "repassar", "comunicar", "transmitir"],
    // adjetivos de intensidade emocional
    "intenso":     ["forte", "profundo", "ardente", "veemente", "apaixonado", "vívido", "agudo", "denso"],
    "fragil":      ["delicado", "fraco", "vulnerável", "tênue", "quebradiço", "efêmero", "sutil", "leve"],
    "sereno":      ["calmo", "tranquilo", "plácido", "quieto", "equilibrado", "pacífico", "suave", "manso"],
    // substantivos do espaço literário
    "limiar":      ["fronteira", "borda", "margem", "início", "passagem", "porta", "umbral", "soleira"],
    "silhueta":    ["contorno", "sombra", "forma", "figura", "perfil", "vulto", "traço", "esboço"],
    "ecos":        ["ressonância", "rumor", "reverberação", "vestígio", "rastro", "traço", "lembrança"],
    // processos narrativos
    "hesitar":     ["duvidar", "vacilar", "titubear", "recuar", "ponderar", "demorar", "tergiversar"],
    "revelar":     ["mostrar", "expor", "descobrir", "desvelar", "divulgar", "confessar", "abrir", "desnudar"],
    "esconder":    ["ocultar", "disfarçar", "encobrir", "suprimir", "abafar", "silenciar", "velar", "calar"],
    "partir":      ["sair", "ir", "deixar", "escapar", "abandonar", "zarpar", "distanciar", "seguir"],
    "chegar":      ["alcançar", "atingir", "aportar", "desembarcar", "comparecer", "surgir", "aparecer"],
    "permanecer":  ["ficar", "continuar", "persistir", "durar", "resistir", "manter", "subsistir", "perdurar"],

    // substantivos de experiência e memória
    "rastro":      ["marca", "vestígio", "traço", "indício", "pista", "sinal", "trilha", "impressão"],
    "eco":         ["ressonância", "reverberação", "reflexo", "rumor", "sombra", "lembrança", "repetição"],
    "ruína":       ["destroço", "resto", "fragmento", "escombro", "vestígio", "decadência", "carcaça"],
    "origem":      ["nascedouro", "berço", "raiz", "começo", "início", "fonte", "princípio", "causa"],
    // verbos de percepção
    "perceber":    ["notar", "sentir", "captar", "detectar", "intuir", "reconhecer", "distinguir", "observar"],
    "imaginar":    ["fantasiar", "sonhar", "supor", "conceber", "inventar", "criar", "presumir", "projetar"],
    "lembrar":     ["recordar", "rememorar", "evocar", "relembrar", "recuperar", "trazer à mente", "reviver"],
    // adjetivos de luz e sombra
    "escuro":      ["sombrio", "tenebroso", "negro", "obscuro", "lúgubre", "opaco", "denso", "nublado"],
    "suave":       ["leve", "macio", "delicado", "tênue", "gentil", "brando", "manso", "discreto"],
    "vivo":        ["animado", "ativo", "vibrante", "exuberante", "pulsante", "intenso", "ardente", "aceso"],
    // verbos de conflito e decisão
    "decidir":     ["resolver", "optar", "escolher", "determinar", "concluir", "assentar", "firmar", "definir"],
    "abandonar":   ["largar", "deixar", "desistir", "ceder", "renunciar", "desamparar", "soltar", "partir"],
    "lutar":       ["combater", "brigar", "disputar", "resistir", "enfrentar", "batalhar", "guerrear", "contender"],
    "vencer":      ["superar", "derrotar", "triunfar", "conquistar", "ganhar", "ultrapassar", "dominar"],
    // estados de personagem
    "perdido":     ["desorientado", "extraviado", "confuso", "sem rumo", "errante", "vagante", "adrift"],
    "forte":       ["poderoso", "robusto", "vigoroso", "resistente", "firme", "sólido", "incansável"],

    // adjetivos de tempo e duração
    "breve":       ["rápido", "curto", "fugaz", "passageiro", "transitório", "efêmero", "momentâneo"],
    "longo":       ["extenso", "demorado", "prolongado", "duradouro", "amplo", "vasto", "distante"],
    "antigo":      ["velho", "arcaico", "ancestral", "remoto", "histórico", "longínquo", "precedente"],
    "recente":     ["novo", "atual", "moderno", "contemporâneo", "fresco", "último", "próximo"],
    // verbos de comunicação e narração
    "gritar":      ["bradar", "berrar", "vociferar", "clamar", "exclamar", "esbravear", "rugir"],
    "sussurrar":   ["murmurar", "cochichar", "segredar", "balbuciar", "soprar", "mussitar"],
    "calar":       ["silenciar", "emudecer", "calar-se", "sufocar", "reprimir", "abafar", "segurar"],
    "mentir":      ["enganar", "iludir", "fabulosear", "fingir", "dissimular", "inventar", "falsear"],
    // adjetivos de caráter moral
    "honesto":     ["íntegro", "leal", "verdadeiro", "transparente", "reto", "justo", "sincero"],
    "covarde":     ["medroso", "tímido", "fraco", "pusilânime", "receoso", "hesitante", "apavorado"],
    // verbos de movimento e espaço
    "escalar":     ["subir", "trepar", "galgar", "alçar", "ascender", "superar", "vencer"],
    "afundar":     ["submergir", "mergulhar", "naufragar", "soçobrar", "ceder", "sucumbir", "imergir"],
    // substantivos de tempo
    "instante":    ["momento", "segundo", "átimo", "fração", "flash", "brevidade", "instantâneo"],
    "eternidade":  ["infinito", "perpetuidade", "permanência", "imortalidade", "sempre", "perene"],
    "amanhecer":   ["aurora", "alvorecer", "madrugada", "alvorada", "raiar", "romper do dia"],
    "anoitecer":   ["crepúsculo", "entardecer", "poente", "pôr do sol", "penumbra", "ocaso"],

    // substantivos de relação social
    "amizade":     ["companheirismo", "fraternidade", "camaradagem", "vínculo", "afinidade", "cumplicidade"],
    "rivalidade":  ["disputa", "concorrência", "competição", "conflito", "animosidade", "antagonismo"],
    "traição":     ["perfídia", "deslealdade", "apostasia", "infidelidade", "quebra de confiança", "virada"],
    "aliança":     ["parceria", "pacto", "acordo", "coalizão", "coalização", "união", "solidariedade"],
    // adjetivos de nível e grau
    "absoluto":    ["total", "completo", "integral", "pleno", "irrestrito", "incondicional", "categórico"],
    "relativo":    ["parcial", "condicionado", "dependente", "comparativo", "proporcional", "contextual"],
    "excessivo":   ["demasiado", "desmedido", "exagerado", "extremo", "desproporcional", "imoderado"],
    "escasso":     ["raro", "parco", "insuficiente", "limitado", "restrito", "deficiente", "exíguo"],
    // verbos de transformação
    "mudar":       ["transformar", "alterar", "modificar", "converter", "revirar", "reformular", "renovar"],
    "crescer":     ["expandir", "desenvolver", "prosperar", "avançar", "progredir", "amadurecer", "evoluir"],
    "cair":        ["despencar", "desabar", "tombar", "ruir", "colapsar", "declinar", "afundar"],
    "construir":   ["edificar", "erguer", "criar", "montar", "estabelecer", "fundar", "arquitetar"],
    // adjetivos de julgamento moral
    "justo":       ["equânime", "imparcial", "correto", "reto", "proporcional", "equilibrado", "equitativo"],
    "injusto":     ["parcial", "desigual", "arbitrário", "desmedido", "tendencioso", "opressivo"],
    "culpado":     ["responsável", "autor", "causador", "réu", "culpável", "incriminado", "punível"],
    "inocente":    ["absolvido", "irrepreensível", "indefeso", "puro", "não culpado", "desculpado"],

    // adjetivos de estado emocional
    "ansioso":     ["inquieto", "preocupado", "agitado", "apreensivo", "angustiado", "nervoso", "tenso"],
    "confiante":   ["seguro", "firme", "decidido", "otimista", "determinado", "tranquilo", "resoluto"],
    "orgulhoso":   ["altivo", "arrogante", "vaidoso", "soberbo", "ufano", "majestoso", "imponente"],
    "arrependido": ["pesaroso", "contrito", "envergonhado", "penitente", "remoroso", "culpado", "aflito"],
    // verbos de julgamento e análise
    "julgar":      ["avaliar", "sentenciar", "condenar", "absolver", "ponderar", "criticar", "examinar"],
    "analisar":    ["examinar", "investigar", "estudar", "avaliar", "dissecar", "interpretar", "decompor"],
    "criticar":    ["censurar", "avaliar", "questionar", "rebater", "confrontar", "questionar", "apontar"],
    // substantivos de ação coletiva
    "rebelião":    ["revolta", "insurgência", "sedição", "levante", "motim", "sublevação", "insurreição"],
    "acordo":      ["pacto", "tratado", "convenção", "contrato", "entendimento", "consenso", "ajuste"],
    "revolução":   ["transformação radical", "virada", "ruptura", "subversão", "mudança estrutural"],
    // adjetivos de posição no espaço
    "central":     ["principal", "fundamental", "nuclear", "essencial", "basilar", "pivô", "axial"],
    "marginal":    ["periférico", "lateral", "secundário", "excluído", "à margem", "externo", "acessório"],
    "distante":    ["afastado", "remoto", "longínquo", "isolado", "separado", "apartado", "longe"],
    "próximo":     ["perto", "vizinho", "adjacente", "imediato", "contíguo", "chegado", "junto"],
    // verbos de mudança de estado
    "endurecer":   ["fortalecer", "solidificar", "firmar", "consolidar", "cimentar", "tornar firme"],
    "suavizar":    ["amolecer", "atenuar", "amenizar", "aliviar", "diminuir", "abrandar", "moderar"],
    "ampliar":     ["expandir", "alargar", "estender", "aumentar", "crescer", "desenvolver", "aprofundar"],
    "reduzir":     ["diminuir", "encurtar", "estreitar", "minimizar", "comprimir", "limitar", "contrair"],

    "magoa":       ["mágoa", "tristeza", "decepção", "ressentimento", "amargura", "rancor", "melancolia"],
    "afeto":       ["carinho", "ternura", "amor", "apego", "afeição", "cuidado", "vínculo"],
    "identidade":  ["personalidade", "essência", "self", "caráter", "pertencimento", "singularidade", "ser"],
    "proposito":   ["propósito", "finalidade", "missão", "razão de ser", "meta", "sentido", "objetivo"],
    "significado": ["sentido", "valor", "importância", "conteúdo", "substância", "essência", "alcance"],
    "valor":       ["importância", "valia", "mérito", "qualidade", "peso", "relevância", "dignidade"],
    "principio":   ["princípio", "fundamento", "regra", "ética", "premissa", "alicerce", "origem"],
    "verdade":     ["realidade", "certeza", "fato", "veracidade", "autenticidade", "transparência", "singeleza"],
    "ilusao":      ["ilusão", "fantasma", "sonho", "miragem", "engano", "aparência", "ficção"],
    "realidade":   ["fato", "verdade", "existência", "concretude", "mundo real", "substância", "certeza"],
    "fantasia":    ["sonho", "imaginação", "devaneio", "utopia", "ilusão", "ficção", "capricho"],
    "paixao":      ["paixão", "arrebatamento", "entusiasmo", "ardor", "fervor", "ímpeto", "intensidade"],
    "indiferenca": ["indiferença", "frieza", "apatia", "desinteresse", "alheamento", "distância", "neutralidade"],
    "compaixao":   ["compaixão", "empatia", "piedade", "solidariedade", "misericórdia", "humanidade", "cuidado"],
    "empatia":     ["compaixão", "compreensão", "identificação", "sensibilidade", "escuta", "presença", "acolhimento"],
    "exclusao":    ["exclusão", "rejeição", "marginalização", "afastamento", "ostracismo", "discriminação", "isolamento"],
    "pertenca":    ["pertença", "pertencimento", "vínculo", "inclusão", "comunidade", "raiz", "identidade"],
    "ausencia":    ["ausência", "vazio", "falta", "lacuna", "silêncio", "solidão", "abandono"],
    "presenca":    ["presença", "existência", "corporalidade", "vitalidade", "atenção", "aura", "peso"],
    "leveza":      ["ligeireza", "suavidade", "graça", "delicadeza", "frivolidade", "agilidade", "translucidez"],
    "densidade":   ["peso", "espessura", "profundidade", "substância", "gravidade", "consistência", "teor"],
    "clareza":     ["nitidez", "luminosidade", "transparência", "precisão", "limpidez", "evidência", "simplicidade"],

    "retratar":    ["descrever", "pintar", "evocar", "representar", "caracterizar", "delinear", "narrar"],
    "evocar":      ["invocar", "rememorar", "trazer à mente", "suscitar", "despertar", "chamar", "ressurgir"],
    "iluminar":    ["clarificar", "esclarecer", "revelar", "elucidar", "mostrar", "expor", "destacar"],
    "obscurecer":  ["esconder", "velar", "turvar", "ofuscar", "encobrir", "sombrar", "escurecer"],
    "atenuar":     ["suavizar", "mitigar", "moderar", "abrandar", "amenuizar", "diminuir", "reduzir"],
    "intensificar":["ampliar", "acirrar", "reforçar", "acentuar", "agudizar", "aprofundar", "elevar"],
    "tensionar":   ["criar tensão", "estressar", "pressionar", "acirrar", "inflamar", "recrudescer", "agravar"],
    "aliviar":     ["suavizar", "amansar", "confortar", "acalmar", "desafogar", "distender", "relaxar"],
    "acelerar":    ["apressar", "agilizar", "precipitar", "antecupar", "intensificar", "abreviar", "urgir"],
    "desacelerar": ["frear", "reduzir", "abrandar", "pausar", "moderar", "retardar", "suavizar"],
    "interromper": ["pausar", "cessar", "suspender", "deter", "quebrar", "truncar", "cortar"],
    "retomar":     ["recomeçar", "reiniciar", "prosseguir", "continuar", "recuperar", "relançar", "reassumir"],
    "iniciar":     ["começar", "lançar", "inaugurar", "estrear", "instaurar", "abrir", "encabeçar"],
    "encerrar":    ["terminar", "concluir", "fechar", "finalizar", "acabar", "cessar", "clausurar"],
    "apresentar":  ["introduzir", "mostrar", "exibir", "revelar", "expor", "anunciar", "trazer"],
    "desenvolver": ["aprofundar", "expandir", "elaborar", "aprimorar", "crescer", "evoluir", "progredir"],
    "resolver":    ["solucionar", "superar", "dirimir", "sanar", "remediar", "desfazer", "concluir"],
    "sugerir":     ["insinuar", "implicar", "indicar", "apontar", "evocar", "remeter", "sinalizar"],
    "direcionar":  ["guiar", "conduzir", "orientar", "apontar", "encaminhar", "dirigir", "nortear"],
    "confundir":   ["embaralhar", "misturar", "complicar", "turvar", "desorientar", "perturbar", "intricar"],
    "esclarecer":  ["explicar", "elucidar", "iluminar", "clarificar", "detalhar", "desenvolver", "expor"],

    "descrever":   ["retratar", "pintar", "evocar", "narrar", "representar", "caracterizar", "delinear"],
    "detalhar":    ["pormenorizar", "especificar", "aprofundar", "esclarecer", "explicitar", "desenvolver", "desdobrar"],
    "contrastar":  ["contrapor", "opor", "distinguir", "diferenciar", "confrontar", "evidenciar diferenças", "comparar por oposição"],
    "inferir":     ["deduzir", "concluir", "supor", "pressupor", "intuir", "presumir", "extrair"],
    "concluir":    ["finalizar", "encerrar", "deduzir", "inferir", "resolver", "fechar", "terminar"],
    "sintetizar":  ["resumir", "condensar", "sistematizar", "compilar", "integrar", "unificar", "aglutinar"],
    "questionar":  ["indagar", "interrogar", "inquirir", "perguntar", "examinar", "problematizar", "contestar"],
    "refutar":     ["contradizer", "rebater", "negar", "desmentir", "contestar", "opor-se", "invalidar"],
    "persuadir":   ["convencer", "influenciar", "seduzir", "aliciar", "converter", "dobrar", "conquistar"],
    "argumentar":  ["defender", "sustentar", "fundamentar", "justificar", "raciocinar", "debater", "pleitear"],
    "lamentar":    ["deplorar", "chorar", "sentir", "sofrer", "prantear", "lastimar", "penar"],
    "protestar":   ["reclamar", "exigir", "insurgir-se", "denunciar", "reivindicar", "clamar", "indagar"],
    "celebrar":    ["comemorar", "festejar", "homenagear", "glorificar", "aclamar", "exaltar", "enaltecer"],
    "confrontar":  ["enfrentar", "desafiar", "opor-se", "resistir", "encarar", "embater", "defrontar"],
    "negociar":    ["acordar", "tratar", "ajustar", "mediar", "transigir", "bargainhar", "pactar"],
    "surpreender": ["espantar", "maravilhar", "chocar", "impressionar", "assustar", "assombrar", "estupefazer"],
    "tranquilizar":["acalmar", "serenar", "confortar", "apaziguar", "aplacar", "aquietar", "sossigar"],
    "cansar":      ["exaurir", "fatigar", "esgotar", "extenuار", "debilitar", "desgastar", "sobrecarregar"],
    "recuperar":   ["restabelecer", "restaurar", "reaviver", "reaver", "renovar", "reconquistar", "curar"],
    "conectar":    ["ligar", "vincular", "unir", "integrar", "associar", "articular", "entrelaçar"],
    "doacao":      ["presente", "oferta", "dádiva", "brinde", "mimo", "generosidade", "presenteio"],
    "recusa":      ["negação", "rejeição", "nã", "exclusão", "repúdio", "negativa", "vetar"],
    "comprometer": ["envolver", "embaraçar", "prejudicar", "vincular", "responsabilizar", "ameaçar", "implicar"],
    "prometer":    ["jurar", "assegurar", "garantir", "comprometer-se", "vow", "afirmar", "declarar"],
    "falhar":      ["errar", "fracassar", "malograr", "decepcionar", "tropeçar", "naufrar", "sucumbir"],
    "errar":       ["falhar", "equivocar-se", "enganar-se", "desacertar", "tropeçar", "desviar", "escorregar"],
    "arrepender":  ["penitenciar-se", "lamentar", "lastimar", "retratar-se", "revoltar-se consigo", "sentir remorso", "voltar atrás"],
    "culpar":      ["acusar", "responsabilizar", "atribuir culpa", "incriminar", "condenar", "imputar", "censurar"],
    "acusar":      ["denunciar", "imputar", "culpar", "responsabilizar", "indiciar", "incriminar", "apontar"],
    "defender":    ["proteger", "amparar", "guardar", "escudar", "resguardar", "justificar", "advogar"],
    "atacar":      ["agredir", "investir", "assaltar", "avançar sobre", "ofender", "fustigar", "confrontar"],
    "restaurar":   ["recuperar", "reabilitar", "reparar", "renovar", "reconstruir", "resgatar", "revitalizar"],
    "renovar":     ["restaurar", "atualizar", "revitalizar", "reformar", "transformar", "regenerar", "ressurgir"],
    "evoluir":     ["progredir", "avançar", "desenvolver-se", "crescer", "transformar-se", "amadurecer", "elevar-se"],
    "regredir":    ["recuar", "voltar atrás", "involuir", "recair", "decair", "retroceder", "piorar"],
    "avançar":     ["progredir", "prosseguir", "ir adiante", "evoluir", "crescer", "ganhar terreno", "seguir em frente"],
    "recuar":      ["retroceder", "regredir", "afastar-se", "ceder", "hesitar", "voltar atrás", "desistir"],
    "diminuir":    ["reduzir", "minguar", "encolher", "atenuar", "decrescer", "abrandar", "comprimir"],
    "aumentar":    ["crescer", "expandir", "ampliar", "acrescer", "elevar", "intensificar", "multiplicar"],
    "expandir":    ["ampliar", "alargar", "estender", "crescer", "difundir", "desenvolver", "propagar"],
    "contrair":    ["reduzir", "diminuir", "encolher", "apertar", "comprimir", "retrair", "encurtar"],
    "prender":     ["capturar", "deter", "aprisionar", "segurar", "acorrentar", "enredar", "engaiolar"],
    "escapar":     ["fugir", "livrar-se", "evadir-se", "desprender-se", "safar-se", "eludir", "esquivar-se"],
    "capturar":    ["prender", "apanhar", "agarrar", "deter", "aprisionar", "fisgar", "arrebatar"],
    "ignorar":     ["desconsiderar", "desprezar", "negligenciar", "fingir não ver", "desrespeitar", "omitir", "passar por cima"],
    "negar":       ["recusar", "refutar", "contradizer", "rebater", "desmentir", "rejeitar", "contestar"],

    "gemer":       ["lamentar", "choramingar", "gemer de dor", "suspirar fundo", "arquejar", "ganir", "carpir"],
    "escutar":     ["ouvir", "prestar atenção", "auscultar", "perceber", "captar", "atentar", "acolher"],
    "contemplar":  ["observar", "admirar", "mirar", "olhar fixo", "meditar", "ponderar", "apreciar"],
    "perseguir":   ["caçar", "seguir", "rastrear", "cercar", "rondar", "assediar", "encalçar"],
    "descobrir":   ["revelar", "desvendar", "encontrar", "iluminar", "expor", "desmascarar", "achar"],
    "explorar":    ["investigar", "sondar", "vasculhar", "perscrutar", "mapear", "desbavar", "percorrer"],
    "alcançar":    ["atingir", "chegar", "obter", "conquistar", "lograr", "conseguir", "alcançar a meta"],
    "fracasso":    ["derrota", "malogro", "insucesso", "falha", "fiasco", "ruína", "colapso"],
    "vitória":     ["triunfo", "conquista", "êxito", "glória", "sucesso", "feito", "proeza"],
    "jornada":     ["caminho", "travessia", "percurso", "viagem", "trecho", "etapa", "trajeto"],
    "acaso":       ["sorte", "acidente", "casualidade", "contingência", "fortuna", "ventura", "imprevisto"],
    "ruído":       ["barulho", "som", "estrondo", "eco", "fragor", "rumor", "estardalhaço"],
    "movimento":   ["gesto", "ação", "deslocamento", "impulso", "dinâmica", "atividade", "mobilização"],
    "pausa":       ["silêncio", "intervalo", "interrupção", "suspensão", "cesura", "descanso", "hiato"],
    "equilibrio":  ["equilíbrio", "balança", "harmonia", "estabilidade", "equanimidade", "compensação", "proporção"],
    "caos":        ["desordem", "confusão", "tumulto", "anarquia", "turbulência", "bagunça", "entropia"],
    "ordem":       ["organização", "disciplina", "estrutura", "regra", "norma", "harmonia", "arranjo"],
    "prisao":      ["cárcere", "cativeiro", "confinamento", "clausura", "grilhão", "jaula", "catacumbas"],
    "fraqueza":    ["fragilidade", "impotência", "debilidade", "vulnerabilidade", "falha", "lacuna", "deficiência"],
    "forca":       ["força", "vigor", "potência", "energia", "poder", "robustez", "determinação"],

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
