
const endpaper=`<div class="pp pp-center"><div class="pp-ed">Editora Margem</div><div class="pp-rule"></div></div>`;
const PAGES={
'falsa-folha':`<div class="pp pp-center"><h1 class="pp-title">A Cartografia<br>do Esquecimento</h1></div>`,
'folha-rosto':`<div class="pp pp-center"><div class="pp-ed">Helena Vasconcelos</div><h1 class="pp-title" style="margin-top:30px">A Cartografia<br>do <em>Esquecimento</em></h1><div class="pp-sub">romance</div><div class="pp-rule"></div><div class="pp-ed">Editora Margem · São Paulo · 2025</div></div>`,
'creditos':`<div class="pp pp-small"><p>© 2025 Helena Vasconcelos<br>Todos os direitos reservados.</p><p>Revisão · Clara Bastos<br>Projeto gráfico · Estúdio Vereda<br>Capa · R. M. sobre fotografia de domínio público</p><p>1ª edição, 2025<br>ISBN 978-65-00000-00-9</p><div class="cip">Dados Internacionais de Catalogação na Publicação (CIP)<br>V331c &nbsp; Vasconcelos, Helena<br>&nbsp;&nbsp;&nbsp;&nbsp;A cartografia do esquecimento / Helena Vasconcelos. — São Paulo : Margem, 2025.<br>&nbsp;&nbsp;&nbsp;&nbsp;CDD 869.3</div></div>`,
'dedicatoria':`<div class="pp pp-center" style="margin-top:34%"><p class="epi">Para Joana,<br>que conhecia todos<br>os caminhos de volta.</p></div>`,
'epigrafe':`<div class="pp pp-center"><p class="epi">Esquecer também é uma<br>forma de cartografar:<br>marca-se com a ausência.</p><p class="epi-attr">— Aurélia Pina, <em>Cadernos do Litoral</em></p></div>`,
'sumario':`<div class="pp"><div class="runhead">Sumário</div><ul class="toc"><li class="part">Parte I — A maré baixa</li><li><span>1. O farol</span><span class="dots"></span><span>11</span></li><li><span>2. Cartas de marear</span><span class="dots"></span><span>29</span></li><li class="part">Parte II — O território</li><li><span>3. A vila submersa</span><span class="dots"></span><span>63</span></li><li><span>4. Nomes que a água levou</span><span class="dots"></span><span>88</span></li><li><span>Epílogo</span><span class="dots"></span><span>211</span></li><li><span>Colofão</span><span class="dots"></span><span>224</span></li></ul></div>`,
'prefacio':`<div class="pp"><div class="runhead">Prefácio</div><h4>Os mapas do invisível</h4><p>Há livros que se leem com os olhos e há livros que se leem com a memória. Este é dos segundos.</p><p>Conheci Helena quando ambos procurávamos, em arquivos esquecidos, o nome de uma vila que nenhum mapa registrava.</p><p style="font-style:italic;text-align:right">— Antônio Sarmento</p></div>`,
'prologo':`<div class="pp"><div class="runhead">Prólogo</div><p class="dropcap">A maré recuou três metros além do normal naquela manhã, e a vila amanheceu mostrando o que havia décadas escondia sob a água parada.</p><p>Joana desceu até a linha úmida com o caderno debaixo do braço, como quem vai reconhecer um corpo.</p></div>`,
'capitulos':`<div class="part-divider"><div class="pn">Parte I</div><div class="pt">A Maré Baixa</div><div class="pp-rule"></div><p class="pp-small">1 · O farol</p></div>`,
'epilogo':`<div class="pp"><div class="runhead">Epílogo</div><p class="dropcap">Anos depois, quando perguntavam pela vila, ela apenas desdobrava o mapa sobre a mesa e apontava o ponto onde o mar havia, enfim, devolvido tudo.</p><p>Não havia mais nada a esquecer. Era a primeira vez que se sentia em casa.</p></div>`,
'posfacio':`<div class="pp"><div class="runhead">Posfácio</div><h4>Notas sobre a água</h4><p>Escrevi este livro durante três invernos, ouvindo o mesmo trecho de mar. Cada capítulo nasceu de um mapa real que não correspondia a lugar nenhum.</p><p style="font-style:italic;text-align:right">— H. V., outono de 2025</p></div>`,
'agradecimentos':`<div class="pp"><div class="runhead">Agradecimentos</div><p>A Clara, primeira leitora de tudo. À equipe da Margem, pela paciência editorial. Aos pescadores de Regência, que me emprestaram nomes e silêncios.</p><p>E a você, que chegou até esta página.</p></div>`,
'bibliografia':`<div class="pp pp-small"><div class="runhead">Referências</div><p>ANDRADE, M. <em>Geografias afetivas</em>. São Paulo: Margem, 2019.</p><p>PINA, A. <em>Cadernos do Litoral</em>. Vitória: Maré, 1974.</p><p>SARMENTO, A. “Vilas submersas do Espírito Santo”. <em>Revista de História</em>, n. 42, 2003.</p></div>`,
'glossario':`<div class="pp"><div class="runhead">Glossário</div><dl class="gloss"><dt>marejar</dt><dd>encher-se de água, dito do olho e da terra.</dd><dt>lote corredor</dt><dd>terreno estreito e longo, comum no litoral.</dd><dt>derrota</dt><dd>na náutica, o rumo planejado de uma viagem.</dd></dl></div>`,
'sobre-autor':`<div class="pp"><div class="runhead">Sobre a autora</div><div class="photo photo-large" role="img" aria-label="Retrato da autora Helena Vasconcelos"></div><p style="text-align:center">Helena Vasconcelos nasceu no litoral capixaba em 1981. É formada em Letras e trabalhou como revisora antes de publicar seu primeiro livro de contos.</p><p class="pp-small" style="text-align:center">helenavasconcelos.com.br · @helena.mar</p></div>`,
'colofao':`<div class="pp pp-center"><div class="pp-rule"></div><p class="pp-small" style="max-width:200px;margin:0 auto">Este livro foi composto nas tipografias <em>Fraunces</em> e <em>Spectral</em>, e impresso em papel pólen soft 80g, no inverno de 2025, para a Editora Margem.</p><div class="pp-rule"></div><div class="pp-ed">colofão</div></div>`
};
const SECTIONS=[
{n:'1',title:'O exterior',items:[['capa','Capa','Primeira capa','É o convite do livro: o lugar do título, do nome e da primeira faísca da leitura.'],['lombada','Lombada','Exterior','É o lado que chama você da estante. Aqui vivem o título, a autoria e a espessura da leitura.'],['contracapa','Contracapa','Quarta capa','Fecha o convite. Reúne a promessa da história, uma frase de impacto e o ISBN.'],['orelha1','Orelha da frente','Exterior','Abre o apetite. Resume a obra e ajuda quem lê a decidir se entra ou não.'],['orelha2','Orelha do verso','Exterior','Apresenta quem escreveu e aproxima o livro de quem está prestes a abrir a primeira página.'],['sobrecapa','Sobrecapa','Jacket','É a roupa extra do livro: protege, veste e dá uma nova presença ao objeto.'],['cinta','Cinta','Exterior','A faixa que chama atenção para um prêmio, uma adaptação ou um elogio impossível de ignorar.']]},
{n:'2',title:'Pré-textuais',items:[['falsa-folha','Falsa folha de rosto','Pré-textual','A primeira respiração do miolo. Só o título, sem distração.'],['folha-rosto','Folha de rosto','Pré-textual','Aqui o livro se apresenta por inteiro: título, autoria, editora, edição e ano.'],['creditos','Créditos e ficha','Pré-textual','Os bastidores em uma página: direitos, equipe, ISBN e ficha catalográfica.'],['dedicatoria','Dedicatória','Pré-textual','Um gesto íntimo. Poucas palavras para dizer a quem esse livro chega primeiro.'],['epigrafe','Epígrafe','Pré-textual','A frase que acende o clima antes da história começar.'],['sumario','Sumário','Pré-textual','O mapa da viagem: mostra por onde o livro vai levar quem lê.'],['prefacio','Prefácio','Pré-textual','Uma porta de entrada escrita por alguém que apresenta a obra e abre o olhar.']]},
{n:'3',title:'Textuais',items:[['prologo','Prólogo','Textual','É o passo antes do começo: prepara o terreno para a história acontecer.'],['capitulos','Partes e capítulos','Textual','É onde a leitura ganha corpo, ritmo e avanço.'],['epilogo','Epílogo','Textual','Mostra o que fica depois: o eco, a consequência, o que ainda respira.']]},
{n:'4',title:'Pós-textuais',items:[['posfacio','Posfácio','Pós-textual','Fecha a conversa com reflexões sobre a obra e o caminho que a trouxe até aqui.'],['agradecimentos','Agradecimentos','Pós-textual','Onde o livro lembra que nunca nasce sozinho.'],['bibliografia','Bibliografia','Pós-textual','As fontes que sustentam a obra quando ela nasce de pesquisa.'],['glossario','Glossário e apêndice','Pós-textual','Uma ajuda extra para ampliar a leitura e clarear o que pede contexto.'],['sobre-autor','Sobre a autora','Pós-textual','Um retrato mais próximo de quem escreveu, para quem quiser seguir adiante.'],['colofao','Colofão','Pós-textual','A despedida técnica: como o livro foi feito, impresso e finalizado.']]}
];
const ORDER=Object.keys(PAGES),META={},ALL=[];
SECTIONS.forEach(s=>s.items.forEach(it=>{META[it[0]]={name:it[1],section:it[2],desc:it[3],interior:ORDER.includes(it[0])};ALL.push(it[0])}));
const index=document.getElementById('index');
SECTIONS.forEach(s=>{const g=document.createElement('div');g.className='grp';g.innerHTML=`<div class="grp-h"><span class="num">${s.n}</span>${s.title}</div>`;s.items.forEach(it=>{const b=document.createElement('button');b.type='button';b.dataset.id=it[0];b.textContent=it[1];b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>select(it[0]));g.appendChild(b)});index.appendChild(g)});
const stage=document.getElementById('stage'),book=document.getElementById('book'),bookViewport=document.getElementById('bookViewport'),pageFlipShell=document.getElementById('pageFlipShell'),pageFlipBook=document.getElementById('pageFlipBook'),caption=document.getElementById('caption'),rightpage=document.getElementById('rightpage'),leftpage=document.getElementById('leftpage'),leaf=document.getElementById('leaf'),leafFront=document.getElementById('leafFront'),leafBack=document.getElementById('leafBack'),headerState=document.getElementById('headerState'),viewLabel=document.getElementById('viewLabel'),partCount=document.getElementById('partCount'),indexRange=document.getElementById('indexRange');
const FLIP_MS=960;
const PAGE_FLIP_MS=960;
const PAGE_FOCUS_SETTLE_MS=PAGE_FLIP_MS+28;
const PAGE_FLIP_GUARD_MS=PAGE_FLIP_MS+420;
let isOpen=false,curIndex=null,animating=false,pendingTarget=null,flipTarget=null,midpointTimer=null,pageFlip=null,pageFlipReady=false,selectedInteriorIndex=null,focusPulseTimer=null,focusAfterFlipTimer=null,focusRequestId=0,visibleSpreadIndex=null,pendingProgrammaticFlip=null,pendingProgrammaticTimer=null;
partCount.textContent=`${ALL.length} partes`;
indexRange.textContent=`01—${String(ALL.length).padStart(2,'0')}`;
const EXT={capa:'capa',lombada:'lombada',contracapa:'contracapa',orelha1:'orelha1',orelha2:'orelha2',sobrecapa:'capa',cinta:'capa'};
function setActive(id){document.querySelectorAll('.index button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===id?'true':'false'))}
function setCaption(id){
  const m=META[id],pos=ALL.indexOf(id)+1;
  caption.innerHTML=`<div class="caption-head"><span class="eyebrow">${m.section}</span><span class="caption-count">${String(pos).padStart(2,'0')} / ${String(ALL.length).padStart(2,'0')}</span></div><h2>${m.name}</h2><p>${m.desc}</p>`;
  caption.classList.remove('swap');void caption.offsetWidth;caption.classList.add('swap');
  headerState.textContent=m.name;viewLabel.textContent=m.name;
}
function renderSpread(i){rightpage.innerHTML=PAGES[ORDER[i]];leftpage.innerHTML=i>0?PAGES[ORDER[i-1]]:endpaper}
function pageNumberForContent(i){return i+2}
function spreadForContent(i){return Math.floor((pageNumberForContent(i)-1)/2)}
function spreadForPageIndex(pageIndex){return Math.max(0,Math.floor((Number(pageIndex)-1)/2))}
function sideForContent(i){return pageNumberForContent(i)%2===1?'left':'right'}
function firstContentInSpread(spread){
  let fallback=null;
  for(let i=0;i<ORDER.length;i++){
    if(spreadForContent(i)!==spread)continue;
    if(fallback===null)fallback=i;
    if(sideForContent(i)==='left')return i;
  }
  return fallback;
}
function cancelPendingProgrammaticFlip(){
  clearTimeout(pendingProgrammaticTimer);
  pendingProgrammaticTimer=null;
  pendingProgrammaticFlip=null;
}
function clearPageFocus(){
  clearTimeout(focusPulseTimer);
  if(!pageFlipBook)return;
  pageFlipBook.querySelectorAll('.pf-page.is-focus-target,.pf-page.is-focus-muted,.pf-page.is-focus-left,.pf-page.is-focus-right,.pf-page.is-focus-pulsing').forEach(el=>{
    el.classList.remove('is-focus-target','is-focus-muted','is-focus-left','is-focus-right','is-focus-pulsing');
    const sheet=el.querySelector('.pf-sheet');if(sheet)sheet.removeAttribute('data-focus-label');
  });
}
function focusVisiblePage(target){
  if(!pageFlipReady||!pageFlipBook||target<0||target>=ORDER.length)return false;
  clearPageFocus();
  const targetEl=pageFlipBook.querySelector(`.pf-page[data-content-index="${target}"]`);
  if(!targetEl)return false;
  const side=sideForContent(target);
  const sheet=targetEl.querySelector('.pf-sheet');
  targetEl.classList.add('is-focus-target',`is-focus-${side}`);
  if(sheet)sheet.setAttribute('data-focus-label',META[ORDER[target]].name);
  const pageNumber=pageNumberForContent(target);
  const otherPageNumber=pageNumber%2===1?pageNumber+1:pageNumber-1;
  const otherIndex=otherPageNumber-2;
  if(otherIndex>=0&&otherIndex<ORDER.length){
    const otherEl=pageFlipBook.querySelector(`.pf-page[data-content-index="${otherIndex}"]`);
    if(otherEl)otherEl.classList.add('is-focus-muted');
  }
  void targetEl.offsetWidth;
  targetEl.classList.add('is-focus-pulsing');
  focusPulseTimer=setTimeout(()=>targetEl.classList.remove('is-focus-pulsing'),820);
  return true;
}
function cancelScheduledPageFocus(){
  clearTimeout(focusAfterFlipTimer);
  focusAfterFlipTimer=null;
  focusRequestId+=1;
}
function schedulePageFocus(target,delay=PAGE_FOCUS_SETTLE_MS){
  cancelScheduledPageFocus();
  const requestId=focusRequestId;
  focusAfterFlipTimer=setTimeout(()=>{
    focusAfterFlipTimer=null;
    if(requestId!==focusRequestId)return;
    if(selectedInteriorIndex!==target)return;
    if(!stage.classList.contains('uses-pageflip'))return;
    focusVisiblePage(target);
  },delay);
}
function buildPageFlip(){
  if(!pageFlipBook||!window.St||!window.St.PageFlip)return false;
  const cover=`<div class="pf-cover-page"><div class="pf-top"><div class="pf-ed">Editora Margem</div><div class="pf-title">A Cartografia<br>do <em>Esquecimento</em></div><div class="pf-sub">romance</div></div><div class="pf-author">Helena Vasconcelos</div></div>`;
  const pages=[
    `<div class="pf-page" data-density="hard">${cover}</div>`,
    `<div class="pf-page" data-density="hard"><div class="pf-endpaper"></div></div>`,
    ...ORDER.map((id,i)=>`<div class="pf-page" data-page-id="${id}" data-content-index="${i}"><div class="pf-sheet">${PAGES[id]}<span class="pf-page-number">${String(i+1).padStart(2,'0')}</span></div></div>`),
    `<div class="pf-page" data-density="hard"><div class="pf-endpaper"></div></div>`
  ];
  pageFlipBook.innerHTML=pages.join('');
  pageFlip=new St.PageFlip(pageFlipBook,{
    width:330,height:480,size:'stretch',minWidth:190,maxWidth:390,minHeight:276,maxHeight:568,
    drawShadow:true,flippingTime:PAGE_FLIP_MS,usePortrait:true,startZIndex:20,autoSize:false,
    maxShadowOpacity:.58,showCover:true,mobileScrollSupport:true,swipeDistance:24,
    clickEventForward:true,useMouseEvents:true,showPageCorners:true,disableFlipByClick:false
  });
  pageFlip.on('flip',e=>{
    if(!stage.classList.contains('uses-pageflip'))return;
    cancelScheduledPageFocus();
    const raw=Number(e.data);
    if(!Number.isFinite(raw))return;
    const newSpread=spreadForPageIndex(raw);
    visibleSpreadIndex=newSpread;

    if(pendingProgrammaticFlip){
      const pending=pendingProgrammaticFlip;
      if(newSpread===pending.spread){
        cancelPendingProgrammaticFlip();
        if(selectedInteriorIndex===pending.target){
          curIndex=pending.target;
          schedulePageFocus(pending.target,48);
        }
      }
      return;
    }

    if(selectedInteriorIndex!==null&&spreadForContent(selectedInteriorIndex)===newSpread){
      curIndex=selectedInteriorIndex;
      schedulePageFocus(selectedInteriorIndex,48);
      return;
    }

    const idx=firstContentInSpread(newSpread);
    if(idx!==null&&ORDER[idx]){
      const id=ORDER[idx];
      curIndex=idx;
      selectedInteriorIndex=idx;
      setActive(id);
      setCaption(id);
      schedulePageFocus(idx,48);
    }
  });
  pageFlip.loadFromHTML(pageFlipBook.querySelectorAll('.pf-page'));
  pageFlipReady=true;
  return true;
}
function flipLibraryTo(target,animate=true){
  if(!pageFlipReady||!pageFlip)return false;
  const pageNumber=pageNumberForContent(target);
  const spread=spreadForContent(target);
  cancelPendingProgrammaticFlip();
  pendingProgrammaticFlip={target,spread};
  try{
    animate?pageFlip.flip(pageNumber,'bottom'):pageFlip.turnToPage(pageNumber);
  }catch(error){
    cancelPendingProgrammaticFlip();
    throw error;
  }
  pendingProgrammaticTimer=setTimeout(()=>{
    if(!pendingProgrammaticFlip||pendingProgrammaticFlip.target!==target)return;
    visibleSpreadIndex=spread;
    cancelPendingProgrammaticFlip();
    if(selectedInteriorIndex===target){
      curIndex=target;
      schedulePageFocus(target,0);
    }
  },PAGE_FLIP_GUARD_MS);
  return true;
}
function fitBook(){
  if(!bookViewport||!book)return;
  const viewportStyle=getComputedStyle(bookViewport);
  const usableW=bookViewport.clientWidth-parseFloat(viewportStyle.paddingLeft)-parseFloat(viewportStyle.paddingRight);
  const usableH=bookViewport.clientHeight-parseFloat(viewportStyle.paddingTop)-parseFloat(viewportStyle.paddingBottom);
  const bookStyle=getComputedStyle(book);
  const bw=parseFloat(bookStyle.getPropertyValue('--bw'))||book.offsetWidth;
  const bh=parseFloat(bookStyle.getPropertyValue('--bh'))||book.offsetHeight;
  const visualW=stage.classList.contains('is-open')?bw*2.08:bw*1.34;
  const visualH=bh*1.12;
  const scale=Math.max(.46,Math.min(1,usableW/visualW,usableH/visualH));
  book.style.setProperty('--fit-scale',scale.toFixed(3));
  if(pageFlipReady&&pageFlip){try{pageFlip.update()}catch(_){}}
}
function cancelFlip(commitTarget=true){
  if(!animating)return;
  clearTimeout(midpointTimer);
  if(commitTarget&&flipTarget!==null){renderSpread(flipTarget);curIndex=flipTarget}
  leaf.style.visibility='hidden';leaf.className='leaf';
  stage.classList.remove('is-turning');stage.removeAttribute('aria-busy');
  animating=false;flipTarget=null;pendingTarget=null;
}
function closeForExterior(id){cancelFlip();cancelScheduledPageFocus();cancelPendingProgrammaticFlip();clearPageFocus();isOpen=false;curIndex=null;selectedInteriorIndex=null;stage.classList.remove('is-open','uses-pageflip');stage.dataset.view=EXT[id];stage.classList.toggle('show-jacket',id==='sobrecapa');stage.classList.toggle('show-cinta',id==='cinta');requestAnimationFrame(fitBook)}
function openTo(target){
  cancelScheduledPageFocus();
  const targetSpread=spreadForContent(target);
  const wasUsingPageFlip=pageFlipReady&&stage.classList.contains('uses-pageflip');
  const sameVisibleSpread=wasUsingPageFlip&&visibleSpreadIndex===targetSpread;
  stage.classList.remove('show-jacket','show-cinta','is-open');stage.dataset.view='capa';
  if(pageFlipReady){
    stage.classList.add('uses-pageflip');isOpen=true;curIndex=target;selectedInteriorIndex=target;
    if(sameVisibleSpread){
      cancelPendingProgrammaticFlip();
      requestAnimationFrame(()=>{
        if(selectedInteriorIndex!==target)return;
        focusVisiblePage(target);
        fitBook();
      });
    }else{
      clearPageFocus();
      requestAnimationFrame(()=>{
        if(selectedInteriorIndex!==target)return;
        flipLibraryTo(target,true);
        schedulePageFocus(target);
        fitBook();
      });
    }
    return;
  }
  stage.classList.remove('uses-pageflip');
  if(!isOpen){cancelFlip(false);isOpen=true;renderSpread(target);curIndex=target;selectedInteriorIndex=target;requestAnimationFrame(()=>{stage.classList.add('is-open');fitBook()});return}
  if(target!==curIndex){selectedInteriorIndex=target;flipTo(target)}
}
function flipTo(target){
  if(animating){pendingTarget=target;return}
  if(target===curIndex)return;
  const from=curIndex,forward=target>from;
  animating=true;flipTarget=target;stage.classList.add('is-turning');stage.setAttribute('aria-busy','true');
  leaf.className='leaf';leaf.style.visibility='hidden';void leaf.offsetWidth;
  if(forward){
    leafFront.innerHTML=PAGES[ORDER[from]];
    leafBack.innerHTML=target>0?PAGES[ORDER[target-1]]:endpaper;
    leaf.classList.add('flip-fwd');
  }else{
    leafFront.innerHTML=PAGES[ORDER[target]];
    leafBack.innerHTML=from>0?PAGES[ORDER[from-1]]:endpaper;
    leaf.classList.add('flip-bwd');
  }
  leaf.style.visibility='visible';
  midpointTimer=setTimeout(()=>{leaf.classList.add(forward?'show-back':'show-front');renderSpread(target);curIndex=target},Math.round(FLIP_MS*.51));
}
leaf.addEventListener('animationend',event=>{
  if(event.animationName!=='flipFwd'&&event.animationName!=='flipBwd')return;
  clearTimeout(midpointTimer);
  if(flipTarget!==null){renderSpread(flipTarget);curIndex=flipTarget}
  leaf.style.visibility='hidden';leaf.className='leaf';
  stage.classList.remove('is-turning');stage.removeAttribute('aria-busy');
  animating=false;flipTarget=null;fitBook();
  if(pendingTarget!==null&&pendingTarget!==curIndex){const queued=pendingTarget;pendingTarget=null;flipTo(queued)}else{pendingTarget=null}
});
function select(id){setActive(id);setCaption(id);META[id].interior?openTo(ORDER.indexOf(id)):closeForExterior(id)}
if('ResizeObserver'in window)new ResizeObserver(fitBook).observe(bookViewport);
window.addEventListener('resize',fitBook,{passive:true});
buildPageFlip();select('capa');requestAnimationFrame(fitBook);
