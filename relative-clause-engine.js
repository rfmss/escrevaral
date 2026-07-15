// relative-clause-engine.js — leitura contextual de orações adjetivas em português brasileiro
// Política: só classifica como explicativa/restritiva quando há evidência textual forte;
// nos demais casos, preserva a intenção da escritora e retorna leitura ambígua.

(function (global) {
  "use strict";

  const UNIQUE_REFERENTS = new Set([
    "brasil", "portugal", "brasilia", "lisboa",
    "america do sul", "america do norte", "america central",
    "terra", "lua", "sol", "via lactea",
    "lingua portuguesa", "portugues brasileiro",
    "machado de assis", "clarice lispector", "conceicao evaristo",
    "guimaraes rosa", "carlos drummond de andrade",
  ]);

  // Relações taxonômicas estáveis e não controversas. A lista é deliberadamente
  // pequena: conhecimento ausente produz abstenção, nunca palpite categórico.
  const GENERAL_PROPERTIES = [
    { antecedent: /^(?:as )?baleias$/, predicate: /^(?:t[eê]m sangue quente|s[aã]o mam[ií]feros|respiram por pulm[oõ]es)\b/i },
    { antecedent: /^(?:os )?mam[ií]feros$/, predicate: /^(?:t[eê]m sangue quente|amamentam (?:os )?filhotes|possuem gl[aâ]ndulas mam[aá]rias)\b/i },
    { antecedent: /^(?:as )?aves$/, predicate: /^(?:t[eê]m penas|possuem penas|s[aã]o vertebrados)\b/i },
    { antecedent: /^(?:os )?tri[aâ]ngulos$/, predicate: /^(?:t[eê]m tr[eê]s lados|possuem tr[eê]s lados)\b/i },
  ];

  const DETERMINERS = new Set([
    "o", "a", "os", "as", "um", "uma", "uns", "umas",
    "este", "esta", "estes", "estas", "esse", "essa", "esses", "essas",
    "aquele", "aquela", "aqueles", "aquelas", "meu", "minha", "meus", "minhas",
    "seu", "sua", "seus", "suas", "nosso", "nossa", "nossos", "nossas",
  ]);
  const LIMITERS = new Set(["apenas", "somente", "só", "exclusivamente"]);
  const QUANTIFIERS = new Set(["todos", "todas", "ambos", "ambas"]);
  const NAME_CONNECTORS = new Set(["da", "das", "de", "do", "dos", "e"]);
  const COMPLEMENT_TRIGGERS = new Set([
    "acha", "acham", "achava", "acredita", "acreditam", "afirma", "afirmam", "afirmou",
    "anuncia", "anunciam", "anunciou", "conta", "contam", "contou", "declara", "declaram",
    "declarou", "demonstra", "demonstram", "demonstrou", "diz", "dizem", "disse", "disseram",
    "espera", "esperam", "esperava", "explica", "explicam", "explicou", "garante", "garantem",
    "garantiu", "imagina", "imaginam", "informa", "informam", "informou", "lembra", "lembram",
    "nota", "notam", "percebe", "percebem", "percebeu", "pensa", "pensam", "pensou",
    "promete", "prometem", "prometeu", "reconhece", "reconhecem", "responde", "respondem",
    "respondeu", "revela", "revelam", "revelou", "sabe", "sabem", "sabia",
  ]);

  const normalize = value => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  function words(value) {
    return value.match(/[\p{L}][\p{L}'’-]*/gu) || [];
  }

  function extractAntecedent(prefix) {
    const tokens = words(prefix);
    if (!tokens.length) return null;
    if (COMPLEMENT_TRIGGERS.has(normalize(tokens[tokens.length - 1]))) return null;

    const windowStart = Math.max(0, tokens.length - 8);
    let start = -1;
    for (let i = tokens.length - 1; i >= windowStart; i -= 1) {
      const token = normalize(tokens[i]);
      if (DETERMINERS.has(token)) {
        start = i;
        if (i > windowStart && (LIMITERS.has(normalize(tokens[i - 1])) || QUANTIFIERS.has(normalize(tokens[i - 1])))) start = i - 1;
        break;
      }
    }

    if (start < 0) {
      let i = tokens.length - 1;
      while (i >= windowStart) {
        const token = tokens[i];
        const normalized = normalize(token);
        if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(token) || NAME_CONNECTORS.has(normalized)) i -= 1;
        else break;
      }
      start = i + 1;
      const nameTokens = tokens.slice(start);
      if (!nameTokens.some(token => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(token))) return null;
    }

    const antecedentTokens = tokens.slice(start);
    if (antecedentTokens.length < 2 && DETERMINERS.has(normalize(antecedentTokens[0] || ""))) return null;
    return antecedentTokens.join(" ");
  }

  function predicateAfter(text, queEnd) {
    return text.slice(queEnd)
      .replace(/^\s+/, "")
      .split(/[,;.!?…]/, 1)[0]
      .trim();
  }

  function hasUniqueReferent(antecedent) {
    const normalized = normalize(antecedent);
    const withoutDeterminer = normalized.replace(/^(?:o|a|os|as)\s+/, "");
    if (UNIQUE_REFERENTS.has(withoutDeterminer)) return true;

    return false;
  }

  function hasGeneralProperty(antecedent, predicate) {
    const normalizedAntecedent = normalize(antecedent);
    return GENERAL_PROPERTIES.some(item => item.antecedent.test(normalizedAntecedent) && item.predicate.test(predicate));
  }

  function explicitLimiter(antecedent) {
    return LIMITERS.has(normalize(words(antecedent)[0] || ""));
  }

  function classify(antecedent, predicate) {
    if (explicitLimiter(antecedent)) {
      return {
        type: "restritiva",
        confidence: "alta",
        score: 0.96,
        evidence: ["delimitador explícito restringe o conjunto referido"],
        guidance: "Sem vírgulas, a oração seleciona exatamente o grupo indicado pelo delimitador.",
      };
    }

    if (hasUniqueReferent(antecedent)) {
      return {
        type: "explicativa",
        confidence: "alta",
        score: 0.94,
        evidence: ["antecedente aponta para referente único no contexto"],
        guidance: "Com vírgulas, a oração acrescenta uma explicação sobre um referente já identificado.",
      };
    }

    if (hasGeneralProperty(antecedent, predicate)) {
      return {
        type: "explicativa",
        confidence: "alta",
        score: 0.92,
        evidence: ["oração expressa propriedade geral documentada do antecedente"],
        guidance: "Com vírgulas, a propriedade aparece como explicação aplicável ao conjunto inteiro.",
      };
    }

    return {
      type: "ambigua",
      confidence: "baixa",
      score: 0.35,
      evidence: ["a pontuação depende do conjunto que a escritora pretende identificar"],
      guidance: "Com vírgulas, a oração comenta todo o referente; sem vírgulas, seleciona uma parte dele. A intenção autoral decide.",
    };
  }

  function analyze(text) {
    if (!text || !text.trim()) return [];
    const analyses = [];
    const relative = /\bque\b/giu;
    let match;

    while ((match = relative.exec(text)) !== null) {
      const sentenceStart = Math.max(
        text.lastIndexOf(".", match.index - 1),
        text.lastIndexOf("!", match.index - 1),
        text.lastIndexOf("?", match.index - 1),
        text.lastIndexOf("\n", match.index - 1),
      ) + 1;
      const rawPrefix = text.slice(sentenceStart, match.index);
      const hasComma = /,\s*$/.test(rawPrefix);
      const cleanPrefix = rawPrefix.replace(/,\s*$/, "").trimEnd();
      const antecedent = extractAntecedent(cleanPrefix);
      if (!antecedent) continue;

      const predicate = predicateAfter(text, match.index + match[0].length);
      if (!predicate) continue;
      const classification = classify(antecedent, predicate);
      const antecedentPos = cleanPrefix.lastIndexOf(antecedent);
      const pos = sentenceStart + Math.max(0, antecedentPos);

      analyses.push({
        antecedent,
        predicate,
        fragment: `${antecedent}${hasComma ? "," : ""} que ${predicate}`.slice(0, 120),
        pos,
        hasComma,
        ...classification,
      });
    }

    return analyses;
  }

  global.VeredaRelativeClauses = { analyze };

}(typeof window !== "undefined" ? window : global));