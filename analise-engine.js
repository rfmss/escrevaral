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
    // clichês de diálogo emocional
    "não é você, sou eu","precisamos conversar","temos que falar",
    "você nunca me entende","eu sei como você se sente",
    "isso não é o fim","deixa eu explicar","me dê uma chance",
    // clichês de crise emocional
    "sentiu o chão ceder sob seus pés","o mundo desabou",
    "lágrimas escorreram pelo rosto","soluços abalaram o corpo",
    "o coração se partiu em mil pedaços","deu um nó na garganta",
    // clichês de realização
    "finalmente fazia sentido","as peças se encaixaram",
    "uma luz no fim do túnel","encontrou a paz que procurava",
    // clichês de introdução narrativa
    "era uma vez","há muito tempo atrás","desde que o mundo é mundo",
    "em um reino muito distante","os anos passaram",
    "o tempo foi passando","o destino quis que",
    // clichês de encerramento narrativo
    "e viveram felizes para sempre","fim de uma era",
    "o círculo se fechou","a história chegava ao fim",
    "nada mais seria como antes",
    // clichês de literatura brasileira regionalista
    "a seca castigava a terra","o sertão chamava","o povo sofria em silêncio",
    "a pobreza era o destino","a terra era o único bem","o latifúndio oprimia",
    // clichês de narrativa de resistência
    "não se entregou","levantou a cabeça","foi mais forte que tudo",
    "a dor virou força","saiu com a cabeça erguida","nunca desistiu",
    // clichês de narrativa policial/noir
    "o suspeito tinha coartada","todas as pistas levavam a",
    "o crime perfeito não existe","o detetive farejou a verdade",
    "as peças do quebra-cabeça","o culpado sempre comete um erro",
    // clichês de prosa poética
    "o silêncio tinha som","a dor tinha nome",
    "o tempo parou naquele instante","os anos se foram sem deixar rastro",
    "a saudade tinha cheiro","o amor tinha sabor",
    // clichês de crônica urbana brasileira
    "a cidade é cruel","o trânsito mata a alma",
    "ninguém se olha mais","o celular virou parede",
    "a violência chegou perto","o condomínio afastou a rua",
    // clichês de romance histórico
    "as páginas da história","os ventos da mudança sopravam","a época era de incerteza",
    "o peso da tradição","as correntes do passado prendiam","o destino de uma nação",
    "o herói do seu tempo","a mulher à frente do seu tempo","os grandes homens fazem a história",
    // clichês de literatura de autoajuda e memória
    "aprendi com a dor","me tornei quem sou","essa experiência me transformou",
    "hoje sou grato por tudo","a vida me ensinou","minha maior lição foi",
    "encontrei meu propósito","redescobri minha força","a cura foi um processo longo",
    // clichês de ficção científica e distopia
    "o futuro era cinzento","a máquina não sentia","os humanos perderam a essência",
    "o sistema controlava tudo","a resistência era pequena","a liberdade era um conceito antigo",
    "o governo sabia tudo","os dados não mentiam","a consciência artificial",
    // clichês de literatura infantojuvenil
    "a aventura começou quando","o mundo adulto não entendia","juntos eram mais fortes",
    "a amizade vence tudo","o segredo que mudou tudo","coragem de ser diferente",
    // clichês de narrativa de não-ficção e jornalismo literário
    "fontes ouvidas pela reportagem","o caso que chocou o país","segundo apurou a reportagem",
    "o crime que virou símbolo","a história que o Brasil precisa conhecer","por dentro dos bastidores",
    "quem estava lá para contar","o dia que mudou tudo","a verdade que foi escondida",
    // clichês de crônica política e engajada
    "o povo nas ruas","a voz do povo","o país está em chamas",
    "ninguém escapou ileso","a luta continua","o silêncio foi cumplice",
    "a história vai julgar","não podemos deixar esquecer","é preciso lembrar",
    // clichês de literatura de testemunho e relato pessoal
    "eu estava lá","vi com meus próprios olhos","nunca esquecerei aquele dia",
    "o cheiro ainda está na memória","carrego essa história comigo",
    "ninguém acreditou em mim no começo","precisei contar antes de morrer",
    // clichês de literatura de terror e suspense
    "a casa tinha vida própria","algo não estava certo","as sombras se moviam",
    "o barulho vinha de baixo","não olhei para trás","o espelho mostrou o que não devia",
    "os olhos seguiam todos os movimentos","o silêncio era ensurdecedor",
    // clichês de literatura espiritualista e de autoconhecimento brasileiro
    "o universo conspirou","a energia estava diferente","abriu um portal para mim",
    "eu me curei","a espiritualidade me guiou","o universo me mandou um sinal",
    "foi a vontade de Deus","tudo tem um propósito maior","entrei em contato comigo mesmo",
    "me libertei dos laços do passado","minha cura interior","encontrei minha verdade",
    // clichês de literatura de mercado e negócios
    "a startup que mudou o setor","construí do zero","fracassei para aprender",
    "o empreendedor resiliente","saí da zona de conforto","reinventei o modelo",
    "pense fora da caixa","o mindset do sucesso","trabalhe enquanto eles dormem",
    // clichês de romance contemporâneo e new adult
    "ele não era para ela","ela resistiu mas cedeu","um amor proibido",
    "a química entre eles era impossível de ignorar","seus olhos se encontraram",
    "ela nunca tinha sentido isso antes","ele era diferente de todos os outros",
    "a distância entre eles cresceu","ela sabia que estava apaixonada",
    // clichês de reconto de conto de fadas
    "era uma princesa diferente das outras","quebrou a maldição com um beijo",
    "o vilão tinha uma razão para ser assim","o herói era o menos esperado",
    "no final, o amor verdadeiro venceu tudo","e eles viveram para contar",
    // clichês de literatura de terror e suspense psicológico
    "a casa tinha história própria","as paredes guardavam segredos",
    "algo estava errado mas ela não sabia o quê","a escuridão parecia viva",
    "a sombra seguia seus passos","o espelho mostrou algo diferente",
    "o pesadelo era real demais","não era superstição, era real",
    "ela não deveria ter aberto aquela porta","o silêncio era ensurdecedor",
    // clichês de narrativa de formação (bildungsroman)
    "era jovem demais para entender","a vida ainda ia lhe ensinar",
    "crescer dói mas transforma","não era mais a mesma pessoa",
    "o mundo era maior do que pensava","aprendeu da pior maneira possível",
    "um erro que mudou tudo","a inocência não voltaria mais",
    // clichês de ficção científica e pós-apocalíptico
    "a humanidade havia ido longe demais","a tecnologia os traiu",
    "o último bastião da civilização","sobreviver era o único objetivo",
    "ninguém sabia o que havia causado","o mundo que conheciam tinha acabado",
    "a inteligência artificial tomou conta","os robôs haviam assumido o controle",
    // clichês de literatura de viagem e aventura
    "a estrada era sua única certeza","o horizonte chamava",
    "cada cidade era um novo começo","viajou para se encontrar",
    "o destino reservava surpresas","a jornada o transformou",
    "entre uma cidade e outra perdeu a conta","voltou diferente de quando partiu",
    // clichês de literatura infantojuvenil e young adult
    "era diferente dos outros da sua idade","nunca se encaixou em lugar nenhum",
    "descobriu um poder que não sabia ter","o mundo era maior do que parecia",
    "o amor mudou tudo","ficou mais forte depois do sofrimento",
    "aprendeu quem eram seus verdadeiros amigos","a família era onde o coração estava",
    "escolheu o caminho certo no final","cresceu mais do que esperava",
    // clichês de ficção histórica
    "era uma época de grandes transformações","o mundo estava prestes a mudar para sempre",
    "homens de honra não fugiam de seus deveres","a guerra revelou quem eram de verdade",
    "o passado nunca morreu completamente","a história se repetia",
    "eram tempos sombrios e incertos","quem sobrevivesse contaria a história",
    // clichês de narrativa policial e noir
    "a cidade escondia seus pecados","as ruas contavam histórias",
    "a verdade sempre vem à tona","todo criminoso comete um erro",
    "seguiu o dinheiro e encontrou a resposta","era mais simples do que parecia no começo",
    "os inocentes pagavam pelos crimes dos culpados","confiou em quem não devia",
    // clichês de literatura de horror psicológico
    "o inimigo estava dentro dela o tempo todo","a loucura era a única saída",
    "não conseguia distinguir o real do imaginário","perdera o contato com a realidade",
    "o passado a perseguia em cada canto","os gritos nunca paravam",
    "a mente era um labirinto sem saída","os pesadelos eram mais reais que a vida",
    // clichês de literatura de autoconhecimento
    "precisava se encontrar","estava perdida em si mesma",
    "o amor próprio era a chave de tudo","parou de se comparar com os outros",
    "aceitou suas imperfeições","aprendeu a dizer não",
    "priorizou a própria saúde mental","fez as pazes com o passado",
    // clichês de romantismo literário
    "o amor era maior que tudo","o coração não mente",
    "quando os olhares se cruzam tudo muda","foi amor à primeira vista",
    "sentia que eram almas gêmeas","eram feitos um para o outro",
    "o destino os havia unido","o universo conspirava a favor deles",
    // clichês de literatura épica e de fantasia
    "o herói era o escolhido","sua hora havia chegado",
    "com grande poder vem grande responsabilidade","apenas ele poderia salvar o mundo",
    "a profecia estava se cumprindo","foram testados além dos limites",
    "o bem sempre vence o mal","a luz sempre supera as trevas",
    // clichês de literatura regionalista brasileira
    "o sertão é duro mas é belo","a seca matava tudo menos a esperança",
    "o nordestino era resistente","a terra rachada guardava segredos",
    "o povo do interior era simples mas sábio","o coronel mandava e o povo obedecia",
    "a migração era a única saída","as Minas sofridas formavam o caráter",
    // clichês de literatura urbana e periférica
    "a favela tinha código próprio","quem foi criado lá dentro entendia",
    "a violência era o único caminho","o sistema nunca deu chance",
    "sobreviver era resistir","o asfalto dividia dois mundos",
    "nenhum jovem da quebrada sonhava com pouco","a periferia produz arte que o centro consome",
    // clichês de literatura de resistência e militância
    "resistir é existir","a luta continua",
    "cada geração paga o preço","não vai ser diferente desta vez",
    "o silêncio é cumplicidade","quem cala consente",
    "o passado não passou","precisamos falar sobre isso",
    // clichês de narrativa memorialista e autobiográfica
    "me lembro como se fosse hoje","o tempo apaga mas não cura",
    "a memória é seletiva","aquela cena nunca mais me deixou",
    "minha infância foi marcada por","aprendi cedo que o mundo não era justo",
    "meu avô dizia que","quando olho para trás só consigo ver",
    // clichês de narrativa juvenil e de formação
    "era um dia como outro qualquer","tudo ia bem até que",
    "nunca imaginei que um dia","foi então que tudo mudou",
    "aprendi que a vida não é justa","descobri quem eu realmente era",
    "a escola me ensinou mais do que qualquer livro","tinha todo o futuro pela frente",
    // clichês de ficção científica e fantasia
    "em um futuro não muito distante","num mundo em que a tecnologia dominou tudo",
    "ninguém poderia imaginar o que estava por vir","ele era o escolhido",
    "o portal se abriu diante de nós","não havia retorno possível",
    "o destino havia sido traçado","forças além da compreensão humana",
    // clichês de suspense e thriller
    "tudo o que faço agora pode ser usado contra mim","o assassino ainda está solto",
    "nada é o que parece","confie em ninguém",
    "o relógio estava contando","cada segundo contava",
    "a verdade estava diante de seus olhos","era mais fundo do que imaginava",
    // clichês de narrativa de viagem e aventura
    "uma viagem que mudaria minha vida para sempre","eu me perdi para me encontrar",
    "o caminho era mais importante que o destino","cada lugar guardava um segredo",
    "o mundo é grande demais para ficar parado","saí sem saber quando voltaria",
    // clichês de drama familiar e relacional
    "nossa família nunca foi perfeita","sempre tivemos nossas diferenças",
    "debaixo da mesma luz crescemos diferentes","o sangue chama mas nem sempre une",
    "pai e filho que nunca se entenderam","a mãe que deu tudo e não recebeu nada",
    "precisei ir embora para entender minha origem","só na perda percebemos o valor",
    // clichês de comédia romântica
    "no momento menos esperado o amor aparece","ele não era o tipo de pessoa que eu imaginava",
    "apostamos que nos odiaríamos para sempre","o destino conspirava para nos juntar",
    "uma virada na última página do destino","não era o momento certo mas o certo nunca chega",
    // clichês de narrativa policial e noir
    "a cidade nunca dorme e nem eu","todos têm algo a esconder",
    "o crime não compensa mas compensa se não for pego","um deslize e tudo desmorona",
    "a evidência mais óbvia era a mais difícil de ver","quem parecia inocente era o culpado",
    // clichês de narrativa épica e de heróis
    "a profecia dizia que um dia viria o escolhido","nasceu para salvar o mundo",
    "a batalha final entre o bem e o mal","o sacrifício do herói redime todos",
    "o poder corrompe mas o poder absoluto corrompe absolutamente","a escuridão antes do amanhecer",
    // clichês de narrativa realista e social
    "a pobreza não é destino mas parece","nasce pobre morre pobre no Brasil",
    "o sistema foi feito para esmagar quem está embaixo","meritocracia é mentira",
    "trabalhou a vida toda e não tem nada","o sonho americano tem endereço de rico",
    // clichês narrativos de ritmo
    "foi então que","de repente tudo mudou","e assim foi que","e foi assim que",
    "num piscar de olhos","em fração de segundos","em menos de um segundo",
    "sem pensar duas vezes","antes que fosse tarde demais","não havia tempo a perder",
    // clichês de romance popular brasileiro
    "seus olhos como estrelas","seu sorriso iluminava tudo","o coração disparou",
    "um frio na barriga","ficou sem chão","não conseguia tirar você da cabeça",
    // clichês de autoajuda na ficção
    "acredite em si mesmo","você é capaz","nunca desista dos seus sonhos",
    "os limites estão na mente","mude sua mentalidade","seja a mudança que quer ver",
    // clichês de redação temporal
    "ao decorrer dos anos","desde os primórdios da humanidade",
    "desde os tempos mais remotos","na sociedade atual",
    "no mundo globalizado","na era digital","em pleno século xxi",
    // clichês de suspense
    "havia algo errado","algo estava fora do lugar","um pressentimento ruim",
    "não era coincidência","o pior estava por vir","era apenas o começo",
    // clichês de narração literária desgastada
    "suas mãos tremiam","a garganta fechou","lágrimas escorreram pelo rosto",
    "o tempo parecia parar","um silêncio sepulcral","o mundo girou",
    "perdeu a noção do tempo","a realidade veio à tona","acordou como se fosse um sonho",
    "era uma noite escura e tempestuosa","o vento uivava","a lua cheia iluminava",
    "seus pensamentos corriam a mil","não conseguia pensar direito","a cabeça rodava",
    // clichês de retrato de personagem
    "olhos cor de mel","cabelos cor de ébano","pele de porcelana",
    "voz aveludada","sorriso enigmático","riso cristalino","olhar penetrante",
    "era diferente das outras","nunca tinha sentido isso antes","algo nele a atraía",
    // clichês de redação escolar e acadêmica
    "vivemos em uma sociedade","ao longo da história","desde os primórdios",
    "é importante ressaltar","vale destacar que","cabe salientar que",
    "neste contexto","diante do exposto","tendo em vista o exposto",
    "conforme mencionado anteriormente","como foi dito acima","retomando o que foi dito",
    "em suma","sendo assim","por tudo isso","portanto conclui-se",
    // clichês de narrativa de conflito e guerra
    "o sangue corria","corpos espalhados pelo chão","o cheiro de pólvora",
    "a batalha estava perdida","lutou até o fim","morreu como um herói",
    // clichês de natureza e paisagem
    "o pôr do sol tingiu o céu","as estrelas brilhavam","a brisa suave",
    "o mar revolto","ondas quebravam na praia","o horizonte se abria",
    "a floresta densa","folhas sussurvavam ao vento","pássaros cantavam",
    // v754 — clichês literários: introspecção, diálogos forçados, cenas climáticas, romance
    "senti um frio na espinha","o coração acelerou","o tempo congelou",
    "não conseguia respirar","tudo ficou nebuloso","meu mundo desabou",
    "era impossível não amar","você não entende","precisamos conversar",
    "eu te amo mas não posso","você mudou muito","não é você, sou eu",
    "sabia desde o princípio","foi amor à primeira vista","nossos olhos se encontraram",
    "ela era diferente de todas","ele tinha algo especial","meu coração disparou",
    "as palavras não saíam","fiquei paralisado","o silêncio era ensurdecedor",
    "a tensão era palpável","o ar estava carregado","algo estava errado",
    "pressentiu o perigo","sentiu que não estava sozinha","um arrepio percorreu",
    "tinha tudo planejado","mas desta vez era diferente","pela primeira vez na vida",
    "nunca imaginei que","não conseguia acreditar","como se fosse um sonho",
    "o destino os aproximou","a vida deu uma virada","tudo mudou em um instante",
    "no momento em que menos esperava","o impossível aconteceu",
    "e foi assim que tudo começou","e nunca mais foi o mesmo",
    "o fim era apenas o começo","mas isso é uma outra história",
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
    // pares adjetivos/substantivos redundantes
    ["inovação nova","inovação"],["resultado final","resultado"],
    ["experiência vivida","experiência"],["ganho obtido","ganho"],
    ["opinião pessoal","opinião"],["decisão tomada","decisão"],
    ["herança legada","herança"],["sobrevivente que sobreviveu","sobrevivente"],
    // verbos com complemento óbvio
    ["subir para cima","subir"],["descer para baixo","descer"],
    ["entrar para dentro","entrar"],["sair para fora","sair"],
    ["avançar para frente","avançar"],["recuar para trás","recuar"],
    ["juntar em conjunto","juntar"],["unir em união","unir"],
    // redundâncias burocráticas e corporativas
    ["vias de fato","fato"],["na atual conjuntura","agora"],
    ["em termos percentuais","em percentual"],
    ["para efeitos práticos","na prática"],
    ["no contexto atual","atualmente"],
    ["dentro do contexto","no contexto"],
    ["em virtude de que","porque"],["haja vista que","visto que"],
    // redundâncias escolares e acadêmicas
    ["conforme descrito acima","conforme descrito"],
    ["o autor acima citado","o autor"],
    ["o texto em questão","o texto"],
    ["mediante o pagamento de","mediante pagamento de"],
    // pares de adjetivos redundantes
    ["único e singular","único"],["amplo e vasto","amplo"],
    ["fino e delicado","fino"],["rude e grosseiro","rude"],
    ["sombrio e escuro","sombrio"],["leve e suave","leve"],
    // redundâncias de quantidade e tempo
    ["dois pares de irmãos gêmeos","par de gêmeos"],["cem por cento absoluto","cem por cento"],
    ["toda a totalidade","toda"],["metade pela metade","metade"],
    ["dois duos","dupla"],["três trios","trio"],
    ["novamente outra vez","novamente"],["futuramente no futuro","futuramente"],
    ["atualmente nos dias de hoje","atualmente"],["antigamente no passado","antigamente"],
    // redundâncias de localização e movimento
    ["entrar e adentrar","entrar"],["sair e abandonar o local","sair"],
    ["ir adiante em frente","ir adiante"],["ficar parado sem se mover","ficar parado"],
    ["girar em torno de si mesmo","girar"],["voltar de volta","voltar"],
    // redundâncias jornalísticas e de notícia
    ["ocorrência de fato ocorrido","ocorrência"],["vítima que foi vítima","vítima"],
    ["morto que morreu","morto"],["ferido que ficou ferido","ferido"],
    ["detido que foi detido","detido"],["local do acontecimento do fato","local do fato"],
    // pleonasmos de escrita criativa
    ["soluçar em soluços","soluçar"],["chorar em lágrimas","chorar"],
    ["rir às gargalhadas","rir"],["sussurrar em voz baixa","sussurrar"],
    ["berrar em voz alta","berrar"],["gritar em alto e bom som","gritar"],
    // linguagem corporativa redundante
    ["trabalho em equipe colaborativo","trabalho em equipe"],
    ["estratégia planejada com antecedência","estratégia planejada"],
    ["meta a ser alcançada","meta"],["objetivo a ser atingido","objetivo"],
    ["resultado esperado e almejado","resultado esperado"],
    ["processo contínuo e permanente","processo contínuo"],
    ["reunião de alinhamento conjunto","reunião de alinhamento"],
    ["feedback de retorno","feedback"],["follow-up de acompanhamento","acompanhamento"],
    // linguagem acadêmica redundante
    ["hipótese a ser testada e verificada","hipótese a ser testada"],
    ["metodologia e método de pesquisa","metodologia"],
    ["resultados e conclusões obtidas","conclusões"],
    ["referencial teórico bibliográfico","referencial teórico"],
    ["estudo de caso individual","estudo de caso"],
    // linguagem jurídica e burocrática
    ["lavrar o auto e ato","lavrar o auto"],
    ["processo e procedimento legal","processo legal"],
    ["notificar e comunicar formalmente","notificar"],
    ["decisão judicial proferida pelo juiz","decisão judicial"],
    // linguagem de saúde e psicologia
    ["crise aguda e intensa","crise aguda"],
    ["trauma psicológico emocional","trauma psicológico"],
    ["comportamento padrão habitual","comportamento habitual"],
    ["sintoma indicativo de sinal","sintoma"],
    // redundâncias em descrição de personagem e narração literária
    ["rosto e face","rosto"],["mãos e dedos das mãos","mãos"],
    ["olhar nos olhos","olhar"],["sorriso nos lábios","sorriso"],
    ["lágrimas nos olhos","lágrimas"],["voz e som da voz","voz"],
    ["silêncio absoluto e total","silêncio absoluto"],
    ["pensamento e reflexão interna","pensamento"],
    ["passado remoto e distante","passado"],
    ["futuro incerto e desconhecido","futuro incerto"],
    // redundâncias de sentimento e emoção
    ["sentiu na pele e no corpo","sentiu"],["amor e paixão ardente","amor"],
    ["ódio e raiva cega","ódio"],["alegria e contentamento","alegria"],
    ["tristeza e melancolia profunda","tristeza"],
    ["angústia e tormento interior","angústia"],
    ["euforia e exaltação","euforia"],
    // redundâncias de paisagem e cenário
    ["céu azul e claro","céu claro"],["noite escura e sombria","noite sombria"],
    ["sol brilhante e quente","sol brilhante"],["chuva fria e gelada","chuva gelada"],
    ["vento suave e leve","vento suave"],["mar azul e profundo","mar profundo"],
    // redundâncias de narrativa e composição literária
    ["história e narrativa contada","narrativa"],["personagem e figura fictícia","personagem"],
    ["enredo e trama da história","trama"],["capítulo e seção do livro","capítulo"],
    ["prologo e introdução inicial","prólogo"],["epílogo e conclusão final","epílogo"],
    ["flashback e cena do passado","flashback"],["narrador e voz que conta","narrador"],
    // redundâncias de tempo e sequência
    ["início e começo","início"],["final e desfecho","desfecho"],
    ["meio e parte central","parte central"],["antes e anteriormente","antes"],
    ["depois e posteriormente","depois"],["durante e ao longo de","durante"],
    ["primeiro e inicialmente","primeiro"],["último e definitivo","último"],
    // redundâncias de processo e resultado
    ["processo e procedimento de trabalho","processo"],["método e metodologia adotada","metodologia"],
    ["resultado e consequência obtida","resultado"],["impacto e efeito produzido","impacto"],
    ["mudança e transformação realizada","transformação"],["evolução e progresso alcançado","evolução"],
    // redundâncias de causa e efeito
    ["motivo e causa do problema","causa"],["razão e motivo principal","motivo"],
    ["consequência e efeito resultante","consequência"],["origem e raiz do problema","origem"],
    ["fator determinante e decisivo","fator determinante"],["contexto e situação atual","situação atual"],
    // redundâncias de descrição física e espacial
    ["alto e elevado","alto"],["baixo e pequeno","baixo"],
    ["largo e amplo","amplo"],["comprido e extenso","extenso"],
    ["redondo e circular","redondo"],["quadrado e retangular","quadrado"],
    ["enorme e gigantesco","gigantesco"],["diminuto e microscópico","minúsculo"],
    // redundâncias de qualidade e valor
    ["bom e positivo","bom"],["ruim e negativo","ruim"],
    ["certo e correto","correto"],["errado e incorreto","errado"],
    ["justo e equânime","justo"],["injusto e parcial","injusto"],
    ["forte e robusto","forte"],["fraco e débil","fraco"],
    // redundâncias de discurso político e social
    ["mudança e transformação social","transformação"],
    ["povo e população brasileira","população"],
    ["democracia e participação popular","democracia"],
    ["direitos e garantias fundamentais","direitos fundamentais"],
    ["política e gestão pública","política pública"],
    ["crise e instabilidade econômica","crise econômica"],
    ["projetos e iniciativas de governo","projetos de governo"],
    ["investigação e apuração dos fatos","apuração"],
    // redundâncias de saúde e medicina
    ["saúde e bem-estar","saúde"],["doença e enfermidade","doença"],
    ["tratamento e terapia médica","tratamento"],["cura e recuperação","recuperação"],
    ["diagnóstico e identificação do quadro","diagnóstico"],
    ["sintoma e manifestação clínica","sintoma"],
    ["prevenção e profilaxia","prevenção"],["medicamento e remédio","medicamento"],
    // redundâncias de educação e pedagogia
    ["ensino e aprendizagem","ensino"],["escola e instituição de ensino","escola"],
    ["aluno e estudante","estudante"],["professor e educador","professor"],
    ["conteúdo e matéria","conteúdo"],["avaliação e prova","avaliação"],
    ["metodologia e método pedagógico","método"],["currículo e grade curricular","currículo"],
    // redundâncias de tecnologia e comunicação
    ["tecnologia e inovação tecnológica","tecnologia"],["sistema e plataforma digital","sistema"],
    ["dados e informações","dados"],["software e programa de computador","software"],
    ["conexão e acesso à internet","conexão"],["dispositivo e aparelho eletrônico","dispositivo"],
    // redundâncias de espaço e lugar
    ["local e lugar","local"],["espaço e área","espaço"],["região e zona","região"],
    ["território e espaço territorial","território"],["ambiente e contexto ambiental","ambiente"],
    ["paisagem e cenário visual","paisagem"],["horizonte e linha do horizonte","horizonte"],
    // redundâncias temporais e de sequência
    ["primeiro de tudo","primeiro"],["antes de mais nada","antes de tudo"],
    ["no final das contas","no final"],["ao longo do tempo","com o tempo"],
    ["desde sempre","sempre"],["até o fim do fim","até o fim"],
    // redundâncias de narrativa e texto literário
    ["personagem principal protagonista","protagonista"],["clímax culminante","clímax"],
    ["desfecho final","desfecho"],["epílogo conclusivo","epílogo"],
    ["narrador que narra","narrador"],["diálogo falado","diálogo"],
    ["conflito em confronto","conflito"],["trama enredada","trama"],
    ["metáfora figurativa","metáfora"],["símbolo que simboliza","símbolo"],
    // redundâncias de discurso e argumentação
    ["argumento argumentativo","argumento"],["tese que defendo","tese"],
    ["conclusão final do raciocínio","conclusão"],["premissa de base","premissa"],
    ["ponto de vista pessoal","ponto de vista"],["opinião que tenho","opinião"],
    ["análise analítica","análise"],["síntese resumida","síntese"],
    // redundâncias de emoção e sentimento
    ["sentimento que sinto","sentimento"],["emoção emocionante","emoção"],
    ["amor que amo","amor"],["medo que temo","medo"],
    ["tristeza triste","tristeza"],["alegria alegre","alegria"],
    ["saudade de algo saudoso","saudade"],["raiva que me enraivece","raiva"],
    // redundâncias de cognição e discurso
    ["pensar um pensamento","pensar"],["sonhar um sonho","sonhar"],
    ["imaginar uma imagem","imaginar"],["decidir uma decisão","decidir"],
    ["escolher uma escolha","escolher"],["crer numa crença","crer"],
    ["duvidar de uma dúvida","duvidar"],["perguntar uma pergunta","perguntar"],
    // redundâncias de narrativa temporal
    ["futuro que ainda virá","futuro"],["passado que já foi","passado"],
    ["presente que é agora","presente"],["memória do passado","memória"],
    ["história que aconteceu","história"],["evento que se deu","evento"],
    // redundâncias de afirmação e negação
    ["verdade verídica","verdade"],["mentira falsa","mentira"],
    ["fato real e verdadeiro","fato"],["certeza que é certa","certeza"],
    ["opinião pessoal do autor","opinião"],["ponto de vista pessoal","ponto de vista"],
    // redundâncias de ação física
    ["sorrir um sorriso","sorrir"],["chorar o pranto","chorar"],
    ["gritar um grito","gritar"],["suspirar um suspiro","suspirar"],
    ["cair numa queda","cair"],["correr numa corrida","correr"],
    // v745 — pleonasmos adicionais
    ["elo de ligação","elo"],["laço de união","laço"],
    ["planejar antecipadamente","planejar"],["prever antecipadamente","prever"],
    ["repetir de novo","repetir"],["reiterar novamente","reiterar"],
    ["juntar junto","juntar"],["unir em conjunto","unir"],
    ["calar em silêncio","calar"],["gritar em voz alta","gritar"],
    ["murmurar em voz baixa","murmurar"],["sussurrar baixinho","sussurrar"],
    ["começar de início","começar"],["iniciar desde o começo","iniciar"],
    ["terminar no final","terminar"],["encerrar ao final","encerrar"],
    ["comparecer pessoalmente","comparecer"],["assistir pessoalmente","assistir"],
    ["hemorragia de sangue","hemorragia"],["dor que dói","dor"],
    ["surpresa inesperada","surpresa"],["acidente imprevisto","acidente"],
    ["tragédia fatal","tragédia"],["catástrofe catastrófica","catástrofe"],
    ["vitória vencedora","vitória"],["derrota perdedora","derrota"],
    ["enorme gigante","enorme"],["pequenino minúsculo","minúsculo"],
    // v754 — novos pleonasmos: natureza, tempo, comunicação, negócios
    ["floresta virgem intocada","floresta virgem"],["geleira de gelo","geleira"],
    ["panorama geral amplo","panorama"],["perspectiva futura","perspectiva"],
    ["passado antigo","passado"],["futuro adiante","futuro"],
    ["memória do passado","memória"],["recordação passada","recordação"],
    ["previsão futura","previsão"],["antecipação prévia","antecipação"],
    ["promessa de cumprir","promessa"],["contrato firmado","contrato"],
    ["acordo consensual","acordo"],["decisão deliberada","decisão"],
    ["proposta de propor","proposta"],["convite de convidar","convite"],
    ["resposta de responder","resposta"],["pergunta de perguntar","pergunta"],
    ["narrativa narrada","narrativa"],["descrição descritiva","descrição"],
    ["ficção fictícia","ficção"],["fato factual","fato"],
    ["realidade real","realidade"],["verdade verdadeira","verdade"],
    ["mentira falsa","mentira"],["ilusão ilusória","ilusão"],
    ["erro errado","erro"],["acerto correto","acerto"],
    ["visão futurista","visão futura"],["obra de arte artística","obra de arte"],
    ["cor amarela","amarelo"],["cor vermelha","vermelho"],["cor azul","azul"],
    ["vício ruim","vício"],["virtude boa","virtude"],
    ["protestar contra","protestar"],["opinar sua opinião","opinar"],
    ["desde já antecipadamente","desde já"],["afirmar com certeza","afirmar"],
    ["prever o futuro","prever"],["lembrar da memória","lembrar"],
    ["esquecer do passado","esquecer"],["cortar fora","cortar"],
    ["sorrir para fora","sorrir"],["chorar para dentro","chorar"],
    ["absolutamente certeza","certeza"],["realmente verdadeiro","verdadeiro"],
    ["acabou definitivamente","acabou"],["completamente vazio","vazio"],
    ["absolutamente nulo","nulo"],["totalmente oposto","oposto"],
    ["colaboração conjunta","colaboração"],["consenso unânime","unanimidade"],
    ["questionar com perguntas","questionar"],["narrar uma narrativa","narrar"],
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


  // ── A-01: CONFUSÕES GRAMATICAIS (inspirado em LanguageTool PT-BR) ─────────
  const CONFUSOES_GRAMATICAIS = [
    [/\bao invés de\b/gi,
     "«ao invés de»",
     "«Ao invés de» indica contrariedade (ao invés de rir, chorou). Para substituição, use «em vez de»."],
    [/\ba n[ií]vel de\b/gi,
     "«a nível de»",
     "Locução burocrática. Prefira «em termos de», «no campo de» ou reestruture a frase."],
    [/\bem função de\b/gi,
     "«em função de»",
     "Construção burocrática. Prefira «porque», «por causa de», «devido a», «em razão de»."],
    [/\bface [aà]\b/gi,
     "«face a»",
     "Anglicismo burocrático. Prefira «diante de», «perante», «em relação a»."],
    [/\bem se tratando de\b/gi,
     "«em se tratando de»",
     "Construção vaga. Prefira «quanto a», «no caso de», «em relação a», «tratando-se de»."],
    [/\btendo em vista\b/gi,
     "«tendo em vista»",
     "Construção burocrática. Prefira «considerando», «visto que», «dado que», «uma vez que»."],
    [/\bhaviam\s+(?:muitas?|poucas?|algumas?|vários?|várias?|certas?|certos?|tantas?|tantos?|inúmeras?|diversos?|diversas?|bastante)\b/gi,
     "«haviam» existencial",
     "«Haver» no sentido de «existir» é impessoal: use «havia», não «haviam». Ex.: «havia muitas pessoas»."],
    [/\ba partir daí[,\s]/gi,
     "«a partir daí»",
     "Locução desgastada na prosa literária. Prefira «então», «depois disso», «a partir desse momento»."],
    [/\bno que tange\b/gi,
     "«no que tange»",
     "Construção burocrática. Prefira «quanto a», «sobre», «em relação a»."],
    [/\bno que diz respeito\b/gi,
     "«no que diz respeito»",
     "Construção burocrática. Prefira «quanto a», «sobre», «em relação a»."],
    [/\bcom vistas? a\b/gi,
     "«com vista(s) a»",
     "Construção burocrática. Prefira «para», «com o objetivo de», «a fim de»."],
    [/\bhaja vista\b/gi,
     "«haja vista»",
     "Construção burocrática. Prefira «visto que», «dado que», «considerando que»."],
    [/\bdiante do exposto\b/gi,
     "«diante do exposto»",
     "Clichê de redação. Prefira uma conclusão original que retome a ideia central com suas próprias palavras."],
    [/\bnesse sentido[,\.]/gi,
     "«nesse sentido»",
     "Conector vago e desgastado em início de parágrafo. Prefira uma transição que nomeie a relação real entre as ideias."],
    [/à luz de/gi,
     "«à luz de»",
     "Metáfora desgastada em contextos abstratos. Prefira «segundo», «conforme», «com base em»."],
    [/\bde maneira a\b/gi,
     "«de maneira a»",
     "Construção pesada. Prefira «para», «a fim de», «de modo a»."],
    [/\b(?:vou|vai|vamos|vão|irá|irei|iremos|irão)\s+estar\s+\w+(?:ando|endo|indo)\b/gi,
     "gerundismo",
     "Construção «vou estar fazendo» é traço do discurso corporativo. Em prosa literária, prefira o futuro simples («farei») ou o presente («faço»)."],
    [/\bem torno a\b/gi,
     "«em torno a»",
     "A regência correta é «em torno de». Escreva «em torno de», não «em torno a»."],
    [/\bse acaso\b/gi,
     "«se acaso»",
     "«Se» e «acaso» têm o mesmo sentido condicional. Escreva só «se» ou só «acaso», não os dois juntos."],
    [/\bpelo motivo de que\b/gi,
     "«pelo motivo de que»",
     "Construção pesada. Prefira «porque», «pois», «uma vez que»."],
    [/\bfuturo vindouro\b/gi,
     "«futuro vindouro»",
     "«Vindouro» já significa «que está por vir». Escreva só «futuro» ou só «vindouro»."],
    [/\bpor parte d[eoa]s?\b/gi,
     "«por parte de»",
     "Construção pesada e burocrática. Prefira o sujeito direto: «o governo decidiu» em vez de «houve decisão por parte do governo»."],
    [/\bno\s?âmbito\b/gi,
     "«no âmbito de»",
     "Construção vaga. Prefira «em», «dentro de», «na área de», ou reformule com sujeito ativo."],
    [/\bno bojo\b/gi,
     "«no bojo de»",
     "Metáfora desgastada em contextos abstratos. Prefira «dentro de», «no contexto de», «ao longo de»."],
    [/\bno cerne\b/gi,
     "«no cerne de»",
     "Clichê crítico-acadêmico. Prefira uma formulação direta do que está no centro da questão."],
    [/\bno seio\b/gi,
     "«no seio de»",
     "Metáfora desgastada em contextos institucionais. Prefira «dentro de», «entre», «na comunidade de»."],
    [/\ba despeito d[eoa]s?\b/gi,
     "«a despeito de»",
     "Construção formal e pesada. Prefira «apesar de», «mesmo com», «mesmo diante de»."],
    [/\bpor intermédio d[eoa]s?\b/gi,
     "«por intermédio de»",
     "Construção burocrática. Prefira «por», «através de», «com a ajuda de», «via»."],
    [/\bno tocante\b/gi,
     "«no tocante a»",
     "Construção burocrática. Prefira «quanto a», «sobre», «em relação a»."],
    [/\bpor meio d[eoa]s?\b/gi,
     "«por meio de»",
     "Construção neutra que às vezes pode ser substituída por «com», «usando», «por». Prefira o verbo direto."],
    [/\bem virtude d[eoa]s?\b/gi,
     "«em virtude de»",
     "Construção burocrática. Prefira «por causa de», «porque», «devido a»."],
    [/\bcom base em\b/gi,
     "«com base em»",
     "Construção acadêmica. Em prosa literária, prefira uma formulação mais direta: «segundo», «a partir de», «apoiado em»."],
    [/\bno que concerne\b/gi,
     "«no que concerne»",
     "Construção extremamente formal. Prefira «quanto a», «sobre», «em relação a»."],
    [/\bpor conseguinte\b/gi,
     "«por conseguinte»",
     "Conectivo formal e pesado. Prefira «portanto», «por isso», «assim», «então» na prosa literária."],
    [/\bem detrimento d[eoa]s?\b/gi,
     "«em detrimento de»",
     "Construção burocrática. Prefira «à custa de», «sacrificando», «em prejuízo de» ou reformule com verbo ativo."],
    [/\bsob a ótica d[eoa]s?\b/gi,
     "«sob a ótica de»",
     "Metáfora desgastada. Prefira «segundo», «na visão de», «para»."],
    [/\bsob o prisma d[eoa]s?\b/gi,
     "«sob o prisma de»",
     "Metáfora desgastada em contextos abstratos. Prefira «segundo», «considerando», «do ponto de vista de»."],
    [/\bem pleno século\b/gi,
     "«em pleno século»",
     "Fórmula jornalística desgastada. Prefira uma formulação que nomeie o que especificamente é surpreendente."],
    [/\bnos dias (?:de hoje|atuais)\b/gi,
     "«nos dias de hoje»",
     "Locução temporal vaga e desgastada. Prefira «hoje», «atualmente» ou uma referência temporal mais precisa."],
    [/\bna sociedade (?:contemporânea|atual|moderna|de hoje)\b/gi,
     "«na sociedade contemporânea»",
     "Abertura vaga de redação escolar. Prefira uma formulação que nomeie o fenômeno específico desde o início."],
    [/\bdesde os primórdios\b/gi,
     "«desde os primórdios»",
     "Clichê temporal. Prefira uma referência histórica específica ou uma formulação mais concreta."],
    [/\bisso posto\b/gi,
     "«isso posto»",
     "Conectivo formal e arcaizante. Prefira «portanto», «assim», «com isso»."],
    [/\bcumpre (?:ressaltar|salientar|destacar|mencionar|observar)\b/gi,
     "«cumpre ressaltar»",
     "Construção burocrática impessoal. Prefira a forma direta: «vale ressaltar», «é importante notar» — ou simplesmente afirme o que precisa ser dito."],
    [/\bmister se faz\b/gi,
     "«mister se faz»",
     "Arcaísmo burocrático. Prefira «é necessário», «é preciso», «convém»."],
    [/(?:^|\s)é de se notar que/gim,
     "«é de se notar que»",
     "Construção impessoal e pesada. Prefira «note-se que», «vale notar», ou simplesmente afirme o fato."],
    [/(?:^|\s)é sabido que/gim,
     "«é sabido que»",
     "Construção vaga que evita afirmar. Prefira afirmar diretamente o que é verdade, ou citar uma fonte."],
    [/(?:^|\s)é de suma importância/gim,
     "«é de suma importância»",
     "Construção superlativa vaga. Afirme diretamente o que é importante e por quê."],
    [/\bface ao exposto\b/gi,
     "«face ao exposto»",
     "Clichê de redação formal. Prefira «portanto», «assim», «diante disso» — ou reescreva a conclusão com suas próprias palavras."],
    [/\bsem sombra de dúvida\b/gi,
     "«sem sombra de dúvida»",
     "Ênfase desgastada. A convicção deve aparecer no argumento, não no reforço vazio."],
    [/\bnão há como negar\b/gi,
     "«não há como negar»",
     "Construção que evita afirmar diretamente. Prefira afirmar o fato sem mediação retórica."],
    [/\bnão restam dúvidas\b/gi,
     "«não restam dúvidas»",
     "Reforço argumentativo vazio. Afirme o fato e deixe a evidência falar por si."],
    [/(?:^|\s)é importante (?:ressaltar|salientar|destacar|observar|notar)/gim,
     "«é importante ressaltar»",
     "Adia o ponto principal. Afirme o que é importante diretamente, sem anunciar."],
    [/\bvale (?:ressaltar|salientar|destacar|lembrar|notar) que\b/gi,
     "«vale ressaltar que»",
     "Interrompe o fluxo da prosa. Integre a informação diretamente na frase."],
    [/\bconforme (?:mencionado|citado|dito|exposto|visto) (?:acima|anteriormente|antes)\b/gi,
     "«conforme mencionado anteriormente»",
     "Referência circular e burocrática. Reformule a ideia ou suprima a repetição."],
    [/\bcomo (?:já )?(?:mencionado|dito|citado|visto|exposto)\b/gi,
     "«como já mencionado»",
     "Referência circular. Se a informação é necessária, repita-a diretamente; se não é, suprima."],
    // batch 10
    [/\bse faz necessário\b/gi,
     "«se faz necessário»",
     "Construção passivizante e burocrática. Prefira o verbo direto: «é preciso», «convém», «deve-se»."],
    [/(?:^|\s)é mister/gim,
     "«é mister»",
     "Arcaísmo jurídico-burocrático. Use «é preciso», «é necessário» ou afirme diretamente."],
    [/\bde modo geral\b/gi,
     "«de modo geral»",
     "Generalização vaga. Especifique o escopo ou suprima — a frase ganha precisão sem ele."],
    [/\bem linhas gerais\b/gi,
     "«em linhas gerais»",
     "Abertura que adia o ponto central. Comece diretamente pelo que quer dizer."],
    [/\bde certa forma\b/gi,
     "«de certa forma»",
     "Hedge vago que enfraquece a afirmação. Afirme com precisão ou escolha outra construção."],
    [/\bde certo modo\b/gi,
     "«de certo modo»",
     "Hedge vago. Se há reserva real, nomeie-a; se não há, afirme diretamente."],
    [/\bpor assim dizer\b/gi,
     "«por assim dizer»",
     "Recurso que sinaliza imprecisão sem resolvê-la. Escolha a palavra certa ou reformule."],
    [/\bem outras palavras\b/gi,
     "«em outras palavras»",
     "Se a segunda formulação é mais clara, suprima a primeira. Se não for, suprima a segunda."],
    // batch 12
    [/\bprimeiramente\b/gi,
     "«primeiramente»",
     "Enumeração burocrática. Se há ordem necessária, numere; se não há, afirme diretamente."],
    [/\bem primeiro lugar\b/gi,
     "«em primeiro lugar»",
     "Abertura enumerativa que adia o argumento. Afirme diretamente ou estruture a lista com clareza."],
    [/\bpor fim\b/gi,
     "«por fim»",
     "Marcador conclusivo mecânico. Prefira começar a conclusão pela ideia, não pelo aviso de que há uma conclusão."],
    [/\bpor último\b/gi,
     "«por último»",
     "Marcador de encerramento que pode ser suprimido — a posição no texto já indica que é o último ponto."],
    [/\bdiante disso\b/gi,
     "«diante disso»",
     "Conector vago. Prefira «portanto», «assim», «logo» ou retome o argumento diretamente."],
    [/\blevando em conta\b/gi,
     "«levando em conta»",
     "Perífrase para «considerando». Prefira «considerando», «dado que» ou integre o critério à frase."],
    [/\blevando em consideração\b/gi,
     "«levando em consideração»",
     "Perífrase longa para «considerando». Prefira «considerando», «tendo em vista» ou restructure."],
    [/\bposto isso\b/gi,
     "«posto isso»",
     "Conector de conclusão burocrático. Prefira «portanto», «assim» ou inicie a conclusão diretamente."],
    // batch 13
    [/\bno que se refere\b/gi,
     "«no que se refere a»",
     "Perífrase para «quanto a», «sobre» ou «em». Prefira a preposição simples."],
    [/\bcom relação\b/gi,
     "«com relação a»",
     "Perífrase preposicional. Prefira «sobre», «quanto a», «em» ou restructure a frase."],
    [/\bpode ser que\b/gi,
     "«pode ser que»",
     "Hedge modal vago. Se há incerteza real, nomeie a fonte; se não há, afirme diretamente."],
    [/\bde certa maneira\b/gi,
     "«de certa maneira»",
     "Hedge vago equivalente a «de certa forma». Afirme com precisão ou escolha outra construção."],
    [/\bde alguma forma\b/gi,
     "«de alguma forma»",
     "Hedge impreciso. Identifique a forma concreta ou afirme diretamente sem a ressalva vaga."],
    // batch 14
    [/\bfica (?:claro|evidente|nítido) que\b/gi,
     "«fica claro que»",
     "Anuncia uma conclusão em vez de tirá-la. Afirme o que fica claro diretamente."],
    [/\bpode-se (?:dizer|afirmar|concluir|observar|notar) que\b/gi,
     "«pode-se dizer que»",
     "Recuo desnecessário. Afirme diretamente — a escolha de escrever já implica responsabilidade."],
    [/(?:^|\s)é possível (?:dizer|afirmar|concluir|observar|notar) que/gim,
     "«é possível dizer que»",
     "Hedge que enfraquece a afirmação. Afirme sem mediação ou apresente a incerteza com precisão."],
    [/(?:^|\s)é necessário (?:ressaltar|salientar|destacar|enfatizar)/gim,
     "«é necessário ressaltar»",
     "Anuncia que algo é importante em vez de demonstrá-lo. Afirme o ponto diretamente."],
    [/\bnão podemos (?:esquecer|ignorar|deixar de mencionar)\b/gi,
     "«não podemos esquecer»",
     "Introdução negativa que adia o argumento. Afirme o que não deve ser esquecido diretamente."],
    [/\bdevemos (?:ressaltar|salientar|destacar|lembrar) que\b/gi,
     "«devemos ressaltar que»",
     "Plural inclusivo que dilui a responsabilidade autoral. Afirme na primeira pessoa ou diretamente."],
    [/\bpara (?:concluir|finalizar|encerrar)[,\.]/gi,
     "«para concluir»",
     "Sinalizador mecânico de conclusão. Comece a conclusão pela ideia, não pelo aviso de que há uma."],
    [/\bem suma\b/gi,
     "«em suma»",
     "Marcador de síntese que pode ser suprimido — a posição no texto já sinaliza encerramento."],
    // batch 17
    [/\ba saber[,:\s]/gi,
     "«a saber»",
     "Latinismo formal que anuncia enumeração. Em prosa literária, integre diretamente os elementos."],
    [/\bqual seja\b/gi,
     "«qual seja»",
     "Formalismo jurídico-acadêmico. Prefira «ou seja», «isto é» ou restructure a frase."],
    [/\bsem mais delongas\b/gi,
     "«sem mais delongas»",
     "Expressão que ironicamente delonga o que promete encurtar. Vá direto ao assunto."],
    [/\bmodéstia à parte\b/gi,
     "«modéstia à parte»",
     "Falsa modéstia que anuncia o oposto. Afirme sem a mediação performática."],
    [/\bcom todo o respeito\b/gi,
     "«com todo o respeito»",
     "Prefácio de crítica que serve de escudo retórico. Afirme a crítica diretamente."],
    [/\bpermita-me (?:dizer|afirmar|destacar|observar)\b/gi,
     "«permita-me dizer»",
     "Deferência performática que enfraquece o que vem a seguir. Afirme diretamente."],
    [/\bcomo (?:bem |já )?dizia\b/gi,
     "«como dizia»",
     "Citação de autoridade sem precisar autor ou obra. Cite diretamente ou afirme por conta própria."],
    [/\bquando tudo (?:está|parece) (?:dito|posto|feito)\b/gi,
     "«quando tudo está dito»",
     "Abertura paradoxal que promete síntese mas frequentemente adia o argumento principal."],
    // batch 16
    [/\btodo(?:s)? (?:os|as) seres humanos\b/gi,
     "«todos os seres humanos»",
     "Generalização universal difícil de sustentar. Especifique o grupo, o contexto ou a condição."],
    [/\ba sociedade (?:atual|moderna|contemporânea|de hoje)\b/gi,
     "«a sociedade atual»",
     "Generalização vaga. Especifique qual sociedade, em que aspecto ou em que período."],
    [/\bo ser humano\b/gi,
     "«o ser humano»",
     "Essencialismo que apaga diferenças históricas e culturais. Especifique o sujeito concreto."],
    [/\bdesde os primórdios da humanidade\b/gi,
     "«desde os primórdios da humanidade»",
     "Hipérbole temporal sem sustentação. Especifique o período ou o contexto histórico concreto."],
    [/(?:^|\s)é inegável que/gim,
     "«é inegável que»",
     "Reforço que nega o debate antes de apresentar o argumento. Afirme e apresente a evidência."],
    [/(?:^|\s)é inquestionável que/gim,
     "«é inquestionável que»",
     "Fechamento autoritário do argumento. Afirme com os dados que tornam a afirmação sólida."],
    [/\btodos sabemos que\b/gi,
     "«todos sabemos que»",
     "Pressuposto falso de conhecimento compartilhado. Afirme sem presumir o que o leitor sabe."],
    [/(?:^|\s)é sabido por todos/gim,
     "«é sabido por todos»",
     "Argumento de autoridade difuso. Se é sabido, cite a fonte; se não é, afirme com evidência."],
    // batch 11
    [/(?:^|\s)[aà] título de/gim,
     "«à título de»",
     "Pleonasmo de preposição («a» + «título» já inclui a relação). Reescreva: «como exemplo», «como ilustração»."],
    [/\bem tempo hábil\b/gi,
     "«em tempo hábil»",
     "Expressão vaga de prazo. Prefira o tempo concreto: «até sexta», «em três dias», «antes do prazo»."],
    [/\bno decorrer d[eo]s?\b/gi,
     "«no decorrer de»",
     "Perífrase temporal. Prefira «durante», «ao longo de» ou o tempo diretamente."],
    [/\bao longo dos anos\b/gi,
     "«ao longo dos anos»",
     "Generalização temporal desgastada. Especifique o período ou afirme diretamente a mudança."],
    [/\bdesde (?:sempre|tempos imemoriais|o início dos tempos)\b/gi,
     "«desde sempre»",
     "Hipérbole temporal imprecisa. Especifique quando ou reformule com o fato concreto."],
    [/\bno final das contas\b/gi,
     "«no final das contas»",
     "Marcador conclusivo desgastado. Substitua por «afinal», «em suma» ou inicie diretamente a conclusão."],
    [/\bde qualquer forma\b/gi,
     "«de qualquer forma»",
     "Conector frouxo que pode sinalizar incoerência no argumento. Revise a transição."],
    [/\bde qualquer maneira\b/gi,
     "«de qualquer maneira»",
     "Conector frouxo. Prefira uma conjunção precisa: «ainda assim», «mesmo assim», «contudo»."],
  ];

  function analisarConfusoes(texto) {
    const encontradas = [];
    CONFUSOES_GRAMATICAIS.forEach(([padrao, rotulo, sugestao]) => {
      const hits = [...texto.matchAll(padrao)];
      if (hits.length > 0)
        encontradas.push({ rotulo, sugestao, ocorrencias: hits.length, exemplos: hits.slice(0, 2).map(m => m[0]) });
    });
    return { ocorrencias: encontradas.length, lista: encontradas };
  }

  function analisarPleonasmos(texto) {
    const lower = texto.toLowerCase();
    const seen = new Set();
    const encontrados = PLEONASMOS
      .filter(([p]) => { const k = p.toLowerCase(); return lower.includes(k) && !seen.has(k) && seen.add(k); })
      .map(([p, corr]) => ({
        rotulo: `«${p}»`,
        sugestao: corr ? `Prefira «${corr}».` : "Construção redundante — remova o termo que repete o sentido.",
        ocorrencias: 1,
        exemplos: [p]
      }));
    return { ocorrencias: encontrados.length, lista: encontrados };
  }

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
      confusoes: analisarConfusoes(texto),
      pleonasmos: analisarPleonasmos(texto),
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

    if (resultado.pleonasmos?.ocorrencias > 0)
      resultado.pleonasmos.lista.forEach(p => {
        alertas.push({ dim: "pleonasmos", id: `pleonasmo-${p.rotulo.replace(/[^a-z]/gi,"-").toLowerCase()}`,
          nivel: "moderado",
          msg: `${p.ocorrencias}× ${p.rotulo} — ${p.sugestao}`,
          acao: `Exemplo encontrado: "${p.exemplos[0]}".` });
      });
    if (resultado.confusoes?.ocorrencias > 0)
      resultado.confusoes.lista.forEach(c => {
        alertas.push({ dim: "confusoes", id: `confusao-${c.rotulo.replace(/[^a-z]/gi,"-").toLowerCase()}`,
          nivel: "moderado",
          msg: `${c.ocorrencias}× ${c.rotulo} — ${c.sugestao}`,
          acao: `Exemplo encontrado: "${c.exemplos[0]}".` });
      });

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
