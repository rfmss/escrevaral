/* Universo do caderno: ES5, dados locais e vínculos estáveis. */
(function (root) {
  'use strict';
  var E = root.Escr;
  function copy(v) { return JSON.parse(JSON.stringify(v)); }
  function arr(v) { return Object.prototype.toString.call(v) === '[object Array]'; }
  function id(v) { return typeof v === 'string' && /^[a-z0-9-]+$/.test(v); }
  function str(v, n) { return typeof v === 'string' && v.length <= n; }
  function ids(v) { return arr(v) && v.length <= 5000 && v.every(id) && v.every(function (x, i) { return v.indexOf(x) === i; }); }
  function empty() { return { version:1, characters:[], settings:[], scenes:[], chapters:[] }; }
  function valid(s) {
    if (!s || s.version !== 1 || !arr(s.characters) || !arr(s.settings) || !arr(s.scenes) || !arr(s.chapters)) { return false; }
    var seen = Object.create(null), characters = Object.create(null), settings = Object.create(null), chapters = Object.create(null);
    function unique(x) { if (!x || !id(x.id) || seen[x.id]) { return false; } seen[x.id] = true; return true; }
    function card(x) { return unique(x) && str(x.name,120) && !!x.name.replace(/\s/g,'') && str(x.description,4000); }
    if (s.characters.length > 5000 || s.settings.length > 5000 || s.scenes.length > 10000 || s.chapters.length > 10000) { return false; }
    if (!s.characters.every(function(x){if(!card(x)){return false;}characters[x.id]=true;return true;}) || !s.settings.every(function(x){if(!card(x)){return false;}settings[x.id]=true;return true;})) { return false; }
    function refs(x) { return ids(x.characters) && x.characters.every(function(k){return !!characters[k];}) && ids(x.settings) && x.settings.every(function(k){return !!settings[k];}); }
    return s.scenes.every(function(x){return unique(x) && str(x.title,120) && !!x.title.replace(/\s/g,'') && str(x.summary,4000) && str(x.when,120) && (x.chapter === '' || id(x.chapter)) && refs(x);}) && s.chapters.every(function(x){if(!x || !id(x.noteId) || chapters[x.noteId] || !refs(x)){return false;}chapters[x.noteId]=true;return true;});
  }
  function read(data) { var s = data.story; if (typeof s === 'undefined') { return empty(); } if (!valid(s)) { throw new Error('Não foi possível ler as fichas deste caderno. Os dados foram preservados.'); } return copy(s); }
  function remap(s, mapping) { var next=copy(s); next.chapters.forEach(function(x){x.noteId=mapping[x.noteId]||x.noteId;});next.scenes.forEach(function(x){x.chapter=mapping[x.chapter]||x.chapter;});return next; }
  function remove(s, kind, key) {
    var next=copy(s); next[kind]=next[kind].filter(function(x){return x.id!==key;});
    if(kind==='characters'||kind==='settings'){next.scenes.concat(next.chapters).forEach(function(x){x[kind]=x[kind].filter(function(k){return k!==key;});});}
    return next;
  }
  function members(s, noteId, kind) { var found=[];s.chapters.filter(function(x){return x.noteId===noteId;}).concat(s.scenes.filter(function(x){return x.chapter===noteId;})).forEach(function(x){x[kind].forEach(function(k){if(found.indexOf(k)<0){found.push(k);}});});return s[kind].filter(function(x){return found.indexOf(x.id)>=0;}); }
  E.story = { empty:empty, valid:valid, read:read, remap:remap, remove:remove, members:members };
}(typeof window !== 'undefined' ? window : this));
