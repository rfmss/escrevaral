// Combo Detector — sinais locais de coesão, ritmo e precisão
// Puro: sem DOM, sem estado global, sem nota literária

const CONECTIVOS = [
  "portanto","porém","entretanto","contudo","todavia","assim","logo",
  "pois","porque","embora","apesar","além","então","também","ainda",
  "já que","uma vez que","de modo que","ao passo que","ademais",
  "afinal","aliás","nesse sentido","por isso","por outro lado",
];

function _conectivosPresentes(texto) {
  const lower = texto.toLowerCase();
  return CONECTIVOS.filter(c => lower.includes(c));
}

function _analisarRitmo(frases) {
  if (frases.length < 2) return { variado: false };
  const lens = frases.map(f => f.trim().split(/\s+/).filter(Boolean).length);
  return { variado: Math.max(...lens) - Math.min(...lens) >= 3 };
}

function _repeticoesExcessivas(palavras) {
  const freq = {};
  palavras.forEach(p => { freq[p] = (freq[p] || 0) + 1; });
  return Object.keys(freq).filter(p => freq[p] > 2 && p.length > 4);
}

function detectCombos(texto) {
  const frases = texto.split(/[.!?]+/).map(f => f.trim()).filter(Boolean);
  const palavras = texto.toLowerCase().replace(/[^a-záéíóúàâêôãõüç\s]/gi, "")
    .split(/\s+/).filter(p => p.length > 3);

  const conectivos = _conectivosPresentes(texto);
  const ritmo     = _analisarRitmo(frases);
  const repeticoes = _repeticoesExcessivas(palavras);

  const sinais = [];
  if (conectivos.length > 0)                          sinais.push({ tipo: "coesao",   label: "Boa retomada" });
  if (ritmo.variado)                                   sinais.push({ tipo: "ritmo",    label: "Ritmo variou" });
  if (frases.length >= 3 && repeticoes.length === 0)   sinais.push({ tipo: "precisao", label: "Ideia avançou" });
  if (frases.length >= 2 && conectivos.length >= 2)    sinais.push({ tipo: "fluxo",   label: "Combo de coesão" });

  return { coesao: conectivos, ritmo, precisao: { repeticoes }, sinais, combo: sinais.length };
}

window.ComboDetector = { detectCombos };
