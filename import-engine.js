// import-engine.js — trazer textos do computador (.docx, .txt, .md) para o Acervo
// Sem biblioteca externa: o .docx é um ZIP lido com DecompressionStream nativo.

const VeredaImport = (() => {
  const EXTENSOES = [".docx", ".txt", ".md", ".markdown"];

  function extensaoDe(nome) {
    const m = /\.[^.]+$/.exec((nome || "").toLowerCase());
    return m ? m[0] : "";
  }

  function aceita(file) {
    return EXTENSOES.includes(extensaoDe(file?.name));
  }

  function tituloDe(nome) {
    return (nome || "Texto trazido").replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Texto trazido";
  }

  // ── Texto plano ────────────────────────────────────────────────
  // UTF-8 primeiro; se vier cheio de U+FFFD (arquivo antigo do Word), relê como windows-1252.
  async function lerTextoPlano(file) {
    const buf = await file.arrayBuffer();
    let texto = new TextDecoder("utf-8").decode(buf);
    const substituicoes = (texto.match(/�/g) || []).length;
    if (substituicoes > 2 && substituicoes > texto.length / 400) {
      texto = new TextDecoder("windows-1252").decode(buf);
    }
    return texto.replace(/\r\n?/g, "\n");
  }

  // ── Markdown mínimo ────────────────────────────────────────────
  // Só o que um manuscrito usa: títulos, negrito, itálico, parágrafos.
  function mdParaHtml(texto) {
    const escapa = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const linha = (s) => escapa(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_]+)__/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/_([^_]+)_/g, "<em>$1</em>");
    return texto.split(/\n{2,}/).map((bloco) => {
      const b = bloco.trim();
      if (!b) return "";
      const h = /^(#{1,3})\s+(.*)$/.exec(b);
      if (h) return `<h${h[1].length}>${linha(h[2])}</h${h[1].length}>`;
      return `<p>${b.split("\n").map(linha).join("<br>")}</p>`;
    }).filter(Boolean).join("");
  }

  // ── ZIP (formato do .docx) ─────────────────────────────────────
  async function inflar(bytes, metodo) {
    if (metodo === 0) return bytes;
    if (metodo !== 8) throw new Error(`Compressão ${metodo} não suportada`);
    const ds = new DecompressionStream("deflate-raw");
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function extrairDoZip(buf, caminho) {
    const dv = new DataView(buf);
    const bytes = new Uint8Array(buf);
    // End of Central Directory: assinatura 0x06054b50, varrida do fim
    let eocd = -1;
    for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65558); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("Arquivo não é um .docx válido");
    const total = dv.getUint16(eocd + 10, true);
    let pos = dv.getUint32(eocd + 16, true);
    const decoder = new TextDecoder("utf-8");
    for (let n = 0; n < total; n++) {
      if (dv.getUint32(pos, true) !== 0x02014b50) break;
      const metodo = dv.getUint16(pos + 10, true);
      const tamanhoComprimido = dv.getUint32(pos + 20, true);
      const nomeLen = dv.getUint16(pos + 28, true);
      const extraLen = dv.getUint16(pos + 30, true);
      const comentLen = dv.getUint16(pos + 32, true);
      const offsetLocal = dv.getUint32(pos + 42, true);
      const nome = decoder.decode(bytes.subarray(pos + 46, pos + 46 + nomeLen));
      if (nome === caminho) {
        // Cabeçalho local tem campos extra próprios — recalcular o início dos dados
        const localNomeLen = dv.getUint16(offsetLocal + 26, true);
        const localExtraLen = dv.getUint16(offsetLocal + 28, true);
        const inicio = offsetLocal + 30 + localNomeLen + localExtraLen;
        const dados = bytes.subarray(inicio, inicio + tamanhoComprimido);
        return await inflar(dados, metodo);
      }
      pos += 46 + nomeLen + extraLen + comentLen;
    }
    throw new Error(`${caminho} não encontrado no .docx`);
  }

  // ── DOCX → HTML ────────────────────────────────────────────────
  function docxXmlParaHtml(xmlTexto) {
    const xml = new DOMParser().parseFromString(xmlTexto, "application/xml");
    if (xml.querySelector("parsererror")) throw new Error("Conteúdo do .docx ilegível");
    const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    const paragrafos = xml.getElementsByTagNameNS(W, "p");
    const blocos = [];
    for (const p of paragrafos) {
      const estilo = p.getElementsByTagNameNS(W, "pStyle")[0]?.getAttribute("w:val") || "";
      const nivel = /^(?:Heading|Ttulo|Titulo)([1-3])$/i.exec(estilo)?.[1];
      let html = "";
      for (const r of p.getElementsByTagNameNS(W, "r")) {
        let trecho = "";
        for (const filho of r.children) {
          if (filho.localName === "t") trecho += filho.textContent;
          else if (filho.localName === "br" || filho.localName === "cr") trecho += "<br>";
          else if (filho.localName === "tab") trecho += " ";
        }
        if (!trecho) continue;
        trecho = trecho.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/<br>/g, "<br>");
        const rPr = r.getElementsByTagNameNS(W, "rPr")[0];
        const ligado = (tag) => {
          const el = rPr?.getElementsByTagNameNS(W, tag)[0];
          return el && el.getAttribute("w:val") !== "false" && el.getAttribute("w:val") !== "0";
        };
        if (ligado("i")) trecho = `<em>${trecho}</em>`;
        if (ligado("b")) trecho = `<strong>${trecho}</strong>`;
        html += trecho;
      }
      if (!html.trim()) { blocos.push("<p><br></p>"); continue; }
      blocos.push(nivel ? `<h${nivel}>${html}</h${nivel}>` : `<p>${html}</p>`);
    }
    // Remove folhas em branco no fim
    while (blocos.length && blocos[blocos.length - 1] === "<p><br></p>") blocos.pop();
    return blocos.join("");
  }

  async function lerDocx(file) {
    const buf = await file.arrayBuffer();
    const dados = await extrairDoZip(buf, "word/document.xml");
    return docxXmlParaHtml(new TextDecoder("utf-8").decode(dados));
  }

  // ── Porta de entrada ───────────────────────────────────────────
  // Devolve { title, html } pronto para VeredaArchive.createManuscript.
  async function importFile(file) {
    const ext = extensaoDe(file.name);
    const title = tituloDe(file.name);
    if (ext === ".docx") {
      return { title, html: await lerDocx(file) };
    }
    const texto = await lerTextoPlano(file);
    if (ext === ".md" || ext === ".markdown") {
      return { title, html: mdParaHtml(texto) };
    }
    return { title, html: VeredaDocument.textToHtml(texto) };
  }

  return { importFile, aceita, EXTENSOES };
})();
