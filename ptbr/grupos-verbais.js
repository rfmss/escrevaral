/* Formas nominais explícitas e combinações delimitadas. Não cria lemas por sufixo. */
(function(root){
  'use strict';
  var E=root.Escr, forms={};
  var rows=[
    ['amar','amando','amado'],['comprar','comprando','comprado'],['ler','lendo','lido'],
    ['escrever','escrevendo','escrito'],['publicar','publicando','publicado'],['ver','vendo','visto'],
    ['abrir','abrindo','aberto'],['cortar','cortando','cortado'],['encontrar','encontrando','encontrado'],
    ['trazer','trazendo','trazido'],['cantar','cantando','cantado'],['andar','andando','andado'],
    ['correr','correndo','corrido'],['sair','saindo','saído'],['partir','partindo','partido'],
    ['trabalhar','trabalhando','trabalhado'],['chegar','chegando','chegado'],['terminar','terminando','terminado'],
    ['dar','dando','dado'],
    ['revisar','revisando','revisado'],['dedicar','dedicando','dedicado'],['entregar','entregando','entregado'],
    ['enviar','enviando','enviado'],['mostrar','mostrando','mostrado'],['contar','contando','contado'],
    ['narrar','narrando','narrado'],['guardar','guardando','guardado'],['observar','observando','observado'],
    ['revelar','revelando','revelado'],['esconder','escondendo','escondido'],['escolher','escolhendo','escolhido'],
    ['ouvir','ouvindo','ouvido'],['sentir','sentindo','sentido'],['sonhar','sonhando','sonhado'],
    ['pensar','pensando','pensado'],['acreditar','acreditando','acreditado'],['confiar','confiando','confiado'],
    ['precisar','precisando','precisado'],['cuidar','cuidando','cuidado'],['resistir','resistindo','resistido'],
    ['caminhar','caminhando','caminhado'],['voltar','voltando','voltado'],['descansar','descansando','descansado'],
    ['brilhar','brilhando','brilhado'],['florescer','florescendo','florescido'],['dormir','dormindo','dormido'],
    ['acordar','acordando','acordado'],['chorar','chorando','chorado'],['sorrir','sorrindo','sorrido'],
    ['cair','caindo','caído'],['viver','vivendo','vivido'],['navegar','navegando','navegado'],
    ['passar','passando','passado'],['permanecer','permanecendo','permanecido'],['começar','começando','começado'],
    ['recitar','recitando','recitado'],['traduzir','traduzindo','traduzido'],['oferecer','oferecendo','oferecido'],
    ['devolver','devolvendo','devolvido'],['prometer','prometendo','prometido'],['ensinar','ensinando','ensinado'],
    ['aprender','aprendendo','aprendido'],['explicar','explicando','explicado'],['descobrir','descobrindo','descoberto']
  ];
  rows.forEach(function(row){row.forEach(function(word,i){forms['$'+word]={lemma:row[0],kind:['infinitivo','gerúndio','particípio'][i]};});});
  function match(tokens,at,auxiliary){
    var next=tokens[at+1],last=at+1,connector=null,form,kind;
    if(!next){return null;}
    if(auxiliary==='estar'&&next.value==='a'){connector=at+1;last++;next=tokens[last];}
    if(!next){return null;}
    form=forms['$'+next.value];if(!form){return null;}
    if(auxiliary==='ter'&&next.value==='partido'){return null;} /* Posse de partido vs. tempo composto. */
    if(auxiliary==='estar'&&form.kind==='gerúndio'&&connector===null){kind='progressiva';}
    else if(auxiliary==='estar'&&form.kind==='infinitivo'&&connector!==null){kind='progressiva';}
    else if((auxiliary==='ter'||auxiliary==='haver')&&form.kind==='particípio'){kind='tempo composto';}
    else if(auxiliary==='ir'&&form.kind==='infinitivo'){kind='prospectiva';}
    else{return null;}
    return{first:at,last:last,main:last,connector:connector,lemma:form.lemma,form:form.kind,kind:kind,auxiliary:auxiliary};
  }
  E.verbGroups={version:'locucoes-2',match:match};
}(typeof window!=='undefined'?window:this));
