/* Comunicação limitada à navegação; o livro não acessa o documento do editor. */
(function () {
  'use strict';
  function send(action) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ channel: 'escrevaral-academia', action: action }, '*');
    }
  }
  window.addEventListener('keydown', function (event) {
    if ((event.key === 'Escape' || event.keyCode === 27) && !event.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      if (event.stopImmediatePropagation) { event.stopImmediatePropagation(); }
      send('close');
    }
  }, true);
  function bindLinks(selector, handler) {
    var list = document.querySelectorAll(selector);
    var i;
    for (i = 0; i < list.length; i += 1) {
      (function (el) {
        el.addEventListener('click', function (event) {
          event.preventDefault();
          handler(el);
        }, false);
      }(list[i]));
    }
  }
  bindLinks('a[data-academia-back]', function () { send('back'); });
  bindLinks('a[data-academia-open]', function (el) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ channel: 'escrevaral-academia', action: 'open', id: el.getAttribute('data-academia-open') }, '*');
    }
  });
  bindLinks('a[data-academia-close]', function () { send('close'); });
}());
