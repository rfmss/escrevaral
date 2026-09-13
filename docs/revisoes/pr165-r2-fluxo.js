/* Diagnóstico da re-revisão: executa os scripts reais em VM com DOM mínimo.
 * Node de oficina; não é renderização nem teste físico. Nenhuma engine é editada.
 * Uso na raiz: node docs/revisoes/pr165-r2-fluxo.js
 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const results = [];
function record(check, passed, evidence) { results.push({ check, passed, evidence }); }
function setup(legacyAPIs) {
  const pending = [], nodes = {}, buttons = [];
  function node() {
    const n = { children: [], textContent: '', handlers: {}, classes: {}, className: '',
      appendChild(c) { this.children.push(c); },
      addEventListener(type, fn) { this.handlers[type] = fn; }
    };
    n.classList = { add(s) { n.classes[s] = true; }, remove(s) { delete n.classes[s]; } };
    Object.defineProperty(n, 'innerHTML', { get() { return ''; }, set() { this.children = []; this.textContent = ''; } });
    return n;
  }
  nodes.text = node(); nodes.out = node();
  nodes.text.textContent = 'A casa caiu. A casa ficou.';
  for (const m of html.matchAll(/<button data-engine="([^"]+)"/g)) {
    const b = node(); b.engineId = m[1]; b.getAttribute = name => name === 'data-engine' ? b.engineId : null;
    buttons.push(b);
  }
  const ctx = { console, setTimeout(fn) { pending.push(fn); return pending.length; },
    document: { getElementById(id) { if (!nodes[id]) throw Error('DOM não previsto: ' + id); return nodes[id]; },
      createElement: node,
      querySelectorAll() { return buttons; },
      querySelector() { return buttons.find(b => b.classes.active) || null; }
    }
  };
  ctx.window = ctx; vm.createContext(ctx);
  if (legacyAPIs) vm.runInContext('String.prototype.normalize=undefined; String.prototype.includes=undefined; String.prototype.startsWith=undefined; String.prototype.endsWith=undefined; String.prototype.matchAll=undefined; Array.prototype.includes=undefined; this.Set=undefined; this.Map=undefined; this.Promise=undefined; this.Symbol=undefined;', ctx);
  for (const s of html.matchAll(/<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g)) {
    vm.runInContext(s[1] ? fs.readFileSync(path.join(root, s[1]), 'utf8') : s[2], ctx, { filename: s[1] || 'index.html:inline' });
  }
  return { ctx, nodes, pending,
    click(id) { const b = buttons.find(b => b.engineId === id); b.handlers.click.call(b); },
    flush() { let limit = 100; while (pending.length) { if (--limit < 0) throw Error('Fila não terminou'); pending.shift()(); } },
    rendered() { return nodes.out.children.flatMap(b => b.children.map(c => ({ className: c.className, text: c.textContent }))); }
  };
}
const a = setup(false);
a.click('LEXICO-CLASSES'); a.click('LEXICO-CLASSES');
record('R6: desativar limpa imediatamente', a.rendered().length === 0, a.rendered());
a.flush();
record('R6: desativar invalida resposta pendente', a.rendered().length === 0, a.rendered());
const b = setup(false);
b.click('LEXICO-CLASSES'); b.click('VERB-MORPH'); b.flush();
record('R6: trocar lente descarta resposta anterior', b.rendered().every(f => f.className !== 'finding lex'), b.rendered());
const c = setup(true);
c.click('LEXICO-CLASSES'); c.flush();
record('R1/R2: scripts reais, sem APIs opcionais, analisam o texto', c.rendered().length === 6 && /Artigo/.test(c.rendered()[0].text), c.rendered());
const corpus = require(path.join(root, 'src/test/fixtures/analise-literaria-corpus.js')).cases;
c.nodes.text.textContent = corpus.find(x => x.id === 'sujeira-vicios').text;
c.click('ANALISE-LITERARIA'); c.flush();
record('R1: análise literária sem APIs opcionais', c.rendered().length > 0 && c.rendered().every(f => !/Erro interno/.test(f.text)), { count: c.rendered().length, boxes: c.nodes.out.children.map(x => ({className:x.className,text:x.textContent,children:x.children})) });
// Superfície auxiliar exportada: contraprova da troca de tokenização em R1.
const marked = c.ctx.VeredaLexical.createHighlightedContext('A casa caiu.', 'casa', s => s);
record('R1: destaque preserva palavra inteira', marked === 'A <mark>casa</mark> caiu.', { expected: 'A <mark>casa</mark> caiu.', actual: marked });
console.log(JSON.stringify({ node: process.version, results }, null, 2));
process.exitCode = results.some(r => !r.passed) ? 1 : 0;
