/**
 * analise-engine.js — Vereda v3
 * Engine offline de análise textual baseado nos 39 critérios do framework editorial.
 * Implementa as métricas computáveis sem LLM: regex, listas locais, estatísticas de frase.
 * Todas as operações são locais — nada é enviado para servidores.
 *
 * Métricas implementadas (21/39) | Condições de alerta: 16
 *   Economia:   adverbios-mente, voz-passiva, redundancia, negacao-dupla
 *   Clareza:    comprimento-frase, pronome-ambiguo, tempo-verbal, subordinacao, flesch-legib
 *   Ritmo:      variacao-frase, distribuicao-frase, repeticao-proxima, abertura-fraca
 *   Voz:        cliche
 *   Estrutura:  proporcao-partes, transicoes
 *   POV:        consistencia-pessoa
 *   Léxico:     verbos-estado, substantivos-vagos
 *   Norma:      pontuação funcional (via punctuation-engine.js, se carregado)
 */
(function analiseEngine(global) {
  "use strict";

  // ── LISTAS LOCAIS ─────────────────────────────────────────────────────────

  const VERBOS_ESTADO = new Set([
    "ser","é","são","era","eram","foi","foram","seja","sejam","fosse","fossem",
    "será","serão","seria","seriam","sendo","sido",
    "estar","está","estão","estava","estavam","esteve","estiveram","esteja","estejam",
    "estivesse","estivessem","estará","estarão","estaria","estariam","estando","estado",
    "ter","tem","têm","tinha","tinham","teve","tiveram","tenha","tenham",
    "tivesse","tivessem","terá","terão","teria","teriam","tendo","tido",
    "haver","há","havia","houve","houveram","haja","hajam","houvesse","houvessem",
    "haverá","haverão","haveria","haveriam","havendo","havido",
    "ficar","fica","ficam","ficava","ficavam","ficou","ficaram","fique","fiquem",
    "ficasse","ficassem","ficará","ficarão","ficaria","ficariam","ficando","ficado",
    "parecer","parece","parecem","parecia","pareciam","pareceu","pareceram",
    "continuar","continua","continuam","continuava","continuou","continuaram",
    "permanecer","permanece","permaneceu","permaneceram",
    "tornar","torna","tornou","tornaram","tornasse",
    "manter","mantém","manteve","mantiveram","mantenha",
    "revelar","revela","revelou","revelaram",
    "mostrar","mostra","mostrou","mostraram",
    "resultar","resulta","resultou","resultaram",
    "representar","representa","representou","representaram",
    "constituir","constitui","constituiu","constituíram",
    "existir","existe","existem","existia","existiu","existiram",
  ]);

  const SUBSTANTIVOS_VAGOS = new Set([
    "coisa","coisas","algo","nada",
    "aspecto","aspectos",
    "questao","questoes",
    "fator","fatores",
    "situacao","situacoes",
    "problema","problemas",
    "elemento","elementos",
    "ponto","pontos",
    "area","areas",
    "contexto","contextos",
    "processo","processos",
    "realidade","realidades",
    "caso","casos",
    "tipo","tipos",
    "forma","formas","maneira","maneiras","modo","modos",
    "parte","partes",
    "conjunto","conjuntos",
    "nivel","niveis",
    "ambito","ambitos",
    "setor","setores",
    "esfera","esferas",
    "campo","campos",
    "tema","temas",
    "assunto","assuntos",
    "motivo","motivos",
    "razao","razoes",
    "causa","causas",
    "efeito","efeitos",
    "impacto","impactos",
    "resultado","resultados",
    "consequencia","consequencias",
    "fenomeno","fenomenos",
    "dimensao","dimensoes",
    "perspectiva","perspectivas",
    "cenario","cenarios",
    "mecanismo","mecanismos",
    "instancia","instancias",
    "formato","formatos",
    "parametro","parametros",
    "objetivo","objetivos",
    "desafio","desafios",
    "abordagem","abordagens",
    "sistema","sistemas",
    "estrutura","estruturas",
    "caracteristica","caracteristicas",
    "instrumento","instrumentos",
    "pressuposto","pressupostos",
    "vertente","vertentes",
    "viés","vis",
  ]);

  const CLIQUES_PT = [
    "no final das contas","em última análise","ao longo do tempo","nos dias de hoje",
    "em um mundo cada vez mais","a grosso modo","de certa forma","em linhas gerais",
    "no que diz respeito","tendo em vista","por outro lado","dito isso","à luz de",
    "no tocante a","sob essa perspectiva","o fato de que","dado que","haja vista",
    "conclui-se que","é de suma importância","vale ressaltar","vale destacar",
    "cabe destacar","cabe ressaltar","nesse contexto","sem sombra de dúvida",
    "é importante ressaltar","é importante destacar","é importante salientar",
    "é sabido que","é notório que","é consenso que","é fato que",
    "diante do exposto","diante disso","sendo assim","dessa forma","desse modo",
    "portanto fica evidente","fica evidente que","cada vez mais","ao mesmo tempo",
    "de maneira geral","como já dito","conforme mencionado","como mencionado",
    "conforme dito","nada mais nada menos","isso posto","em suma","em síntese",
    "em conclusão","por fim","por último","finalmente","desta forma","neste sentido",
    "nesse sentido","por conseguinte","consequentemente","assim sendo",
    // adicionais comuns em textos acadêmicos e jornalísticos
    "é importante frisar","mister se faz","faz-se necessário","no sentido de",
    "em termos de","no bojo de","tendo em conta","levando em consideração",
    "em face de","a título de","no âmbito de","no que concerne",
    "em virtude de","para todos os efeitos","a despeito de","malgrado",
    "em que pese","por sua vez","de fato","a priori","a posteriori",
    "grosso modo","ipso facto","ab initio","sine qua non","stricto sensu",
    "lato sensu","de plano","em tese","em tela","tem-se que","impõe-se que",
    "depreende-se que","infere-se que","ao que tudo indica","tudo leva a crer",
    "não é por acaso que","é mister","é imperioso","é imprescindível frisar",
    "como sabemos","como é sabido","todos sabemos","não podemos negar que",
    // clichês literários — romance brasileiro
    "olhos cor de mel","olhos verdes como","coração acelerou","coração disparou",
    "sentiu um frio na barriga","sentiu um nó na garganta","engoliu em seco",
    "mal conseguia respirar","soltou uma lágrima","uma lágrima escorreu",
    "silêncio foi ensurdecedor","no fundo do seu coração","no fundo de seu coração",
    "não era como os outros","era diferente de todos","nunca havia sentido",
    "nunca tinha sentido aquilo","algo que nunca sentira","algo que jamais sentira",
    "o tempo parou","o tempo parecia ter parado","sem perceber o tempo passar",
    "não havia palavras para descrever","não havia como descrever",
    "sentiu o coração apertar","o coração apertou","o coração se apertou",
    "fez o coração acelerar","fez seu coração bater","seu coração bateu mais forte",
    "uma onda de","oleada de calor","onda de calor percorreu",
    "arrepios percorreram","um arrepio percorreu","teve arrepios",
    "ela sorriu de canto de boca","sorriu de canto","sorrio levemente",
    "sua voz era suave como mel","voz suave como mel",
    "seus lábios macios","lábios carnudos","lábios perfeitos",
    "cabelos esvoaçantes","cabelos ao vento","cabelos negros como a noite",
    "olhos que brilhavam","olhos que faiscavam","olhos que relampejavam",
    // clichês de suspense e drama
    "sangue gelou nas veias","o sangue gelou","segurou a respiração","prendeu a respiração",
    "o tempo estava se esgotando","não sabia que era a última vez","como se fosse a última vez",
    "de repente um barulho","os olhos se encheram de lágrimas","olhos enchidos de lágrimas",
    "segurou as lágrimas","conteve as lágrimas",
    // clichês de romance universal
    "amor à primeira vista","almas gêmeas","destinados a se encontrar",
    "não conseguia tirar os olhos dela","não conseguia tirar os olhos dele",
    "não conseguia parar de pensar nela","não conseguia parar de pensar nele",
    // clichês de ficção e prosa literária
    "noite estrelada","noite de lua cheia","vento uivava","vento gelado",
    "correu para seus braços","jogou-se em seus braços","sentiu-se flutuar",
    "perdeu-se em seus olhos","mergulhou em seus olhos","afogou-se em seus olhos",
    "ela era linda demais","ele era lindo demais",
    // clichês de redação acadêmica / escolar
    "o presente trabalho","ao longo deste artigo","ao longo desta pesquisa",
    "no decorrer desta análise","destarte","não obstante isso",
    "no que tange a","no que tange ao","no que tange à",
    "de forma significativa","torna-se mister","hodiernamente",
    "doravante","supracitado","no contexto atual",
    "inegavelmente","precipuamente","imprescindível mencionar",
    // mais clichês acadêmicos e de ensaio escolar
    "desde tempos imemoriais","em pleno século xxi","desde os primórdios",
    "tecido social","na esteira de","à guisa de","em sede de",
    // clichês de narrativa e drama sentimental
    "não era mais o mesmo","nunca mais foi o mesmo","tudo havia mudado",
    "nada mais seria como antes","o mundo jamais seria o mesmo",
    "sentiu o peso do mundo","o peso dos anos","o peso do passado",
    "foi como se o chão sumisse","o chão sumiu sob seus pés",
    "o coração partido","coração em pedaços","coração aos cacos",
    "uma voz dentro dela","uma voz dentro dele","uma voz interior",
    "fez de tudo para não chorar","lutou para não chorar","segurou as lágrimas",
    "olhos marejaram","olhos marejados","olhos rasos d'água",
    "respirou fundo","tomou um fôlego","coletou os pensamentos",
    // clichês de thriller e suspense
    "estava sendo observado","tinha a sensação de ser seguido",
    "algo estava errado","alguma coisa estava errada","presentiu o perigo",
    "na calada da noite","sob o manto da noite","coberto pela escuridão",
    "ninguém ouviria seu grito","ninguém poderia ouvi-la","gritou mas ninguém ouviu",
    "era tarde demais","já era tarde demais","quando percebeu já era tarde",
    // clichês de fantasia e ficção especulativa
    "o escolhido","a escolhida","ela era a prometida","ele era o prometido",
    "estava destinada a","estava destinado a","seu destino era",
    "o bem contra o mal","a luta entre o bem e o mal","forças do mal",
    "magia antiga","poder ancestral","segredo antigo","saber ancestral",
    // clichês de redação e texto argumentativo
    "é necessário que a sociedade","faz-se urgente que","é dever do estado",
    "para que isso seja possível","para que tal seja possível",
    "é fundamental que","é primordial que","é essencial que se",
    "olhando pelo retrovisor da história","ao longo dos séculos",
    // clichês de diálogo e voz narrativa
    "— você não entende","— você nunca vai entender",
    "— eu precisava te dizer","— precisava te contar isso",
    "— foi só um sonho","— tudo não passou de um sonho",
    "— precisamos conversar","— temos que conversar",
    "— o que você está fazendo aqui","— o que você quer de mim",
    "disse com um sorriso","disse ela com um sorriso","disse ele sorrindo",
    "respondeu sem olhar","respondeu sem olhá-la","respondeu virando o rosto",
    // clichês de autoconhecimento e transformação
    "encontrar a si mesmo","encontrar a si mesma","se encontrar de verdade",
    "a melhor versão de si","a melhor versão dele","a melhor versão dela",
    "aprender a se amar","aprender a se aceitar","se aceitar de verdade",
    "dar a volta por cima","levantar a cabeça","erguer a cabeça",
    "recomeçar do zero","começar do zero","começar tudo de novo",
    // clichês de ação e clímax
    "tudo aconteceu muito rápido","aconteceu muito depressa",
    "não havia tempo a perder","não tinha tempo a perder",
    "era agora ou nunca","era a última chance","seria a última oportunidade",
    "foi mais forte que ela","foi mais forte que ele","foi mais forte do que ela",
    // clichês de filosofia popular e resignação
    "a vida é feita de escolhas","tudo acontece por uma razão","o destino quis assim",
    "tudo tem um motivo","as coisas acontecem quando devem acontecer",
    "o tempo cura tudo","o tempo é o melhor remédio","o tempo dirá",
    "no final vai dar tudo certo","vai ficar tudo bem","tudo vai passar",
    "mais fácil falar do que fazer","é o que é","faz parte da vida",
    // clichês de narrativa descritiva
    "o silêncio que se seguiu","seguiu-se um silêncio","o silêncio pesou",
    "respirou aliviado","soltou um suspiro de alívio","aliviado suspirou",
    "era apenas o começo","seria apenas o início","ainda havia muito pela frente",
    "não era de surpreender","não foi surpresa para ninguém",
    "uma longa jornada","uma longa e difícil jornada","uma jornada sem volta",
    // clichês de thriller psicológico e narrativa de mistério
    "havia algo errado naquele sorriso","algo nele não batia","algo nela não batia",
    "seus olhos diziam o contrário","os olhos não mentem","os olhos nunca mentem",
    "ela sabia mais do que aparentava","ele sabia mais do que parecia",
    "não havia saída","não havia como escapar","não havia para onde correr",
    "o passado sempre volta","ninguém escapa do passado","o passado cobra seu preço",
    "ela tinha um segredo","ele guardava um segredo","carregava um segredo",
    // clichês de autoficção e narrativa de superação
    "aprendi que","o que aprendi foi","essa experiência me ensinou que",
    "hoje sou uma pessoa diferente","hoje sou outra pessoa","mudei completamente",
    "foi a pior fase da minha vida","foi o período mais difícil",
    "não reconhecia mais a pessoa que eu era","não me reconhecia mais no espelho",
    "saí mais forte","saí mais forte dessa experiência","saí fortalecido",
    // clichês de narrativa memorialista
    "lembro como se fosse hoje","como se tivesse acontecido ontem",
    "nunca esquecerei aquele dia","aquele dia ficou gravado na memória",
    "foi naquele momento que tudo mudou","foi aí que minha vida mudou",
    // clichês de linguagem motivacional e autoajuda
    "sair da zona de conforto","se desafiar a cada dia","no final do dia",
    "ao final do dia","a jornada é o destino","não desista dos seus sonhos",
    "acredite no seu potencial","transforme seu sonho em realidade",
    "cada dia é uma nova oportunidade","sucesso não vem por acaso",
    "ir além dos limites","o limite é a sua mente","quem planta colhe",
    "foco, força e fé","sonho grande","sonhos não têm prazo de validade",
    "se não você quem","batalhar todos os dias","conquistar o mundo",
    "de dentro para fora","trabalhe em silêncio e deixe o sucesso fazer barulho",
    // clichês de crônica e texto jornalístico brasileiro
    "cidadão de bem","trabalhador honesto","povo brasileiro",
    "país de contrastes","o brasileiro é resiliente","na terra do carnaval",
    "somos um povo caloroso","a realidade brasileira",
    "em um país de tantas desigualdades","não é simples assim",
    "é mais complexo do que parece","como todos sabemos",
    "não é novidade para ninguém","o cotidiano do brasileiro",
    // clichês de linguagem corporal estereotipada
    "cerrou o maxilar","apertou os punhos","bateu a porta com força",
    "não olhou para trás","desapareceu na multidão",
    "engoliu a dor em silêncio","carregava o peso sozinho",
    "era forte por fora mas por dentro","nunca mostrava fraqueza",
    // clichês de paisagem e natureza descritiva
    "o sol se punha no horizonte","o horizonte se pintou de vermelho",
    "as estrelas cintilavam no céu","a lua cheia iluminava",
    "o vento sussurrava entre as folhas","as folhas tremiam ao vento",
    "o rio corria manso","o silêncio da floresta",
    "a natureza parecia cúmplice","o pôr do sol pintou o céu",
    // clichês de romance young adult (YA)
    "não era como as outras garotas","não era como os outros garotos",
    "havia algo diferente nele","havia algo diferente nela",
    "nunca havia conhecido alguém assim","nunca se sentira tão vivo",
    "ele a fez sentir especial","ela o fez se sentir especial",
    "não conseguia parar de sorrir","o coração deu um salto",
    "o coração disparou no peito","sentiu borboletas no estômago",
    "não era o tipo dele","não era o tipo dela",
    "foram os dias mais felizes da sua vida",
    "sabia que seria diferente dessa vez","desta vez seria diferente",
    // clichês de ficção contemporânea urbana
    "olhava para o teto sem conseguir dormir","virou para o outro lado da cama",
    "acordou sem saber onde estava","olhou para o espelho e não se reconheceu",
    "o apartamento estava em silêncio","o silêncio era ensurdecedor",
    "pegou o celular e viu que não tinha mensagens","verificou o celular mais uma vez",
    "tentou lembrar como era feliz","tentou lembrar quando tudo havia mudado",
    "havia lido aquela mensagem mil vezes","não conseguia apagar aquela imagem da cabeça",
    // clichês de narrativa de empoderamento e autodescoberta
    "encontrou a si mesmo","encontrou a si mesma",
    "a experiência a transformou","a experiência o transformou",
    "saiu uma pessoa diferente","não era mais o mesmo após aquilo",
    "aprendeu a amar a si mesmo","aprendeu a amar a si mesma",
    "pela primeira vez na vida se sentiu inteira","se sentiu completo pela primeira vez",
    "percebeu que merecia ser feliz","todos merecem ser felizes",
    // thriller e suspense
    "suores frios escorreram pela testa","sentiu um arrepio percorrer a espinha",
    "o tempo pareceu congelar","cada segundo contava",
    "correu como se a vida dependesse disso","apertou os dentes e continuou",
    // clichês de diálogo
    "não é o que parece","tudo que você precisa saber é que",
    "há coisas que é melhor não saber","confie em mim",
    "não posso explicar agora","não temos tempo para isso",
    "você não ia acreditar se eu contasse","é uma longa história",
    // personagem sábio secundário
    "os olhos do velho brilharam","o ancião sorriu com sabedoria",
    "as rugas do rosto contavam histórias","havia tristeza nos olhos dele",
    "uma luz estranha brilhava em seus olhos","o silêncio foi sua resposta",
    // cenário urbano
    "a cidade que nunca dorme","as luzes da cidade",
    "o asfalto molhado","sirenes ao longe","o cheiro de chuva na cidade",
    // ficção científica
    "a humanidade nunca mais seria a mesma","uma nova era havia começado",
    "a tecnologia havia avançado além da imaginação",
    "os humanos haviam ido longe demais","jogaram com forças que não podiam controlar",
    // fantasia
    "o destino havia sido traçado","a profecia se cumpriria",
    "havia sido escolhido","tinha um dom especial",
    "o mal despertou","a luz venceu as trevas","o equilíbrio foi restaurado",
    // reflexões literárias gastas
    "o inevitável havia chegado","o destino bateu à porta",
    "o passado não morre","a memória é uma arma de dois gumes",
    "ninguém escapa de si mesmo","o homem é o lobo do homem",
    "a natureza humana não muda","a história se repete",
  ];

  const PLEONASMOS = [
    ["completamente terminado","terminado"],["subir para cima","subir"],
    ["descer para baixo","descer"],["entrar para dentro","entrar"],
    ["sair para fora","sair"],["voltar de volta","voltar"],
    ["juntamente com","junto com"],["há anos atrás","há anos"],
    ["resultado final","resultado"],["planejamento futuro","planejamento"],
    ["nova inovação","inovação"],["elo de ligação","elo"],
    ["colaborar juntos","colaborar"],["repetir de novo","repetir"],
    ["certeza absoluta","certeza"],["monopólio exclusivo","monopólio"],
    ["experiência vivida","experiência"],["acabamento final","acabamento"],
    ["surpresa inesperada","surpresa"],["encarar de frente","encarar"],
    ["interagir entre si","interagir"],["ganho extra","ganho adicional"],
    ["detalhes minuciosos","detalhes"],["relato verbal","relato"],
    ["outra alternativa","alternativa"],["hemorragia de sangue","hemorragia"],
    ["criar novos empregos","criar empregos"],["panorama geral","panorama"],
    ["excesso de sobras","sobras"],["cadáver morto","cadáver"],
    ["conviver juntos","conviver"],["premissa prévia","premissa"],
    ["prever antecipadamente","prever"],["retornar de volta","retornar"],
    ["comparecer pessoalmente","comparecer"],["biografia de vida","biografia"],
    ["a razão é porque","a razão é que"],
    ["onde quer que seja","onde quer que"],["metade da metade","um quarto"],
    ["dois irmãos gêmeos","gêmeos"],["primeira estreia","estreia"],
    ["previsão futura","previsão"],["fato verídico","fato"],
    ["possível hipótese","hipótese"],["avançar para frente","avançar"],
    ["recuar para trás","recuar"],["importar para dentro","importar"],
    ["exportar para fora","exportar"],["breve síntese","síntese"],
    ["consenso geral","consenso"],["opinião pessoal","opinião"],
    ["suicídio voluntário","suicídio"],["regressar de volta","regressar"],
    ["perspectiva futura","perspectiva"],["somente apenas","somente"],
    ["bom êxito","êxito"],["sorriso nos lábios","sorriso"],
    ["período de tempo","período"],["habitat natural","habitat"],
    ["urgência imediata","urgência"],["totalmente grátis","grátis"],
    ["prioridade prioritária","prioridade"],["abortar o feto","abortar"],
    ["vereador municipal","vereador"],["continuar persistindo","persistir"],
    ["acordo mútuo","acordo"],["protagonista principal","protagonista"],
    ["gritar em voz alta","gritar"],["multidão de pessoas","multidão"],
    ["ruído barulhento","ruído"],["recordar de memória","recordar"],
    ["planejar antecipadamente","planejar"],
    // novas entradas — redundâncias frequentes em textos brasileiros
    ["pequenos detalhes","detalhes"],["totalmente completo","completo"],
    ["continuar ainda","continuar"],["subir acima","subir"],
    ["descer abaixo","descer"],["juntar junto","juntar"],
    ["unir juntos","unir"],["criar do zero","criar"],
    ["herança deixada","herança"],["legado deixado","legado"],
    ["tumor maligno cancerígeno","tumor maligno"],
    ["enxergar com os olhos","enxergar"],["ouvir com os ouvidos","ouvir"],
    ["pensar mentalmente","pensar"],["lembrar-se de memória","lembrar-se"],
    ["fato real","fato"],["realidade factual","realidade"],
    ["a nível de","em termos de"],["em nível de","em termos de"],
    ["processo seletivo de seleção","processo seletivo"],
    ["plano de planejamento","plano"],["atividade em atividade","atividade"],
    ["futuro porvir","futuro"],["mero pretexto","pretexto"],
    ["hábito costumeiro","hábito"],["viúva do marido falecido","viúva"],
    ["falso pretexto","pretexto"],["questionar com perguntas","questionar"],
    ["novidade nova","novidade"],
    ["acrescentar mais","acrescentar"],["antecipar antes","antecipar"],
    ["até hoje ainda","até hoje"],["completamente vazio","vazio"],
    ["engordar de peso","engordar"],["eliminar de vez","eliminar"],
    ["hipótese possível","hipótese"],["livre e solto","livre"],
    ["muito excessivo","excessivo"],["passado antigo","passado"],
    ["primeiro início","início"],["recordação de memória","recordação"],
    ["rever outra vez","rever"],["retorno de volta","retorno"],
    ["separar individualmente","separar"],["unânime de todos","unânime"],
    ["juntos ao mesmo tempo","juntos"],["reimprimir de novo","reimprimir"],
    ["meia metade","metade"],["herança hereditária","herança"],
    ["sequela posterior","sequela"],["viés tendencioso","viés"],
    ["presente atualmente","atualmente"],["emigrar para fora","emigrar"],
    ["imigrar para dentro","imigrar"],["adiantamento prévio","adiantamento"],
    ["promessa futura","promessa"],["lamentar tristemente","lamentar"],
    ["silêncio mudo","silêncio"],["relembrar de novo","relembrar"],
    ["nunca jamais","nunca"],["rosto facial","rosto"],
    ["memória do passado","memória"],["madrugada da noite","madrugada"],
    ["amanhecer do dia","amanhecer"],["breve resumo","resumo"],
    ["certamente com certeza","certamente"],["calar a boca","calar"],
    ["repetir mais uma vez","repetir"],["improvisar de repente","improvisar"],
    // mais pleonasmos comuns em prosa e redação
    ["elo de ligação entre","elo entre"],["livre e espontânea vontade","livre vontade"],
    ["estranho e incomum","incomum"],["simples e singelo","singelo"],
    ["trágico e fatal","fatal"],["absurdo e ilógico","absurdo"],
    ["inesperado e surpreendente","surpreendente"],["velho e antigo","antigo"],
    ["jovem e novo","jovem"],["vivo e em vida","vivo"],
    ["verdadeiro fato","fato"],["falsa mentira","mentira"],
    ["subir para o alto","subir"],["descer para o fundo","descer"],
    ["criar do nada","criar"],["destruir completamente","destruir"],
    ["acabar de vez","acabar"],["terminar de uma vez","terminar"],
    ["aparecer de repente","aparecer"],["desaparecer de repente","desaparecer"],
    ["entrar para dentro de","entrar em"],["sair de dentro de","sair de"],
    // redundâncias corporais e de ação
    ["ver com os olhos","ver"],["sorrir com os lábios","sorrir"],
    ["pensar com a mente","pensar"],["trabalhar laboriosamente","trabalhar"],
    ["viver a vida","viver"],["chorar com lágrimas","chorar"],
    ["caminhar com as pernas","caminhar"],["cair para baixo","cair"],
    // pares de sinônimos redundantes (figuras de acumulação)
    ["assassinar e matar","assassinar"],["erros e equívocos","erros"],
    ["dor e sofrimento","dor"],["regras e normas","regras"],
    ["medo e receio","medo"],["triste e abatido","abatido"],
    ["coragem e bravura","coragem"],
    // redundâncias em prosa literária e redação escolar
    ["falar verbalmente","falar"],["escrever por escrito","escrever"],
    ["ver com os próprios olhos","ver"],["retroceder para trás","retroceder"],
    ["único e exclusivo","único"],["proibido e vetado","proibido"],
    ["novamente de novo","novamente"],["começo e início","início"],
    ["fim e término","fim"],["medo e temor","medo"],
    ["grande e enorme","enorme"],["pequeno e minúsculo","minúsculo"],
    ["escuro e sem luz","escuro"],["claro e luminoso","claro"],
    ["completamente perfeito","perfeito"],["velho veterano","veterano"],
    ["morrer de morte","morrer"],["certeza e convicção","certeza"],
    ["alegria e felicidade","alegria"],["grave e sério","grave"],
  ];

  const NEGACOES_DUPLAS = [
    /não\s+é\s+(in|im|ir|des|dis|a)\w+/gi,
    /não\s+são\s+(in|im|ir|des|dis|a)\w+/gi,
    /não\s+era\s+(in|im|ir|des|dis|a)\w+/gi,
    /não\s+foi\s+(in|im|ir|des|dis|a)\w+/gi,
    /nunca\s+é\s+(in|im|ir|des|dis|a)\w+/gi,
    /não\s+seria\s+(in|im|ir|des|dis|a)\w+/gi,
    /não\s+parece\s+(in|im|ir|des|dis|a)\w+/gi,
  ];

  const CONECTIVOS_LOGICOS = [
    "portanto","logo","assim","consequentemente","por conseguinte","dessa forma",
    "desse modo","sendo assim","então","por isso","por essa razão","por tanto",
    "todavia","contudo","porém","entretanto","no entanto","apesar disso",
    "ainda assim","mesmo assim","de toda forma","de todo modo","de qualquer forma",
    "não obstante","seja como for",
    "além disso","ademais","também","igualmente","da mesma forma","outrossim",
    "por outro lado","em contrapartida","ao contrário","diferentemente",
    "primeiro","segundo","terceiro","por fim","finalmente","por último",
    "inicialmente","em seguida","depois","posteriormente","anteriormente","a partir daí",
    "por exemplo","como por exemplo","como","tal como","assim como",
    "de fato","com efeito","realmente","na verdade","efetivamente",
    "em resumo","em síntese","em suma","concluindo","para concluir",
    "ou seja","isto é","quer dizer","em outras palavras",
    "nesse sentido","nesse contexto","diante disso","em vista disso",
    "com isso","uma vez que","visto que","posto que",
  ];

  const PALAVRAS_FRACAS_ABERTURA = new Set([
    "o","a","os","as","um","uma","uns","umas",
    "que","de","do","da","dos","das","no","na","nos","nas",
    "e","mas","ou","porem","todavia","contudo","entretanto",
    "tambem","ainda","ja","so","apenas","muito","bem","mal",
    "ha","houve","teve","foi","era","estava","tinha",
    "assim","portanto","logo","nisto","nesse","nessa","neste","nesta",
  ]);

  // ── TOKENIZADORES ─────────────────────────────────────────────────────────

  function tokenizarFrases(texto) {
    // Divide em sentenças por . ! ? com proteção de abreviações comuns
    return texto
      .replace(/\b(Sr|Sra|Dr|Dra|Prof|Profa|etc|vs|al|op|cit|vol|cap|fig|pág)\./gi, "$1⊙")
      .split(/(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÜÇ])/u)
      .map(s => s.replace(/⊙/g, ".").trim())
      .filter(s => s.length > 3);
  }

  function tokenizarPalavras(frase) {
    return (frase.match(/[\p{L}''-]+/gu) || []);
  }

  function normalizar(palavra) {
    return palavra
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/['']/g, "");
  }

  function contarPalavras(texto) {
    return (texto.match(/[\p{L}''-]+/gu) || []).length;
  }

  function contarSilabas(palavra) {
    const v = normalizar(palavra).match(/[aeiouáéíóúâêôãõü]/gi);
    return v ? v.length : 1;
  }

  // ── STOPWORDS (para análise de repetição) ─────────────────────────────────

  const STOPWORDS = new Set([
    "a","ao","aos","aquela","aquelas","aquele","aqueles","aquilo","as","ate","atem",
    "com","como","cada","cujo","cuja","cujos","cujas",
    "da","das","de","dela","delas","dele","deles","depois","desde","do","dos",
    "desse","dessa","desses","dessas","deste","desta","destes","destas","disso","disto",
    "e","ela","elas","ele","eles","em","entre","era","eram","essa","essas","esse",
    "esses","esta","estas","este","estes","eu","foi","foram","ha","isso","isto",
    "ja","lhe","lhes","lo","la","las","los","mas","me","mesmo","meu","minha","minhas","meus",
    "mais","menos","muito","mal","bem",
    "na","nas","nao","nas","nem","no","nos","nossa","nossas","nosso","nossos","nunca",
    "nesse","nessa","nesses","nessas","neste","nesta","nestes","nestas","nisso","nisto",
    "num","numa","o","os","ou","para","pela","pelas","pelo","pelos","por","porque","pois",
    "qual","quais","quem","quando","que","se","sem","seu","sua","suas","seus",
    "sempre","so","sobre","tambem","te","tanto","tanta","tantos","tantas",
    "tinha","tinham","toda","todas","todo","todos","tu","tua","tuas","teu","teus",
    "um","uma","uns","umas","voce","voces","vos","ser","ter","haver","estar","fazer",
    "sendo","tendo","havendo","estando","fazendo","indo",
    "tudo","nada","algo","alguem","ninguem","si","mim","ti",
    "vai","vao","vem","vou","iam","ia","vamos","veio","vim",
    "estou","esta","estao","estava","estavam","estive","estiveram",
    "fica","ficam","fico","ficava","ficaram","ficou",
    "proprio","propria","proprios","proprias",
    "assim","logo","entao","portanto","porem","todavia","contudo",
  ]);

  // ── MÉTRICAS: ECONOMIA ────────────────────────────────────────────────────

  function analisarEconomia(texto, frases, totalPalavras, contexto = {}) {
    const palavras = tokenizarPalavras(texto);
    const lower = texto.toLowerCase();
    const skipPleonasmos = Boolean(contexto.skipPleonasmos);

    // 1. Adverbios -mente
    const adverbios = palavras.filter(p => normalizar(p).endsWith("mente"));
    const densidadeAdv = totalPalavras > 0 ? adverbios.length / totalPalavras : 0;

    // 2. Voz passiva aproximada
    const passiva = [...texto.matchAll(/\b(foi|foram|é|são|era|eram|será|serão|seria|seriam|fosse|fossem|tenha sido|tenham sido|tem sido|têm sido|está sendo|estava sendo|estão sendo)\s+\w+(?:ado|ada|ados|adas|ido|ida|idos|idas)\b/gi)];
    const propPassiva = frases.length > 0 ? passiva.length / frases.length : 0;

    // 3. Redundância / pleonasmos
    const redEncontradas = skipPleonasmos
      ? []
      : PLEONASMOS.filter(([p]) => lower.includes(p.toLowerCase())).map(([p]) => p);

    // 4. Negação dupla/indireta
    const negacoes = [];
    NEGACOES_DUPLAS.forEach(re => {
      const matches = [...texto.matchAll(re)];
      negacoes.push(...matches.map(m => m[0]));
    });

    return {
      adverbiosMente: { valor: adverbios.length, densidade: +(densidadeAdv * 100).toFixed(1), lista: adverbios.slice(0, 8) },
      vozPassiva: { ocorrencias: passiva.length, proporcao: +(propPassiva * 100).toFixed(1), exemplos: passiva.slice(0, 3).map(m => m[0]) },
      redundancia: { ocorrencias: redEncontradas.length, lista: redEncontradas },
      negacaoDupla: { ocorrencias: negacoes.length, lista: [...new Set(negacoes)].slice(0, 5) },
    };
  }

  // ── MÉTRICAS: CLAREZA ─────────────────────────────────────────────────────

  function analisarClareza(frases, totalPalavras) {
    const comprimentos = frases.map(f => tokenizarPalavras(f).length).filter(n => n > 0);
    if (!comprimentos.length) return {};

    const media = comprimentos.reduce((a, b) => a + b, 0) / comprimentos.length;
    const dp = Math.sqrt(comprimentos.reduce((a, b) => a + Math.pow(b - media, 2), 0) / comprimentos.length);

    // Pronomes ambíguos — alta densidade de pronome de 3ª pessoa após múltiplos substantivos
    const frasesComEleEla = frases.filter(f => {
      const ws = tokenizarPalavras(f).map(normalizar);
      const ele = ws.filter(w => ["ele","ela","eles","elas","o","a","os","as","lhe","lhes","lo","la"].includes(w)).length;
      const subs = ws.filter(w => w.length > 3 && !STOPWORDS.has(w)).length;
      return ele >= 2 && subs >= 2;
    });

    // Subordinação: conta conectivos subordinativos por frase
    const SUBORD = ["que","quando","enquanto","se","porque","pois","embora","ainda que","mesmo que","apesar","caso","para que","a fim","salvo","exceto","conforme","segundo","como"];
    const frasesComSubord = frases.filter(f => {
      const lower = f.toLowerCase();
      const count = SUBORD.filter(s => lower.includes(` ${s} `) || lower.startsWith(`${s} `)).length;
      return count >= 3;
    });

    // Coerência de tempo verbal (detecção de mistura presente/passado)
    const PRES = /\b(é|são|está|estão|tem|têm|faz|fazem|vai|vão|pode|podem|deve|devem|fica|ficam)\b/gi;
    const PASS = /\b(foi|foram|era|eram|estava|estavam|tinha|tinham|fez|fizeram|foi|foram|pôde|puderam|devia|deviam|ficou|ficaram)\b/gi;
    let mistura = 0;
    frases.forEach(f => {
      const hasPres = PRES.test(f);
      const hasPass = PASS.test(f);
      PRES.lastIndex = 0; PASS.lastIndex = 0;
      if (hasPres && hasPass) mistura++;
    });

    return {
      comprimentoMedio: +media.toFixed(1),
      desvioPadrao: +dp.toFixed(1),
      frasesLongas: comprimentos.filter(n => n > 35).length,
      frasesVeryLong: comprimentos.filter(n => n > 50).length,
      pronomeAmbiguo: { suspeitas: frasesComEleEla.length },
      subordinacaoExcessiva: { frasesProblematicas: frasesComSubord.length },
      tempoVerbal: { frasesComMistura: mistura },
    };
  }

  // ── MÉTRICAS: RITMO ───────────────────────────────────────────────────────

  function analisarRitmo(texto, frases) {
    const comprimentos = frases.map(f => tokenizarPalavras(f).length).filter(n => n > 0);
    if (!comprimentos.length) return {};

    const media = comprimentos.reduce((a, b) => a + b, 0) / comprimentos.length;
    const dp = Math.sqrt(comprimentos.reduce((a, b) => a + Math.pow(b - media, 2), 0) / comprimentos.length);

    const curtas = comprimentos.filter(n => n < 8).length;
    const medias = comprimentos.filter(n => n >= 8 && n <= 20).length;
    const longas = comprimentos.filter(n => n > 20).length;
    const total = comprimentos.length;

    // Repetição lexical próxima (janela de 3 frases)
    const lemmas = frases.map(f =>
      tokenizarPalavras(f).map(normalizar).filter(w => w.length > 3 && !STOPWORDS.has(w))
    );
    const repeticoes = [];
    for (let i = 0; i < lemmas.length; i++) {
      const janela = new Set([...(lemmas[i-1]||[]), ...(lemmas[i+1]||[]), ...(lemmas[i+2]||[])]);
      lemmas[i].forEach(w => {
        if (janela.has(w) && !repeticoes.includes(w)) repeticoes.push(w);
      });
    }

    // Abertura/fecho fraco de parágrafo
    const paragrafos = texto.split(/\n\s*\n/).filter(p => p.trim().length > 20);
    let aberturasFracas = 0;
    paragrafos.forEach(p => {
      const primeiraPalavra = normalizar((tokenizarPalavras(p.trim())[0]) || "");
      if (PALAVRAS_FRACAS_ABERTURA.has(primeiraPalavra)) aberturasFracas++;
    });

    return {
      variacaoFrase: { dp: +dp.toFixed(1), nivel: dp < 4 ? "baixo" : dp < 10 ? "moderado" : "alto" },
      distribuicaoFrases: {
        curtas: curtas, curtas_pct: +((curtas/total)*100).toFixed(0),
        medias: medias, medias_pct: +((medias/total)*100).toFixed(0),
        longas: longas, longas_pct: +((longas/total)*100).toFixed(0),
      },
      repeticaoProxima: { ocorrencias: repeticoes.length, lista: repeticoes.slice(0, 8) },
      aberturaFracos: { paragrafos: paragrafos.length, aberturasFracas },
    };
  }

  // ── MÉTRICAS: VOZ ─────────────────────────────────────────────────────────

  function analisarVoz(texto, contexto = {}) {
    const lower = texto.toLowerCase();
    const encontrados = (contexto.skipCliches ? [] : CLIQUES_PT.filter(c => lower.includes(c)));
    return {
      cliches: { ocorrencias: encontrados.length, lista: encontrados.slice(0, 10) },
    };
  }

  // ── MÉTRICAS: ESTRUTURA ───────────────────────────────────────────────────

  function analisarEstrutura(texto, frases, totalPalavras) {
    const paragrafos = texto.split(/\n\s*\n/).filter(p => p.trim().length > 10);

    // Proporção entre partes (intro/miolo/conclusão estimados por posição)
    let proporcao = null;
    if (paragrafos.length >= 3) {
      const pWords = paragrafos.map(p => contarPalavras(p));
      const total = pWords.reduce((a, b) => a + b, 0);
      const intro = pWords[0];
      const conclusao = pWords[pWords.length - 1];
      proporcao = {
        intro_pct: +((intro/total)*100).toFixed(0),
        conclusao_pct: +((conclusao/total)*100).toFixed(0),
        equilibrado: intro/total < 0.4 && conclusao/total < 0.4,
      };
    }

    // Transições entre parágrafos
    let comTransicao = 0;
    paragrafos.forEach(p => {
      const primeiraFrase = p.trim().toLowerCase().slice(0, 80);
      if (CONECTIVOS_LOGICOS.some(c => primeiraFrase.startsWith(c) || primeiraFrase.includes(` ${c} `))) {
        comTransicao++;
      }
    });

    return {
      proporcaoPartes: proporcao,
      transicoes: {
        paragrafos: paragrafos.length,
        comTransicao,
        semTransicao: Math.max(0, paragrafos.length - 1 - comTransicao),
        proporcao: paragrafos.length > 1 ? +((comTransicao / (paragrafos.length - 1)) * 100).toFixed(0) : 100,
      },
    };
  }

  // ── MÉTRICAS: POV ─────────────────────────────────────────────────────────

  function analisarPov(frases) {
    const EU = /\b(eu|me|mim|meu|minha|meus|minhas)\b/gi;
    const NOS = /\b(n[oó]s|nosso|nossa|nossos|nossas|a gente)\b/gi;
    const ELE = /\b(ele|ela|eles|elas|lhe|lhes|seu|sua|seus|suas)\b/gi;
    const AUTOR = /\b(o autor|a autora|o escritor|a escritora|o narrador|a narradora)\b/gi;

    let frasesEu = 0, frasesNos = 0, frasesEle = 0, frasesAutor = 0;
    frases.forEach(f => {
      if (EU.test(f)) frasesEu++;
      if (NOS.test(f)) frasesNos++;
      if (ELE.test(f)) frasesEle++;
      if (AUTOR.test(f)) frasesAutor++;
      EU.lastIndex = 0; NOS.lastIndex = 0; ELE.lastIndex = 0; AUTOR.lastIndex = 0;
    });

    // Inconsistência: só alerta quando AMBAS as perspectivas são relevantes
    // (>15% do total cada). Evita falso positivo em ficção com diálogos.
    const total = frases.length || 1;
    const prop1a  = frasesEu / total;
    const prop3a  = frasesEle / total;
    const mistura = Math.min(prop1a, prop3a);
    const ambosSignificativos = prop1a > 0.15 && prop3a > 0.15;

    return {
      consistenciaPessoa: {
        frases1a: frasesEu,
        frases1aPlural: frasesNos,
        frases3a: frasesEle,
        frasesAutorRef: frasesAutor,
        indiceMistura: +((mistura * 100).toFixed(0)),
        consistente: !ambosSignificativos,
      },
    };
  }

  // ── MÉTRICAS: LÉXICO ──────────────────────────────────────────────────────

  function analisarLexico(texto, totalPalavras) {
    const palavras = tokenizarPalavras(texto);
    const normas = palavras.map(normalizar);
    const lower = palavras.map(w => w.toLowerCase());

    const estado = lower.filter(w => VERBOS_ESTADO.has(w));
    const vagos = normas.filter(w => SUBSTANTIVOS_VAGOS.has(w));
    const totalVerbs = normas.filter(w =>
      /^.+(ar|er|ir|ou|ei|ava|ia|ará|erá|sse|endo|ando|indo|ado|ada|ido|ida)$/.test(w)
    ).length;

    return {
      verbosEstado: {
        ocorrencias: estado.length,
        proporcao: totalVerbs > 0 ? +((estado.length / totalVerbs) * 100).toFixed(1) : 0,
        nivel: estado.length / Math.max(1, totalPalavras) > 0.08 ? "alto" : estado.length / Math.max(1, totalPalavras) > 0.04 ? "moderado" : "baixo",
      },
      substantivosVagos: {
        ocorrencias: vagos.length,
        densidade: totalPalavras > 0 ? +((vagos.length / totalPalavras) * 100).toFixed(1) : 0,
        lista: [...new Set(vagos)].slice(0, 8),
      },
    };
  }

  // ── ANÁLISE PRINCIPAL ─────────────────────────────────────────────────────

  function inferirContextoAnalise(options = {}) {
    const formato = `${options.formato || options.editorMode || options.oficio || options.kind || options.type || ""}`.toLowerCase();
    const poesia = options.poesia === true || /poema|poesia|soneto|slam|haiku|cordel|verso/.test(formato);

    return {
      formato,
      poesia,
      skipPleonasmos: poesia,
      skipCliches: poesia,
    };
  }

  function analisar(texto, options = {}) {
    if (!texto || !texto.trim()) return null;
    if (contarPalavras(texto) < 30) return null;

    const contexto = inferirContextoAnalise(options);
    const frases = tokenizarFrases(texto.trim());
    const totalPalavras = contarPalavras(texto);
    const totalFrases = frases.length;
    const totalParagrafos = texto.split(/\n\s*\n/).filter(p => p.trim().length > 10).length;

    // Legibilidade Flesch-BR
    const allWords = tokenizarPalavras(texto);
    const totalSilabas = allWords.reduce((a, w) => a + contarSilabas(w), 0);
    const totalSentencas = Math.max(1, texto.split(/[.!?]+/).filter(s => s.trim()).length);
    const flesch = Math.max(0, Math.min(100, Math.round(
      248.835 - 1.015 * (totalPalavras / totalSentencas) - 84.6 * (totalSilabas / Math.max(1, totalPalavras))
    )));

    return {
      meta: {
        totalPalavras,
        totalFrases,
        totalParagrafos,
        fleschBR: flesch,
        fleschLabel: flesch >= 80 ? "Fácil" : flesch >= 60 ? "Moderado" : flesch >= 40 ? "Denso" : flesch >= 20 ? "Muito denso" : "Extremamente denso",
      },
      economia:  analisarEconomia(texto, frases, totalPalavras, contexto),
      clareza:   analisarClareza(frases, totalPalavras),
      ritmo:     analisarRitmo(texto, frases),
      voz:       analisarVoz(texto, contexto),
      estrutura: analisarEstrutura(texto, frases, totalPalavras),
      pov:       analisarPov(frases),
      lexico:    analisarLexico(texto, totalPalavras),
      norma:     {
        pontuacao: global.VeredaPunctuation ? global.VeredaPunctuation.analyze(texto) : null,
      },
    };
  }

  // ── INTERPRETAÇÃO: NÍVEL DE ALERTA ────────────────────────────────────────

  function interpretarResultado(resultado) {
    if (!resultado) return [];
    const alertas = [];
    const { economia, clareza, ritmo, voz, lexico, pov, norma } = resultado;

    if (economia.adverbiosMente.densidade > 3)
      alertas.push({ dim: "economia", id: "adverbios-mente", nivel: economia.adverbiosMente.densidade > 6 ? "alto" : "moderado",
        msg: `${economia.adverbiosMente.densidade}% de advérbios em -mente. Acima de 3% é sinal de verbo fraco.`,
        acao: `Troque o advérbio por um verbo mais preciso. Ex.: "andou lentamente" → "arrastou os pés". Palavras afetadas: ${economia.adverbiosMente.lista.slice(0,3).join(", ")}.` });

    if (economia.vozPassiva.proporcao > 20)
      alertas.push({ dim: "economia", id: "voz-passiva", nivel: economia.vozPassiva.proporcao > 35 ? "alto" : "moderado",
        msg: `${economia.vozPassiva.proporcao}% de construções passivas. Acima de 20% indica insegurança ou distância excessiva.`,
        acao: `Reescreva as passivas na voz ativa: quem age? Identifique o sujeito e ponha-o antes do verbo.` });

    if (economia.redundancia.ocorrencias > 0)
      alertas.push({ dim: "economia", id: "redundancia", nivel: "moderado",
        msg: `${economia.redundancia.ocorrencias} par(es) redundante(s): ${economia.redundancia.lista.slice(0,2).join(", ")}.`,
        acao: `Remova a palavra que repete o sentido. Ex.: "subir para cima" → "subir".` });

    if (economia.negacaoDupla.ocorrencias > 2)
      alertas.push({ dim: "economia", id: "negacao-dupla", nivel: "moderado",
        msg: `${economia.negacaoDupla.ocorrencias} negação(ões) dupla(s)/indireta(s). Preferir a forma afirmativa direta.`,
        acao: `Prefira a forma afirmativa direta: "não é impossível" → "é possível".` });

    if (clareza.comprimentoMedio > 30)
      alertas.push({ dim: "clareza", id: "comprimento-frase", nivel: clareza.comprimentoMedio > 40 ? "alto" : "moderado",
        msg: `Média de ${clareza.comprimentoMedio} palavras/frase. Acima de 30 aumenta a carga cognitiva.`,
        acao: `Identifique a oração principal e mova os adjuntos para frases independentes. Quebre a sentença em dois períodos.` });

    if (ritmo.variacaoFrase.dp < 4 && resultado.meta.totalFrases > 5)
      alertas.push({ dim: "ritmo", id: "variacao-frase", nivel: "moderado",
        msg: `Desvio padrão de comprimento: ${ritmo.variacaoFrase.dp}. Texto com ritmo muito uniforme. Varie o comprimento das frases.`,
        acao: `Após uma frase longa, escreva uma curta. Depois, uma média. Misture tamanhos deliberadamente.` });

    if (ritmo.repeticaoProxima.ocorrencias > 5)
      alertas.push({ dim: "ritmo", id: "repeticao-proxima", nivel: ritmo.repeticaoProxima.ocorrencias > 10 ? "alto" : "moderado",
        msg: `${ritmo.repeticaoProxima.ocorrencias} palavras repetidas em frases próximas: ${ritmo.repeticaoProxima.lista.slice(0,4).join(", ")}.`,
        acao: `Substitua a segunda ocorrência por sinônimo, pronome ou elipse. Se a repetição for intencional como motivo, mantenha-a consciente.` });

    if (voz.cliches.ocorrencias > 0)
      alertas.push({ dim: "voz", id: "cliche", nivel: voz.cliches.ocorrencias > 3 ? "alto" : "moderado",
        msg: `${voz.cliches.ocorrencias} clichê(s) detectado(s): ${voz.cliches.lista.slice(0,2).join("; ")}.`,
        acao: `Substitua cada clichê por uma imagem ou formulação própria. O que você vê quando pensa nessa ideia? Descreva isso.` });

    if (lexico.verbosEstado.nivel === "alto")
      alertas.push({ dim: "lexico", id: "verbos-estado", nivel: "moderado",
        msg: `${lexico.verbosEstado.proporcao}% dos verbos são de estado (ser, estar, ter...). Substitua por verbos de ação.`,
        acao: `Troque "é importante" por "importa", "está presente" por "habita", "tem influência" por "influencia".` });

    if (lexico.substantivosVagos.densidade > 2)
      alertas.push({ dim: "lexico", id: "substantivos-vagos", nivel: "moderado",
        msg: `${lexico.substantivosVagos.densidade}% de substantivos vagos (coisa, aspecto, questão...). Especifique.`,
        acao: `Substitua cada substantivo vago pelo que ele nomeia: "a questão" → "o prazo", "a coisa" → "o manuscrito".` });

    if (!pov.consistenciaPessoa.consistente)
      alertas.push({ dim: "pov", id: "pessoa-narrativa", nivel: "moderado",
        msg: `Texto mistura 1ª e 3ª pessoa (${pov.consistenciaPessoa.frases1a} frases em "eu" e ${pov.consistenciaPessoa.frases3a} em "ele/ela"). Verifique se é intencional.`,
        acao: `Se não for diálogo ou citação, escolha um ponto de vista e mantenha-o. Defina: quem narra?` });

    if (norma?.pontuacao?.issues?.length > 0) {
      const first = norma.pontuacao.issues[0];
      alertas.push({
        dim: "norma", id: "pontuacao",
        nivel: first.severity === "alta" ? "alto" : "moderado",
        msg: `${norma.pontuacao.issues.length} alerta(s) de pontuação funcional. Principal: ${first.criterio}`,
        acao: first.acao || "Revise a pontuação no trecho indicado.",
      });
    }

    if (resultado.meta.fleschBR < 30 && resultado.meta.totalPalavras > 100)
      alertas.push({ dim: "clareza", id: "flesch-denso", nivel: "moderado",
        msg: `Legibilidade ${resultado.meta.fleschBR}/100 (${resultado.meta.fleschLabel}). Texto muito exigente — verifique se é intencional para o público-alvo.`,
        acao: `Prefira palavras curtas às longas. Quebre frases acima de 25 palavras. Reduza prefixos e substantivos abstratos.` });

    if (clareza.tempoVerbal?.frasesComMistura > 2 && resultado.meta.totalFrases > 10)
      alertas.push({ dim: "clareza", id: "tempo-verbal", nivel: "moderado",
        msg: `${clareza.tempoVerbal.frasesComMistura} frases misturam presente e passado na mesma sentença. Verifique se a alternância é intencional ou sinal de inconsistência.`,
        acao: `Escolha um tempo verbal dominante para a narrativa. Se alternar, que seja por efeito consciente — flashback, comparação, reflexão.` });

    if (clareza.pronomeAmbiguo?.suspeitas > 3)
      alertas.push({ dim: "clareza", id: "pronome-ambiguo", nivel: "moderado",
        msg: `${clareza.pronomeAmbiguo.suspeitas} frases com pronomes de 3ª pessoa em contexto denso. Verifique se o referente está claro para o leitor.`,
        acao: `Quando dois ou mais personagens aparecem antes de "ele/ela", repita o nome na segunda menção. Clareza supera elegância nesses casos.` });

    if (ritmo.aberturaFracos?.aberturasFracas >= 3 && resultado.meta.totalParagrafos >= 3)
      alertas.push({ dim: "ritmo", id: "abertura-fraca", nivel: "moderado",
        msg: `${ritmo.aberturaFracos.aberturasFracas} parágrafos começam com artigo, conjunção ou verbo fraco. Inicie mais parágrafos com substantivo, verbo de ação ou advérbio forte.`,
        acao: `Reescreva as aberturas: em vez de "O vento...", experimente "Vento" ou "Soprava um vento...". Em vez de "E então...", comece com o que acontece.` });

    return alertas.sort((a, b) => (a.nivel === "alto" ? -1 : 1) - (b.nivel === "alto" ? -1 : 1));
  }

  // ── EXPORT ────────────────────────────────────────────────────────────────

  global.VeredaAnalise = {
    analisar,
    interpretarResultado,
    tokenizarFrases,
    tokenizarPalavras,
    normalizar,
  };

})(window);
