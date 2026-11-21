/* Inventário do recorte sintático: dados locais, sem acesso ao manuscrito. ES5. */
(function (root) {
  'use strict';
  var E=root.Escr, nouns={}, frames={}, articles={o:['m','singular'],a:['f','singular'],os:['m','plural'],as:['f','plural'],um:['m','singular'],uma:['f','singular'],uns:['m','plural'],umas:['f','plural']};
  var origin='Inventário local preservado da versão v6-23; não é transcrição de dicionário nem cobertura geral.';
  function nominal(words,gender,number){
    words.split(' ').forEach(function(form){
      var key='$'+form;
      if(!nouns[key]){nouns[key]=[];}
      nouns[key].push({form:form,wordClass:'substantivo',gender:gender,number:number,origin:origin});
    });
  }
  /* Formas explícitas; não inferir flexão por sufixo nem sobrescrever candidatos. */
  nominal('livro menino homem escritor poema canto mar pão silêncio tempo fogo dia vento jogo sonho trabalho olho filho pagamento caminho caderno papel texto verso capítulo conto romance diário autor leitor editor amigo pai irmão avô coração corpo rosto sorriso passo gesto segredo destino caminho rio sol céu jardim muro telhado quarto relógio espelho café trem barco navio porto campo ferro ouro vidro casaco chapéu sapato trovão relâmpago inverno verão outono minuto segundo mês ano século mundo lugar espaço ruído som eco brilho medo plano assunto tema título parágrafo rascunho manuscrito arquivo documento selo certificado','m','singular');
  nominal('livros meninos homens escritores poemas cantos pães silêncios tempos jogos sonhos trabalhos olhos filhos cadernos papéis textos versos capítulos contos romances diários autores leitores editores amigos pais irmãos avôs corações corpos rostos sorrisos passos gestos segredos destinos rios sóis céus jardins muros telhados quartos relógios espelhos cafés trens barcos navios portos campos casacos chapéus sapatos trovões relâmpagos invernos verões outonos minutos segundos meses anos séculos mundos lugares espaços ruídos sons ecos medos planos assuntos temas títulos parágrafos rascunhos manuscritos arquivos documentos selos certificados','m','plural');
  nominal('casa menina mulher escritora carta porta revista opinião rosa flor água mesa vida música notícia família noite cobra vizinha chuva cidade rua janela manhã tarde voz história palavra cadeira luz sombra estrada pessoa amiga mãe irmã avó criança mente ideia memória saudade dor alegria esperança estrela lua árvore folha pedra chave página linha frase crônica cama parede sala cozinha praça estação ilha praia floresta terra areia poeira fumaça cinza prata roupa lágrima viagem resposta pergunta biblioteca escola ponte montanha nuvem tempestade hora semana primavera infância juventude velhice oficina mesa folha obra língua escrita leitura revisão','f','singular');
  nominal('casas meninas mulheres escritoras cartas portas revistas opiniões rosas flores águas mesas vidas cobras vizinhas chuvas cidades ruas janelas manhãs tardes vozes histórias palavras cadeiras luzes sombras estradas pessoas amigas mães irmãs avós crianças mentes ideias memórias saudades dores alegrias esperanças estrelas luas árvores folhas pedras chaves páginas linhas frases crônicas camas paredes salas cozinhas praças estações ilhas praias florestas terras areias roupas lágrimas viagens respostas perguntas bibliotecas escolas pontes montanhas nuvens tempestades horas semanas primaveras oficinas folhas obras línguas escritas leituras revisões','f','plural');
  function pattern(words,kind){
    words.split(' ').forEach(function(lemma){
      var key='$'+lemma;
      if(!frames[key]){frames[key]=[];}
      frames[key].push({id:'REG-'+lemma+'-'+kind,lemma:lemma,pattern:kind,status:'implementado-no-recorte',origin:origin});
    });
  }
  /* Usos reconhecidos, nunca classificação permanente do verbo. */
  pattern('amar comprar ler escrever publicar ver abrir cortar encontrar trazer ouvir sentir guardar procurar perder achar construir criar pintar desenhar contar narrar lembrar esquecer escolher seguir deixar levar pegar segurar fechar beber comer preparar estudar ensinar aprender entender compreender explicar mostrar esconder revelar descobrir inventar imaginar observar admirar visitar conhecer receber enviar entregar assinar revisar corrigir traduzir recitar acender apagar','objeto-direto');
  pattern('ser estar parecer ficar continuar permanecer','predicativo');
  pattern('dar','direto-e-indireto-a');
  pattern('cantar andar correr sair partir trabalhar chegar terminar dormir acordar sorrir chorar rir cair nascer morrer crescer viver esperar caminhar passear viajar voltar retornar descansar silenciar brilhar florescer escapar fugir entrar descer subir parar','sem-complemento');
  function copy(record){var out={};Object.keys(record).forEach(function(k){out[k]=record[k];});return out;}
  function framesFor(lemma){return (frames['$'+lemma]||[]).map(copy);}
  E.syntaxLexicon={
    version:'lexico-sintatico-2',
    nounReadings:function(form){return (nouns['$'+form]||[]).map(copy);},
    articleReading:function(form){return Object.prototype.hasOwnProperty.call(articles,form)?articles[form].slice():null;},
    isProperName:function(form){return ['ana','maria','joão','pedro'].indexOf(form)>=0;},
    framesFor:framesFor,
    frame:function(lemma,kind){var candidates=framesFor(lemma).filter(function(f){return f.pattern===kind;});return candidates.length===1?candidates[0]:null;}
  };
}(typeof window !== 'undefined' ? window : this));
