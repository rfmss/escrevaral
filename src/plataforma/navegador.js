(function () {
  'use strict';
  function create(win) {
    var storage = null;
    try { storage = win.localStorage; } catch (error) { storage = null; }
    return {
      storage: storage,
      now: function () { return new Date().getTime(); },
      writerId: new Date().getTime().toString(36) + '-' + Math.random().toString(36).slice(2),
      later: function (callback, delay) { return win.setTimeout(callback, delay); },
      clear: function (id) { win.clearTimeout(id); },
      confirm: function (message) { return win.confirm(message); },
      listen: function (name, callback) { win.addEventListener(name, callback, false); }
    };
  }
  return { create: create };
})
