(function (repositorio, sessao, plataforma, transferencia, mesa, coordenador) {
  'use strict';
  function start(win, doc) {
    var platform = plataforma.create(win);
    var repository = repositorio.create(platform.storage, platform.writerId);
    var session = sessao.create(repository, platform.now);
    var view = mesa.create(doc);
    var exporter = transferencia.create(win, doc);
    coordenador.start(session, repository, view, platform, exporter);
  }
  return { start: start };
})
