(function () {
  'use strict';
  function create(win, doc) {
    function download(record) {
      var urlApi = win.URL || win.webkitURL, url, link, blob;
      if (!win.Blob || !urlApi || !urlApi.createObjectURL) { return false; }
      link = doc.createElement('a');
      if (!('download' in link)) { return false; }
      try {
        blob = new win.Blob([record.text], { type: 'text/plain;charset=utf-8' });
        url = urlApi.createObjectURL(blob);
        link.href = url;
        link.download = (record.title || 'escrevaral').replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').slice(0, 80) + '.txt';
        link.style.display = 'none';
        doc.body.appendChild(link); link.click(); doc.body.removeChild(link);
        win.setTimeout(function () { urlApi.revokeObjectURL(url); }, 60000);
        return true;
      } catch (error) {
        if (link.parentNode) { link.parentNode.removeChild(link); }
        if (url) { urlApi.revokeObjectURL(url); }
        return false;
      }
    }
    return { download: download };
  }
  return { create: create };
})
