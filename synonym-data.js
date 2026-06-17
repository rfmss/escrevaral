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
