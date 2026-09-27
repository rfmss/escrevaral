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
  nominal('livro menino homem escritor poema canto mar pão silêncio tempo fogo dia vento jogo sonho trabalho olho filho pagamento caminho','m','singular');
  nominal('livros meninos homens escritores poemas cantos pães silêncios tempos jogos sonhos trabalhos olhos filhos','m','plural');
  nominal('casa menina mulher escritora carta porta revista opinião rosa flor água mesa vida música notícia família noite cobra vizinha','f','singular');
  nominal('casas meninas mulheres escritoras cartas portas revistas opiniões rosas flores águas mesas vidas cobras vizinhas','f','plural');
  function pattern(words,kind){
    words.split(' ').forEach(function(lemma){
      var key='$'+lemma;
      if(!frames[key]){frames[key]=[];}
      frames[key].push({id:'REG-'+lemma+'-'+kind,lemma:lemma,pattern:kind,status:'implementado-no-recorte',origin:origin});
    });
  }
  /* Usos reconhecidos, nunca classificação permanente do verbo. */
  pattern('amar comprar ler escrever publicar ver abrir cortar encontrar trazer','objeto-direto');
  pattern('ser estar','predicativo');
  pattern('dar','direto-e-indireto-a');
  pattern('cantar andar correr sair partir trabalhar chegar terminar','sem-complemento');
  function copy(record){var out={};Object.keys(record).forEach(function(k){out[k]=record[k];});return out;}
  function framesFor(lemma){return (frames['$'+lemma]||[]).map(copy);}
  E.syntaxLexicon={
    version:'lexico-sintatico-1',
    nounReadings:function(form){return (nouns['$'+form]||[]).map(copy);},
    articleReading:function(form){return Object.prototype.hasOwnProperty.call(articles,form)?articles[form].slice():null;},
    isProperName:function(form){return ['ana','maria','joão','pedro'].indexOf(form)>=0;},
    framesFor:framesFor,
    frame:function(lemma,kind){var candidates=framesFor(lemma).filter(function(f){return f.pattern===kind;});return candidates.length===1?candidates[0]:null;}
  };
}(typeof window !== 'undefined' ? window : this));
