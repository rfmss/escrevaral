(function () {
  'use strict';
  function valid(record) {
    return !!record && record.schema === 1 && typeof record.title === 'string' &&
      typeof record.text === 'string' && typeof record.updated === 'number' &&
      isFinite(record.updated) && typeof record.revision === 'number' &&
      record.revision >= 0 && record.revision % 1 === 0;
  }
  function fresh() {
    return { schema: 1, title: '', text: '', revision: 0, updated: 0 };
  }
  function copy(record) {
    return { schema: 1, title: record.title, text: record.text,
      revision: record.revision, updated: record.updated };
  }
  return { valid: valid, fresh: fresh, copy: copy };
})
