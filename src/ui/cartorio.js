/* Interface do Cartório do Escrevaral: selo ao vivo da mesa e verificação de arquivos .scrvrl. ES5. */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  var E = root.Escr;

  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }
  function mk(tag, cls, txt) {
    var el = document.createElement(tag);
    if (cls) { el.className = cls; }
    if (typeof txt !== 'undefined' && txt !== null) { el.textContent = String(txt); }
    return el;
  }
  function fmtDate(iso) {
    if (!iso) { return '—'; }
    try { return new Date(iso).toLocaleString('pt-BR'); }
    catch (e) { return iso; }
  }
  function fmtNum(n) {
    try { return Number(n || 0).toLocaleString('pt-BR'); }
    catch (e) { return String(n || 0); }
  }
  function shortHash(h) {
    if (!h || h.length < 16) { return h || '—'; }
    return h.slice(0, 12) + '…' + h.slice(-12);
  }
  function copyText(text, onDone) {
    var done = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { onDone(true); }, function () { fallbackCopy(text, onDone); });
        done = true;
      }
    } catch (ignore) {}
    if (!done) { fallbackCopy(text, onDone); }
  }
  function fallbackCopy(text, onDone) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand && document.execCommand('copy');
      document.body.removeChild(ta);
      onDone(!!ok);
    } catch (e) { onDone(false); }
  }

  function statusTone(status) {
    if (status === 'verified_clean' || status === 'integro_sem_colagem') { return 'clean'; }
    if (status === 'tampered' || status === 'adulterado') { return 'danger'; }
    if (status === 'verified_with_paste' || status === 'verified_imported' || status === 'integro_com_ressalvas') { return 'warn'; }
    return 'neutral';
  }

  E.mountCartorio = function (opts) {
    opts = opts || {};
    var overlay = null, activeTab = 'desk', lastReport = null, lastFileName = '';
    var deskBody = null, verifyBody = null, tabDeskBtn = null, tabVerifyBtn = null, statusBanner = null;
    var dropZone = null, fileInput = null, pasteBox = null, pasteToggleBtn = null, pasteWrap = null;
    var verifyOutput = null;

    function announce(msg) {
      if (statusBanner) { statusBanner.textContent = msg || ''; }
    }

    function openPrintWindow(report, fileName) {
      var textCert = E.cartorio.formatCertificateText(report, fileName);
      var win = null;
      try { win = root.open('', '_blank', 'width=860,height=920'); } catch (ignore) {}
      if (!win) {
        if (opts.download) {
          opts.download(textCert, 'text/plain', 'certificado-cartorio-escrevaral.txt');
          announce('Certificado baixado como texto (.txt).');
        }
        return;
      }
      var doc = win.document;
      doc.open();
      doc.write(
        '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
        '<title>Certificado do Cartório — Escrevaral</title>' +
        '<style>' +
        'body{font-family:Georgia,"Times New Roman",serif;background:#f8f5ef;color:#1e2320;margin:0;padding:36px 24px;}' +
        '.sheet{max-width:760px;margin:0 auto;background:#fffdf9;border:1px solid #c9c2b2;padding:38px 44px;box-shadow:0 6px 24px rgba(0,0,0,.06);}' +
        '.masthead{border-top:3px double #1e2320;border-bottom:1px solid #1e2320;padding:10px 0;margin-bottom:22px;display:flex;justify-content:space-between;font:600 11px/1.3 Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase;}' +
        'h1{margin:0 0 6px;font:700 24px/1.2 Georgia,serif;}' +
        '.sub{margin:0 0 20px;color:#4a544c;font-size:14px;}' +
        'pre{white-space:pre-wrap;word-break:break-word;font:12.5px/1.65 "Courier New",Courier,monospace;background:#f7f4ec;border:1px solid #dcd5c5;padding:18px;border-radius:3px;}' +
        '.actions{margin-top:18px;text-align:right;}' +
        '.actions button{padding:8px 16px;font:600 13px Arial,sans-serif;cursor:pointer;background:#1e2320;color:#f8f5ef;border:0;border-radius:3px;}' +
        '@media print{body{background:#fff;padding:0;}.sheet{border:0;box-shadow:none;padding:0;}.actions{display:none;}}' +
        '</style></head><body><div class="sheet">' +
        '<div class="masthead"><span>CARTÓRIO DO ESCREVARAL</span><span>CERTIFICADO DE ORIGEM E PROCESSO</span></div>' +
        '<h1>Certificado de Verificação</h1>' +
        '<p class="sub">Emitido offline pela oficina Escrevaral — conferência criptográfica SHA-256.</p>' +
        '<pre id="cert-pre"></pre>' +
        '<div class="actions"><button type="button" onclick="window.print()">Imprimir / Salvar em PDF</button></div>' +
        '</div></body></html>'
      );
      doc.close();
      var pre = doc.getElementById('cert-pre');
      if (pre) { pre.textContent = textCert; }
    }

    function renderReportCard(container, report, fileName, isLiveDesk) {
      container.textContent = '';
      var tone = statusTone(report.verdict);

      var cert = mk('article', 'cart-cert cart-tone-' + tone);
      if (E.ornaments && E.ornaments.attachCorners) {
        E.ornaments.attachCorners(cert, 'subtle');
      }
      var mast = mk('div', 'cart-cert-mast');
      mast.appendChild(mk('span', '', 'CARTÓRIO DO ESCREVARAL'));
      mast.appendChild(mk('span', '', isLiveDesk ? 'AUDITORIA AO VIVO DA MESA' : 'CONFERÊNCIA DE ARQUIVO'));
      cert.appendChild(mast);

      var badgeRow = mk('div', 'cart-verdict-row');
      var stamp = mk('span', 'cart-stamp cart-stamp-' + tone,
        tone === 'clean' ? 'SELO ÍNTEGRO' :
        tone === 'danger' ? 'ADULTERADO' :
        tone === 'warn' ? 'ÍNTEGRO · COM RESSALVAS' : 'SEM SELO'
      );
      badgeRow.appendChild(stamp);
      if (fileName) {
        badgeRow.appendChild(mk('span', 'cart-file-chip', fileName));
      }
      cert.appendChild(badgeRow);

      cert.appendChild(mk('h3', 'cart-verdict-title', report.verdictTitle));
      cert.appendChild(mk('p', 'cart-verdict-summary', report.verdictSummary));
      if (E.ornaments && E.ornaments.createStairRod) {
        cert.appendChild(E.ornaments.createStairRod('compact'));
      }

      /* Grade de métricas principais */
      var metrics = mk('div', 'cart-metrics');
      var items = [
        { k: 'Folhas verificadas', v: fmtNum(report.totals.documents) },
        { k: 'Palavras', v: fmtNum(report.totals.words) },
        { k: 'Revisões encadeadas', v: fmtNum(report.totals.revisions) },
        { k: 'Toques registrados', v: fmtNum(report.totals.keystrokes) },
        { k: 'Colagens externas', v: fmtNum(report.totals.externalPastes) + (report.totals.externalPasteChars ? ' (' + fmtNum(report.totals.externalPasteChars) + ' car.)' : '') },
        { k: 'Colagens bloqueadas', v: fmtNum(report.totals.blockedPastes) }
      ];
      var i;
      for (i = 0; i < items.length; i += 1) {
        var box = mk('div', 'cart-metric');
        box.appendChild(mk('span', 'cart-metric-k', items[i].k));
        box.appendChild(mk('strong', 'cart-metric-v', items[i].v));
        metrics.appendChild(box);
      }
      cert.appendChild(metrics);

      /* Bloco SHA-256 */
      var hashBox = mk('div', 'cart-hash-box');
      var hashTop = mk('div', 'cart-hash-top');
      hashTop.appendChild(mk('span', 'cart-hash-label', isLiveDesk ? 'IMPRESSÃO DIGITAL DA MESA (SHA-256)' : 'IMPRESSÃO DIGITAL DO PACOTE (SHA-256)'));
      var copyBtn = mk('button', 'cart-mini-btn', 'Copiar SHA-256');
      copyBtn.type = 'button';
      on(copyBtn, 'click', function () {
        copyText(report.packageHash, function (ok) {
          announce(ok ? 'Código SHA-256 copiado para a área de transferência.' : 'Selecione o código SHA-256 para copiar.');
        });
      });
      hashTop.appendChild(copyBtn);
      hashBox.appendChild(hashTop);
      hashBox.appendChild(mk('code', 'cart-hash-code', report.packageHash));
      cert.appendChild(hashBox);

      /* Ações do certificado */
      var actions = mk('div', 'cart-actions');
      if (isLiveDesk && opts.onExportSealed) {
        var expBtn = mk('button', 'cart-btn-primary', 'Exportar mesa selada (.scrvrl)');
        expBtn.type = 'button';
        on(expBtn, 'click', function () {
          opts.onExportSealed();
          announce('Mesa selada exportada (.scrvrl). Ela já pode ser conferida na aba “Verificar arquivo” ou enviada a um editor.');
        });
        actions.appendChild(expBtn);
      }
      var printBtn = mk('button', 'cart-btn-secondary', 'Imprimir / Guardar certificado');
      printBtn.type = 'button';
      on(printBtn, 'click', function () { openPrintWindow(report, fileName); });
      actions.appendChild(printBtn);

      var copyCertBtn = mk('button', 'cart-btn-secondary', 'Copiar relatório em texto');
      copyCertBtn.type = 'button';
      on(copyCertBtn, 'click', function () {
        copyText(E.cartorio.formatCertificateText(report, fileName), function (ok) {
          announce(ok ? 'Relatório completo do Cartório copiado.' : 'Não foi possível copiar automaticamente.');
        });
      });
      actions.appendChild(copyCertBtn);
      cert.appendChild(actions);

      /* Livro de folhas */
      if (report.documents.length) {
        var ledgerHead = mk('h4', 'cart-section-h', 'Livro de folhas verificadas (' + report.documents.length + ')');
        cert.appendChild(ledgerHead);

        var list = mk('div', 'cart-doc-list');
        for (i = 0; i < report.documents.length; i += 1) {
          (function (d) {
            var dTone = statusTone(d.status);
            var row = mk('div', 'cart-doc-row cart-doc-' + dTone);

            var top = mk('div', 'cart-doc-top');
            var titleWrap = mk('div', 'cart-doc-title-wrap');
            titleWrap.appendChild(mk('strong', 'cart-doc-title', d.title));
            titleWrap.appendChild(mk('span', 'cart-doc-project', d.project));
            top.appendChild(titleWrap);
            top.appendChild(mk('span', 'cart-doc-badge cart-stamp-' + dTone, d.label));
            row.appendChild(top);

            row.appendChild(mk('p', 'cart-doc-detail', d.detail));

            var stats = mk('div', 'cart-doc-stats');
            stats.appendChild(mk('span', '', fmtNum(d.words) + ' palavras'));
            stats.appendChild(mk('span', '', fmtNum(d.chainLength || d.revision) + ' revisões'));
            stats.appendChild(mk('span', '', fmtNum(d.keystrokes) + ' toques'));
            stats.appendChild(mk('span', '', 'Colagens externas: ' + fmtNum(d.externalPastes)));
            stats.appendChild(mk('span', '', 'Texto SHA-256: ' + shortHash(d.contentHash)));
            row.appendChild(stats);

            if (d.trail && d.trail.length) {
              var details = mk('details', 'cart-trail-details');
              details.appendChild(mk('summary', '', 'Ver trilha criptográfica (' + d.trail.length + ' elo' + (d.trail.length === 1 ? '' : 's') + ')'));
              var ol = mk('ol', 'cart-trail-list');
              var tIdx, item, li;
              var startIdx = Math.max(0, d.trail.length - 12);
              for (tIdx = startIdx; tIdx < d.trail.length; tIdx += 1) {
                item = d.trail[tIdx];
                li = mk('li', '');
                li.appendChild(mk('strong', '', 'Rev. ' + item.rev));
                li.appendChild(mk('span', '', ' · ' + fmtDate(item.at) + ' · ' + fmtNum(item.words) + ' pal. · ' + fmtNum(item.keys) + ' toques · ext: ' + fmtNum(item.extPastes) + ' · '));
                li.appendChild(mk('code', '', shortHash(item.hash)));
                ol.appendChild(li);
              }
              details.appendChild(ol);
              row.appendChild(details);
            }

            list.appendChild(row);
          }(report.documents[i]));
        }
        cert.appendChild(list);
      }

      /* Nota de transparência jurídica (Camada 1 + Camada 2) */
      var legal = mk('footer', 'cart-transparency');
      legal.appendChild(mk('strong', '', 'Transparência e escopo da verificação'));
      legal.appendChild(mk('p', '',
        'Camada 1 (100% offline): a cadeia SHA-256 comprova a integridade do arquivo exportado e a trilha de criação registrada dentro do Escrevaral, distinguindo escrita nativa, colagens externas e importações.'
      ));
      legal.appendChild(mk('p', '',
        'Camada 2 (anterioridade jurídica externa): as datas provêm do relógio do aparelho. Quando uma editora ou registro jurídico exigir prova independente de data, utilize o código SHA-256 acima para ancoragem externa (Biblioteca Nacional, carimbo de tempo ou protocolo editorial).'
      ));
      cert.appendChild(legal);

      container.appendChild(cert);
    }

    function refreshDeskTab() {
      if (!deskBody) { return; }
      deskBody.textContent = '';

      /* Cartão rápido de proteção da oficina (modo colagem restrita) */
      var guardBar = mk('div', 'cart-guard-bar');
      var guardText = mk('div', 'cart-guard-text');
      guardText.appendChild(mk('strong', '', 'Modo colagem restrita na oficina'));
      guardText.appendChild(mk('span', '', 'Quando ligado, impede colagens de fora do Escrevaral para manter o manuscrito 100% digitado na oficina.'));
      guardBar.appendChild(guardText);

      var restrictedOn = opts.isRestrictedPaste ? !!opts.isRestrictedPaste() : false;
      var guardBtn = mk('button', 'cart-guard-toggle', restrictedOn ? 'Restrição ativa · ON' : 'Permitindo colagem · OFF');
      guardBtn.type = 'button';
      guardBtn.setAttribute('aria-pressed', restrictedOn ? 'true' : 'false');
      on(guardBtn, 'click', function () {
        if (opts.onToggleRestrictedPaste) {
          var next = !!opts.onToggleRestrictedPaste();
          guardBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
          guardBtn.textContent = next ? 'Restrição ativa · ON' : 'Permitindo colagem · OFF';
          announce(next ? 'Colagem externa bloqueada. Tudo que você escrever agora fica sob regime puro do Cartório.' : 'Colagem externa permitida (continuará sendo registrada com transparência no Cartório).');
        }
      });
      guardBar.appendChild(guardBtn);
      deskBody.appendChild(guardBar);

      /* Gera pacote selado em memória (sem modificar nada) e verifica */
      var reportHost = mk('div', 'cart-report-host');
      deskBody.appendChild(reportHost);
      try {
        if (opts.checkpoint) { opts.checkpoint(); }
        var pack = opts.buildCurrentPackage ? opts.buildCurrentPackage() : null;
        if (!pack) {
          reportHost.appendChild(mk('p', 'cart-empty', 'Escreva e salve uma folha para gerar o primeiro selo criptográfico do Cartório.'));
          return;
        }
        var report = E.cartorio.verifyPackage(pack);
        lastReport = report;
        lastFileName = 'Mesa atual do Escrevaral';
        renderReportCard(reportHost, report, lastFileName, true);
      } catch (e) {
        reportHost.appendChild(mk('p', 'cart-error', e && e.message ? e.message : 'Não foi possível auditar a mesa atual.'));
      }
    }

    function runFileVerification(rawText, fileName) {
      if (!verifyOutput) { return; }
      verifyOutput.textContent = '';
      try {
        var report = E.cartorio.verifyPackage(rawText);
        lastReport = report;
        lastFileName = fileName || 'Arquivo enviado';
        renderReportCard(verifyOutput, report, lastFileName, false);
        announce('Verificação concluída: ' + report.verdictTitle + '.');
      } catch (e) {
        verifyOutput.appendChild(mk('p', 'cart-error', e && e.message ? e.message : 'Não foi possível verificar este arquivo.'));
        announce('O arquivo não pôde ser verificado.');
      }
    }

    function handleFile(file) {
      if (!file) { return; }
      if (file.size > 50000000) {
        announce('Envie arquivos de até 50 MB.');
        return;
      }
      E.transfer.read(file, function (err, content) {
        if (err) {
          announce(err.message || 'Erro ao ler o arquivo.');
          return;
        }
        runFileVerification(content, file.name);
      });
    }

    function setTab(name) {
      activeTab = name;
      if (tabDeskBtn) { tabDeskBtn.setAttribute('aria-pressed', name === 'desk' ? 'true' : 'false'); }
      if (tabVerifyBtn) { tabVerifyBtn.setAttribute('aria-pressed', name === 'verify' ? 'true' : 'false'); }
      if (deskBody) { deskBody.hidden = name !== 'desk'; }
      if (verifyBody) { verifyBody.hidden = name !== 'verify'; }
      announce('');
      if (name === 'desk') { refreshDeskTab(); }
    }

    function buildOverlay() {
      if (overlay) { return overlay; }
      overlay = mk('div', 'esc-cartorio-overlay');
      overlay.id = 'esc-cartorio-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'cart-heading');
      overlay.hidden = true;

      var card = mk('div', 'esc-cartorio-card');

      var head = mk('header', 'cart-head');
      var headText = mk('div', '');
      headText.appendChild(mk('small', 'cart-eyebrow', 'ESCREVARAL · PROVA DE ORIGEM E PROCESSO'));
      var h2 = mk('h2', '', 'Cartório');
      h2.id = 'cart-heading';
      headText.appendChild(h2);
      head.appendChild(headText);

      var closeBtn = mk('button', 'cart-close', '← Voltar à escrita');
      closeBtn.type = 'button';
      closeBtn.id = 'cartorio-close';
      on(closeBtn, 'click', close);
      head.appendChild(closeBtn);
      card.appendChild(head);

      var nav = mk('nav', 'cart-tabs');
      nav.setAttribute('aria-label', 'Modos do Cartório');
      tabDeskBtn = mk('button', 'cart-tab', 'Esta mesa (selo ao vivo)');
      tabDeskBtn.type = 'button';
      tabDeskBtn.id = 'cartorio-tab-desk';
      tabDeskBtn.setAttribute('aria-pressed', 'true');
      on(tabDeskBtn, 'click', function () { setTab('desk'); });

      tabVerifyBtn = mk('button', 'cart-tab', 'Verificar arquivo (.scrvrl)');
      tabVerifyBtn.type = 'button';
      tabVerifyBtn.id = 'cartorio-tab-verify';
      tabVerifyBtn.setAttribute('aria-pressed', 'false');
      on(tabVerifyBtn, 'click', function () { setTab('verify'); });

      nav.appendChild(tabDeskBtn);
      nav.appendChild(tabVerifyBtn);
      card.appendChild(nav);

      statusBanner = mk('p', 'cart-status', '');
      statusBanner.id = 'cartorio-status';
      statusBanner.setAttribute('role', 'status');
      statusBanner.setAttribute('aria-live', 'polite');
      card.appendChild(statusBanner);

      var scroll = mk('div', 'cart-scroll');

      deskBody = mk('section', 'cart-pane');
      deskBody.id = 'cartorio-desk-pane';
      scroll.appendChild(deskBody);

      verifyBody = mk('section', 'cart-pane');
      verifyBody.id = 'cartorio-verify-pane';
      verifyBody.hidden = true;

      /* Drop-zone para despejar arquivo .scrvrl */
      dropZone = mk('div', 'cart-dropzone');
      dropZone.id = 'cartorio-dropzone';
      dropZone.appendChild(mk('strong', 'cart-drop-title', 'Despeje uma mesa exportada (.scrvrl) para verificar'));
      dropZone.appendChild(mk('p', 'cart-drop-sub', 'Leitura somente de conferência: seus textos atuais não são alterados nem misturados. Ideal para escritores e editores conferirem origem e integridade.'));

      var dropBtns = mk('div', 'cart-drop-actions');
      var fileLabel = mk('label', 'cart-btn-primary cart-file-btn', 'Escolher arquivo .scrvrl');
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'cartorio-file-input';
      fileInput.accept = '.scrvrl,.json,application/json';
      on(fileInput, 'change', function () {
        if (fileInput.files && fileInput.files[0]) {
          handleFile(fileInput.files[0]);
          fileInput.value = '';
        }
      });
      fileLabel.appendChild(fileInput);
      dropBtns.appendChild(fileLabel);

      pasteToggleBtn = mk('button', 'cart-btn-secondary', 'Ou colar conteúdo JSON');
      pasteToggleBtn.type = 'button';
      on(pasteToggleBtn, 'click', function () {
        pasteWrap.hidden = !pasteWrap.hidden;
        if (!pasteWrap.hidden) { pasteBox.focus(); }
      });
      dropBtns.appendChild(pasteToggleBtn);
      dropZone.appendChild(dropBtns);

      on(dropZone, 'dragover', function (ev) {
        ev.preventDefault();
        dropZone.classList.add('is-dragover');
      });
      on(dropZone, 'dragleave', function () {
        dropZone.classList.remove('is-dragover');
      });
      on(dropZone, 'drop', function (ev) {
        ev.preventDefault();
        dropZone.classList.remove('is-dragover');
        if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]) {
          handleFile(ev.dataTransfer.files[0]);
        }
      });

      verifyBody.appendChild(dropZone);

      pasteWrap = mk('div', 'cart-paste-wrap');
      pasteWrap.hidden = true;
      pasteBox = document.createElement('textarea');
      pasteBox.id = 'cartorio-paste-input';
      pasteBox.rows = 5;
      pasteBox.placeholder = 'Cole aqui o conteúdo completo de um arquivo .scrvrl…';
      pasteBox.spellcheck = false;
      pasteWrap.appendChild(pasteBox);
      var runPasteBtn = mk('button', 'cart-btn-primary', 'Conferir conteúdo colado');
      runPasteBtn.type = 'button';
      runPasteBtn.id = 'cartorio-paste-run';
      on(runPasteBtn, 'click', function () {
        runFileVerification(pasteBox.value || '', 'Conteúdo colado');
      });
      pasteWrap.appendChild(runPasteBtn);
      verifyBody.appendChild(pasteWrap);

      verifyOutput = mk('div', 'cart-verify-output');
      verifyOutput.id = 'cartorio-verify-output';
      verifyBody.appendChild(verifyOutput);

      scroll.appendChild(verifyBody);
      card.appendChild(scroll);
      overlay.appendChild(card);

      on(overlay, 'click', function (ev) {
        if (ev.target === overlay) { close(); }
      });
      on(document, 'keydown', function (ev) {
        if (ev.keyCode === 27 && overlay && !overlay.hidden) {
          ev.preventDefault();
          close();
        }
      });

      document.body.appendChild(overlay);
      return overlay;
    }

    function open(initialTab) {
      buildOverlay();
      overlay.hidden = false;
      setTab(initialTab === 'verify' ? 'verify' : 'desk');
      if (tabDeskBtn) { tabDeskBtn.focus(); }
    }

    function close() {
      if (overlay) { overlay.hidden = true; }
      if (opts.onClose) { opts.onClose(); }
    }

    return {
      open: open,
      close: close,
      verifyText: function (raw, name) { open('verify'); runFileVerification(raw, name || 'Arquivo'); }
    };
  };
}(typeof window !== 'undefined' ? window : this));
