/* Interface editorial do Guia "Usos da Língua" (Dicionário de Dificuldades PT-BR) — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn, false); } }
  function mk(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (typeof txt === 'string') { n.textContent = txt; }
    return n;
  }

  root.Escr.mountUsosLingua = function (opts) {
    var data = root.Escr.dificuldades;
    var container = byId((opts && opts.containerId) || 'usos-lingua-body');
    var activeCat = '';
    var query = '';
    var expandedId = '';
    var manifestoOpen = true;

    function render() {
      if (!container || !data) { return; }
      container.textContent = '';

      /* Manifesto acolhedor recolhível */
      var manBox = mk('div', 'esc-usos-manifesto');
      var manHead = mk('div', 'esc-usos-manifesto-head');
      manHead.appendChild(mk('strong', '', 'Não existe “erro” — existe adequação de uso'));
      var manBtn = mk('button', 'esc-usos-quiet', manifestoOpen ? 'Recolher' : 'Ler manifesto');
      manBtn.type = 'button';
      on(manBtn, 'click', function () { manifestoOpen = !manifestoOpen; render(); });
      manHead.appendChild(manBtn);
      manBox.appendChild(manHead);
      if (manifestoOpen) {
        manBox.appendChild(mk('p', '', data.manifesto));
      }
      container.appendChild(manBox);

      /* Busca instantânea */
      var searchWrap = mk('div', 'esc-usos-search-wrap');
      var inp = mk('input', 'esc-usos-search');
      inp.type = 'search';
      inp.placeholder = 'Busque sua dúvida: mal ou mau, crase, assistir, vírgula, porquês…';
      inp.value = query;
      inp.setAttribute('aria-label', 'Buscar dúvida de uso da língua portuguesa');
      on(inp, 'input', function () {
        query = inp.value;
        renderResults();
      });
      searchWrap.appendChild(inp);
      container.appendChild(searchWrap);

      /* Categorias */
      var catsBar = mk('div', 'esc-usos-cats');
      catsBar.setAttribute('role', 'group');
      catsBar.setAttribute('aria-label', 'Categorias de usos da língua');
      var allBtn = mk('button', 'esc-usos-cat', 'Todas (' + data.list().length + ')');
      allBtn.type = 'button';
      allBtn.setAttribute('aria-pressed', !activeCat ? 'true' : 'false');
      on(allBtn, 'click', function () { activeCat = ''; render(); });
      catsBar.appendChild(allBtn);

      data.categories.forEach(function (cat) {
        var b = mk('button', 'esc-usos-cat', cat.label);
        b.type = 'button';
        b.setAttribute('aria-pressed', activeCat === cat.id ? 'true' : 'false');
        on(b, 'click', function () { activeCat = activeCat === cat.id ? '' : cat.id; render(); });
        catsBar.appendChild(b);
      });
      container.appendChild(catsBar);

      var listWrap = mk('div', 'esc-usos-list');
      listWrap.id = 'esc-usos-results';
      container.appendChild(listWrap);

      var foot = mk('p', 'esc-usos-foot', 'Seleção curada de ' + data.list().length + ' pontos frequentes do português brasileiro · consulta 100% offline.');
      container.appendChild(foot);

      renderResults();
    }

    function renderResults() {
      var listWrap = byId('esc-usos-results');
      if (!listWrap || !data) { return; }
      listWrap.textContent = '';
      var items = data.search(query, activeCat);
      if (!items.length) {
        listWrap.appendChild(mk('p', 'esc-usos-empty', 'Nenhum verbete encontrado para “' + query + '”. Tente buscar por uma palavra-chave simples (ex.: crase, onde, haver, vírgula).'));
        return;
      }
      var cap = query ? items.length : Math.min(items.length, 40);
      if (expandedId) {
        items.sort(function (a, b) {
          if (a.id === expandedId) { return -1; }
          if (b.id === expandedId) { return 1; }
          return 0;
        });
      }
      var i;
      for (i = 0; i < cap; i += 1) {
        (function (item) {
          var isOpen = expandedId === item.id || (items.length === 1);
          var card = mk('article', 'esc-usos-card' + (isOpen ? ' is-open' : ''));
          var headBtn = mk('button', 'esc-usos-card-head');
          headBtn.type = 'button';
          headBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          var titleWrap = mk('span', 'esc-usos-card-titles');
          titleWrap.appendChild(mk('strong', '', item.titulo));
          titleWrap.appendChild(mk('small', '', item.categoriaLabel));
          headBtn.appendChild(titleWrap);
          headBtn.appendChild(mk('span', 'esc-usos-chev', isOpen ? '▴' : '▾'));
          on(headBtn, 'click', function () {
            expandedId = (expandedId === item.id) ? '' : item.id;
            renderResults();
          });
          card.appendChild(headBtn);

          if (isOpen) {
            var body = mk('div', 'esc-usos-card-body');
            var b1 = mk('div', 'esc-usos-block');
            b1.appendChild(mk('span', 'esc-usos-lbl', 'Na fala cotidiana'));
            b1.appendChild(mk('p', '', item.fala));
            body.appendChild(b1);

            var b2 = mk('div', 'esc-usos-block');
            b2.appendChild(mk('span', 'esc-usos-lbl', 'Na escrita formal'));
            b2.appendChild(mk('p', '', item.formal));
            body.appendChild(b2);

            var b3 = mk('div', 'esc-usos-block is-why');
            b3.appendChild(mk('span', 'esc-usos-lbl', 'Por que muda (teste rápido)'));
            b3.appendChild(mk('p', '', item.porque));
            body.appendChild(b3);

            var b4 = mk('div', 'esc-usos-examples');
            b4.appendChild(mk('span', 'esc-usos-lbl', 'Exemplo vivo'));
            b4.appendChild(mk('p', 'esc-usos-ex-fala', 'Diálogo / fala: ' + item.exemploFala));
            b4.appendChild(mk('p', 'esc-usos-ex-formal', 'Texto formal: ' + item.exemploFormal));
            body.appendChild(b4);

            card.appendChild(body);
          }
          listWrap.appendChild(card);
        }(items[i]));
      }
      if (!query && items.length > cap) {
        var moreP = mk('p', 'esc-usos-more-note', 'Mostrando ' + cap + ' de ' + items.length + ' verbetes. Use a busca acima ou filtre por categoria para ver qualquer tema.');
        listWrap.appendChild(moreP);
      }
    }

    function openWith(idOrQuery) {
      if (!data) { return; }
      var byIdHit = idOrQuery ? data.byId(idOrQuery) : null;
      if (byIdHit) {
        activeCat = '';
        query = '';
        expandedId = byIdHit.id;
      } else if (idOrQuery) {
        var direct = data.lookupWord(idOrQuery);
        activeCat = '';
        query = direct ? '' : String(idOrQuery);
        expandedId = direct ? direct.id : '';
      }
      render();
      if (opts && typeof opts.onOpenSheet === 'function') {
        opts.onOpenSheet();
      }
    }

    return {
      render: render,
      openWith: openWith
    };
  };
}(typeof window !== 'undefined' ? window : this));
