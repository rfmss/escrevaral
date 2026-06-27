// synonym-data.js — extraído do Dicionário de Sinônimos (Antenor Nascentes, 4ª ed.) + conhecimento literário PT-BR
// Entradas marcadas "(est)" foram estimadas por conhecimento linguístico quando o verbete não constava no PDF

(function(global) {

  const SINONIMOS = {

    // vencendo distância; Marchar é andar compassadamente"
    "andar":    ["caminhar", "marchar", "percorrer", "passear", "deambular", "vaguear"],

    // palavras; Falar é exprimir pela voz; Proferir é pronunciar em voz alta"
    "falar":    ["dizer", "proferir", "pronunciar", "enunciar", "articular", "declarar"],

    // Nascentes: mesma entrada que falar
    "dizer":    ["falar", "proferir", "declarar", "afirmar", "enunciar", "pronunciar"],

    // distinguir claramente; Lobrigar é ver com dificuldade"
    "olhar":    ["avistar", "enxergar", "observar", "contemplar", "fitar", "lobrigar"],

    // Escoar-se é passar lentamente; Dimanar é brotar serenamente"
    "correr":    ["acelerar", "disparar", "precipitar-se", "arremeter", "galgar", "desfilar"],

    // Nascentes: "Caminhar é ir vencendo distância, aproximando-se do termo"
    "caminhar":    ["andar", "trilhar", "percorrer", "marchar", "trafegar", "palmilhar"],

    // Exausto é esgotado de forças; Extenuado é enfraquecido ao extremo"
    "cansado":    ["exausto", "fatigado", "esgotado", "abatido", "estafado", "desfalecido"],

    // Nascentes: mesma entrada que olhar
    "ver":    ["observar", "enxergar", "contemplar", "avistar", "distinguir", "presenciar"],

    // Sentir é apontar o sentido, penetrar o íntimo"
    "sentir":    ["perceber", "experimentar", "pressentir", "intuir", "notar", "captar", "vivenciar", "tocar por dentro", "acusar", "ser afetado por"],

    // pensar com base em argumento; Pensar é cogitar"
    "pensar":    ["refletir", "ponderar", "cogitar", "meditar", "raciocinar", "imaginar"],

    // est — não localizado como verbete; saber no sentido de conhecer/entender
    "saber":    ["conhecer", "compreender", "dominar", "entender", "reconhecer", "perceber"],

    // quem deseja depende da vontade alheia"
    "querer":    ["desejar", "almejar", "ansiar", "pretender", "aspirar", "cobiçar"],

    // est — poder como verbete de ação
    "poder":    ["conseguir", "lograr", "ser capaz", "ter condições", "facultar", "ser possível"],

    // Realizar é tornar real"
    "fazer":    ["realizar", "executar", "efetuar", "cumprir", "elaborar", "concretizar"],

    // Nascentes: "Vir" — não encontrado como verbete direto; est
    "vir":    ["chegar", "aproximar-se", "advir", "sobrevir", "comparecer", "acorrer"],

    // est
    "ir":    ["partir", "dirigir-se", "encaminhar-se", "rumar", "deslocar-se", "seguir"],

    // Chegar indica o fato de aproximar-se terminado o percurso"
    "chegar":    ["alcançar", "atingir", "aportar", "desembarcar", "comparecer", "surgir", "aparecer"],

    // est — sair como verbete
    "sair":    ["partir", "retirar-se", "ausentar-se", "evadir", "evadir-se", "desertar"],

    // Nascentes: "Entrar é ir para dentro; Penetrar é entrar profundamente"
    "entrar":    ["adentrar", "penetrar", "ingressar", "introduzir-se", "transpor", "aceder"],

    // est — ficar no sentido de permanecer
    "ficar":    ["permanecer", "demorar-se", "remanecer", "pousar", "instalar-se", "manter-se"],

    // Retornar é o mesmo que voltar; Volver é literário"
    "voltar":    ["regressar", "retornar", "retroceder", "recuar", "volver", "reaparecer"],

    // erudita; Principiar é dar princípio"
    "começar":    ["iniciar", "principiar", "encetar", "estrear", "inaugurar", "desencadear"],

    // pôr termo ao que tem de cessar; Ultimar é chegar ao termo de coisa começada"
    "terminar":    ["concluir", "finalizar", "encerrar", "rematar", "ultimar", "acabar"],

    // esforço; Evocar é fazer presente na lembrança"
    "lembrar":    ["recordar", "rememorar", "evocar", "relembrar", "recuperar", "trazer à mente", "reviver"],

    // Nascentes: "Esquecer e Olvidar: perder da memória; Olvidar é literário"
    "esquecer":    ["olvidar", "apagar", "suprimir", "negligenciar", "perder", "deixar escapar"],

    // amar como ídolo; Venerar é render culto de profundo respeito"
    "amar":    ["adorar", "querer", "venerar", "idolatrar", "estimar", "prezar"],

    // Detestar é protestar; Execrar é afastar com indignação; Odiar é o mais genérico"
    "odiar":    ["detestar", "abominar", "desprezar", "aborrecer", "repudiar", "execrar"],

    // Lamentar é queixar-se com prantos; Soluçar é chorar em soluços"
    "chorar":    ["lagrimar", "soluçar", "lamentar", "carpir-se", "prantear", "gemer"],

    // est — não encontrado como verbete; rir no sentido geral
    "rir":    ["sorrir", "gargalhar", "cachinar", "escangalhar-se", "dar risada", "zombar"],

    // Fenecer é chegar ao fim natural; Finar-se é findar-se"
    "morrer":    ["falecer", "perecer", "sucumbir", "extinguir-se", "expirar", "finar-se"],

    // est — nascer; brotar, desabrochar usados em sentido figurado na ficção
    "nascer":    ["surgir", "brotar", "emergir", "vir ao mundo", "originar-se", "germinar"],

    // Crescer é avolumar-se por forças interiores"
    "crescer":    ["expandir", "desenvolver", "prosperar", "avançar", "progredir", "amadurecer", "evoluir"],

    // Cair é o mais genérico; Desabar é cair com fracasso; Tombar é cair de comprido"
    "cair":    ["despencar", "desabar", "tombar", "ruir", "colapsar", "declinar", "afundar"],

    // est — levantar não encontrado como verbete direto
    "levantar":    ["erguer", "elevar", "alçar", "içar", "soerguer", "erigir"],

    // longe; Clamor é brado de quem se queixa ou pede socorro"
    "gritar":    ["bradar", "berrar", "vociferar", "clamar", "exclamar", "esbravear", "rugir", "chiar"],

    // est — sussurrar não consta no dicionário
    "sussurrar":    ["murmurar", "cochichar", "segredar", "balbuciar", "soprar", "mussitar"],

    // Tocar é chegar pondo-se em contato"
    "tocar":    ["apalpar", "tatear", "roçar", "tanger", "afagar", "tangenciar"],

    // Segurar é prender de modo que não fuja"
    "pegar":    ["agarrar", "segurar", "capturar", "apanhar", "empunhar", "apoderar-se de"],

    // Desprender é tirar o que está prendendo; Soltar é deixar livre"
    "soltar":    ["libertar", "desprend er", "desatar", "largar", "liberar", "desligar"],

    // est — abrir não encontrado como verbete de ação direta
    "abrir":    ["escancarar", "entreabrir", "destapar", "descerrar", "romper", "rasgar"],

    // est — fechar não encontrado como verbete direto
    "fechar":    ["cerrar", "encerrar", "trancar", "clausurar", "vedar", "selar"],

    // Nascentes: "Belo, Bonito, Formoso, Gentil, Lindo, Pulcro"
    "belo":    ["formoso", "bonito", "lindo", "gracioso", "gentil", "pulcro"],

    // est — feio não encontrado como verbete, mas hediondo, disforme usados no texto
    "feio":    ["horrendo", "horroroso", "disforme", "monstruoso", "repulsivo", "repelente"],

    // Nascentes: "Grande, Imane, Ingente, Magno — Grande é o mais genérico"
    "grande":    ["imenso", "vasto", "gigantesco", "amplo", "colossal", "majestoso"],

    // est
    "pequeno":    ["diminuto", "minúsculo", "ínfimo", "miúdo", "exíguo", "reduzido"],

    // maior que a média"
    "forte":    ["poderoso", "robusto", "vigoroso", "resistente", "firme", "sólido", "incansável"],

    // est — fraco; débil, lânguido aparecem no texto mas não como verbete de fraco
    "fraco":    ["débil", "frágil", "delicado", "enfraquecido", "vulnerável", "impotente"],

    // exclusivamente à idade avançada; Ancião é o velho venerável"
    "velho":    ["antigo", "ancião", "envelhecido", "decrépito", "caduco", "remoto"],

    // é acontecido há pouco"
    "novo":    ["recente", "jovem", "novel", "fresco", "moderno", "contemporâneo"],

    // Tristonho — Melancólico é triste, calmo, cismador; Macambúzio é triste carrancudo"
    "triste":    ["melancólico", "macambúzio", "sorumbático", "tristonho", "abatido", "pesaroso"],

    // Álacre é alegre com vivacidade; Ledo é literário"
    "alegre":    ["contente", "jubiloso", "exultante", "álacre", "jovial", "ledo"],

    // Assustar é meter um susto; Apavorar é infundir pavor"
    "assustado":    ["amedrontado", "apavorado", "atemorizado", "horrorizado", "espavorido", "aterrorizado"],

    // Nascentes: "Só, Sozinho — Sozinho tem elemento afetivo de tristeza ou compaixão"
    "sozinho":    ["solitário", "isolado", "só", "desamparado", "abandonado", "único"],

    // est — calmo; no texto: "calmo, sereno, moderado" associados a prudente/sisudo
    "calmo":    ["sereno", "tranquilo", "plácido", "pacato", "imperturbável", "equânime"],

    // est — agitado como adjetivo
    "agitado":    ["inquieto", "turbulento", "convulsionado", "perturbado", "febril", "irrequieto"],

    // Nascentes: "Escuro, Obscuro — Escuro é mais material; Obscuro é mais figurado"
    "escuro":    ["sombrio", "tenebroso", "negro", "obscuro", "lúgubre", "opaco", "denso", "nublado"],

    // determina o assentimento; Manifesto não tem nada que o oculte"
    "claro":    ["límpido", "translúcido", "transparente", "nítido", "luminoso", "evidente"],

    // Gélido é muito frio; Glacial é frio como gelo"
    "frio":    ["gelado", "gélido", "glacial", "frígido", "álgido", "enregelado"],

    // Ardente é o muito quente; Tórrido implica calor extremo"
    "quente":    ["ardente", "abrasador", "tórrido", "cálido", "escaldante", "candente"],

    // falar; Taciturno é reservado por natureza; Silente é literário"
    "silencioso":    ["calado", "mudo", "taciturno", "silente", "quieto", "insonoro"],

    // est — barulhento não consta
    "barulhento":    ["ruidoso", "estrondoso", "tumultuoso", "vociferante", "estardalhaçante", "clamoso"],

    // Macio é agradável ao tato; Tenro é o que se deixa amolecer"
    "suave":    ["leve", "macio", "delicado", "tênue", "gentil", "brando", "manso", "discreto"],

    // tem superfície rugosa ou temperamento rude"
    "áspero":    ["rude", "acre", "acerbo", "rugoso", "escabroso", "ríspido"],

    // natureza anda com vagar; Moroso é o muito demorado"
    "rápido":    ["veloz", "ligeiro", "ágil", "célere", "expedito", "arrojado"],

    // Nascentes: mesma entrada que rápido
    "lento":    ["vagaroso", "moroso", "pausado", "cadenciado", "gradual", "arrastado"],

    // de bens bastantes; Opulento tem riqueza exuberante"
    "rico":    ["abastado", "opulento", "endinheirado", "próspero", "milionário", "remediado"],

    // Mendigo pede esmola"
    "pobre":    ["indigente", "miserável", "necessitado", "carente", "desprovido", "humilde"],

    // Ternura — Amor é o sentimento mais profundo e duradouro"
    "amor":    ["afeição", "paixão", "afeto", "ternura", "devoção", "apego"],

    // espírito faz presente; Temor é o perigo provável"
    "medo":    ["pavor", "terror", "temor", "pânico", "susto", "apreensão"],

    // Nascentes: "Calado, Mudo, Silencioso, Silente, Taciturno" (entrada conexa)
    "silêncio":    ["quietude", "mutismo", "calmaria", "inércia", "sossegow", "paz"],

    // est
    "tempo":    ["instante", "momento", "época", "era", "período", "duração"],

    // Nascentes: "Biografia, Vida — Como títulos: Vida se aplica a grandes homens"
    "vida":    ["existência", "vivência", "trajetória", "percurso", "biografia", "porvir"],

    // Morte é a cessação da vida; Óbito é o termo documental; Passamento é literário"
    "morte":    ["falecimento", "óbito", "passamento", "fim", "traspasse", "extinção"],

    // Nascentes: "Lume, Luz — Lume serve para cozinhar/aquecer; Luz serve para alumiar"
    "luz":    ["claridade", "brilho", "luminosidade", "fulgor", "radiance", "clarão"],

    // Visão — Sombra é a parte imaterial quanto manifesta à visão"
    "sombra":    ["escuridão", "penumbra", "trevas", "negrume", "obscuridade", "breu"],

    // brando; Aura é vento brando e sussurrante; Brisa é mais forte; Zéfiro é literário"
    "vento":    ["brisa", "rajada", "ventania", "sopro", "aragem", "furacão"],

    // est — chuva não encontrada como verbete sinonímico
    "chuva":    ["chuva", "chuvarada", "aguaceiro", "garoa", "chuvisco", "temporal", "dilúvio"],

    // est
    "terra":    ["chão", "solo", "terreno", "húmus", "torrão", "pátria"],
    "mar":    ["oceano", "águas", "ondas", "largo", "abismo", "profundo", "onda", "água salgada", "imensidão azul"],
    "casa":    ["lar", "morada", "habitação", "domicílio", "abrigo", "teto"],

    // com mais arte; Senda é caminho estreito; Trilha é rastro; Vereda é pequeno caminho"
    "caminho":    ["vereda", "senda", "trilha", "estrada", "rota", "via"],

    // est — noite
    "noite":    ["escuridão", "trevas", "crepúsculo", "madrugada", "negrume", "lusco-fusco"],

    // est
    "dia":    ["aurora", "amanhecer", "alvorada", "jornada", "claridade", "manhã"],
    "olhos":    ["olhar", "vista", "visão", "mirada", "pupilas", "órbitas"],
    "mãos":    ["palmas", "dedos", "punhos", "garras", "mãozinhas", "dedilhares"],

    // de uma ideia; Termo é palavra técnica; Vocábulo é o conjunto de sons articulados"
    "voz":    ["timbre", "tom", "entonação", "sonoridade", "acento", "dicção"],

    // Nascentes: mesma entrada que voz/palavra
    "palavra":    ["vocábulo", "termo", "expressão", "locução", "dicção", "verbo"],

    // livre sem peias"
    "sonho":    ["devaneio", "fantasia", "visão", "quimera", "ilusão", "imaginação"],

    // é a parte interior que representa a sede da vida, do sentimento"
    "coração":    ["âmago", "cerne", "íntimo", "entranhas", "peito", "alma"],

    // est
    "também":    ["igualmente", "outrossim", "ademais", "de igual modo", "da mesma forma", "bem como"],

    // Nascentes: "Ainda, Inda — A segunda é poética e popular"
    "ainda":    ["inda", "mesmo assim", "até agora", "por ora", "de toda forma", "até o momento"],

    // est
    "já":    ["agora", "logo", "imediatamente", "de imediato", "neste instante", "desde já"],
    "apenas":    ["somente", "só", "exclusivamente", "unicamente", "tão somente", "simplesmente"],

    // Nascentes: "Quiçá, Talvez — Quiçá denota possibilidade; hoje é literário/pedante"
    "talvez":    ["quiçá", "porventura", "possivelmente", "eventualmente", "acaso", "quem sabe"],

    // ser ainda hoje, amanhã"
    "logo":    ["imediatamente", "depois", "brevemente", "em seguida", "prontamente", "já"],

    // Nascentes: "Continuamente, Sempre — Sempre, em tempo e ocasião oportuna"
    "sempre":    ["continuamente", "constantemente", "eternamente", "invariavelmente", "incessantemente", "sem cessar"],

    // Nascentes: "Jamais, Nunca — Jamais reforça o nunca com ideia de tempo passado"
    "nunca":    ["jamais", "em tempo algum", "de forma alguma", "nunca mais", "em nenhum caso", "de jeito nenhum"],

    // est
    "assim":    ["desse modo", "dessa maneira", "por isso", "portanto", "logo", "conseguintemente"],
    "então":    ["portanto", "logo", "assim sendo", "nesse caso", "por conseguinte", "pois"],
    "portanto":    ["logo", "por isso", "assim", "consequentemente", "por conseguinte", "destarte"],
    "escrever":    ["redigir", "compor", "traçar", "registrar", "narrar", "relatar", "anotar", "grafar"],

    // Nascentes: "Criar é tirar do nada; Inventar é fazer o que não existia por combinação"
    "criar":    ["originar", "conceber", "gerar", "produzir", "edificar", "forjar"],

    // est
    "partir":    ["sair", "ir", "deixar", "escapar", "abandonar", "zarpar", "distanciar", "seguir"],
    "esperar":    ["aguardar", "antecipar", "aguçar expectativa", "suspirar por", "tolerar a demora"],

    // Nascentes: "Padecer é sofrer doenças; Pena é dor moral; Sofrer é mais geral"
    "sofrer":    ["padecer", "suportar", "aguentar", "tolerar", "penar", "sentir"],

    // est
    "lutar":    ["combater", "brigar", "disputar", "resistir", "enfrentar", "batalhar", "guerrear", "contender"],
    "acordar":    ["despertar", "erguer-se", "levantar", "animar-se", "sair do sono", "abrir os olhos"],

    // Nascentes: "Sonhar é experimentar sonhos; Fantasiar é criar imagens voluntárias"
    "sonhar":    ["fantasiar", "imaginar", "alucinar", "devanear", "cismar", "divagar"],

    // est
    "transformar":    ["metamorfosear", "converter", "moldar", "reformar", "alterar profundamente", "transmutar"],
    "revelar":    ["mostrar", "expor", "descobrir", "desvelar", "divulgar", "confessar", "abrir", "desnudar"],
    "esconder":    ["ocultar", "disfarçar", "encobrir", "suprimir", "abafar", "silenciar", "velar", "calar"],
    "resistir":    ["aguentar", "suportar", "enfrentar", "opor-se", "persistir", "insistir"],

    // Nascentes: "Corpo é a totalidade do ser físico; Carne é a parte mole"
    "corpo":    ["carne", "físico", "organismo", "ser", "tronco", "invólucro"],

    // est
    "cidade":    ["metrópole", "capital", "burgo", "município", "urbes", "centro urbano"],
    "floresta":    ["mata", "selva", "bosque", "mato", "arvoredo", "capoeira", "brenha", "mato fechado", "bosque denso"],
    "memória":    ["lembrança", "recordação", "reminiscência", "evocação", "retentiva", "saudade"],

    // Nascentes: "Fogo é o fenômeno em geral; Chama é a língua de fogo; Brasa é o carvão aceso"
    "fogo":    ["chama", "brasa", "labareda", "incêndio", "faísca", "lume"],

    // est
    "perder":    ["extraviar", "desperdiçar", "privar-se de", "sumir com", "desaparecer com", "desfazer-se de"],

    // Nascentes: "Achar é encontrar por acaso; Descobrir é encontrar o que estava oculto"
    "encontrar":    ["achar", "deparar-se com", "topar com", "descobrir", "localizar", "deparar"],

    // est
    "fugir":    ["escapar", "evadir", "desertar", "abandonar", "esquivar", "debandou"],
    "procurar":    ["buscar", "pesquisar", "investigar", "rastrear", "perscrutar", "explorar"],

    // Nascentes: "Contar é narrar enumerando; Narrar é expor fatos em sequência; Relatar é fazer relato"
    "contar":    ["narrar", "relatar", "descrever", "expor", "repassar", "comunicar", "transmitir"],

    // est
    "perdido":    ["desorientado", "extraviado", "confuso", "sem rumo", "errante", "vagante", "adrift"],

    // Nascentes: "Fundo é o mais material; Profundo indica grande extensão ou intensidade"
    "profundo":    ["denso", "fundo", "intenso", "marcante", "penetrante", "abissal", "que vai ao essencial", "que não fica na superfície"],

    // est
    "secreto":    ["oculto", "clandestino", "sigiloso", "velado", "encoberto", "misterioso"],

    // Nascentes: "Dor, Pena, Sofrimento — Dor é o sofrimento físico ou moral intenso; Pena é dor moral"
    "dor":    ["sofrimento", "pena", "padecimento", "angústia", "tormento", "suplício"],

    // est
    "esperança":    ["expectativa", "anseio", "alento", "perspectiva", "fé", "aspiração"],

    // Nascentes: conexa com "só" — solidão implica ausência sentida de companhia
    "solidão":    ["isolamento", "abandono", "reclusão", "desamparo", "desolação", "separação", "estar-se só", "desamparo íntimo", "presença do vazio", "solidão de multidão"],

    // Nascentes: "Destino, Fado, Sina — Fado é o destino fatal; Sina é destino marcado no nascimento"
    "destino":    ["fado", "sorte", "sina", "providência", "rumo", "porvir"],

    // est
    "povo":    ["gente", "população", "multidão", "comunidade", "nação", "coletividade"],
    "temer":    ["recear", "trepidiar", "horrorizar-se", "apavorar-se", "tremer", "pressentir"],
    "ler":    ["decifrar", "percorrer", "devorar", "folhear", "interpretar", "apreciar", "examinar"],
    "construir":    ["edificar", "erguer", "criar", "montar", "estabelecer", "fundar", "arquitetar"],
    "destruir":    ["aniquilar", "demolir", "arruinar", "devastar", "dizimar", "exterminar"],
    "mudar":    ["transformar", "alterar", "modificar", "converter", "revirar", "reformular", "renovar"],
    "aprender":    ["apreender", "assimilar", "absorver", "captar", "estudar", "instruir-se"],
    "ensinar":    ["instruir", "educar", "lecionar", "doutrinar", "orientar", "iluminar"],
    "dormir":    ["repousar", "descansar", "adormecer", "cochilar", "jazer", "hibernar"],
    "feliz":    ["alegre", "contente", "radiante", "satisfeito", "jubiloso", "afortunado"],
    "livre":    ["solto", "liberto", "independente", "desimpedido", "autônomo", "desatado"],
    "ódio":    ["aversão", "rancor", "hostilidade", "repulsa", "ira", "animosidade"],
    "alegria":    ["contentamento", "júbilo", "felicidade", "prazer", "satisfação", "euforia"],
    "tristeza":    ["melancolia", "pesar", "mágoa", "angústia", "abatimento", "lamento"],
    "mundo":    ["terra", "universo", "cosmos", "orbe", "globo", "humanidade"],
    "céu":    ["firmamento", "abóbada", "éter", "azul", "empíreo", "infinito"],
    "erguer":    ["levantar", "alçar", "içar", "elevar", "soerguer", "enrijecer"],

    // Nascentes: "Dar é entregar voluntariamente; Oferecer é apresentar para que se aceite"
    "dar":    ["oferecer", "entregar", "conceder", "outorgar", "ceder", "presentear"],

    // est
    "tomar":    ["pegar", "apanhar", "agarrar", "apropriar-se", "colher", "receber"],
    "pedir":    ["solicitar", "requisitar", "rogar", "implorar", "suplicar", "reclamar"],

    // Nascentes: "Existir é o mais geral; Viver é existir com vida; Subsistir é persistir na existência"
    "viver":    ["existir", "subsistir", "habitar", "residir", "permanecer", "durar"],

    // est
    "sangue":    ["gore", "hemoglobina", "veias", "vida", "linhagem", "corrente"],
    "acreditar":    ["crer", "confiar", "supor", "presumir", "admitir", "convencer-se"],
    "duvidar":    ["questionar", "desconfiar", "suspeitar", "hesitar", "vaciar", "ponderar"],
    "perceber":    ["notar", "sentir", "captar", "detectar", "intuir", "reconhecer", "distinguir", "observar"],
    "trair":    ["enganar", "ludibriar", "iludir", "tramar", "conspirar", "abandonar", "atraiçoar", "vender", "falsear a confiança", "ferir pelas costas"],
    "perdoar":    ["absolver", "relevar", "desculpar", "remir", "compadecer-se", "reconciliar"],
    "abandonar":    ["largar", "deixar", "desistir", "ceder", "renunciar", "desamparar", "soltar", "partir"],
    "proteger":    ["amparar", "defender", "guardar", "resguardar", "abrigar", "velar"],
    "corajoso":    ["valente", "audacioso", "intrépido", "destemido", "ousado", "arrojado", "que age apesar do medo", "bravo"],
    "covarde":    ["medroso", "tímido", "fraco", "pusilânime", "receoso", "hesitante", "apavorado", "sem coragem", "que recua diante do perigo", "frouxo"],
    "cruel":    ["brutal", "implacável", "impiedoso", "sádico", "severo", "feroz"],
    "gentil":    ["amável", "cortês", "educado", "delicado", "bondoso", "atencioso"],
    "orgulhoso":    ["altivo", "arrogante", "vaidoso", "soberbo", "ufano", "majestoso", "imponente", "soberbo quando excessivo", "que não se curva fácil", "de postura alta"],
    "humilde":    ["modesto", "singelo", "despretensioso", "simples", "discreto", "contido"],
    "fiel":    ["leal", "devotado", "comprometido", "honesto", "constante", "dedicado"],
    "ouvir":    ["escutar", "perceber", "captar", "auscultar", "distinguir", "notar"],
    "parar":    ["cessar", "deter", "interromper", "suspender", "imobilizar", "estancar"],
    "subir":    ["escalar", "ascender", "galgar", "trepar", "alçar-se", "elevar-se"],
    "descer":    ["declinar", "baixar", "abaixar-se", "cair", "deslizar", "arribar"],
    "perguntar":    ["questionar", "indagar", "inquirir", "interrogar", "consultar", "interpelar"],
    "responder":    ["replicar", "retrucar", "ripostar", "contra-argumentar", "contestar", "retornar"],
    "chamar":    ["invocar", "convocar", "nomear", "apelidar", "intitular", "designar"],
    "estranho":    ["bizarro", "incomum", "inusitado", "singular", "peculiar", "excêntrico"],
    "bonito":    ["belo", "formoso", "gracioso", "atraente", "esplêndido", "encantador"],
    "julgar":    ["avaliar", "sentenciar", "condenar", "absolver", "ponderar", "criticar", "examinar"],
    "criticar":    ["censurar", "avaliar", "questionar", "rebater", "confrontar", "apontar"],
    "elogiar":    ["louvar", "enaltecer", "exaltar", "aplaudir", "encomiar", "valorizar"],
    "comparar":    ["confrontar", "cotejar", "contrastar", "equiparar", "ponderar", "medir"],
    "escolher":    ["selecionar", "optar", "preferir", "eleger", "designar", "adotar"],
    "recusar":    ["rejeitar", "negar", "declinar", "repudiar", "excluir", "vetar"],
    "salvar":    ["resgatar", "preservar", "libertar", "proteger", "recuperar", "livrar"],
    "sorrir":    ["esboçar", "reluzir", "acolher", "abrir-se", "desabrochar", "iluminar-se"],
    "suspirar":    ["exalar", "respirar", "gemer", "fungar", "soprar", "assoar"],
    "tremer":    ["estremecer", "tiritar", "vibrar", "sacudir", "palpitar", "trepidiar"],
    "buscar":    ["procurar", "pesquisar", "rastrear", "farejar", "perscrutar", "investigar"],
    "cuidar":    ["zelar", "preservar", "velar", "nutrir", "guardar", "dedicar-se"],
    "preso":    ["detido", "aprisionado", "cativo", "encarcerado", "acorrentado", "confinado"],
    "vivo":    ["animado", "ativo", "vibrante", "exuberante", "pulsante", "intenso", "ardente", "aceso"],
    "envelhecer":    ["amadurecer", "deteriorar", "marcar", "avançar em anos", "desgastar", "maturar"],
    "mostrar":    ["exibir", "expor", "apresentar", "demonstrar", "evidenciar", "externalizar"],
    "ocultar":    ["encobrir", "camuflar", "dissimular", "velar", "mascarar", "suprimir"],
    "mentir":    ["enganar", "iludir", "fabulosear", "fingir", "dissimular", "inventar", "falsear"],
    "confessar":    ["admitir", "reconhecer", "revelar", "assumir", "declarar", "desabafar"],
    "antigo":    ["velho", "arcaico", "ancestral", "remoto", "histórico", "longínquo", "precedente"],
    "jovem":    ["novo", "moço", "juvenil", "adolescente", "imaturo", "incipiente"],
    "idoso":    ["ancião", "grisalho", "envelhecido", "maduro", "experiente", "venerável"],
    "simples":    ["singelo", "despretensioso", "direto", "básico", "elementar", "puro"],
    "complexo":    ["intrincado", "elaborado", "sofisticado", "profundo", "múltiplo", "difícil"],
    "verdadeiro":    ["autêntico", "genuíno", "legítimo", "real", "fiel", "concreto"],
    "falso":    ["fingido", "ilusório", "enganoso", "dissimulado", "aparente", "fictício"],
    "justo":    ["equânime", "imparcial", "correto", "reto", "proporcional", "equilibrado", "equitativo"],
    "injusto":    ["parcial", "desigual", "arbitrário", "desmedido", "tendencioso", "opressivo"],
    "seguro":    ["protegido", "resguardado", "abrigado", "garantido", "estável", "firme"],
    "perigoso":    ["arriscado", "ameaçador", "temerário", "mortal", "instável", "fatal"],
    "infeliz":    ["triste", "desgraçado", "azarado", "infortunado", "desafortunado", "aflito"],
    "branco":    ["alvo", "lívido", "pálido", "cândido", "imaculado", "lácteo"],
    "negro":    ["escuro", "retinto", "azeviche", "sombrio", "ébano", "tenebroso"],
    "ceder":    ["recuar", "capitular", "render-se", "dobrar-se", "abdicar", "resignar-se", "abrir mão", "entregar"],
    "confiar":    ["fiar-se", "acreditar", "apostar", "delegar", "entregar-se", "depositar fé"],
    "desistir":    ["abandonar", "largar", "renunciar", "recuar", "prescindir", "abdicar"],
    "tentar":    ["experimentar", "arriscar", "ousar", "aventurar-se", "ensaiar", "provar"],
    "conseguir":    ["obter", "alcançar", "lograr", "conquistar", "realizar", "granjear"],
    "intenso":    ["forte", "profundo", "ardente", "veemente", "apaixonado", "vívido", "agudo", "denso"],
    "calado":    ["silencioso", "quieto", "mudo", "reservado", "reticente", "taciturno"],
    "libertar":    ["soltar", "desamarrar", "emancipar", "alforriar", "desencadear", "eximir"],
    "vencer":    ["superar", "derrotar", "triunfar", "conquistar", "ganhar", "ultrapassar", "dominar"],
    "guardar":    ["conservar", "preservar", "zelar", "manter", "resguardar", "proteger"],
    "roubar":    ["surrupiar", "furtar", "subtrair", "extorquir", "pilhar", "desviar"],
    "aberto":    ["escancarado", "descerrado", "desimpedido", "franco", "expansivo"],
    "fechado":    ["trancado", "cerrado", "vedado", "lacrado", "hermético", "clausurado"],
    "cheio":    ["repleto", "lotado", "saturado", "transbordante", "recheado", "carregado"],
    "vazio":    ["oco", "esvaziado", "desprovido", "desolado", "árido", "destituído"],
    "limpo":    ["imaculado", "asseado", "higienizado", "nítido", "puro", "impecável"],
    "sujo":    ["imundo", "encardido", "enlameado", "manchado", "sórdido", "contaminado"],
    "longo":    ["extenso", "demorado", "prolongado", "duradouro", "amplo", "vasto", "distante", "que não termina logo", "de grande alcance"],
    "curto":    ["breve", "conciso", "reduzido", "exíguo", "sumário", "condensado"],
    "alto":    ["elevado", "imponente", "altaneiro", "erguido", "majestoso", "excelso"],
    "baixo":    ["raso", "rebaixado", "achatado", "humilde", "rasteiro", "miúdo"],
    "duro":    ["rígido", "resistente", "inflexível", "endurecido", "áspero", "severo"],
    "mole":    ["macio", "flácido", "frouxo", "fofo", "cede com facilidade", "amolecido"],
    "seco":    ["árido", "enxuto", "ressecado", "desidratado", "estéril", "descarnado"],
    "pesado":    ["volumoso", "denso", "sobrecarregado", "opressivo", "maciço", "ponderoso"],
    "leve":    ["ligeiro", "etéreo", "tênue", "ágil", "diáfano", "sutil"],
    "caro":    ["custoso", "valioso", "inacessível", "oneroso", "dispendioso", "exorbitante"],
    "barato":    ["acessível", "módico", "econômico", "popular", "em conta", "simples"],
    "facil":    ["simples", "singelo", "descomplicado", "acessível", "tranquilo", "intuitivo"],
    "dificil":    ["árduo", "complexo", "trabalhoso", "penoso", "espinhoso", "tortuoso"],
    "certo":    ["correto", "exato", "preciso", "adequado", "acertado", "inequívoco"],
    "errado":    ["incorreto", "equivocado", "falho", "impreciso", "inadequado", "equívoco"],
    "saltar":    ["pular", "dar um salto", "transpor", "ultrapassar", "galgar", "trancar"],
    "nadar":    ["mergulhar", "flutuar", "navegar", "remar", "deslizar na água", "bracear"],
    "voar":    ["alçar voo", "planar", "sobrevoar", "flutuar", "elevar-se", "alçar-se"],
    "comer":    ["alimentar-se", "devorar", "ingerir", "saborear", "engolir", "nutrir-se"],
    "beber":    ["tomar", "ingerir", "sorver", "engolir", "hidratar-se", "tragar"],
    "respirar":    ["inspirar", "expirar", "ar", "fôlego", "recuperar o fôlego", "tomar fôlego"],
    "fabricar":    ["produzir", "manufaturar", "confeccionar", "elaborar", "construir", "fazer"],
    "matar":    ["eliminar", "assassinar", "ceifar", "liquidar", "exterminar", "abater"],
    "curar":    ["sanar", "sarar", "tratar", "remediar", "restituir", "recuperar"],
    "doer":    ["machucar", "pungir", "queimar", "martirizar", "atormentar", "mortificar"],
    "imaginar":    ["imaginar", "conceber", "inventar", "visualizar", "fabular", "criar no pensamento", "sonhar acordado"],
    "vermelho":    ["escarlate", "carmesim", "rubro", "encarnado", "purpúreo", "róseo"],
    "azul":    ["anil", "safira", "celeste", "cerúleo", "ciano", "turquesa"],
    "verde":    ["esmeralda", "jade", "oliva", "viçoso", "verdejante", "matizado"],
    "amarelo":    ["dourado", "âmbar", "ocre", "palha", "cor de ouro", "cor de mel"],
    "preto":    ["negro", "escuro", "carvão", "azeviche", "breu", "retinto"],
    "aceitar":    ["concordar", "admitir", "acolher", "consentir", "aprovar", "anuir"],
    "rejeitar":    ["recusar", "repelir", "descartar", "repudiar", "negar", "desconsiderar"],
    "calar":    ["silenciar", "emudecer", "calar-se", "sufocar", "reprimir", "abafar", "segurar"],
    "ajudar":    ["auxiliar", "socorrer", "amparar", "colaborar", "cooperar", "apoiar"],
    "prejudicar":    ["danificar", "comprometer", "lesar", "arruinar", "atrasar", "sabotar"],
    "roxo":    ["violeta", "púrpura", "lilás", "lavanda", "amatista", "malva"],
    "cinza":    ["acinzentado", "cinzento", "pardo", "fosco", "nebuloso", "apagado"],
    "angustia":    ["tormento", "aflição", "inquietação", "agonia", "sofrimento", "amargura", "sufoco interior", "mal-estar existencial", "aperto no peito", "aperto d'alma"],
    "ansiedade":    ["nervosismo", "inquietude", "apreensão", "agitação", "tensão", "preocupação"],
    "desespero":    ["desalento", "desânimo", "aflição", "agonia", "desolação", "desamparo", "desalento extremo", "afogamento interior", "fim de saída"],
    "orgulho":    ["brio", "altivez", "vaidade", "soberba", "autoestima", "dignidade"],
    "vergonha":    ["pudor", "rubor", "constrangimento", "humilhação", "vexame", "desonra", "acanhamento"],
    "humildade":    ["modéstia", "simplicidade", "mansidão", "abnegação", "despojamento", "discrição"],
    "coragem":    ["bravura", "audácia", "valentia", "ousadia", "determinação", "heroísmo"],
    "sabedoria":    ["prudência", "discernimento", "perspicácia", "senso", "maturidade", "ponderação"],
    "lealdade":    ["fidelidade", "dedicação", "comprometimento", "honradez", "integridade", "confiabilidade", "devotamento", "constância"],
    "perdao":    ["indulgência", "clemência", "absolvição", "misericórdia", "magnanimidade", "remissão", "graça", "esquecimento da ofensa"],
    "vinganca":    ["retaliação", "represália", "desforra", "desagravo", "punição", "acerto de contas"],
    "liberdade":    ["autonomia", "independência", "emancipação", "alforria", "soberania", "libertação"],
    "paz":    ["tranquilidade", "serenidade", "harmonia", "sossego", "concórdia", "pacificidade"],
    "guerra":    ["conflito", "batalha", "combate", "luta", "contenda", "hostilidade"],
    "raiva":    ["ira", "fúria", "indignação", "revolta", "irritação", "cólera"],
    "saude":    ["bem-estar", "vitalidade", "disposição", "vigor", "sanidade", "integridade física"],
    "doenca":    ["enfermidade", "moléstia", "afecção", "mal", "achaque", "padecimento"],

    // sentimentos e estados internos
    "curiosidade":    ["interesse", "indagação", "inquisição", "investigação", "desejo de saber", "ânsia"],
    "tédio":    ["enfado", "fastio", "monotonia", "indiferença", "apatia", "marasmo"],
    "inveja":    ["ciúme", "cobiça", "ressentimento", "emulação", "rivalidade", "despeito", "ciúme do sucesso alheio", "desejo de ter o que o outro tem", "mal-estar pelo bem do outro"],
    "nostalgia":    ["saudade", "melancolia", "evocação", "lembrança", "acalanto", "añoranza", "saudade do passado", "afeto pelo que passou", "dor doce de lembrar", "memória com aroma"],
    "admiracao":    ["estima", "respeito", "reverência", "consideração", "apreço", "louvor"],
    "gratidao":    ["agradecimento", "reconhecimento", "apreço", "obrigação", "grato acolhimento", "sentir-se em dívida boa", "grato pelo bem recebido"],
    "compaixao":    ["compaixão", "empatia", "piedade", "solidariedade", "misericórdia", "humanidade", "cuidado", "empatia com o sofrimento", "comoção pelo outro", "solidariedade afetiva"],
    "confusao":    ["desorientação", "perplexidade", "embaraço", "turbação", "caos mental", "barafunda"],
    "entusiasmo":    ["ardor", "fervor", "ânimo", "empolgação", "paixão", "exaltação"],
    "desconfianca":    ["suspeita", "ceticismo", "dúvida", "cautela", "descrença", "reserva"],
    "serenidade":    ["calma", "tranquilidade", "sossego", "paz interior", "equanimidade", "placidez"],
    "conhecer":    ["saber", "reconhecer", "identificar", "aprender", "familiarizar", "inteirar-se"],
    "moderno":    ["atual", "contemporâneo", "recente", "novo", "presente", "hodierno"],
    "sutil":    ["tênue", "discreto", "leve", "imperceptível", "delicado", "refinado"],
    "fragil":    ["delicado", "fraco", "vulnerável", "tênue", "quebradiço", "efêmero", "sutil", "leve"],
    "eterno":    ["infinito", "perpétuo", "imortal", "inabalável", "perene", "imutável"],
    "vago":    ["impreciso", "indefinido", "nebuloso", "ambíguo", "incerto", "difuso"],

    // verbos de escrita e pensamento
    "narrar":    ["narrar", "contar", "relatar", "dar voz a", "dar forma à história", "tecer a narrativa", "dizer", "descrever em sequência", "dar voz aos fatos", "encenar em palavras"],
    "refletir":    ["meditar", "ponderar", "pensar", "considerar", "contemplar", "ruminar"],
    "expressar":    ["manifestar", "revelar", "demonstrar", "exteriorisar", "comunicar", "traduzir"],
    "observar":    ["notar", "perceber", "ver", "contemplar", "registrar", "apreender"],
    "romper":    ["quebrar", "partir", "fragmentar", "violar", "transgredir", "irromper"],
    "atravessar":    ["cruzar", "transpor", "percorrer", "ultrapassar", "vencer", "traspor"],
    "leal":    ["fiel", "dedicado", "comprometido", "honrado", "confiável", "constante"],
    "traiçoeiro":    ["desleal", "falso", "pérfido", "infiel", "enganador", "traidor"],
    "teimoso":    ["obstinado", "persistente", "cabeça-dura", "pertinaz", "irredutível", "inflexível", "persistente para o mal ou bem", "tenaz no erro"],
    "arrogante":    ["presunçoso", "soberbo", "altivo", "vaidoso", "orgulhoso", "pretensioso", "que se crê superior", "desdenhoso", "altaneiro"],
    "paciente":    ["sereno", "tolerante", "calmo", "tranquilo", "impassível", "resignado", "que espera sem quebrar", "sereno diante da demora", "perseverante"],

    // substantivos de espaço e ambiente
    "abrigo":    ["refúgio", "acolhida", "proteção", "guarida", "covil", "repouso"],
    "prisao":    ["cárcere", "cativeiro", "confinamento", "clausura", "grilhão", "jaula", "catacumbas", "encarceramento", "gaiola", "reclusão"],
    "fronteira":    ["limite", "divisa", "margem", "borda", "perímetro", "demarcação"],
    "labirinto":    ["labirinto", "emaranhado", "teia", "rede confusa", "dédalo", "encruzilhada sem saída", "tortuosidade"],
    "espelho":    ["reflexo", "imagem", "cópia", "sombra", "eco", "duplo"],

    // sentimentos relacionais
    "ciume":    ["possessividade", "inveja afetiva", "insegurança", "desconfiança", "suspeita", "receio", "medo de perder", "inveja do outro no afeto", "vontade de exclusividade"],
    "saudade":    ["nostalgia", "longing", "ausência sentida", "recordação afetiva", "melancolia doce", "anseio"],
    "abandono":    ["abandono", "deixar para trás", "deserção", "esquecimento deliberado", "partida sem volta", "solidão imposta", "desamparar"],
    "pertencimento":["identidade", "laço", "vínculo", "enraizamento", "comunidade", "integração"],

    // processos e transformações
    "renascer":    ["ressurgir", "reviver", "reerguer", "brotar de novo", "recomeçar", "reconstituir"],
    "cicatrizar":    ["curar", "sarar", "fechar ferida", "superar", "recompor", "restabelecer"],
    "superficial":    ["raso", "vago", "ligeiro", "frívolo", "sem consistência", "epidérmico"],
    "sombrio":    ["escuro", "lúgubre", "melancólico", "tenebroso", "obscuro", "carregado"],
    "luminoso":    ["claro", "brilhante", "radiante", "iluminado", "fulgente", "resplandecente"],
    "sereno":    ["calmo", "tranquilo", "plácido", "quieto", "equilibrado", "pacífico", "suave", "manso", "que não se perturba", "de paz interior"],

    // substantivos do espaço literário
    "limiar":    ["limiar", "soleira", "umbral", "fronteira invisível", "linha de passagem", "porta de entrada", "margem"],
    "silhueta":    ["contorno", "sombra", "forma", "figura", "perfil", "vulto", "traço", "esboço"],
    "ecos":    ["ressonância", "rumor", "reverberação", "vestígio", "rastro", "traço", "lembrança"],

    // processos narrativos
    "hesitar":    ["duvidar", "vacilar", "titubear", "recuar", "ponderar", "demorar", "tergiversar", "tremer antes de agir", "ficar na dúvida"],
    "permanecer":    ["ficar", "continuar", "persistir", "durar", "resistir", "manter", "subsistir", "perdurar"],

    // substantivos de experiência e memória
    "rastro":    ["marca", "vestígio", "traço", "indício", "pista", "sinal", "trilha", "impressão"],
    "eco":    ["ressonância", "reverberação", "reflexo", "rumor", "sombra", "lembrança", "repetição"],
    "ruína":    ["destroço", "resto", "fragmento", "escombro", "vestígio", "decadência", "carcaça"],
    "origem":    ["nascedouro", "berço", "raiz", "começo", "início", "fonte", "princípio", "causa"],

    // verbos de conflito e decisão
    "decidir":    ["resolver", "optar", "escolher", "determinar", "concluir", "assentar", "firmar", "definir"],

    // adjetivos de tempo e duração
    "breve":    ["rápido", "curto", "fugaz", "passageiro", "transitório", "efêmero", "momentâneo"],
    "recente":    ["novo", "atual", "moderno", "contemporâneo", "fresco", "último", "próximo"],

    // adjetivos de caráter moral
    "honesto":    ["íntegro", "leal", "verdadeiro", "transparente", "reto", "justo", "sincero"],

    // verbos de movimento e espaço
    "escalar":    ["subir", "trepar", "galgar", "alçar", "ascender", "superar", "vencer"],
    "afundar":    ["submergir", "mergulhar", "naufragar", "soçobrar", "ceder", "sucumbir", "imergir"],

    // substantivos de tempo
    "instante":    ["instante", "momento", "relance", "fração de segundo", "lampejo", "átimo", "piscar de olhos"],
    "eternidade":    ["eternidade", "imensidão do tempo", "infinito temporal", "perene", "imortal", "sem fim", "para sempre"],
    "amanhecer":    ["aurora", "alvorecer", "madrugada", "alvorada", "raiar", "romper do dia"],
    "anoitecer":    ["crepúsculo", "entardecer", "poente", "pôr do sol", "penumbra", "ocaso"],

    // substantivos de relação social
    "amizade":    ["companheirismo", "fraternidade", "camaradagem", "vínculo", "afinidade", "cumplicidade"],
    "rivalidade":    ["disputa", "concorrência", "competição", "conflito", "animosidade", "antagonismo"],
    "traição":    ["perfídia", "deslealdade", "apostasia", "infidelidade", "quebra de confiança", "virada"],
    "aliança":    ["parceria", "pacto", "acordo", "coalizão", "coalização", "união", "solidariedade"],

    // adjetivos de nível e grau
    "absoluto":    ["total", "completo", "integral", "pleno", "irrestrito", "incondicional", "categórico"],
    "relativo":    ["parcial", "condicionado", "dependente", "comparativo", "proporcional", "contextual"],
    "excessivo":    ["demasiado", "desmedido", "exagerado", "extremo", "desproporcional", "imoderado"],
    "escasso":    ["raro", "parco", "insuficiente", "limitado", "restrito", "deficiente", "exíguo"],
    "culpado":    ["responsável", "autor", "causador", "réu", "culpável", "incriminado", "punível"],
    "inocente":    ["absolvido", "irrepreensível", "indefeso", "puro", "não culpado", "desculpado"],

    // adjetivos de estado emocional
    "ansioso":    ["inquieto", "preocupado", "agitado", "apreensivo", "angustiado", "nervoso", "tenso", "agitado pela espera", "angustiado com o incerto"],
    "confiante":    ["seguro", "firme", "decidido", "otimista", "determinado", "tranquilo", "resoluto"],
    "arrependido":    ["pesaroso", "contrito", "envergonhado", "penitente", "remoroso", "culpado", "aflito"],
    "analisar":    ["examinar", "investigar", "estudar", "avaliar", "dissecar", "interpretar", "decompor"],

    // substantivos de ação coletiva
    "rebelião":    ["revolta", "insurgência", "sedição", "levante", "motim", "sublevação", "insurreição"],
    "acordo":    ["pacto", "tratado", "convenção", "contrato", "entendimento", "consenso", "ajuste"],
    "revolução":    ["transformação radical", "virada", "ruptura", "subversão", "mudança estrutural"],

    // adjetivos de posição no espaço
    "central":    ["principal", "fundamental", "nuclear", "essencial", "basilar", "pivô", "axial"],
    "marginal":    ["periférico", "lateral", "secundário", "excluído", "à margem", "externo", "acessório"],
    "distante":    ["afastado", "remoto", "longínquo", "isolado", "separado", "apartado", "longe"],
    "próximo":    ["perto", "vizinho", "adjacente", "imediato", "contíguo", "chegado", "junto"],

    // verbos de mudança de estado
    "endurecer":    ["fortalecer", "solidificar", "firmar", "consolidar", "cimentar", "tornar firme"],
    "suavizar":    ["amolecer", "atenuar", "amenizar", "aliviar", "diminuir", "abrandar", "moderar"],
    "ampliar":    ["expandir", "alargar", "estender", "aumentar", "crescer", "desenvolver", "aprofundar"],
    "reduzir":    ["diminuir", "encurtar", "estreitar", "minimizar", "comprimir", "limitar", "contrair"],
    "crianca":    ["criança", "infante", "menino", "menina", "pequeno", "rebento", "jovem", "menino/menina", "ser em formação", "pequeno ser", "quem ainda não cresceu"],
    "adolescente":    ["jovem", "mancebo", "moço", "menor", "púbere", "teen", "teenager"],
    "adulto":    ["maduro", "crescido", "experiente", "maior de idade", "pessoa formada", "plenamente desenvolvido", "membro da sociedade"],
    "ancia":    ["anciã", "velha", "velhinha", "idosa", "matriarca", "avozinha", "pessoa de idade"],
    "avo":    ["avó", "avô", "nona", "vovô", "vovó", "ascendente", "ancestral próximo"],
    "pai":    ["genitor", "progenitor", "padrasto", "papai", "provedor", "responsável", "guardião"],
    "mae":    ["mãe", "genitora", "progenitora", "madrasta", "mamãe", "provedora", "cuidadora"],
    "irmao":    ["irmão", "irmã", "irmandade", "sibling", "companheiro de sangue", "semelhante", "igual"],
    "filho":    ["filho", "filha", "descendente", "rebento", "herdeiro", "progênie", "criatura"],
    "amigo":    ["companheiro", "parceiro", "colega", "camarada", "cúmplice", "aliado", "próximo"],
    "inimigo":    ["adversário", "oponente", "rival", "antagonista", "opositor", "detrator", "algoz"],
    "rival":    ["concorrente", "adversário", "oponente", "competidor", "antagonista", "émulo", "contendor"],
    "aliado":    ["parceiro", "companheiro", "cúmplice", "apoiador", "confederado", "amigo", "solidário"],
    "mentor":    ["guia", "mestre", "tutor", "orientador", "conselheiro", "patrono", "sábio"],
    "heroi":    ["herói", "protagonista", "campeão", "paladino", "salvador", "guerreiro", "defensor"],
    "vilao":    ["vilão", "antagonista", "tirano", "opressor", "malfeitor", "algoz", "inimigo"],
    "vitima":    ["vítima", "prejudicado", "lesado", "ofendido", "mártir", "coitado", "paciente"],
    "testemunha":    ["observador", "espectador", "depoente", "quem viu", "presente", "narrante", "oculista"],
    "narrador":    ["voz narrativa", "contador de histórias", "cronista", "relator", "quem conta", "mensageiro", "porta-voz"],
    "autor":    ["escritor", "criador", "artífice", "artista", "compositor", "produtor", "gênio"],
    "comunidade":    ["grupo", "coletivo", "vizinhança", "congregação", "povo", "sociedade local", "irmandade"],
    "tradicao":    ["tradição", "costume", "herança", "legado", "prática ancestral", "raiz cultural", "modo de ser"],
    "mitos":    ["mito", "lenda", "saga", "narrativa fundadora", "história ancestral", "conto sagrado", "simbologia"],
    "magoa":    ["mágoa", "tristeza", "decepção", "ressentimento", "amargura", "rancor", "melancolia"],
    "afeto":    ["carinho", "ternura", "amor", "apego", "afeição", "cuidado", "vínculo"],
    "identidade":    ["personalidade", "essência", "self", "caráter", "pertencimento", "singularidade", "ser", "quem se é", "construção de si", "pertencimento e diferença", "marca pessoal"],
    "proposito":    ["propósito", "finalidade", "missão", "razão de ser", "meta", "sentido", "objetivo", "intenção", "objetivo maior", "o que guia as escolhas", "norte da vida"],
    "significado":    ["sentido", "valor", "importância", "conteúdo", "substância", "essência", "alcance"],
    "valor":    ["importância", "valia", "mérito", "qualidade", "peso", "relevância", "dignidade"],
    "principio":    ["princípio", "fundamento", "regra", "ética", "premissa", "alicerce", "origem"],
    "verdade":    ["realidade", "certeza", "fato", "veracidade", "autenticidade", "transparência", "singeleza"],
    "ilusao":    ["ilusão", "fantasma", "sonho", "miragem", "engano", "aparência", "ficção", "aparência enganosa", "fantasma da mente", "o que não é real"],
    "realidade":    ["fato", "verdade", "existência", "concretude", "mundo real", "substância", "certeza"],
    "fantasia":    ["sonho", "imaginação", "devaneio", "utopia", "ilusão", "ficção", "capricho"],
    "paixao":    ["paixão", "arrebatamento", "entusiasmo", "ardor", "fervor", "ímpeto", "intensidade", "amor intenso", "entusiasmo extremo", "entrega total", "fogo interior"],
    "indiferenca":    ["indiferença", "frieza", "apatia", "desinteresse", "alheamento", "distância", "neutralidade", "não se importar", "ausência de sentimento"],
    "empatia":    ["compaixão", "compreensão", "identificação", "sensibilidade", "escuta", "presença", "acolhimento"],
    "exclusao":    ["exclusão", "rejeição", "marginalização", "afastamento", "ostracismo", "discriminação", "isolamento"],
    "pertenca":    ["pertença", "pertencimento", "vínculo", "inclusão", "comunidade", "raiz", "identidade"],
    "ausencia":    ["ausência", "vazio", "falta", "lacuna", "silêncio", "solidão", "abandono"],
    "presenca":    ["presença", "existência", "corporalidade", "vitalidade", "atenção", "aura", "peso"],
    "leveza":    ["ligeireza", "suavidade", "graça", "delicadeza", "frivolidade", "agilidade", "translucidez"],
    "densidade":    ["peso", "espessura", "profundidade", "substância", "gravidade", "consistência", "teor"],
    "clareza":    ["nitidez", "luminosidade", "transparência", "precisão", "limpidez", "evidência", "simplicidade"],
    "retratar":    ["descrever", "pintar", "evocar", "representar", "caracterizar", "delinear", "narrar"],
    "evocar":    ["invocar", "rememorar", "trazer à mente", "suscitar", "despertar", "chamar", "ressurgir"],
    "iluminar":    ["clarificar", "esclarecer", "revelar", "elucidar", "mostrar", "expor", "destacar"],
    "obscurecer":    ["esconder", "velar", "turvar", "ofuscar", "encobrir", "sombrar", "escurecer"],
    "atenuar":    ["suavizar", "mitigar", "moderar", "abrandar", "amenuizar", "diminuir", "reduzir"],
    "intensificar":["ampliar", "acirrar", "reforçar", "acentuar", "agudizar", "aprofundar", "elevar"],
    "tensionar":    ["criar tensão", "estressar", "pressionar", "acirrar", "inflamar", "recrudescer", "agravar"],
    "aliviar":    ["suavizar", "amansar", "confortar", "acalmar", "desafogar", "distender", "relaxar"],
    "acelerar":    ["apressar", "agilizar", "precipitar", "antecupar", "intensificar", "abreviar", "urgir"],
    "desacelerar":    ["frear", "reduzir", "abrandar", "pausar", "moderar", "retardar", "suavizar"],
    "interromper":    ["pausar", "cessar", "suspender", "deter", "quebrar", "truncar", "cortar"],
    "retomar":    ["recomeçar", "reiniciar", "prosseguir", "continuar", "recuperar", "relançar", "reassumir"],
    "iniciar":    ["começar", "lançar", "inaugurar", "estrear", "instaurar", "abrir", "encabeçar"],
    "encerrar":    ["terminar", "concluir", "fechar", "finalizar", "acabar", "cessar", "clausurar"],
    "apresentar":    ["introduzir", "mostrar", "exibir", "revelar", "expor", "anunciar", "trazer"],
    "desenvolver":    ["aprofundar", "expandir", "elaborar", "aprimorar", "crescer", "evoluir", "progredir"],
    "resolver":    ["solucionar", "superar", "dirimir", "sanar", "remediar", "desfazer", "concluir"],
    "sugerir":    ["insinuar", "implicar", "indicar", "apontar", "evocar", "remeter", "sinalizar"],
    "direcionar":    ["guiar", "conduzir", "orientar", "apontar", "encaminhar", "dirigir", "nortear"],
    "confundir":    ["embaralhar", "misturar", "complicar", "turvar", "desorientar", "perturbar", "intricar"],
    "esclarecer":    ["explicar", "elucidar", "iluminar", "clarificar", "detalhar", "desenvolver", "expor"],
    "descrever":    ["retratar", "pintar", "evocar", "narrar", "representar", "caracterizar", "delinear"],
    "detalhar":    ["pormenorizar", "especificar", "aprofundar", "esclarecer", "explicitar", "desenvolver", "desdobrar"],
    "contrastar":    ["contrapor", "opor", "distinguir", "diferenciar", "confrontar", "evidenciar diferenças", "comparar por oposição"],
    "inferir":    ["deduzir", "concluir", "supor", "pressupor", "intuir", "presumir", "extrair"],
    "concluir":    ["finalizar", "encerrar", "deduzir", "inferir", "resolver", "fechar", "terminar"],
    "sintetizar":    ["resumir", "condensar", "sistematizar", "compilar", "integrar", "unificar", "aglutinar"],
    "questionar":    ["indagar", "interrogar", "inquirir", "perguntar", "examinar", "problematizar", "contestar"],
    "refutar":    ["contradizer", "rebater", "negar", "desmentir", "contestar", "opor-se", "invalidar"],
    "persuadir":    ["convencer", "influenciar", "seduzir", "aliciar", "converter", "dobrar", "conquistar"],
    "argumentar":    ["defender", "sustentar", "fundamentar", "justificar", "raciocinar", "debater", "pleitear"],
    "lamentar":    ["deplorar", "chorar", "sentir", "sofrer", "prantear", "lastimar", "penar"],
    "protestar":    ["reclamar", "exigir", "insurgir-se", "denunciar", "reivindicar", "clamar", "indagar"],
    "celebrar":    ["comemorar", "festejar", "homenagear", "glorificar", "aclamar", "exaltar", "enaltecer"],
    "confrontar":    ["enfrentar", "desafiar", "opor-se", "resistir", "encarar", "embater", "defrontar", "ir de frente", "não desviar", "bater de frente"],
    "negociar":    ["acordar", "tratar", "ajustar", "mediar", "transigir", "barganhar", "pactar"],
    "surpreender":    ["espantar", "maravilhar", "chocar", "impressionar", "assustar", "assombrar", "estupefazer"],
    "tranquilizar":["acalmar", "serenar", "confortar", "apaziguar", "aplacar", "aquietar", "sossigar"],
    "cansar":    ["exaurir", "fatigar", "esgotar", "extenuar", "debilitar", "desgastar", "sobrecarregar"],
    "recuperar":    ["restabelecer", "restaurar", "reaviver", "reaver", "renovar", "reconquistar", "curar"],
    "conectar":    ["ligar", "vincular", "unir", "integrar", "associar", "articular", "entrelaçar"],
    "doacao":    ["presente", "oferta", "dádiva", "brinde", "mimo", "generosidade", "presenteio"],
    "recusa":    ["negação", "rejeição", "negação explícita", "exclusão", "repúdio", "negativa", "vetar"],
    "comprometer":    ["envolver", "embaraçar", "prejudicar", "vincular", "responsabilizar", "ameaçar", "implicar"],
    "prometer":    ["jurar", "assegurar", "garantir", "comprometer-se", "prometer solenemente", "afirmar", "declarar"],
    "falhar":    ["errar", "fracassar", "malograr", "decepcionar", "tropeçar", "naufrar", "sucumbir"],
    "errar":    ["falhar", "equivocar-se", "enganar-se", "desacertar", "tropeçar", "desviar", "escorregar"],
    "arrepender":    ["penitenciar-se", "lamentar", "lastimar", "retratar-se", "revoltar-se consigo", "sentir remorso", "voltar atrás"],
    "culpar":    ["acusar", "responsabilizar", "atribuir culpa", "incriminar", "condenar", "imputar", "censurar"],
    "acusar":    ["denunciar", "imputar", "culpar", "responsabilizar", "indiciar", "incriminar", "apontar"],
    "defender":    ["proteger", "amparar", "guardar", "escudar", "resguardar", "justificar", "advogar"],
    "atacar":    ["agredir", "investir", "assaltar", "avançar sobre", "ofender", "fustigar", "confrontar"],
    "restaurar":    ["recuperar", "reabilitar", "reparar", "renovar", "reconstruir", "resgatar", "revitalizar"],
    "renovar":    ["restaurar", "atualizar", "revitalizar", "reformar", "transformar", "regenerar", "ressurgir"],
    "evoluir":    ["progredir", "avançar", "desenvolver-se", "crescer", "transformar-se", "amadurecer", "elevar-se"],
    "regredir":    ["recuar", "voltar atrás", "involuir", "recair", "decair", "retroceder", "piorar"],
    "avançar":    ["progredir", "prosseguir", "ir adiante", "evoluir", "crescer", "ganhar terreno", "seguir em frente"],
    "recuar":    ["retroceder", "regredir", "afastar-se", "ceder", "hesitar", "voltar atrás", "desistir"],
    "diminuir":    ["reduzir", "minguar", "encolher", "atenuar", "decrescer", "abrandar", "comprimir"],
    "aumentar":    ["crescer", "expandir", "ampliar", "acrescer", "elevar", "intensificar", "multiplicar"],
    "expandir":    ["ampliar", "alargar", "estender", "crescer", "difundir", "desenvolver", "propagar"],
    "contrair":    ["reduzir", "diminuir", "encolher", "apertar", "comprimir", "retrair", "encurtar"],
    "prender":    ["capturar", "deter", "aprisionar", "segurar", "acorrentar", "enredar", "engaiolar"],
    "escapar":    ["fugir", "livrar-se", "evadir-se", "desprender-se", "safar-se", "eludir", "esquivar-se"],
    "capturar":    ["prender", "apanhar", "agarrar", "deter", "aprisionar", "fisgar", "arrebatar"],
    "ignorar":    ["desconsiderar", "desprezar", "negligenciar", "fingir não ver", "desrespeitar", "omitir", "passar por cima"],
    "negar":    ["recusar", "refutar", "contradizer", "rebater", "desmentir", "rejeitar", "contestar"],
    "gemer":    ["lamentar", "choramingar", "gemer de dor", "suspirar fundo", "arquejar", "ganir", "carpir"],
    "escutar":    ["ouvir", "prestar atenção", "auscultar", "perceber", "captar", "atentar", "acolher"],
    "contemplar":    ["observar", "admirar", "mirar", "olhar fixo", "meditar", "ponderar", "apreciar"],
    "perseguir":    ["caçar", "seguir", "rastrear", "cercar", "rondar", "assediar", "encalçar", "não largar", "ir atrás", "assombrar"],
    "descobrir":    ["revelar", "desvendar", "encontrar", "iluminar", "expor", "desmascarar", "achar"],
    "explorar":    ["investigar", "sondar", "vasculhar", "perscrutar", "mapear", "desbravar", "percorrer"],
    "alcançar":    ["atingir", "chegar", "obter", "conquistar", "lograr", "conseguir", "alcançar a meta"],
    "fracasso":    ["derrota", "malogro", "insucesso", "falha", "fiasco", "ruína", "colapso"],
    "vitória":    ["triunfo", "conquista", "êxito", "glória", "sucesso", "feito", "proeza"],
    "jornada":    ["caminho", "travessia", "percurso", "viagem", "trecho", "etapa", "trajeto"],
    "acaso":    ["sorte", "acidente", "casualidade", "contingência", "fortuna", "ventura", "imprevisto"],
    "ruído":    ["barulho", "som", "estrondo", "eco", "fragor", "rumor", "estardalhaço"],
    "movimento":    ["gesto", "ação", "deslocamento", "impulso", "dinâmica", "atividade", "mobilização"],
    "pausa":    ["silêncio", "intervalo", "interrupção", "suspensão", "cesura", "descanso", "hiato"],
    "equilibrio":    ["equilíbrio", "balança", "harmonia", "estabilidade", "equanimidade", "compensação", "proporção"],
    "caos":    ["desordem", "confusão", "tumulto", "anarquia", "turbulência", "bagunça", "entropia"],
    "ordem":    ["organização", "disciplina", "estrutura", "regra", "norma", "harmonia", "arranjo"],
    "fraqueza":    ["fragilidade", "impotência", "debilidade", "vulnerabilidade", "falha", "lacuna", "deficiência"],
    "forca":    ["força", "vigor", "potência", "energia", "poder", "robustez", "determinação", "poder físico", "energia do corpo", "capacidade de resistir"],

    // processo criativo e escrita
    "inspiracao":    ["inspiração", "lampejo", "insight", "iluminação", "centelha criativa", "impulso", "fagulha", "impulso criativo", "centelha", "sopro inicial", "abertura do texto"],
    "criatividade":["criatividade", "inventividade", "imaginação criadora", "originalidade", "engenho", "talento", "aptidão"],
    "bloqueio":    ["bloqueio", "trava", "paralisia criativa", "estagnação", "silêncio interno", "impasse", "nó", "travamento", "silêncio forçado", "medo disfarçado de preguiça"],
    "esboço":    ["esboço", "rascunho", "primeira versão", "minuta", "borrão", "apontamento", "traço inicial"],
    "disciplina":    ["disciplina", "constância", "persistência", "rotina criativa", "firmeza", "regularidade", "comprometimento", "prática regular", "compromisso com o texto", "rotina de escrita"],
    "oficio":    ["ofício", "artesanato da escrita", "técnica", "habilidade", "mestria", "perícia", "trato com as palavras", "arte", "prática", "especialidade", "profissão"],
    "rascunho":    ["rascunho", "esboço", "versão zero", "primeiro gesto", "borrão", "ensaio", "tentativa inicial", "primeira versão", "texto bruto", "letra viva", "versão provisória"],
    "ritmo":    ["ritmo", "cadência", "andamento", "compasso", "fluxo", "pulsação", "respiração do texto", "cadência do texto", "pulsação das palavras", "andamento da frase", "compasso narrativo", "fluxo sonoro"],
    "escuta":    ["escuta", "atenção ao texto", "sensibilidade", "receptividade", "abertura", "percepção", "leitura atenta"],

    // sensações físicas e corporais
    "calafrio":    ["calafrio", "arrepio", "tremor", "frio na espinha", "estremecimento", "gelidez repentina", "frêmito"],
    "sufoco":    ["sufoco", "opressão", "aperto", "angústia física", "nó na garganta", "peso no peito", "falta de ar"],
    "tontura":    ["tontura", "vertigem", "desequilíbrio", "giro", "náusea leve", "perda de chão", "estonteamento"],

    // natureza e paisagem
    "penumbra":    ["penumbra", "meia-luz", "crepúsculo", "sombra difusa", "claro-escuro", "breu parcial", "meia-sombra"],
    "neblina":    ["neblina", "névoa", "bruma", "cerração", "véu úmido", "garoa espessa", "vapores da manhã", "nevoeiro", "garoa fina"],
    "breu":    ["breu", "escuridão total", "treva", "noite fechada", "negro absoluto", "ausência de luz", "sombra densa"],
    "claridade":    ["claridade", "luminosidade", "luz difusa", "brilho suave", "resplendor", "lusco-fusco claro", "albor"],

    // tempo e duração
    "espera":    ["espera", "aguardo", "interregno", "pausa tensa", "suspenso", "demora", "latência"],
    "urgencia":    ["urgência", "pressa", "iminência", "precipitação", "correria", "sem tempo", "apressar-se"],
    "abismo":    ["abismo", "precipício", "vazio sem fundo", "profundeza", "buraco", "fenda", "goela"],
    "refúgio":    ["refúgio", "abrigo", "esconderijo", "canto seguro", "guarida", "porto seguro", "retiro"],
    "horizonte":    ["horizonte", "linha do céu", "confim", "longe", "infinito visual", "onde o olho alcança", "perspectiva"],
    "altar":    ["altar", "pedra sagrada", "lugar de oferenda", "centro ritual", "mesa de reza", "espaço de devoção", "símbolo central"],

    // conflito e tensão
    "embate":    ["embate", "confronto", "choque", "colisão", "queda de braço", "disputa acirrada", "atrito"],
    "ruptura":    ["ruptura", "fratura", "quebra", "rompimento", "cisão", "separação abrupta", "rachadura"],
    "dilema":    ["dilema", "impasse", "escolha impossível", "bifurcação", "encruzilhada moral", "tensão irresolvível", "nó"],
    "resistencia":    ["resistência", "teimosia", "recusa", "oposição firme", "persistência", "não ceder", "enfrentamento", "teimosia vital", "força de manter-se", "aguentar o embate"],
    "rendição":    ["rendição", "capitulação", "derrota aceita", "abrir mão", "entrega", "cessação da luta", "abandono"],

    // transformação e mudança
    "metamorfose":    ["metamorfose", "transformação profunda", "mudança de forma", "conversão", "transmutação", "virada", "renascimento"],
    "revelação":    ["revelação", "descoberta", "desvelamento", "epifania", "iluminação súbita", "o que estava oculto", "lampejo de verdade"],
    "retorno":    ["retorno", "volta", "regresso", "reencontro com o passado", "circularidade", "recomeço", "caminho de volta"],
    "recomeço":    ["recomeço", "novo começo", "segunda chance", "renascer das cinzas", "reinvenção", "ponto zero", "primeira vez de novo"],

    // estados da escrita e leitura
    "leitura":    ["leitura", "decifração", "interpretação", "encontro com o texto", "mergulho nas páginas", "diálogo com o livro", "absorção"],
    "escrita":    ["escrita", "composição", "criação literária", "prosa", "texto", "obra", "palavras no papel"],

    // formas do texto
    "narrativa":    ["narrativa", "história", "relato", "enredo", "trama", "fábula", "sequência de acontecimentos"],
    "enredo":    ["enredo", "trama", "intriga", "sequência", "história", "fio narrativo", "cadeia de eventos", "fio da história", "tecido narrativo", "sequência de acontecimentos", "esqueleto da ficção"],
    "cena":    ["cena", "quadro", "sequência", "momento", "episódio", "passagem", "instantâneo narrativo"],
    "diálogo":    ["diálogo", "conversa", "troca de falas", "interlocução", "réplica", "colóquio", "fala entre personagens", "fala dos personagens", "troca de vozes", "conversa encenada", "interlocução na cena", "voz em confronto"],
    "monólogo":    ["monólogo", "fala solitária", "discurso interior", "voz única", "solilóquio", "pensamento em voz alta"],
    "descrição":    ["descrição", "retrato", "pintura verbal", "evocação", "caracterização", "representação", "quadro", "pintura em palavras", "apresentação de detalhes", "mostrar sem agir", "parar o tempo"],
    "personagem":    ["personagem", "figura", "ser de papel", "voz na história", "sujeito da ficção", "ser imaginado", "criatura"],
    "protagonista":["protagonista", "herói", "figura central", "voz principal", "sujeito do percurso", "quem conduz", "motor da ação"],
    "antagonista":    ["antagonista", "adversário", "força contrária", "obstáculo encarnado", "opositor", "sombra do herói", "polo oposto"],
    "conflito":    ["conflito", "tensão", "embate", "choque", "atrito", "confronto", "luta", "oposição de forças"],
    "tensão":    ["tensão", "suspense", "pressão dramática", "iminência", "antecipação", "corda esticada", "expectativa"],
    "clímax":    ["clímax", "auge", "ponto máximo", "ápice", "cúpula dramática", "momento decisivo", "pico da tensão", "ponto alto da tensão", "auge da história", "ápice narrativo", "virada máxima"],
    "desfecho":    ["desfecho", "desenlace", "conclusão", "final", "resolução", "encerramento", "solução"],
    "perspectiva":    ["perspectiva", "ponto de vista", "ângulo", "focalização", "olhar narrativo", "voz que conta", "prisma"],
    "arco":    ["arco", "trajetória", "percurso", "jornada do personagem", "curva dramática", "evolução", "transformação"],
    "estrutura":    ["estrutura", "arquitetura do texto", "organização", "forma", "disposição", "esqueleto narrativo", "construção"],
    "sumário":    ["sumário", "resumo narrativo", "síntese", "condensação", "salto temporal", "passagem rápida", "panorama", "compressão de tempo", "elipse controlada", "o que ficou de fora"],
    "flashback":    ["flashback", "analepse", "volta ao passado", "memória irruptiva", "retrocesso temporal", "recordação encenada"],
    "elipse":    ["elipse", "salto", "omissão calculada", "lacuna narrativa", "tempo saltado", "corte", "silêncio estrutural", "omissão significativa", "salto no tempo", "o que foi deixado de fora", "lacuna de cena"],
    "prólogo":    ["prólogo", "abertura", "preâmbulo", "introdução", "porta de entrada", "antessala", "voz inaugural", "antes da história", "abertura que situa", "voz que prepara o leitor", "préambulo"],
    "epílogo":    ["epílogo", "fechamento", "coda", "última palavra", "posfácio narrativo", "remate", "eco final", "texto de encerramento", "palavras finais", "conclusão da voz autoral", "capítulo de desfecho", "último olhar do autor", "depois da história", "o que ficou depois", "desfecho do desfecho", "pós-texto narrativo"],
    "capítulo":    ["capítulo", "parte", "seção", "unidade", "segmento", "trecho", "divisão", "divisão do livro", "unidade narrativa", "parte da obra", "bloco de narração", "segmento do texto longo", "divisão da narrativa", "unidade de tempo ou perspectiva", "corte intencional"],
    "plot":    ["plot", "enredo", "trama", "fio condutor", "sequência de causas", "lógica dos eventos", "nexo narrativo"],
    "focalização":    ["focalização", "ponto de vista", "perspectiva", "quem vê", "filtro narrativo", "olhar escolhido", "ângulo de visão", "perspectiva narrativa", "filtro de percepção"],

    // estilo e voz
    "tom":    ["tom", "registro", "atitude narrativa", "temperatura emocional", "voz do texto", "inclinação", "coloração", "voz dominante", "registro emocional", "atmosfera do texto", "coloração da escrita", "timbre da narração"],
    "estilo":    ["estilo", "dicção", "modo de escrever", "voz própria", "marca autoral", "assinatura do texto", "maneira"],
    "ironia":    ["ironia", "subversão do dito", "duplo sentido", "contraste entre fala e intenção", "sarcasmo velado", "inversão", "dizer o contrário", "duplo sentido velado", "tom invertido", "crítica disfarçada", "elogio que condena", "dizer o oposto", "distância entre aparência e realidade", "camada oculta", "voz dupla"],
    "metáfora":    ["metáfora", "imagem", "figura de linguagem", "comparação implícita", "transposição de sentido", "símbolo vivo", "imagem sem 'como'", "transferência de sentido", "identificação poética", "imagem direta"],
    "símbolo":    ["símbolo", "signo", "emblema", "imagem carregada", "representação condensada", "sinal", "ícone"],
    "alegoria":    ["alegoria", "narrativa simbólica", "fábula moral", "história com sentido oculto", "parábola", "metáfora estendida"],
    "paradoxo":    ["paradoxo", "contradição aparente", "tensão de opostos", "verdade impossível", "antinomia", "oxímoro"],
    "ambiguidade":    ["ambiguidade", "dupla leitura", "incerteza deliberada", "sentido flutuante", "indecisão de significado"],
    "intertexto":    ["intertexto", "diálogo com outras obras", "referência literária", "citação velada", "eco de textos", "palimpsesto"],
    "paródia":    ["paródia", "releitura crítica", "imitação cômica", "subversão do original", "espelho deformante", "pastiche irônico"],
    "pastiche":    ["pastiche", "imitação estilística", "variação sobre tema", "homenagem formal", "colagem de estilos"],
    "polissemia":    ["polissemia", "multiplicidade de sentidos", "palavra de muitas faces", "riqueza semântica", "ambivalência do signo"],

    // formas literárias
    "conto":    ["conto", "narrativa breve", "história curta", "prosa de fôlego curto", "fatia de vida", "instantâneo ficcional"],
    "romance":    ["romance", "narrativa longa", "ficção de fôlego", "prosa extensa", "mundo em palavras", "universo ficcional"],
    "crônica":    ["crônica", "registro do cotidiano", "prosa jornalística", "texto de momento", "flagrante literário", "instante escrito", "texto breve de observação", "prosa de tema cotidiano", "relato do efêmero", "registro literário do dia a dia"],
    "ensaio":    ["ensaio", "reflexão em prosa", "texto de ideias", "exercício de pensamento", "tentativa intelectual", "prosa especulativa"],
    "verso":    ["verso", "linha poética", "unidade do poema", "fala em ritmo", "voz cadenciada", "palavra medida", "linha de poema", "sequência rítmica", "linha com cadência"],
    "rima":    ["rima", "correspondência sonora", "eco entre palavras", "retorno do som", "musicalidade do verso", "consonância", "correspondência de sons", "eco sonoro", "repetição de terminação", "música entre palavras", "consonância final"],
    "métrica":    ["métrica", "medida do verso", "ritmo regular", "contagem de sílabas", "cadência formal", "padrão sonoro"],
    "prosa":    ["prosa", "discurso corrido", "escrita sem verso", "fala natural", "texto fluido", "voz sem rima"],

    // psicologia do personagem
    "culpa":    ["culpa", "remorso", "peso da consciência", "responsabilidade moral", "arrependimento", "fardo", "autocondena", "peso na consciência", "fardo moral"],
    "vaidade":    ["vaidade", "narcisismo", "amor próprio excessivo", "exibicionismo", "presunção", "soberba", "convencimento"],
    "ambição":    ["ambição", "desejo de ascensão", "sede de poder", "aspiração intensa", "cupidez", "ânsia de conquista", "ganância nobre"],
    "covardia":    ["covardia", "medo que paralisa", "recuo diante do perigo", "pusilanimidade", "timidez extrema", "omissão deliberada"],
    "obstinação":    ["obstinação", "teimosia", "persistência cega", "determinação rígida", "inflexibilidade", "cabeça dura", "perseverança intensa"],
    "resignação":    ["resignação", "aceitação passiva", "conformismo", "rendição silenciosa", "capitulação", "desistência digna", "paciência forçada", "aceitar sem concordar", "parar de lutar sem vencer", "o que ficou quando a raiva foi"],
    "determinação":["determinação", "resolução", "firmeza", "propósito", "vontade", "decisão inabalável", "persistência consciente"],
    "vulnerabilidade":["vulnerabilidade", "fragilidade exposta", "abertura ao risco", "sensibilidade à dor", "pele fina", "ser atingível"],
    "resiliência":    ["resiliência", "capacidade de recuperação", "elasticidade interior", "resistência viva", "força de recomeçar", "dureza mole"],
    "fragilidade":    ["fragilidade", "delicadeza", "leveza quebrável", "sensibilidade extrema", "vulnerabilidade", "ternura em risco"],
    "generosidade":["generosidade", "doação", "altruísmo", "benevolência", "desprendimento", "abertura ao outro", "munificência"],
    "autoridade":    ["autoridade", "poder legítimo", "comando", "ascendência", "prestígio", "liderança", "influência reconhecida"],
    "hierarquia":    ["hierarquia", "ordem de poder", "estrutura de mando", "escalonamento social", "cadeia de comando", "escala de autoridade"],
    "justiça":    ["justiça", "equidade", "imparcialidade", "direito", "retidão", "equilíbrio moral", "dar a cada um o que merece"],
    "violência":    ["violência", "agressão", "brutalidade", "força bruta", "crueldade", "barbárie", "coerção física"],
    "exílio":    ["banimento", "desterro", "expulsão", "afastamento forçado", "vida fora do lugar", "expatriação"],
    "máscara":    ["máscara", "persona", "face pública", "aparência construída", "papel social", "disfarce", "performance de si"],
    "autenticidade":["autenticidade", "ser genuíno", "verdade de si", "inteireza", "coerência interior", "honestidade com si mesmo"],

    // mundo físico
    "natureza":    ["natureza", "mundo natural", "universo vivo", "paisagem", "meio ambiente", "terra", "cosmos orgânico"],
    "montanha":    ["montanha", "monte", "cume", "pico", "elevação", "cordilheira", "alto", "serra", "morro"],
    "vale":    ["vale", "baixada", "planície entre montes", "depressão", "anfiteatro natural", "fundo da paisagem"],
    "planície":    ["planície", "campina", "chão aberto", "extensão plana", "horizonte largo", "campo", "pradaria"],
    "deserto":    ["deserto", "ermo", "solidão árida", "lugar sem água", "vastidão seca", "espaço vazio", "terra hostil"],
    "oceano":    ["oceano", "mar profundo", "água sem fim", "imensidão azul", "abismo líquido", "mar largo", "profundeza"],
    "calor":    ["calor", "quentura", "ardor", "abafamento", "temperatura alta", "febre da terra", "sol que queima"],
    "brisa":    ["brisa", "viração", "vento suave", "sopro leve", "aragem", "ventinho", "frescor em movimento"],
    "névoa":    ["névoa", "neblina", "bruma", "véu de vapor", "cerração", "vapor suspenso", "nuvem baixa", "vapor que encobre", "nuvem baixa que apaga os contornos"],
    "temporal":    ["temporal", "tempestade", "tormenta", "chuva forte", "aguaceiro", "vendaval com chuva", "borrasca"],
    "seca":    ["seca", "estiagem", "ausência de chuva", "ressecamento", "aridez", "tempo sem água", "definhamento da terra"],
    "enchente":    ["enchente", "inundação", "cheia", "transbordamento", "dilúvio", "água que invade", "rio fora do leito"],
    "vendaval":    ["vendaval", "ventania", "rajada", "vento forte", "furacão menor", "sopro violento", "tormenta de vento"],

    // estados físicos e sensoriais
    "prazer":    ["prazer", "fruição", "deleite", "gozo", "satisfação dos sentidos", "alegria do corpo", "contentamento"],
    "cansaço":    ["cansaço", "fadiga", "exaustão", "esgotamento", "lassidão", "peso nos ossos", "torpor do esforço", "exaustão acumulada", "peso do que já foi", "corpo que não aguenta mais", "fadiga que é também alma"],
    "vertigem":    ["vertigem", "tontura", "desequilíbrio", "rodopia", "cambaleio", "mundo que gira", "perda do eixo"],
    "torpor":    ["torpor", "entorpecimento", "letargia", "dormência", "moleza profunda", "inércia do corpo", "sono acordado"],
    "êxtase":    ["êxtase", "arrebatamento", "rapto de alegria", "estado de graça", "transe de prazer", "transporte", "felicidade extrema", "exaltação extrema", "alegria que transborda", "encantamento total"],
    "agonia":    ["agonia", "sofrimento intenso", "luta final", "dor extrema", "tormento", "angústia física", "último esforço"],
    "alívio":    ["alívio", "desafogo", "descanso da tensão", "respiração funda", "fim do peso", "soltura", "leveza repentina", "descanso", "fim da tensão", "respiração possível", "leveza após o peso"],

    // tempo e memória
    "passado":    ["passado", "o que foi", "tempo ido", "ontem", "história pessoal", "memória acumulada", "o que não volta"],
    "presente":    ["presente", "o agora", "este instante", "momento atual", "aqui e agora", "tempo vivo", "o que acontece"],
    "futuro":    ["futuro", "o que virá", "amanhã", "possibilidade", "horizonte temporal", "o que ainda não foi", "promessa de tempo"],
    "família":    ["família", "núcleo afetivo", "laço de sangue", "parentesco", "origem", "raízes humanas", "lar de pertença"],

    // relações e sociedade
    "vínculo":    ["vínculo", "laço", "ligação", "conexão", "elo", "pertencimento mútuo", "relação que une"],
    "solidariedade":["solidariedade", "apoio mútuo", "companheirismo", "fraternidade", "assistência ao outro", "cuidado coletivo"],
    "cumplicidade":["cumplicidade", "conivência", "parceria secreta", "acordo tácito", "aliança velada", "entendimento mútuo"],
    "separação":    ["separação", "afastamento", "ruptura", "distância", "partida", "despedida", "fim do vínculo"],
    "reencontro":    ["reencontro", "retorno ao outro", "volta ao laço", "nova proximidade", "recomeço da relação"],

    // estados da alma
    "melancolia":    ["tristeza suave", "saudade sem objeto", "luto brando", "peso levemente doce", "nostalgia"],
    "euforia":    ["euforia", "alegria intensa", "excitação", "entusiasmo explosivo", "arrebatamento festivo", "júbilo"],
    "inquietação":    ["inquietação", "agitação interior", "desassossego", "nervosismo sutil", "incapacidade de ficar quieto"],
    "rancor":    ["rancor", "ressentimento", "mágoa guardada", "ódio frio", "amargura", "desgosto persistente", "mágoa antiga", "ódio guardado", "raiva que ficou", "ferida que não fechou"],

    // mundo interior
    "consciência":    ["consciência", "lucidez", "percepção de si", "voz interior", "olho que observa", "estado de vigília"],
    "imaginação":    ["imaginação", "fantasia", "capacidade de fingir", "visão interior", "criação mental", "o olho que inventa"],
    "instinto":    ["instinto", "impulso primário", "reação visceral", "voz do corpo", "sabedoria animal", "saber sem pensar"],
    "intuição":    ["intuição", "pressentimento", "saber sem razão", "percepção direta", "antecipação sentida", "saber interior"],

    // percepção e sentidos
    "odor":    ["odor", "cheiro", "aroma", "fragrância", "perfume", "emanação", "fedor"],
    "textura":    ["textura", "tato", "superfície ao toque", "grão", "aspereza ou maciez", "consistência"],
    "sabor":    ["sabor", "gosto", "paladar", "degustação", "sensação gustativa", "flavor"],
    "gesto":    ["gesto", "movimento do corpo", "sinal", "aceno", "movimento expressivo", "ação corporal", "trejeito"],

    // elementos narrativos adicionais
    "início":    ["início", "começo", "abertura", "surgimento", "nascimento", "ponto zero", "primeiro passo"],
    "fim":    ["fim", "término", "encerramento", "conclusão", "morte de algo", "ponto final", "desenlace"],
    "transformação":["transformação", "mudança", "metamorfose", "evolução", "virada", "travessia", "outro lado"],
    "escolha":    ["escolha", "decisão", "dilema resolvido", "bifurcação percorrida", "opção", "seleção", "arbítrio", "alternativa", "deliberação", "eleição", "preferência"],
    "consequência":["consequência", "efeito", "resultado", "desdobramento", "repercussão", "o que se segue"],
    "surpresa":    ["surpresa", "espanto", "assombro", "inesperado", "imprevisível", "choque", "virada"],
    "dúvida":    ["dúvida", "incerteza", "hesitação", "suspensão do juízo", "perguntar a si mesmo", "vacilação"],
    "certeza":    ["certeza", "convicção", "segurança", "firmeza de crença", "saber sem duvidar", "determinação"],
    "segredo":    ["segredo", "mistério", "o que se esconde", "silêncio guardado", "confidência", "ocultação"],
    "mentira":    ["mentira", "engano", "falsidade", "ilusão criada", "desvio da verdade", "fingimento"],

    // ação e movimento narrativo
    "busca":    ["busca", "procura", "jornada em direção a", "demanda", "quest", "missão", "perseguição de algo"],
    "fuga":    ["fuga", "escape", "saída urgente", "retirada", "evasão", "deserção", "partir para sobreviver"],
    "confronto":    ["confronto", "enfrentamento", "duelo", "colisão", "embate direto", "encarar o adversário"],
    "descoberta":    ["descoberta", "achado", "revelação", "o que estava oculto", "novidade", "insight", "encontrar o que não se buscava", "encontro inesperado", "epifania", "elucidação"],
    "perda":    ["perda", "privação", "falta", "vazio que fica", "o que não volta", "desaparecimento"],
    "conquista":    ["conquista", "vitória", "ganho", "alcançar o objetivo", "realização", "obtenção", "êxito"],
    "viagem":    ["viagem", "jornada", "percurso", "deslocamento", "travessia", "expedição", "ir de um lugar a outro"],

    // estados do corpo
    "respiração":    ["respiração", "fôlego", "o ar que entra e sai", "ritmo do corpo", "pausa vital", "sopro de vida"],
    "choro":    ["choro", "lágrimas", "pranto", "lamento", "choro silencioso", "solução emocional", "o corpo que chora"],
    "riso":    ["riso", "gargalhada", "risada", "sorriso", "alegria expressa", "leveza que ri", "hilaridade"],
    "tremor":    ["tremor", "estremecimento", "vibração do corpo", "calafrio", "agitação muscular", "o medo que aparece no gesto"],
    "abraço":    ["abraço", "aconchego", "acolhimento do corpo", "abraçar", "envolver nos braços", "calor humano físico"],

    // dimensões do tempo literário
    "duração":    ["duração", "extensão temporal", "quanto tempo dura", "permanência", "persistência no tempo", "o tempo enquanto acontece", "o presente que se arrasta ou voa", "durar é diferente de contar"],
    "aceleração":    ["aceleração", "velocidade crescente", "urgência crescente", "ritmo que aperta", "compressão temporal"],
    "lentidão":    ["lentidão", "demora deliberada", "tempo esticado", "morosidade", "ritmo que afunda", "tempo dilatado"],
    "anseia":    ["anseia", "ansia", "tormento do desejo", "querer com intensidade", "necessidade urgente", "ânsia"],
    "crise":    ["crise", "ponto crítico", "momento de ruptura", "tudo está em jogo", "virada forçada", "catástrofe iminente"],
    "redenção":    ["redenção", "salvação", "resgate moral", "reparação", "voltar ao caminho", "absolvição", "recomeço limpo"],
    "testemunho":    ["testemunho", "relato em primeira mão", "depoimento", "presença que narra", "voz que viu", "memória relatada"],
    "silêncio eloquente":["silêncio que fala", "o que não se diz mas se entende", "ausência significativa", "pausa carregada", "calar como ato"],

    "abalar":    ["sacudir", "perturbar", "comover", "chocar", "desestabilizar"],
    "arrepio":    ["frisson", "gelar", "arrepiar", "tremor de pele", "calafrio súbito"],
    "arraial":    ["vilarejo", "festa popular", "comunidade rural", "festa de santo", "aldeia"],
    "bruma":    ["névoa densa", "cerração", "vapor úmido", "enevoado", "escuridão suave"],
    "caatinga":    ["sertão", "interior seco", "mata espinhosa", "bioma semiárido", "região árida"],
    "catarse":    ["purificação emocional", "alívio dramático", "descarga", "comoção", "liberação", "alívio catártico", "comoção libertadora", "descarga de emoção", "liberação pelo texto"],
    "cerco":    ["bloqueio", "assédio", "sítio", "aprisionamento", "fechamento"],
    "cicatriz":    ["marca", "sinal", "vestígio", "ferida curada", "rastro de dor"],
    "clamar":    ["bradar", "invocar", "protestar", "apelar", "suplicar"],
    "clausura":    ["confinamento", "reclusão", "enclausuramento", "retiro", "recolhimento"],
    "denunciar":    ["expor", "delatar", "desmascarar", "revelar publicamente", "acusar"],
    "denotar":    ["indicar", "sinalizar", "apontar", "mostrar", "revelar indiretamente"],
    "derrota":    ["capitulação", "sucumbir", "declínio", "fracasso total", "ruína"],
    "despertar":    ["emergir do sono", "reacender", "ressurgir", "sair da letargia", "acordar"],
    "disfarçar":    ["mascarar", "camuflar", "fingir", "dissimular", "esconder"],
    "escuridão":    ["breu", "trevas", "noite fechada", "treva", "ausência de luz"],
    "estupor":    ["torpor", "entorpecimento", "espanto paralisante", "choque", "atonia"],
    "fragmento":    ["pedaço", "estilhaço", "trecho", "retalho", "brecha"],
    "indignação":    ["revolta", "ultraje", "cólera", "inconformidade", "protesto", "ira moral", "rebeldia ética", "protesto interior", "raiva justa"],
    "interrogar":    ["indagar", "perscrutar", "inquirir", "interpelar", "investigar"],
    "irmandade":    ["fraternidade", "laço humano", "vínculo fraterno", "união", "companheirismo"],
    "libertação":    ["emancipação", "alforria", "soltura", "desatamento", "liberdade conquistada"],
    "madrugada":    ["altas horas", "horas mortas", "silêncio da noite", "horas pequenas", "entre a meia-noite e o amanhecer"],
    "mangue":    ["estuário", "beira-rio lodosa", "labirinto d'água", "zona de transição", "lama fértil"],
    "marcar":    ["imprimir", "gravar", "registrar", "deixar vestígio", "sinalizar"],
    "murmurar":    ["cochichar", "segredar", "farfalhar", "musitar", "sussurrar baixinho"],
    "náusea":    ["asco", "enjoo", "repulsa", "aversão visceral", "repugnância"],
    "opressão":    ["coerção", "dominação", "subjugação", "violência estrutural", "sufoco"],
    "palco":    ["arena", "tablado", "proscênio", "espaço de atuação", "cena aberta"],
    "pantanal":    ["alagado", "brejeiro", "vastidão úmida", "planície inundável", "natureza pantanosa"],
    "presságio":    ["anúncio", "prenúncio", "augúrio", "sinal de mau agouro", "agourento"],
    "proclamar":    ["declarar", "bradar", "anunciar solenemente", "decretar", "afirmar"],
    "quilombo":    ["comunidade negra", "resistência", "refúgio", "território de fuga", "aldeia livre"],
    "reprovar":    ["censurar", "condenar", "reprochar", "desaprovar", "rechaçar"],
    "ressentimento":    ["mágoa velha", "amargura", "rancor oculto", "agravo", "ranço"],
    "sertão":    ["interior seco", "caatinga", "brejo", "interior profundo", "terra árida"],
    "silenciar":    ["abafar", "amordaçar", "suprimir", "emmudecer", "calar"],
    "subtexto":    ["subentendido", "camada oculta", "entrelinhas", "dito não-dito", "insinuação"],
    "verossimilhança":["credibilidade", "coerência", "realismo", "autenticidade", "plausibilidade"],

    // v743 — Nascentes EN→ER: ternura, funeral, morte, mente, errância
    "ternura":    ["enternecimento", "afeto", "meiguice", "delicadeza", "doçura", "carinho gentil"],
    "enternecimento":    ["ternura", "comoção suave", "abalo afetivo", "emoção desperta", "sensibilidade"],
    "funeral":    ["enterro", "enterramento", "exéquias", "saimento", "cortejo fúnebre", "velório"],
    "enterrar":    ["inumar", "sepultar", "dar sepultura", "pôr na terra", "esconder na terra"],
    "sepultar":    ["enterrar", "inumar", "dar sepultura", "depositar no jazigo", "guardar na cova"],
    "imenso":    ["enorme", "vastíssimo", "incomensurável", "descomunal", "sem medida", "desmesurado"],
    "inteligência":    ["entendimento", "mente", "intelecto", "perspicácia", "agudeza", "acuidade"],
    "entendimento":    ["compreensão", "inteligência", "percepção", "raciocínio", "clareza mental", "discernimento"],
    "exprimir":    ["enunciar", "manifestar", "exteriorizar", "transmitir", "verbalizar", "dizer com força"],
    "errabundo":    ["errante", "vagante", "andarilho", "itinerante", "sem rumo", "nômade"],
    "talento":    ["dom", "aptidão", "engenho", "gênio", "habilidade inata", "capacidade especial"],
    "gênio":    ["talento", "dom natural", "inspiração singular", "aptidão criadora", "engenho", "visionário"],
    "enganar":    ["iludir", "ludibriar", "enredar", "dissimular", "fabulosear", "induzir ao erro"],
    "vastidão":    ["imensidão", "amplitude", "extensão", "largura", "espaço aberto", "horizonte largo"],

    // v744 — Nascentes M→P: mudança, ócio, orvalho, negrume, palidez, multidão, mundo...
    "mudança":    ["mutação", "transformação", "alteração", "variação", "virada", "conversão"],
    "mutismo":    ["mudez", "silêncio obstinado", "recusa de falar", "calar voluntário", "recolhimento mudo"],
    "multidão":    ["turba", "turbamulta", "aglomeração", "massa", "povo em movimento", "tropel"],
    "negrume":    ["negrura", "negror", "escuridão total", "breu absoluto", "sombra densa", "trevas vivas"],
    "ócio":    ["repouso merecido", "inação", "descanso contemplativo", "pausa", "quietude", "dolce far niente"],
    "orvalho":    ["rocio", "sereno", "gotas da madrugada", "umidade da noite", "vapor noturno", "lágrima da terra"],
    "palidez":    ["palor", "lividez", "cor desbotada", "brancura doentia", "esmaecimento", "sem cor"],
    "opulência":    ["riqueza", "abundância ostentosa", "fartura", "luxo", "fausto", "prosperidade excessiva"],
    "paciência":    ["resignação", "tolerância", "perseverança", "serenidade", "suportar sem queixa", "espera calma"],
    "nauta":    ["marinheiro", "navegador", "homem do mar", "navegante", "marujo", "mestre das águas"],
    "narração":    ["ato de narrar", "relato", "história contada", "discurso narrativo", "versão oral", "contar em sequência", "relato temporal", "narrar eventos", "voz que conduz"],
    "obra":    ["produção", "criação", "escrito", "texto", "resultado do trabalho", "feito humano"],
    "prece":    ["oração humilde", "súplica", "invocação", "pedido confiante", "rogativa", "voto"],

    // v745 — Nascentes R→S: recear, selvagem, soledade, singulto, sigilo, relâmpago...
    "recear":    ["temer sem fundamento", "apavorar-se com sombra", "ter receio", "desconfiar", "pressentir o pior"],
    "reviver":    ["renascer", "ressurgir", "revivescer", "brotar de novo", "voltar à vida", "reacender"],
    "selvagem":    ["bravo", "inculto", "agreste", "não domesticado", "selvático", "primitivo"],
    "soledade":    ["solidão profunda", "lugar ermo", "deserto humano", "quietude solitária", "solitude poética"],
    "soberano":    ["supremo", "sumo", "acima de todos", "governante absoluto", "onipotente", "senhor de tudo"],
    "senilidade":    ["velhice", "senectude", "debilidade da idade", "deterioração pela velhice", "declínio etário"],
    "singulto":    ["soluço", "espasmo do pranto", "choro entrecortado", "respiração cortada pelo choro", "convulsão de lágrimas"],
    "sigilo":    ["segredo absoluto", "silêncio total", "discrição", "confidencialidade", "guardar a sete chaves"],
    "relâmpago":    ["clarão", "faísca celeste", "fulguração", "raio de luz súbito", "faísca do céu", "iluminação instantânea"],
    "simpleza":    ["singeleza", "simplicidade", "ingenuidade", "boa-fé", "sem complicação", "modéstia"],
    "rubro":    ["vermelho intenso", "carmesim", "encarnado vivo", "cor de brasa", "escarlate", "purpúreo"],
    "reserva":    ["discrição", "cautela no falar", "reticência", "guardar em silêncio", "não revelar tudo"],

    // v748 — Nascentes ES: vagar, treva, horrível, onda, fome, furto, estrofe...
    "vagar":    ["errar sem destino", "perambular", "deambular", "andar à toa", "circular sem rumo", "derivar"],
    "treva":    ["escuridão absoluta", "breu total", "noite sem luz", "obscuridade densa", "negro absoluto"],
    "horrível":    ["horroroso", "horrendo", "pavoroso", "medonho", "terrível", "aterrador"],
    "pavoroso":    ["medonho", "horrível", "terrível", "que infunde pavor", "aterrador", "horrendo"],
    "onda":    ["vaga", "mareta", "escarcéu", "ondulação", "vagas do mar", "movimento das águas"],
    "fome":    ["esfaimado", "famélico", "faminto", "necessidade insaciável", "apetite voraz", "carência"],
    "obscuridade":    ["penumbra densa", "falta de clareza", "opacidade", "sombra mental", "escuridão das ideias"],
    "furto":    ["roubo", "rapina", "ladroeira", "subtração", "pilhagem", "latrocínio"],
    "roubo":    ["furto", "rapina", "pilhagem", "latrocínio", "subtração violenta", "assalto"],
    "estrofe":    ["estância", "grupo de versos", "unidade poética", "quadra", "segmento do poema", "sextilha", "bloco do poema", "unidade métrica", "conjunto rítmico", "quadra ou sextilha"],
    "essencial":    ["inerente", "intrínseco", "da própria natureza", "fundamental", "inseparável do ser"],
    "voluntário":    ["espontâneo", "livre", "por vontade própria", "intencional", "não forçado", "deliberado"],
    "esquivar":    ["evitar", "desviar-se", "fugir habilmente", "evadir", "escafeder-se", "não encarar"],

    // v750 — lacunas semânticas: tempo, emoção, natureza, consciência
    "desesperança":    ["desalento", "desânimo", "abatimento sem saída", "perda de esperança", "pessimismo", "descrença", "além da tristeza", "perda do desejo", "o lugar onde a esperança apagou"],
    "lembrança":    ["recordação", "memória viva", "reminiscência", "evocação", "vestígio do passado", "o que ficou na mente"],
    "sorriso":    ["expressão de alegria", "riso suave", "cantos da boca", "luz no rosto", "gesto de alegria", "satisfação no rosto"],
    "pranto":    ["choro intenso", "lágrimas", "lamento", "choro que não para", "expressão de dor em lágrimas"],
    "lágrima":    ["gota de tristeza", "pranto", "o olho que chora", "água do sofrimento", "choro visível"],
    "tempestade":    ["tormenta", "vendaval", "borrasca", "chuva forte", "temporal", "furacão emocional"],
    "vigília":    ["estado de alerta", "estar acordado", "noite sem sono", "insônia", "guardar o sono", "atenção contínua"],
    "delírio":    ["alucinação", "febre da mente", "fuga da realidade", "estado alterado", "mente em colapso", "visão que não existe"],
    "brilho":    ["fulgor", "luminosidade", "clarão", "esplendor", "resplendor", "luz emanada"],
    "compreender":    ["entender", "captar", "assimilar", "perceber o sentido", "abarcar com a mente", "alcançar"],
    "aurora":    ["amanhecer", "alvorecer", "primeiro clarão", "raiar do dia", "madrugada nascendo", "hora do leite"],
    "crepúsculo":    ["entardecer", "pôr do sol", "boca da noite", "tardinha", "fim do dia luminoso", "hora do escurecer"],
    "infância":    ["meninez", "meninice", "primeiros anos", "fase da inocência", "aurora da vida", "tempo de ser criança"],
    "partida":    ["despedida", "saída", "separação voluntária", "momento de partir", "deixar para trás", "ir-se", "abandono", "distância", "adeus"],
    "encontro":    ["reencontro", "cruzamento de caminhos", "acaso", "confluência", "vir ao mesmo espaço", "coincidir"],

    // v751 — alma, desejo, luta, ciclo, natureza, artes, identidade
    "alma":    ["espírito", "ser interior", "essência viva", "sopro vital", "o que anima", "vida interior"],
    "espírito":    ["alma", "força interior", "ânimo", "essência imaterial", "presença invisível", "sopro"],
    "mente":    ["pensamento", "intelecto", "razão", "consciência", "cabeça", "faculdade de pensar"],
    "desejo":    ["anseio", "vontade intensa", "aspiração", "cobiça", "ânsia", "sede de algo"],
    "felicidade":    ["bem-estar", "contentamento", "alegria plena", "satisfação interior", "plenitude", "júbilo"],
    "sofrimento":    ["padecimento", "tormento", "pena", "dor prolongada", "martírio", "agonia"],
    "luta":    ["combate", "embate", "batalha", "esforço tenso", "resistência ativa", "enfrentamento"],
    "começo":    ["início", "princípio", "ponto de partida", "origem", "aurora de algo", "nascimento"],
    "momento":    ["instante", "ponto no tempo", "fração do agora", "lapso", "segundo vivido", "o agora"],
    "rio":    ["curso d'água", "corrente", "fluxo", "veio d'água", "arroio", "riacho", "afluente", "veredas"],
    "nuvem":    ["névoa suspensa", "vapor d'água", "nuvem branca", "nublado", "cumulus", "nebulosa"],
    "pedra":    ["rocha", "calhau", "seixo", "granito", "matéria dura", "rochedo"],
    "florescer":    ["brotar", "abrir em flor", "germinar", "desabrochar", "vir à luz", "emergir com vida"],
    "murchar":    ["definhar", "secar", "perder o viço", "mínguar", "enfraquecer", "esmaecer"],
    "voo":    ["travessia aérea", "elevação", "arremesso no ar", "alçar voo", "planagem", "levada"],
    "queda":    ["tombo", "declínio", "ruína", "desabamento", "colapso", "baixar de altura"],
    "ascensão":    ["elevação", "subida", "alçamento", "galgar", "promoção", "crescimento vertical"],
    "trilha":    ["vereda", "atalho", "caminho estreito", "sendeiro", "picada", "rota de passagem"],
    "velhice":    ["velheza", "ancianidade", "tardio da vida", "última estação", "anos avançados", "senescência"],
    "juventude":    ["mocidade", "adolescência", "anos verdes", "primavera da vida", "vigor jovem", "florescência"],
    "maturidade":    ["amadurecimento", "plenitude vital", "meia idade", "estágio pleno", "fase adulta consciente"],
    "ciclo":    ["volta completa", "ritmo recorrente", "giro", "sequência que se repete", "roda do tempo"],
    "limite":    ["fronteira", "borda", "extremo", "até onde vai", "marco final", "divisória"],
    "margem":    ["beira", "borda de rio", "orla", "limite lateral", "à margem", "periferia"],
    "harmonia":    ["equilíbrio", "concórdia", "consonância", "ordem natural", "paz interna", "correspondência"],
    "companhia":    ["presença", "acompanhamento", "convivência", "comunhão", "junto de alguém", "não estar só"],
    "música":    ["melodia", "harmonia sonora", "ritmo", "composição", "arte dos sons", "canto organizado"],
    "cantar":    ["entoar", "entoar um canto", "vocalizar", "salmodiar", "entoar melodia", "dar voz"],
    "pátria":    ["terra natal", "país de origem", "solo materno", "chão ancestral", "pertencimento territorial"],
    "língua":    ["idioma", "fala", "linguagem materna", "vernáculo", "expressão oral", "código da comunidade"],

    // v755 — Nascentes + lacunas literárias: triunfo, devaneio, epifania, exílio, traição
    "triunfo":    ["vitória gloriosa", "pompa do vencer", "consagração", "glorificação", "celebração da vitória"],
    "verdor":    ["viço", "frescor vegetal", "vida verde", "cor da esperança", "vigor vivo"],
    "devaneio":    ["sonho acordado", "fantasia", "divagação", "pensamento errante", "labirinto mental", "imaginação solta"],
    "confidência":    ["confissão", "segredo partilhado", "revelação íntima", "segredo de coração", "o que se diz baixinho"],
    "epifania":    ["revelação súbita", "iluminação interior", "momento de clareza", "insight repentino", "descoberta interior"],
    "intuir":    ["pressentir", "captar sem análise", "perceber por instinto", "ter palpite", "antever sem razão"],
    "pressentir":    ["intuir", "ter presságio", "antecipar com o corpo", "sentir com antecedência", "palpitar"],
    "demolir":    ["derrubar", "destruir", "arrasar", "arruinar", "desabar", "reduzir a pó"],
    "dançar":    ["bailar", "mover ao ritmo", "girar", "requebrar", "rodopiar", "movimentar-se pela música"],

    // v756 — lacunas emocionais e de cenário
    "calma":    ["serenidade", "tranquilidade", "paz interior", "equanimidade", "sossego", "quietude"],
    "tranquilidade":    ["calma", "paz", "sossego", "repouso do espírito", "quietude", "ausência de agitação"],
    "obstáculo":    ["barreira", "impedimento", "entrave", "tropeço", "embaraço", "o que se interpõe"],
    "mistério":    ["enigma", "incógnita", "arcano", "segredo não revelado", "véu sobre o real"],
    "maravilha":    ["prodígio", "assombro", "coisa extraordinária", "milagre do comum", "espanto que encanta"],
    "júbilo":    ["alegria intensa", "exultação", "êxtase feliz", "contentamento transbordante", "alvoroço do bem"],
    "remorso":    ["arrependimento", "culpa que pesa", "peso da consciência", "tormento interior", "o que não sai da mente"],
    "promessa":    ["palavra dada", "compromisso", "juramento", "pacto", "palavra firmada"],
    "esquecimento":    ["apagamento", "perda da memória", "quando o tempo apaga", "amnésia", "o que ficou para trás"],
    "riqueza":    ["abundância", "prosperidade", "opulência", "fartura", "haveres", "posse em excesso"],
    "miséria":    ["penúria", "pobreza extrema", "indigência", "carência", "precariedade", "falta de tudo"],
    "lar":    ["morada", "refúgio", "casa que acolhe", "ninho", "centro do mundo pessoal", "onde se pertence"],
    "ancião":    ["velho", "idoso", "de muitos anos", "o que já viveu muito", "experiência encarnada"],
    "apatia":    ["indiferença", "torpor", "desinteresse", "letargia", "ausência de sentimento", "embotamento"],
    "heroísmo":    ["bravura", "coragem extrema", "ato heróico", "façanha", "entrega total pela causa"],
    "litoral":    ["costa", "orla marítima", "beira-mar", "praia", "costa atlântica", "encontro da terra com o mar"],
    "fado":    ["sina", "destino traçado", "sorte", "rumo irrevogável", "o que estava escrito"],

    // v761 — Nascentes C→D: cochichar, ilusão, engano, dignidade, comportamento, cínico
    "cochichar":    ["segredar", "murmurar ao pé do ouvido", "falar em voz baixíssima", "dizer sem que ninguém ouça"],
    "segredar":    ["cochichar", "dizer em segredo", "revelar em voz baixa", "confidenciar baixinho"],
    "engano":    ["ilusão", "equívoco", "erro involuntário", "descuido", "percepção falsa"],
    "comportamento":    ["conduta", "procedimento", "modo de agir", "atitude", "forma de se portar"],
    "dignidade":    ["decoro", "compostura", "honra pessoal", "recato", "altivez"],
    "decoro":    ["decência", "compostura", "dignidade", "conveniência moral", "boa apresentação"],
    "meditação":    ["cogitação", "ponderação", "reflexão profunda", "contemplação interior", "pensar devagar"],
    "cogitação":    ["meditação", "ponderação", "pensar com cuidado", "reflexão atenta", "elucubração"],
    "cínico":    ["desavergonhado", "impudente", "descarado", "sem pudor", "que se vangloria do mal"],
    "calúnia":    ["difamação", "acusação falsa", "mentira contra alguém", "manchar a honra alheia"],
    "admirar":    ["apreciar", "contemplar com assombro", "olhar com espanto", "encantar-se com", "maravilhar-se"],
    "desprezar":    ["menosprezar", "ignorar com desdém", "não dar valor", "tratar como inferior"],
    "humilhar":    ["rebaixar", "envergonhar", "diminuir", "esmagar o orgulho de", "fazer sentir menos"],
    "consolar":    ["confortar", "amenizar a dor", "trazer calma", "amparo ao sofrimento", "aliviar a tristeza"],

    // v762 — verbos da comunicação, relação e cosmos
    "declarar":    ["afirmar", "enunciar", "proclamar", "anunciar", "dizer com firmeza"],
    "concordar":    ["assentir", "estar de acordo", "aceitar", "anuir", "reconhecer que é assim"],
    "discordar":    ["divergir", "não concordar", "ter posição contrária", "contestar", "opor-se"],
    "assustar":    ["aterrorizar", "apavorar", "amedrontar", "dar susto", "fazer tremer"],
    "decepcionar":    ["frustrar", "desapontar", "não corresponder à expectativa", "desiluldir"],
    "maravilhar":    ["deslumbrar", "encantar", "deixar sem fôlego", "causar assombro", "fazer admirar"],
    "sol":    ["astro do dia", "o que ilumina o mundo", "fonte de calor e luz", "estrela maior"],
    "lua":    ["satélite natural", "lua cheia", "astro da noite", "farol da noite", "lua que guia"],
    "estrela":    ["astro distante", "ponto de luz no céu", "farol do infinito", "corpo celeste"],
    "durar":    ["persistir", "perdurar", "estender-se no tempo", "resistir ao tempo", "não acabar"],
    "separar":    ["afastar", "distanciar", "colocar entre", "romper a união", "dividir"],
    "unir":    ["juntar", "ligar", "aproximar", "vincular", "trazer junto"],
    "atrair":    ["fascinar", "magnetizar", "puxar para si", "exercer atração", "encantar quem vê"],
    "conquistar":    ["vencer", "ganhar", "alcançar após esforço", "obter pela luta", "tomar para si"],
    "abraçar":    ["envolver nos braços", "estreitar ao corpo", "acolher com o corpo", "dar um abraço"],
    "beijar":    ["dar um beijo", "tocar com os lábios", "sinal de afeto", "o gesto do amor"],
    "fantasiar":    ["imaginar livremente", "sonhar acordado", "criar mundos internos", "fabular"],
    "planejar":    ["traçar plano", "organizar com antecedência", "preparar estratégia", "projetar"],
    "enfrentar":    ["confrontar", "encarar de frente", "não fugir de", "resistir ao embate"],
    "recordar":    ["lembrar", "evocar", "trazer à memória", "reviver o passado", "não esquecer"],

    // v763 — recursos literários, emoções, escrita e tempo
    "hipérbole":    ["exagero expressivo", "amplificação", "exagero para dar força", "aumentar além da medida", "amplificação poética", "força além da medida", "intensidade pelo excesso"],
    "sarcasmo":    ["ironia cortante", "zombaria ácida", "crítica com veneno", "humor que machuca"],
    "revisão":    ["releitura", "olhar de novo", "checar o texto", "refinamento", "segunda leitura crítica", "releitura crítica", "reescrita", "apuro do texto", "polimento", "leitura de correção"],
    "releitura":    ["nova leitura", "reler com outros olhos", "revisitar o texto", "leitura repetida", "segunda leitura", "nova passagem", "revisão com distância", "retorno ao texto"],
    "arrependimento":    ["remorso", "pesar pelo que fez", "querer desfazer o passado", "sentir culpa pelo erro"],
    "sede":    ["vontade de beber", "ressecar a garganta", "necessidade de água", "ânsia de saciar"],
    "sono":    ["vontade de dormir", "torpor do cansaço", "pálpebras pesadas", "chamado do descanso"],
    "agora":    ["neste momento", "o presente imediato", "no instante atual", "já", "no aqui e agora"],
    "sublime":    ["elevado ao máximo", "acima do belo", "que eleva a alma", "grandioso além da beleza", "o que excede a medida", "avassalador", "grandioso além da contenção", "incomensurável"],
    "grotesco":    ["distorcido", "feio de modo expressivo", "que mescla horror e humor", "caricato extremo", "mistura do ridículo com o terrível", "deformação crítica", "riso que assusta"],
    "gostar":    ["apreciar", "sentir afeição", "ter simpatia por", "curtir", "ter prazer em"],
    "desejar":    ["querer", "ansiar", "anseio por", "ter vontade de", "almejar", "cobiçar"],
    "explicar":    ["esclarecer", "tornar claro", "desenvolver o raciocínio", "expor com detalhes", "iluminar"],
    "preservar":    ["conservar", "guardar", "manter intacto", "proteger do tempo", "zelar por"],
    "derrubar":    ["fazer cair", "abater", "lançar ao chão", "destituir", "vencer"],

    // v765 — Nascentes D→S: esmero, cura, repouso, sábio, cume, suspeita, deslize
    "esmero":    ["cuidado extremo", "desvelo", "zelo", "busca da perfeição", "capricho no fazer"],
    "cuidado":    ["atenção", "diligência", "desvelo", "esmero", "solicitude", "trato"],
    "sábio":    ["douto", "erudito", "sapiente", "que sabe com penetração", "homem do saber"],
    "erudição":    ["saber vasto", "conhecimento acumulado", "ilustração", "vasto estudo", "cultura letrada"],
    "cume":    ["pico", "topo", "vértice", "ponta mais alta", "o lugar mais elevado"],
    "cura":    ["saração", "recuperação", "tratamento que funcionou", "remissão", "volta à saúde"],
    "repouso":    ["descanso", "quietude", "pausa", "sossego do corpo", "cessar o esforço"],
    "quietude":    ["quietação", "repouso", "sossego", "estado sem agitação", "silêncio interior"],
    "suspeita":    ["desconfiança", "receio", "conjetura de dano", "mau pressentimento", "dúvida que acusa"],
    "desvendar":    ["revelar", "tirar o véu", "descobrir o que estava oculto", "expor à luz"],
    "manifestar":    ["mostrar", "expor", "tornar evidente", "dar a ver", "exteriorizar"],
    "deslize":    ["desvio leve", "descaída", "pequena falha de conduta", "erro pequeno", "passo em falso"],
    "prole":    ["filhos", "descendentes", "geração seguinte", "descendência", "o que fica de nós"],
    "posteridade":    ["as gerações futuras", "quem virá depois", "o que o tempo guarda", "herança viva"],
    "diligência":    ["atividade cuidadosa", "agilidade com atenção", "presteza", "trabalho atento"],
    "pródigo":    ["esbanjador", "gastador", "que não poupa", "generoso ao extremo", "dissipador"],
    "desvio":    ["descaminho", "afastamento do rumo", "mudança de direção", "sair do trilho"],
    "cultivo":    ["cultura", "lavoura", "trato da terra", "trabalho de cultivar", "cuidar do que cresce"],
    "lavoura":    ["cultivo", "trabalho do campo", "roça", "lida com a terra", "produção agrícola"],
    "erudito":    ["culto", "douto", "muito instruído", "que sabe muito pelo estudo", "pessoa das letras"],

    // v766 — lacunas morais, elementares e culturais
    "bondade":    ["generosidade", "gentileza", "benevolência", "virtude do bem", "ato de cuidar do outro"],
    "gentileza":    ["delicadeza", "cortesia", "atenção ao próximo", "bondade em ato", "afabilidade"],
    "crueldade":    ["brutalidade", "maldade em ato", "falta de compaixão", "desumanidade", "dureza extrema"],
    "maldade":    ["crueldade", "malícia", "perversidade", "má-vontade deliberada", "disposição para o mal"],
    "perigo":    ["ameaça", "risco", "situação perigosa", "iminência do mal", "o que pode machucar"],
    "luto":    ["perda", "sofrimento pela morte", "tempo de chorar", "período de dor", "dor da ausência"],
    "celebração":    ["festa", "comemoração", "júbilo coletivo", "marcar uma conquista", "alegria partilhada"],
    "criação":    ["obra", "resultado do fazer", "produto da imaginação", "ato de criar", "o que nasce do criador"],
    "raiz":    ["origem", "ponto de partida", "onde tudo começa", "fundamento", "base ancestral"],
    "solo":    ["chão", "terra firme", "superfície da terra", "base que sustenta"],
    "água":    ["líquido essencial", "o que flui", "elemento da vida", "chuva que cai", "rio que corre"],
    "livro":    ["obra escrita", "volume", "texto encadernado", "objeto da leitura", "mundo em papel"],
    "percurso":    ["jornada", "caminhada completa", "trajetória", "trilha percorrida", "o que se andou"],

    // v768 — espaço, tempo, sociedade, corpo e linguagem
    "brutalidade":    ["violência extrema", "crueza", "ferocidade", "brutalismo", "força sem piedade"],
    "humanidade":    ["o ser humano coletivo", "o gênero humano", "todos os seres humanos", "a espécie"],
    "civilização":    ["cultura organizada", "sociedade desenvolvida", "conjunto de conquistas humanas"],
    "cultura":    ["conjunto de práticas", "expressão de um povo", "modo de vida coletivo", "herança viva"],
    "história":    ["o passado narrado", "memória coletiva", "o que aconteceu", "o fio dos eventos"],
    "herança":    ["legado", "o que se recebe do passado", "transmissão entre gerações", "o que fica"],
    "legado":    ["herança", "o que se deixa para o futuro", "obra que permanece", "rastro de vida"],
    "texto":    ["escrita", "palavra posta no papel", "discurso registrado", "obra textual", "o que se lê"],
    "discurso":    ["fala", "texto falado", "o que se diz", "cadeia de palavras com sentido", "argumento"],
    "pesadelo":    ["sonho ruim", "visão de terror noturno", "angústia no sono", "horror inconsciente"],
    "desolação":    ["desamparo", "abandono extremo", "solidão da perda", "vazio que dói", "estrago total"],
    "nação":    ["povo com identidade", "país", "comunidade histórica", "terra e povo juntos"],
    "aldeia":    ["pequeno vilarejo", "comunidade pequena", "lugar de poucos", "vila", "comunidade"],
    "janela":    ["abertura para o mundo", "olho da casa", "luz que entra", "ver sem sair"],
    "porta":    ["entrada e saída", "limite que se abre", "passagem", "fronteira da casa"],
    "ponte":    ["ligação entre margens", "conexão", "passagem sobre o obstáculo", "o que une"],
    "muro":    ["parede divisória", "barreira", "limite construído", "o que separa"],
    "manhã":    ["amanhecer", "começo do dia", "aurora do cotidiano", "hora da luz nova"],
    "tarde":    ["fim da luz", "quando o sol desce", "hora crepuscular", "momento entre o dia e a noite"],
    "simpatia":    ["afeição", "inclinação para alguém", "gostar sem razão específica", "atração suave"],
    "estratégia":    ["plano", "tática", "modo de alcançar o objetivo", "cálculo do caminho"],

    // v769 — Nascentes D: distração, ventura, honra, eloquência, proteção
    "distração":    ["diversão", "passatempo", "desvio do foco", "ocupação agradável", "entretenimento leve"],
    "diversão":    ["entretenimento", "prazer", "passatempo", "o que dá alegria", "ocupação alegre"],
    "lema":    ["divisa", "máxima", "princípio norteador", "frase que guia", "palavra de ordem"],
    "ventura":    ["boa sorte", "dita", "felicidade que veio", "fortuna inesperada", "acaso favorável"],
    "duplicidade":    ["dobrez", "falsidade", "dois rostos", "hipocrisia", "falar de dois lados"],
    "lamento":    ["queixa", "choro com palavras", "gemido de dor", "pranto expressado", "queixume"],
    "honra":    ["dignidade", "reputação", "bom nome", "o que não se mancha", "integridade pública"],
    "desonra":    ["vergonha", "mancha na reputação", "perda do bom nome", "humilhação pública"],
    "eloquência":    ["poder de convencer com palavras", "oratória", "arte de falar bem", "dicção persuasiva"],
    "persuasão":    ["convencimento", "poder de persuadir", "argumentação eficaz", "levar à concordância"],
    "proteção":    ["amparo", "abrigo", "defesa", "o que cobre do perigo", "cuidado contra o mal"],
    "carência":    ["falta", "ausência do necessário", "privação", "estado de quem não tem o suficiente"],

    // v770 — corpo, tempo, bioma e filosofia
    "carne":    ["tecido vivo", "o que é físico no ser", "corpo mortal", "matéria que respira"],
    "pele":    ["superfície do corpo", "o que cobre", "membrana viva", "a fronteira do eu"],
    "época":    ["era", "período histórico", "tempo marcado", "momento em que se vive"],
    "era":    ["época", "longo período", "era histórica", "tempo de longa duração"],
    "geração":    ["grupo contemporâneo", "quem viveu o mesmo tempo", "filhos do mesmo momento"],
    "sentido":    ["significado", "propósito", "direção de uma ação", "o que justifica", "razão de ser"],
    "sacrifício":    ["renúncia", "entrega total", "abrir mão do próprio por outro", "dom de si"],
    "renúncia":    ["abdicação", "abandono voluntário", "desapego", "deixar para trás por escolha"],
    "aprendizado":    ["crescimento pelo erro", "processo de aprender", "aquisição de saber", "amadurecimento"],
    "reconciliação":    ["volta à paz", "reparação do vínculo", "superar o conflito", "fazer as pazes"],
    "estrangeiro":    ["de outro país", "quem vem de fora", "o que não é daqui", "forasteiro"],
    "exilado":    ["quem foi expulso", "vivendo longe da pátria", "em desterro", "banido"],
    "anseio":    ["desejo intenso", "ânsia", "cobiça do bem", "vontade profunda", "o que o coração quer"],
    "conselho":    ["orientação", "palavra de quem sabe", "guia de ação", "sugestão experiente"],
    "inferno":    ["lugar do tormento", "o oposto do paraíso", "caos sem saída", "lugar de punição"],
    "paraíso":    ["lugar de graça", "bem-aventurança", "o oposto do inferno", "lugar da plenitude"],
    "cerrado":    ["savana brasileira", "bioma do Brasil central", "chapada e campo abertos"],
    "pampa":    ["campanha gaúcha", "planície sul-rio-grandense", "campo aberto do Sul"],

    // v772 — sentidos, espaço, corpo e narrativa: chegando a 1000
    "aroma":    ["perfume", "cheiro agradável", "fragrância", "odor que encanta", "o que cheira bem"],
    "perfume":    ["aroma", "fragrância", "essência olfativa", "cheiro que fica", "memória pelo nariz"],
    "cheiro":    ["odor", "aroma", "fragrância", "o que o nariz capta", "marca olfativa"],
    "toque":    ["contato suave", "o ato de tocar", "pressão leve", "sensação pelo tato"],
    "temperatura":    ["grau de calor", "estado térmico", "o que o corpo sente de quente ou frio"],
    "transparência":    ["clareza", "visibilidade total", "sem opacidade", "o que não esconde nada"],
    "opacidade":    ["falta de clareza", "o que não se vê através", "escuridão leve", "velamento"],
    "canto":    ["ângulo", "recantos", "lugar escondido", "voz em melodia", "seção oculta"],
    "borda":    ["margem", "limite lateral", "orla", "extremo do objeto", "onde termina"],
    "centro":    ["meio", "ponto central", "onde tudo converge", "núcleo", "o coração do espaço"],
    "relato":    ["narração", "conta", "descrição de fatos", "história contada", "testemunho"],
    "trama":    ["enredo", "tecido da narrativa", "o que se urde", "maquinação", "história entrelaçada"],
    "parede":    ["muro interno", "divisória", "o que separa cômodos", "superfície vertical"],
    "teto":    ["cobertura", "o que está acima", "teto que protege", "limite superior"],
    "chão":    ["solo", "superfície que pisamos", "onde se pisa", "fundamento literal"],
    "deslizar":    ["escorregar", "mover-se suavemente", "fluir sem atrito", "passar de leve"],
    "arrastar":    ["puxar pelo chão", "mover com esforço", "levar arrastando", "mover sem erguer"],
    "pousar":    ["aterrissar", "colocar suavemente", "pôr no lugar", "aterrar devagar"],
    "cobiça":    ["ganância", "desejo excessivo", "avidez pelo que não é seu", "apetite desmedido", "desejo pelo que é do outro", "apetite insaciável", "ambição que não pede licença"],
    "coletivo":    ["grupo", "conjunto de pessoas", "o que é de todos", "comunidade", "o plural do eu"],
    "osso":    ["estrutura óssea", "sustentação do corpo", "o que fica depois", "o duro do ser"],
    "nervo":    ["fio sensível", "o que conduz a dor", "tensão do corpo", "vulnerabilidade física"],
    "músculo":    ["tecido contrátil", "força do corpo", "o que move", "fibra de movimento"],

    // v772 — marco 1000: virtude, ganância, moral, ética, atitude, areia, lama
    "virtude":    ["qualidade moral", "excelência interior", "bondade em ação", "atributo do bem"],
    "vício":    ["hábito danoso", "tendência ao mal", "fraqueza de caráter", "o que nos domina"],
    "ganância":    ["cobiça excessiva", "avidez", "desejo de ter mais", "apetite sem limite"],
    "moral":    ["conjunto de valores", "ética vivida", "o que guia o comportamento", "o certo e o errado"],
    "ética":    ["ciência do comportamento", "moral refletida", "princípio de ação", "o que deve ser"],
    "atitude":    ["postura", "forma de agir", "jeito de se colocar", "modo de enfrentar"],
    "areia":    ["grão do litoral", "o que escorre", "tempo que passa", "praia que se desfaz"],

    // v779 — novos campos: leitura/escrita, política, ofícios, corpo, tempo, vida
    "leitor":    ["leitora", "apreciador", "devorador de livros", "fruidor", "intérprete"],
    "escritura":    ["escrita", "texto escrito", "grafismo", "registro", "inscrição"],
    "governo":    ["poder", "estado", "administração pública", "gestão pública", "regime"],
    "lei":    ["norma", "regra", "decreto", "preceito", "código", "legislação"],
    "direito":    ["prerrogativa", "legitimidade", "mérito", "reivindicação", "título"],
    "trabalho":    ["labor", "atividade", "ocupação", "serviço", "empenho", "faina"],
    "arte":    ["criação", "expressão", "obra", "manifestação", "elaboração", "artifício"],
    "artesanato":    ["trabalho manual", "manufatura", "obra de mão", "artesania", "feitura"],
    "cabelo":    ["cabeleira", "fios", "mecha", "madeixa", "trança", "penteado"],
    "século":    ["cem anos", "centúria", "época centenária", "longa era", "período secular"],
    "milênio":    ["mil anos", "era milenar", "tempo profundo", "longo período", "era civilizatória"],
    "trovão":    ["trovoada", "ribombo", "estrondo celeste", "bramido do céu", "troar"],
    "visão":    ["percepção", "perspectiva", "olhar", "contemplação", "panorama"],
    "adolescência":    ["juventude inicial", "puberdade", "idade da mudança", "mocidade", "despertar"],
    "trajetória":    ["caminho", "percurso", "trilha", "jornada", "curso", "itinerário"],

    // craft literário e emoção narrativa
    "forma":    ["estrutura", "molde", "configuração", "arquitetura", "formato", "gênero", "composição"],
    "tema":    ["assunto", "motivo central", "fio condutor", "questão", "núcleo temático", "preocupação", "o que o texto pergunta"],
    "imagem":    ["figura", "metáfora visual", "representação", "ícone", "símbolo", "cena mental", "quadro"],
    "transição":    ["passagem", "corte", "elipse", "ligação", "conexão entre cenas", "salto temporal", "ponte narrativa"],
    "humor":    ["ironia", "leveza", "wit", "graça", "comicidade", "sarcasmo", "deboche literário", "riso que conhece", "incongruência revelada", "riso de reconhecimento", "leveza precisa"],
    "tormento":    ["sofrimento interior", "angústia", "tormenta", "dor psíquica", "martírio", "dilaceração", "peso que não passa"],
    "suspenso":    ["tensão", "expectativa", "incerteza mantida", "suspense", "fio que pode se romper", "dúvida prolongada"],
    "catalisador":    ["gatilho", "elemento que deflagra", "impulso inicial", "o que põe tudo em movimento", "fator desencadeador"],
    "subversao":    ["inversão", "ruptura", "reviravolta", "contestação", "o avesso da expectativa"],
    "anacronismo":    ["deslocamento temporal", "anacronia", "presença do passado no presente", "fora do tempo"],
    "paratexto":    ["título", "epígrafe", "prefácio", "dedicatória", "o que cerca o texto", "entorno da obra"],

    // emoção e estados interiores
    "satisfação":    ["contentamento", "realização", "plenitude", "saciedade", "agrado", "cumprimento"],
    "decepção":    ["desilusão", "frustração", "desapontamento", "desengano", "amargura suave", "quebra de expectativa"],
    "frustração":    ["decepção", "impossibilidade", "barreira interior", "impotência", "corte no desejo"],
    "desilusão":    ["desencanto", "desapontamento", "decepção", "perda de ilusão", "ver sem véu"],
    "despedida":    ["adeus", "partida", "separação", "último encontro", "ruptura afetiva", "o que se deixa"],
    "perturbação":    ["inquietação", "intranquilidade", "agitação interior", "turbulência", "desequilíbrio"],
    "hesitação":    ["dúvida", "vacilação", "indecisão", "pausa antes do gesto", "entre dois caminhos"],
    "peso":    ["fardo", "carga", "gravidade", "ônus", "o que não se larga", "responsabilidade que pesa"],
    "acolhimento":    ["recepção", "amparo", "receptividade", "abertura ao outro", "abraço em sentido amplo"],
    "rejeição":    ["recusa", "exclusão", "repulsa", "negação do outro", "expulsão", "o que dói ao ser recusado"],

    // paisagens e biomas brasileiros
    "vereda":    ["veredão", "galeria de buritis", "baixada úmida", "caminho d'água no cerrado"],
    "savana":    ["campo aberto", "planície arbustiva", "área de campo e cerrado"],
    "barranco":    ["ribanceira", "barranqueira", "falésia fluvial", "margem alta", "beira do abismo"],
    "lagoa":    ["lago raso", "charco", "espelho d'água", "aguado", "olho d'água"],
    "riacho":    ["córrego", "ribeiro", "regato", "ribeirão pequeno", "fio d'água"],
    "brejo":    ["várzea úmida", "pântano raso", "terras alagadiças", "charco", "zona brejosa", "pântano", "alagado", "terra encharcada"],
    "manguezal":    ["mangue", "mata de mangue", "vegetação de maré", "ecossistema costeiro"],

    // sensorialidade e gesto
    "sussurro":    ["murmúrio", "cochicho", "voz de vento", "fala baixa", "som quase silêncio"],
    "espaço":    ["lugar", "ambiente", "cenário", "território", "campo", "vazio habitável", "abertura"],

    // vocabulário político e social
    "democracia":    ["governo do povo", "participação coletiva", "soberania popular", "representação", "direito de voto"],
    "greve":    ["paralisação", "parede", "suspensão do trabalho", "protesto organizado", "ação coletiva trabalhista"],
    "sindicato":    ["entidade de trabalhadores", "associação de classe", "organização laboral", "representação coletiva"],
    "manifesto":    ["declaração de princípios", "proclamação", "carta aberta", "posicionamento público", "programa"],
    "mobilização":    ["articulação coletiva", "organização de base", "convocação", "levante", "ação coordenada"],
    "militância":    ["engajamento político", "ativismo", "atuação de base", "luta organizada", "comprometimento com causa"],
    "igualdade":    ["equidade", "paridade", "mesmos direitos", "isonomia", "horizontalidade"],
    "cidadania":    ["condição de cidadão", "pertencimento político", "direitos e deveres", "participação civil"],
    "política":    ["gestão pública", "relação de poder", "arte do possível", "escolha coletiva", "disputa de projeto"],
    "reforma":    ["transformação", "mudança estrutural", "renovação", "readequação", "revisão"],
    "reivindicar":    ["exigir", "reclamar o direito", "demandar", "pleitear", "lutar por"],
    "território":    ["terra", "espaço vivido", "chão de origem", "lugar de pertença", "área de identidade"],
    "autonomia":    ["independência", "autodeterminação", "soberania", "capacidade de decidir", "liberdade de escolha"],
    "ancestralidade":    ["raízes", "herança dos antepassados", "tradição de origem", "memória genealógica", "vínculo com os que vieram antes"],
    "diáspora":    ["dispersão de um povo", "exílio coletivo", "espalhamento forçado", "migração de identidade", "comunidade no exílio"],

    // afeto e cuidado
    "carinho":    ["afeto", "ternura", "cuidado suave", "afetuosidade", "gesto de amor", "mimo"],

    // identidades regionais brasileiras
    "nordestino":    ["pessoa do Nordeste", "sertanejo", "filho do sertão", "nordestina"],
    "caipira":    ["pessoa do interior", "sertanejo paulista", "matuto", "roceiro", "habitante da roça"],
    "gaúcho":    ["pessoa do Rio Grande do Sul", "peão de estância", "gaucho"],
    "caboclo":    ["mestiço de indígena com branco", "ribeirinho", "morador da floresta", "habitante da beira do rio"],
    "ribeirinho":    ["morador de beira de rio", "pescador artesanal", "habitante de várzea", "pessoa da margem"],

    // ofício da escrita — processo e prática
    "rascunhar":    ["esboçar", "traçar o primeiro jato", "lançar ideias no papel", "abrir o borrador", "fazer rascunho"],
    "revisar":    ["reler com cuidado", "apurar o texto", "corrigir", "lapidar", "aparar arestas", "repassar o manuscrito"],
    "publicar":    ["lançar", "dar ao público", "editar para circulação", "colocar no mundo", "fazer circular a obra"],

    // elementos da narrativa
    "clichê":    ["lugar-comum", "fórmula gasta", "expressão usada demais", "banalidade repetida", "automatismo verbal"],
    "suspense":    ["tensão narrativa", "expectativa crescente", "ansiedade do leitor", "mistério que se acumula", "fio de incerteza"],

    // formas literárias
    "soneto":    ["poema de catorze versos", "forma fixa italiana", "poema em quartetos e tercetos", "estrutura clássica em versos"],
    "cordel":    ["literatura de folheto", "poesia popular nordestina", "texto rimado em sextilhas", "poema de feira"],
    "haiku":    ["poema de três versos", "forma japonesa de 5-7-5 sílabas", "micropoema de imagem", "instante em versos"],

    // figuras de linguagem
    "aliteração":    ["repetição de consoantes", "eco consonantal", "musicalidade pela repetição", "jogo de sons iniciais"],
    "sinestesia":    ["mistura de sentidos", "fusão de percepções", "cor que tem som", "sensação cruzada entre sentidos"],

    // processo editorial
    "manuscrito":    ["texto original do autor", "obra inédita", "material a editar", "rascunho final", "versão autoral"],
    "versão":    ["variante do texto", "etapa de revisão", "estado do manuscrito", "rascunho numerado", "instância da obra"],
    "prefácio":    ["texto de abertura", "apresentação da obra", "palavras iniciais", "introdução assinada", "porta de entrada do livro"],

    // qualidades do texto
    "registro":    ["nível de linguagem", "variante estilística", "camada de formalidade", "modalidade de escrita", "grau de elaboração verbal"],
    "rasura":    ["marca de revisão", "correção no manuscrito", "risco sobre a palavra", "sinal de reescrita", "apagamento visível", "risco de reescrita", "traço do processo", "vestígio da dúvida"],

    // verbos de conflito e tensão
    "redimir":    ["salvar", "resgatar", "lavar a culpa", "recuperar a honra", "dar nova chance"],
    "sucumbir":    ["ceder", "render-se", "cair", "ser vencido", "dobrar-se ao peso"],
    "rebelar":    ["revoltar-se", "insurgir", "resistir", "desobedecer", "quebrar o jugo"],

    // emoções complexas — lacunas frequentes
    "comocao":    ["comoção", "enternecimento", "emoção que paralisa", "arrepio da alma", "impacto que fica"],
    "cumplicidade":    ["conivência com afeto", "parceria secreta", "laço que não se explica", "entendimento mútuo"],

    // natureza BR — paisagem e lugar
    "rocha":    ["pedra", "penedo", "laje", "paredão", "granito"],

    // qualidades de voz e texto
    "lacunar":    ["deixar brechas", "não dizer tudo", "guardar o silêncio", "reticências intencionais", "criar vazio produtivo"],
    "denso":    ["concentrado", "carregado de sentido", "cheio de camadas", "sem espaço para o vazio", "compacto", "espesso", "de muitas camadas"],
    "fluido":    ["que flui sem esforço", "leve de ler", "sem empecilhos", "que corre", "sem atrito"],
    "digressao":    ["desvio intencional", "parêntese narrativo", "saída do fio principal", "escorregada de propósito"],

    // Figuras de linguagem — v825
    "anacoluto":    ["frase quebrada", "ruptura sintática", "pensamento interrompido", "construção abandonada", "anacoluto"],
    "zeugma":    ["omissão elegante", "retomada implícita", "elipse de verbo", "supressão sintática"],
    "gradacao":    ["escalada", "intensificação progressiva", "clímax gradual", "crescendo", "sequência de impacto"],
    "antitese":    ["contraste", "oposição", "polaridade", "tensão de contrários", "paradoxo visual"],
    "apostrofe":    ["invocação", "chamamento", "apelo direto", "vocativo dramático", "grito ao ausente"],
    "perifrase":    ["descrição indireta", "circunlóquio", "rodeio expressivo", "nome expandido"],
    "anafora":    ["repetição de início", "eco de abertura", "refrão de verso", "insistência sonora"],

    // Termos narrativos — v825
    "onisciente":    ["narrador que tudo sabe", "visão de fora e de dentro", "Deus narrativo", "perspectiva total"],
    "anticlimax":    ["decepção calculada", "resolução menor que o esperado", "ironia de desfecho", "queda de expectativa"],

    // Gêneros — v825
    "saga":    ["épico", "ciclo narrativo", "narrativa de gerações", "história longa", "jornada de famílias"],
    "ficcao":    ["literatura de invenção", "narrativa criada", "pacto de fingimento", "realidade construída"],
    "terror":    ["horror", "medo intenso", "pavor literário", "suspense de ameaça", "narrativa de susto"],

    // Emoções — v825

    // Crítica e teoria literária — v828
    "dialogismo":    ["polifonia", "pluralidade de vozes", "diálogo entre textos", "resposta ao já-dito", "bakhtin"],
    "recepcao":    ["recepção do leitor", "interpretação cultural", "resposta crítica", "leitura historicamente situada"],
    "canonico":    ["clássico", "modelar", "referência obrigatória", "canônico", "da tradição"],
    "autoficcao":    ["ficção autobiográfica", "eu ficcionalizado", "escrita de si", "autoficção"],
    "autoficcaolit":    ["ficção autobiográfica", "eu ficcionalizado", "escrita de si", "autoficção"],
    "noir":    ["policial sombrio", "neocrime", "atmosfera pesada", "crime literário", "mundo sem saída"],
    "distopia":    ["anti-utopia", "futuro opressivo", "pesadelo social", "totalitarismo ficcional", "sociedade do controle"],
    "utopia":    ["sociedade ideal", "lugar nenhum", "projeto de futuro", "contra-presente", "sonho coletivo"],

    // Personagem e narrativa — v828
    "antiheroi":    ["protagonista imperfeito", "herói falho", "anti-herói", "protagonista sem brilho", "personagem comum"],
    "foil":    ["contraponto", "personagem-espelho", "contraste intencional", "sombra do protagonista"],
    "coloquial":    ["informal", "próximo", "da conversa", "espontâneo", "linguagem do cotidiano"],

    // Editoração — v828
    "errata":    ["lista de erros", "correções pós-impressão", "folha de correções", "erratas"],
    "diagramacao":    ["composição visual", "distribuição na página", "layout do miolo", "organização tipográfica"],
    "copidesque":    ["revisão editorial", "revisão de texto", "edição de linha", "refinamento do manuscrito"],
    "galera":    ["prova de impressão", "prova tipográfica", "PDF de revisão", "folha para correção"],
    "orelha":    ["aba da sobrecapa", "texto de apresentação", "convite à leitura", "texto da aba"],

    // Verbos expressivos — v836
    "aguardar":    ["esperar com atenção", "ficar na expectativa", "aguardar", "estar à espera"],
    "ansiar":    ["desejar com urgência", "ansiar", "anseiar", "querer com impaciência", "ter sede de"],

    // Adjetivos de estilo — v836
    "laconico":    ["conciso", "breve", "de poucas palavras", "sintético", "telegráfico", "parco em palavras"],
    "prolixo":    ["extenso demais", "verboso", "redundante", "que se repete", "enfadonho", "pleonástico", "que fala além da conta", "difuso", "alongado sem necessidade"],
    "eloquente":    ["expressivo", "persuasivo", "bem falante", "de discurso poderoso", "articulado", "comunicativo", "que convence pela força da linguagem", "expressivo com precisão", "que move o leitor"],
    "ambiguo":    ["de duplo sentido", "que pode ser lido de mais de um modo", "equívoco", "polissêmico", "aberto"],
    "enigmatico":    ["misterioso", "de difícil decifração", "obscuro", "cifrado", "que guarda segredo"],
    "vigoroso":    ["forte", "cheio de energia", "com presença", "robusto", "intenso", "que não treme"],
    "contundente":    ["direto", "que bate forte", "sem rodeios", "de impacto imediato", "contundente"],
    "verossimil":    ["crível dentro do texto", "que parece real", "que o universo justifica", "internamente coerente"],
    "coerente":    ["consistente", "que não se contradiz", "íntegro", "harmônico", "sem incoerência"],
    "universal":    ["que ressoa em qualquer leitor", "atemporal", "que fala do humano", "que transcende o particular"],
    "singular":    ["único", "original", "sem igual", "inconfundível", "que não se imita", "de voz própria"],
    "incisivo":    ["afiado", "direto", "cortante", "preciso", "que não desperdiça"],
    "plausivel":    ["verossímil", "aceitável", "possível", "razoável", "que faz sentido"],

    // Técnicas narrativas — v834
    "flashforward":    ["salto ao futuro", "prolepse", "antevisão", "antecipação narrativa"],
    "prolepse":    ["antevisão", "flashforward", "salto ao futuro", "prenúncio"],
    "analepse":    ["retorno ao passado", "flashback", "memória narrativa", "recuo temporal"],
    "incipit":    ["abertura", "começo do texto", "primeiras palavras", "entrada na obra"],
    "ode":    ["poema de louvor", "lírica elevada", "canto dedicado", "hino poético"],
    "elegia":    ["lamento poético", "canto de perda", "poema de luto", "pranto lírico"],
    "balada":    ["poema narrativo", "forma cantada", "narrativa com refrão", "forma oral"],
    "assonancia":    ["rima de vogais", "eco vocálico", "repetição de som aberto", "musicalidade vocálica"],
    "onomatopeia":    ["palavra sonora", "imitação de som", "palavra que soa como a coisa", "eco fonético"],
    "paronomasia":    ["jogo sonoro", "aproximação fonética", "trocadilho refinado", "eco de sentido"],

    // Gêneros literários — v831
    "novela":    ["narrativa média", "ficção de fôlego médio", "entre o conto e o romance"],
    "poesia":    ["verso", "linguagem poética", "lírica", "escrita do impossível", "palavra que soa"],
    "poema":    ["texto poético", "composição lírica", "verso ou prosa poética", "unidade de poesia"],
    "lirismo":    ["musicalidade", "subjetividade poética", "qualidade lírica", "emoção condensada"],
    "fabula":    ["alegoria moral", "narrativa com lição", "conto de animais", "parábola"],
    "tragedia":    ["queda inevitável", "ruína por falha", "drama do destino", "catarse pela dor"],
    "comedia":    ["drama leve", "situação engraçada", "mal-entendido que se resolve", "riso que aponta"],
    "drama":    ["conflito emocional", "tensão dramática", "peça teatral", "situação intensa"],
    "epico":    ["narrativa heroica", "jornada de proporções maiores", "saga coletiva", "grandioso"],

    // Semântica — v831
    "denotacao":    ["sentido literal", "significado direto", "o que o dicionário diz", "face objetiva da palavra"],
    "conotacao":    ["sentido figurado", "significado cultural", "o que a palavra carrega", "camada afetiva"],

    // Processo criativo — v845
    "fluxo":    ["estado de imersão", "concentração total", "escrita sem fricção", "presença plena"],
    "rotina":    ["hábito de escrita", "ritual criativo", "sequência de preparo", "prática diária"],

    // Pontuação — v845
    "reticencias":    ["suspensão", "hesitação marcada", "silêncio pontuado", "o que não se diz", "três pontos"],
    "travessao":    ["traço de diálogo", "marcador de voz", "ruptura tipográfica", "pausa da dicção"],
    "virgula":    ["pausa breve", "separação de ideias", "respiração da frase", "vírgula de sentido"],

    // Experiência humana — v845
    "trauma":    ["ferida profunda", "marca que reorganiza", "dor que não passa", "ruptura interior"],
    "beleza":    ["adequação perfeita", "harmonia sem sobra", "o que impressiona sem gritar", "exatidão"],
    "alteridade":    ["o outro como legítimo", "reconhecimento da diferença", "olhar que inclui"],
    "oralidade":    ["saberes da fala", "cultura oral", "dicção que não é escrita", "voz antes da letra"],

    // Estética — v845

    // Ações de escrita — v846
    "dialogar":    ["pôr em diálogo", "dar voz a dois", "escrever fala", "construir troca", "conversar em cena"],
    "esbocar":    ["traçar o primeiro contorno", "escrever por alto", "lançar o esqueleto", "rascunhar a ideia"],
    "editar":    ["cortar e apurar", "lapidar o texto", "selecionar e organizar", "afinar a prosa"],
    "corrigir":    ["retificar", "ajustar", "reparar o erro", "revisar com precisão"],
    "aprimorar":    ["refinar", "polir", "elevar a qualidade", "alcançar a forma certa"],
    "reescrever":    ["recomeçar com o que se aprendeu", "refazer com mais clareza", "segunda versão intencional"],

    // Emoções adicionais — v846

    // Estrutura narrativa — v846
    "abertura":    ["primeiro contato com o leitor", "incipit", "o que prende ou perde", "porta de entrada"],
    "fechamento":    ["desfecho", "resolução", "última impressão", "como o texto encerra"],
    "resolucao":    ["desfecho do conflito", "resposta da narrativa", "solução ou ausência dela"],
    "complicacao":    ["nó da trama", "o que dificulta", "tensão crescente", "ponto de virada antes do clímax"],

    // Estilo — v846
    "lacunico":    ["que diz pouco e significa muito", "conciso ao extremo", "econômico com as palavras"],

    // Verbos de sensação física e emoção expressiva — v853
    "estremecer":    ["tremer levemente", "vibrar de susto ou frio", "sacudir por dentro", "titilar"],
    "palpitar":    ["bater forte (coração)", "pulsar", "vibrar de antecipação", "latejo"],
    "sufocar":    ["não conseguir respirar", "estrangular por emoção", "apertar por dentro", "asfixiar"],
    "ofegar":    ["respirar com dificuldade", "arquejar", "halegar", "respirar aos solaços"],
    "suspiro":    ["expiração carregada de emoção", "respiro entre dores", "alívio que soa", "fôlego contido"],
    "solucar":    ["choro cortado pelo soluço", "choro que treme na voz", "solução de choro"],
    "cheirar":    ["perceber pelo olfato", "farejar", "sentir o aroma", "inalar o odor"],
    "provar":    ["perceber pelo paladar", "saborear", "degustar", "sentir o gosto"],

    // Ausência e lacuna — v853
    "lacuna":    ["espaço em branco", "o que falta no texto", "vão que o leitor preenche", "buraco de sentido"],
    "falta":    ["ausência que dói", "o que não está mas pesa", "carência", "necessidade não cumprida"],
    "inimizade":    ["relação de oposição", "ódio organizado", "conflito de longa data", "antipatia com história"],

    // Adjetivos de personagem — v849
    "valente":    ["corajoso", "audacioso", "destemido", "bravo", "que enfrenta o perigo"],
    "generoso":    ["dadivoso", "magnânimo", "pródigo", "que doa sem contar", "de espírito largo"],
    "mesquinho":    ["sovina", "miserável de alma", "pão-duro de sentimentos", "avarento", "pequeno"],
    "elegante":    ["refinado", "de boa forma", "sem esforço aparente", "discreto e certeiro"],
    "saudoso":    ["com saudade", "que carrega o ausente", "guardador do passado", "nostálgico"],
    "ambicioso":    ["que quer mais", "que não se satisfaz", "determinado ou ganancioso segundo o contexto"],
    "cauteloso":    ["prudente", "que pesa antes de agir", "avesso ao risco", "cuidadoso ao extremo"],
    "medroso":    ["covarde", "que recua pelo medo", "tímido diante do perigo", "assustado"],
    "audacioso":    ["ousado", "que age sem calcular o risco", "arrojado", "que vai além"],
    "grosseiro":    ["rude", "sem refinamento", "bruto no trato", "descortês", "que machuca sem intenção"],
    // Outros adjetivos — v849
    "amplo":    ["vasto", "largo", "espaçoso", "abrangente", "sem limite à vista"],
    "digno":    ["merecedor", "que tem dignidade", "de boa postura", "honroso", "decente"],
    "puro":    ["sem mistura", "intocado", "casto", "límpido", "sem segunda intenção"],
    "severo":    ["rigoroso", "austero", "duro no julgamento", "exigente", "sem concessão"],

    // Adjetivos de personagem — v865 (18 lacunas fechadas)
    "altivo":    ["orgulhoso", "altaneiro", "de postura elevada", "que não baixa a cabeça", "sobranceiro"],
    "soberbo":    ["arrogante", "presunçoso", "altivo ao extremo", "que se julga superior", "imperioso"],
    "rancoroso":    ["ressentido", "que guarda mágoa", "que não esquece o que foi feito", "azedo de memória", "vingativo"],
    "tenso":    ["crispado", "contraído", "à beira de romper", "carregado de nervos", "retesado"],
    "melancolico":    ["entristecido sem causa clara", "que carrega peso antigo", "de melancolia", "saudoso e triste", "pensativo e distante"],
    "nostalgico":    ["saudoso", "preso ao passado", "que lembra com dor e amor", "voltado para o que já foi"],
    "traidor":    ["desleal", "que vira as costas", "que trai a confiança", "falso", "que muda de lado"],
    "ingenuo":    ["ingênuo", "sem malícia", "que acredita fácil", "crédulo", "de olhar aberto ao mundo"],
    "astuto":    ["esperto", "maquinador", "sagaz", "que vê o que os outros não veem", "hábil no subterfúgio"],
    "sensato":    ["prudente", "equilibrado", "que pensa antes de agir", "comedido", "de bom senso"],
    "obstinado":    ["teimoso", "que não cede", "determinado ao limite", "implacável", "que não desiste nem quando deveria"],
    "impulsivo":    ["que age antes de pensar", "explosivo", "de reação imediata", "movido pelo instante", "arrebatado"],
    "prudente":    ["cauteloso", "que pesa as consequências", "sensato", "de passo calculado", "que não se arrisca sem motivo"],
    "furioso":    ["enraivecido", "tomado pela raiva", "fora de si", "que não consegue se conter", "irado"],
    "resignado":    ["que aceitou o que não pode mudar", "conformado", "de dor quieta", "que não luta mais", "pacificado pela perda"],
    "amargo":    ["ressentido", "de sabor de frustração", "que foi ferido e ficou", "com mágoa incorporada", "de alegria rara"],
    "apaixonado":    ["tomado pelo amor", "ardente", "que sente demais", "movido pela paixão", "de sentimento intenso"],
    "ciumento":    ["possessivo", "que teme perder", "vigilante por amor ou insegurança", "de olhar desconfiado", "que sofre com o outro"],

    // Processo narrativo e ofício — v866
    "continuar":    ["prosseguir", "seguir em frente", "dar continuidade", "retomar", "não parar"],
    "pausar":    ["interromper por um momento", "suspender", "fazer pausa", "brecar o ritmo", "dar respiro"],
    "fragmentar":    ["partir em pedaços", "quebrar a linearidade", "dispersar", "dividir", "desmembrar"],
    "condensar":    ["comprimir", "reduzir ao essencial", "sintetizar", "enxugar", "adensar sem perder"],
    "cortar":    ["eliminar", "suprimir", "tirar o que sobra", "aparar", "dar o talho certo"],
    "fragmentado":    ["em pedaços", "partido", "não-linear", "quebrado", "de partes soltas que pedem o leitor"],
    "linear":    ["em linha reta", "cronológico", "que segue a ordem natural dos eventos", "sem saltos"],
    "circular":    ["que volta ao começo", "que fecha onde abriu", "de estrutura em anel", "que retorna"],
    "eliptico":    ["com elipses", "que salta no tempo", "que omite sem esconder", "de lacunas calculadas"],
    "planejamento":    ["estruturação", "mapa narrativo", "roteiro", "plano da obra", "esboço organizado"],

    // Verbos de posição moral e movimento interior — v868
    "relutar":    ["hesitar", "fazer com resistência", "estar relutante", "agir contra a vontade", "opor-se internamente"],
    "titubear":    ["vacilar", "hesitar", "oscilar", "não saber se avança ou recua", "tremer na decisão"],
    "capitular":    ["ceder", "render-se", "abrir mão da resistência", "desistir diante do obstáculo", "sucumbir"],
    "insistir":    ["persistir", "não desistir", "continuar mesmo com obstáculo", "teimar com propósito", "pressionar"],
    "persistir":    ["insistir", "continuar apesar de tudo", "não abandonar", "segurar o curso", "resistir ao cansaço"],
    // Adjetivos de estado moral/espiritual
    "arrependida":    ["que lamenta o que fez", "cheia de remorso", "que quer desfazer o passado", "constrangida pela culpa"],
    "desonesto":    ["desleal", "que age de má-fé", "falso", "que engana", "corrupto no trato"],
    "vil":    ["mesquinho", "sem escrúpulos", "baixo de caráter", "que age com crueldade fria", "desprezível"],
    "nobre":    ["elevado de caráter", "generoso", "que age com dignidade", "de alma larga", "austero no bom sentido"],
    "compassivo":    ["que sente pelo outro", "compreensivo", "cheio de compaixão", "que não julga a dor alheia", "solidário"],
    "indiferente":    ["alheio", "que não se move", "frio diante do que acontece", "desinteressado", "neutro ao extremo"],

    // Substantivos de estado interno e cenário — v869
    "vacilacao":    ["hesitação", "oscilação", "incerteza antes da decisão", "titubeo", "não saber para onde ir"],
    "conformismo":    ["resignação passiva", "aceitação sem luta", "que não questiona mais", "acomodação", "paz que cansa"],
    "persistencia":    ["teimosia com propósito", "determinação que não cede", "resistência ao tempo", "insistência fértil"],
    "entardecer":    ["fim da tarde", "crepúsculo que começa", "hora da luz dourada", "declínio do dia", "entre o dia e a noite"],
    "clarao":    ["lampejo de luz", "claridade súbita", "feixe de luz no escuro", "resplendor", "fulgor passageiro"],
    "lampejo":    ["clarão breve", "instante de luz", "raio de consciência", "faísca de ideia", "momento que ilumina"],
    "paralisia":    ["imobilidade forçada", "paralisação", "incapacidade de agir", "travamento", "ficou pregado no lugar"],
    "silencio criativo":    ["seco criativo", "vácuo de ideias", "pausa forçada na criação", "impossibilidade de escrever"],
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
