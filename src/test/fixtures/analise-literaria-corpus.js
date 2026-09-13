(function () {
    "use strict";

    /* Banca de Análise Literária (Vereda v3) — textos originais congelados.
     * Cada caso tem texto, opções (formato/poesia) e origem declarada.
     * Mínimo exigido pela engine: 30 palavras (caso curto testa a guarda).
     */
    module.exports = {
        cases: [
            {
                id: "narrativa-3p",
                origem: "corpus artificial do cofre (12/09/2026) — prosa narrativa, 3ª pessoa",
                options: {},
                text: "O vento soprou forte pela manhã na cidade pequena. Era um dia frio e escuro, e as ruas pareciam abandonadas. Ele pensou que seria melhor ficar em casa, mas o trabalho o chamava para a rua. Depois de muito hesitar, levantou-se devagar e saiu. As ruas estavam cheias de gente apressada que não olhava para ninguém. Ele atravessou a praça central e entrou no mercado municipal, onde comprou pão quente e café. O padeiro sorriu e o cumprimentou, reconhecendo-o de outros dias. Era sempre assim, uma troca cordial de afetos mínimos entre pessoas que se veem todos os dias sem se conhecerem."
            },
            {
                id: "epistolar-1p",
                origem: "corpus artificial do cofre (12/09/2026) — carta, 1ª pessoa",
                options: {},
                text: "Querida amiga, escrevo esta carta para dizer que finalmente mudei de casa. Meu novo apartamento é pequeno, mas tem uma varanda que eu sempre quis ter. Acordo cedo todos os dias e, antes do trabalho, preparo meu café e leio um pouco. Eu penso muito em você e sinto saudade das nossas conversas na varanda antiga. Nós passamos tardes inteiras discutindo livros e projetos que nunca saíram do papel. Quero que você venha me visitar no próximo mês e conhecer esse novo lugar. Acho que você vai gostar da vizinhança tranquila e das árvores da rua. Nossa amizade atravessou fases difíceis, e eu quero preservá-la como um tesouro."
            },
            {
                id: "ensaio-subordinacao",
                origem: "corpus artificial do cofre (12/09/2026) — ensaio curto, conectivos comparativos/concessivos",
                options: {},
                text: "A leitura lenta, conforme sugerem muitos autores, não é apenas um método de estudo, mas uma forma de resistência. Enquanto a maioria busca velocidade na digestão das páginas, alguns leitores insistem em demorar sobre cada frase, mesmo que isso custe tempo, porque acreditam que o sentido mora nas entrelinhas. Se o texto exige esforço, o esforço se torna parte da experiência; caso contrário, resta apenas o consumo rápido e o esquecimento. Portanto, quando alguém afirma que leu um livro em uma tarde, talvez tenha apenas folheado suas páginas. Ainda que pareça exagero, a lentidão pode ser o gesto mais político disponível em uma época acelerada."
            },
            {
                id: "sujeira-vicios",
                origem: "corpus artificial do cofre (12/09/2026) — texto poluído de propósito: voz passiva, advérbios -mente, pleonasmos, negação dupla, clichês, mistura de tempos, pronomes ambíguos",
                options: {},
                text: "A equipe foi surpreendida por uma notícia que chegou de repente e que foi recebida com espanto por todos os membros. Infelizmente, o projeto foi adiado completamente, e o motivo é que faltavam verbas para continuar. A razão disso é porque o orçamento foi cortado bruscamente na semana passada, e a direção informou que as coisas vão continuar assim por um tempo. Ele disse ao chefe que ela estava errada sobre o prazo, e ninguém sabia ao certo quem deveria ser responsabilizado pelo atraso. Subir para cima no organograma parecia a solução, entrar para dentro da sala de reuniões parecia inevitável, e cada pessoa aguardava ansiosamente o veredicto. O gato subiu para cima do telhado e o cachorro entrou para dentro de casa, enquanto os vizinhos observavam tudo calmamente. Não há como negar que nada disso foi fácil, mas a esperança é a última que morre, então todos continuaram lutando pela mesma visão de sempre."
            },
            {
                id: "poema",
                origem: "corpus artificial do cofre (12/09/2026) — poema (formato poesia, deve saltar pleonasmos/clichês)",
                options: { formato: "poema", poesia: true },
                text: "A tarde desce devagar sobre o cais e o vento escreve linhas na água escura. Os barcos dormem moles, amarrados, e a luz se despede sem pressa da muralha. Eu caminho pela areia fria contando os passos que perdi contigo. Longe, um sino repete a mesma pergunta, e o mar, o mar responde que talvez. As gaivotas riscam o céu com tinta cinza, desenhando rotas que ninguém segue. Fico aqui até que a noite apague os contornos e a saudade vire apenas mais uma onda."
            },
            {
                id: "curto",
                origem: "corpus artificial do cofre (12/09/2026) — texto curto (deve retornar null, guarda de <30 palavras)",
                options: {},
                text: "O dia estava claro e quente."
            },
            {
                id: "opcoes-editor-mode",
                origem: "regressão A1 da revisão independente — options.editorMode booleano (coerção String() no template de formato)",
                options: { editorMode: true },
                text: "O processo de revisão começa quando o autor fecha o manuscrito. Depois disso, cada capítulo é lido, anotado e corrigido por alguém que não escreveu aquele trecho. Essa distância do próprio texto é o que permite ver os problemas com clareza."
            },
            {
                id: "opcoes-oficio",
                origem: "regressão A1 da revisão independente — options.oficio booleano",
                options: { oficio: true },
                text: "A mesa de trabalho amanheceu coberta de papéis. Entre eles, uma carta antiga, um mapa desbotado e o rascunho de uma peça teatral. Ninguém sabia ao certo quem os havia deixado ali naquela noite chuvosa."
            },
            {
                id: "opcoes-formato-5",
                origem: "regressão A1 da revisão independente — options.formato numérico (coerção String() no template de formato)",
                options: { formato: 5 },
                text: "Eles caminharam até o topo da colina antes do amanhecer. O vento trazia o cheiro da chuva que ainda não chegara. No horizonte, as luzes da cidade acendiam uma a uma, como se respondessem a um chamado invisível."
            }
        ]
    };
})();