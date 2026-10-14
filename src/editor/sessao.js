(function (documento) {
  'use strict';
  function create(repository, now) {
    var opened = repository.read(), draft = documento.copy(opened.record);
    var expected = opened.raw, dirty = false, composing = false, conflict = false;
    function change(title, text) {
      if (draft.title === title && draft.text === text) { return false; }
      draft.title = title; draft.text = text; dirty = true;
      return true;
    }
    function save() {
      var record, result;
      if (composing) { return { ok: false, reason: 'composing' }; }
      if (opened.problem === 'unreadable') { return { ok: false, reason: 'unreadable' }; }
      if (!dirty) { return { ok: true, unchanged: true }; }
      record = documento.copy(draft);
      record.revision += 1; record.updated = now();
      result = repository.save(record, expected);
      if (result.ok) { draft = record; expected = result.raw; dirty = false; conflict = false; }
      else if (result.reason === 'conflict') { conflict = true; }
      return result;
    }
    function restore(record) {
      var latest;
      if (!documento.valid(record)) { return false; }
      latest = repository.read();
      if (latest.problem === 'unavailable') { return false; }
      expected = latest.raw; opened = latest;
      draft = documento.copy(record); draft.revision = latest.record.revision;
      dirty = true; conflict = false;
      return true;
    }
    return {
      change: change, save: save, restore: restore,
      snapshot: function () { return documento.copy(draft); },
      dirty: function () { return dirty; },
      problem: function () { return opened.problem; },
      conflict: function () { return conflict; },
      compose: function (value) { composing = value; },
      externalChange: function () { conflict = true; }
    };
  }
  return { create: create };
})
