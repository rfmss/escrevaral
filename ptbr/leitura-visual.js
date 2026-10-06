/* Leitura anotada. Apenas apresentação de findings; não executa motores nem edita texto. ES5. */
(function (root) {
  'use strict';
  var E = root.Escr, D = root.document, serial = 0;
  if (!E || !D) { return; }
  function el(tag, parent, cls, text) {
    var n = D.createElement(tag); n.className = cls || '';
    if (typeof text === 'string') { n.textContent = text; }
    if (parent) { parent.appendChild(n); } return n;
  }
  function valid(s, f) { return f && typeof f.start === 'number' && typeof f.end === 'number' && f.start >= 0 && f.end > f.start && f.end <= s.length && s.slice(f.start, f.end) === f.snippet; }
  function label(f) {
    var c = f.candidates && f.candidates.classes || [];
    if (f.analysisStatus === 'contextual') { return f.feature; }
    if (f.analysisStatus === 'desconhecido') { return 'sem leitura'; }
    if (f.analysisStatus === 'ambiguo') { return 'ambígua'; }
    if (f.analysisStatus === 'lexical') { return (c[0] || 'classe') + ' · léxico'; }
    return f.feature || 'observação';
  }
  function syntaxMap(parent, options) {
    var snapshot=options.snapshot, arr=options.findings.filter(function(f){return valid(snapshot,f)&&valid(snapshot,f.clause);});
    var uid='ptbr-reading-'+(++serial), dead=false, timer=null, active=null, buttons={}, groups={}, order=[];
    var box=el('div',parent,'ptbr-reading'), main=el('div',box,'ptbr-reading-paper');
    el('p',main,'ptbr-overline','RELAÇÕES DA ORAÇÃO');
    el('p',main,'ptbr-reading-help','Escolha um grupo ou núcleo. Os arcos mostram os vínculos desta hipótese; a frase original aparece abaixo.');
    var canvas=el('div',main,'ptbr-reading-canvas'), aside=el('aside',box,'ptbr-reading-aside');
    aside.id=uid;aside.setAttribute('aria-label','Explicação da relação selecionada');
    el('p',aside,'ptbr-overline','POR DENTRO DO TEXTO');
    var selected=el('p',aside,'ptbr-reading-selection'), links=el('p',aside,'ptbr-syntax-links'),details=el('div',aside,'ptbr-reading-details');
    selected.setAttribute('aria-live','polite');
    arr.forEach(function(f){var key='$'+f.clause.start;if(!groups[key]){groups[key]={items:[],clause:f.clause};order.push(key);}groups[key].items.push(f);});
    function button(f, target, cls) {
      var b=el('button',target,cls);b.type='button';b.setAttribute('aria-pressed','false');b.setAttribute('aria-controls',uid);
      b.setAttribute('data-syntax-node',f.nodeId);b.setAttribute('aria-label',f.feature+': '+f.snippet+'. Ver explicação.');
      el('span',b,'ptbr-word-tag',f.feature);el('span',b,'ptbr-word-text',f.snippet);
      if(f.components&&f.components.length){f.components.forEach(function(c){if(valid(snapshot,c)){el('span',b,'ptbr-syntax-head',c.role+': '+c.snippet);}});}
      else if(f.head&&f.head.snippet!==f.snippet){el('span',b,'ptbr-syntax-head','Núcleo: '+f.head.snippet);}
      b.addEventListener('click',function(){select(f);},false);buttons['$'+f.nodeId]={button:b,finding:f};
    }
    order.forEach(function(key,index){
      var g=groups[key],s=el('section',canvas,'ptbr-reading-fragment');
      el('p',s,'ptbr-fragment-number','CONSTRUÇÃO '+('0'+(index+1)).slice(-2));
      var scroll=el('div',s,'ptbr-word-scroll');scroll.setAttribute('tabindex','0');scroll.setAttribute('aria-label','Grupos da oração; role para ver todas as relações');
      g.row=el('div',scroll,'ptbr-syntax-row');
      if(D.createElementNS){g.svg=D.createElementNS('http://www.w3.org/2000/svg','svg');g.svg.setAttribute('class','ptbr-relation-arcs');g.svg.setAttribute('aria-hidden','true');g.row.appendChild(g.svg);}
      var left=el('div',g.row,'ptbr-syntax-subject'),right=el('div',g.row,'ptbr-syntax-predicate'),inside=el('div',null,'ptbr-syntax-parts');
      g.items.forEach(function(f){if(f.feature==='Sujeito'){button(f,left,'ptbr-syntax-term');}else if(f.feature==='Predicado'){button(f,right,'ptbr-syntax-whole');}});
      right.appendChild(inside);
      g.items.forEach(function(f){if(f.feature!=='Sujeito'&&f.feature!=='Predicado'){button(f,inside,'ptbr-syntax-term');}});
      el('p',s,'ptbr-fragment-original',g.clause.snippet);
    });
    if(!arr.length){el('p',main,'ptbr-reading-empty','Nenhuma construção recebeu uma leitura neste recorte. Isso indica o limite desta lente, não um erro no texto.');}
    function draw(){
      if(dead||!active||options.isCurrent&&!options.isCurrent()){return;}
      order.forEach(function(key){if(groups[key].svg){groups[key].svg.textContent='';}});
      var g=groups['$'+active.clause.start];if(!g||!g.svg||!g.row.getBoundingClientRect){return;}
      var row=g.row.getBoundingClientRect();if(!row.width){return;}
      g.svg.setAttribute('width',row.width);g.svg.setAttribute('height',66);g.svg.setAttribute('viewBox','0 0 '+row.width+' 66');
      var lane=0;
      (active.relations||[]).forEach(function(edge){
        if(edge.from!==active.nodeId&&edge.to!==active.nodeId){return;}
        var a=buttons['$'+edge.from],b=buttons['$'+edge.to];if(!a||!b||lane>=4){return;}
        var ar=a.button.getBoundingClientRect(),br=b.button.getBoundingClientRect(),x=ar.left-row.left+ar.width/2,x2=br.left-row.left+br.width/2;
        var p=D.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d','M '+x+' 60 Q '+((x+x2)/2)+' '+(4+lane*10)+' '+x2+' 60');
        p.setAttribute('fill','none');p.setAttribute('stroke','currentColor');p.setAttribute('stroke-width','1.5');p.setAttribute('stroke-dasharray','3 3');g.svg.appendChild(p);lane++;
      });
    }
    function select(f){
      if(dead||options.isCurrent&&!options.isCurrent()){return;}
      active=f;Object.keys(buttons).forEach(function(k){buttons[k].button.setAttribute('aria-pressed',buttons[k].finding===f?'true':'false');});
      selected.textContent=f.feature+' · “'+f.snippet+'”';
      var descriptions=[];(f.relations||[]).forEach(function(edge){
        var a=buttons['$'+edge.from],b=buttons['$'+edge.to];
        if(a&&b&&(edge.from===f.nodeId||edge.to===f.nodeId)){descriptions.push(edge.label+': “'+a.finding.snippet+'” ↔ “'+b.finding.snippet+'”');}
      });
      links.textContent=descriptions.join('. ');options.onSelect(f,details,true);resize();
    }
    function resize(){if(!dead){root.clearTimeout(timer);timer=root.setTimeout(draw,0);}}
    if(root.addEventListener){root.addEventListener('resize',resize,false);}
    if(D.fonts&&D.fonts.ready){D.fonts.ready.then(resize);}
    if(arr.length){select(arr[0]);}
    return{select:function(i){if(arr[i]){select(arr[i]);}},destroy:function(){dead=true;root.clearTimeout(timer);if(root.removeEventListener){root.removeEventListener('resize',resize,false);}}};
  }
  E.renderReadingMap = function (parent, options) {
    if(options.lens==='sintaxe'){return syntaxMap(parent,options);}
    var snapshot = options.snapshot, arr = options.findings.filter(function (f) { return valid(snapshot, f); }).slice(0, 100);
    /* Uma locução ocupa um cartão; leituras dos componentes seguem no achado.
     * Evita repetir as palavras no original reconstruído da anotação. */
    if(options.lens==='morfologia'){
      var compoundGroups=arr.filter(function(f){return !!f.locution;});
      arr=arr.filter(function(f){return f.locution||!compoundGroups.some(function(g){return f.start>=g.start&&f.end<=g.end;});});
    }
    var morph = options.lens === 'morfologia', active = -1, dead = false, timer = null;
    var uid = 'ptbr-reading-' + (++serial), buttons = [], rows = [], rowFor = [], diagrams = [];
    var box = el('div', parent, 'ptbr-reading'), main = el('div', box, 'ptbr-reading-paper');
    el('p', main, 'ptbr-overline', 'LEITURA ANOTADA');
    el('p', main, 'ptbr-reading-help', morph ? 'Toque em uma palavra ou locução para entender sua leitura. Os arcos mostram os apoios da hipótese selecionada.' : 'Escolha um trecho para ver a observação e seus limites.');
    var canvas = el('div', main, 'ptbr-reading-canvas');
    var aside = el('aside', box, 'ptbr-reading-aside'); aside.id = uid; aside.setAttribute('aria-label', 'Explicação da leitura selecionada');
    el('p', aside, 'ptbr-overline', 'POR DENTRO DO TEXTO');
    var selected = el('p', aside, 'ptbr-reading-selection'); selected.setAttribute('aria-live', 'polite');
    var details = el('div', aside, 'ptbr-reading-details');
    if (!arr.length) { el('p', main, 'ptbr-reading-empty', 'Nenhuma observação nova neste recorte. Isso não certifica ausência de problemas.'); }
    var row, sentence, previous = null, n = 0;
    arr.forEach(function (f, index) {
      var gap = previous ? snapshot.slice(previous.end, f.start) : '';
      if (!morph || !row || /[.!?;\r\n]/.test(gap) || n >= 12 || gap.length > 80) {
        var section = el('section', canvas, 'ptbr-reading-fragment');
        el('p', section, 'ptbr-fragment-number', 'TRECHO ' + ('0' + (rows.length + 1)).slice(-2));
        var scroll = el('div', section, 'ptbr-word-scroll'); scroll.setAttribute('tabindex', '0'); scroll.setAttribute('aria-label', 'Trecho anotado; role para ver todas as palavras');
        row = el('div', scroll, morph ? 'ptbr-word-row' : 'ptbr-excerpt-row'); rows.push(row); n = 0;
        if (morph && D.createElementNS) {
          var svg = D.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'ptbr-relation-arcs'); svg.setAttribute('aria-hidden', 'true'); row.appendChild(svg); diagrams.push(svg);
        } else { diagrams.push(null); }
        sentence = el('p', section, 'ptbr-fragment-original');
        sentence.textContent = f.snippet;
      } else { sentence.textContent += gap + f.snippet; }
      var b = el('button', row, morph ? 'ptbr-word' : 'ptbr-excerpt'); b.type = 'button';
      b.setAttribute('data-reading-index', index); b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-controls', uid);
      b.setAttribute('aria-label', f.snippet + ': ' + label(f) + '. Ver explicação.');
      b.setAttribute('data-reading-state', f.analysisStatus || 'observacao');
      var cls = f.analysisStatus === 'contextual' ? f.feature : (f.candidates && f.candidates.classes.length === 1 ? f.candidates.classes[0] : 'incerta');
      b.setAttribute('data-word-class', cls || 'incerta');
      el('span', b, 'ptbr-word-text', f.snippet);
      el('span', b, 'ptbr-word-tag', label(f));
      b.addEventListener('click', function () { select(index, true); }, false);
      buttons.push(b); rowFor.push(rows.length - 1); previous = f; n++;
    });
    function draw() {
      if (dead || active < 0) { return; }
      diagrams.forEach(function (svg) { if (svg) { svg.textContent = ''; } });
      var f = arr[active], ri = rowFor[active], svg = diagrams[ri], b = buttons[active], row = rows[ri];
      if (!svg || !b.getBoundingClientRect || f.analysisStatus !== 'contextual') { return; }
      var rb = row.getBoundingClientRect(), bb = b.getBoundingClientRect(), x = bb.left - rb.left + bb.width / 2;
      if (!rb.width) { return; }
      svg.setAttribute('width', rb.width); svg.setAttribute('height', 66); svg.setAttribute('viewBox', '0 0 ' + rb.width + ' 66');
      var lane = 0;
      (f.context || []).forEach(function (support) {
        if (!valid(snapshot, support) || lane >= 3) { return; }
        for (var j = 0; j < arr.length; j++) {
          if (j === active || rowFor[j] !== ri || arr[j].start !== support.start || arr[j].end !== support.end) { continue; }
          var r = buttons[j].getBoundingClientRect(), y = 60, x2 = r.left - rb.left + r.width / 2;
          var p = D.createElementNS('http://www.w3.org/2000/svg', 'path');
          p.setAttribute('d', 'M ' + x + ' ' + y + ' Q ' + ((x + x2) / 2) + ' ' + (4 + lane * 12) + ' ' + x2 + ' ' + y);
          p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '1.5'); p.setAttribute('stroke-dasharray', '3 3'); svg.appendChild(p);
          buttons[j].setAttribute('data-reading-support', 'true'); lane++; break;
        }
      });
    }
    function select(index, user) {
      if (dead || !arr[index] || options.isCurrent && !options.isCurrent()) { return; }
      active = index;
      buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === index ? 'true' : 'false'); b.setAttribute('data-reading-support', 'false'); });
      selected.textContent = '“' + arr[index].snippet + '” · ' + label(arr[index]);
      options.onSelect(arr[index], details, user);
      root.clearTimeout(timer); timer = root.setTimeout(draw, 0);
    }
    function resize() { if (!dead) { root.clearTimeout(timer); timer = root.setTimeout(draw, 0); } }
    if (root.addEventListener) { root.addEventListener('resize', resize, false); }
    if (D.fonts && D.fonts.ready) { D.fonts.ready.then(resize); }
    var first = 0;
    for (var i = 0; i < arr.length; i++) { if (arr[i].analysisStatus === 'contextual') { first = i; break; } }
    if (arr.length) { select(first, false); }
    return { select: select, destroy: function () { dead = true; root.clearTimeout(timer); if (root.removeEventListener) { root.removeEventListener('resize', resize, false); } } };
  };
}(typeof window !== 'undefined' ? window : this));
