// punctuation-engine.js — análise de pontuação funcional em português brasileiro
// Fontes: Bechara MGP §§ 597-640 · Cunha & Cintra pp. 648-682
//         Moreno "Guia prático" · Squarisi "1001 Dicas"
// 40 regras: 26 por padrão textual + 7 via syntax-engine (analyzeDeep) + 3 novas
// Fix: PONT-23 detect() bug · PONT-46 duplicado resolvido · PONT-48 renomeada
// Adição: `acao` em todas as regras · `resumo` de severidade no analyze()

(function (global) {
  "use strict";

  // helpers
  const all = (re, text) => { const r = []; let m; re.lastIndex = 0; while ((m = re.exec(text)) !== null) r.push({ fragment: m[0].trim(), pos: m.index }); return r; };
  const first = (re, text) => { const m = text.match(re); return m ? [{ fragment: m[0].trim(), pos: text.indexOf(m[0]) }] : []; };

  const RULES = [

    // ── VÍRGULA PROIBIDA ─────────────────────────────────────────────────────

    {
      id: "PONT-01", categoria: "vírgula proibida — sujeito/predicado",
      fonte: "Bechara § 620; Cunha & Cintra p. 649",
      criterio: "Não se usa vírgula entre sujeito simples e verbo.",
      exemplo: "O escritor publicou o romance.",
      contraexemplo: "O escritor, publicou o romance.",
      acao: "Remova a vírgula entre o sujeito e o verbo.",
      severity: "alta",
      detect(text) {
        return first(/\b([A-ZÀ-Úa-záàâãéèêíîóòôõúùûç][a-záàâãéèêíîóòôõúùûç]+(?: [a-záàâãéèêíîóòôõúùûç]+){0,4}),\s+(é|foi|será|tinha|tem|teve|disse|fez|fala|escreveu|publicou|criou|quis|pode|deve|vai|vem)\b/, text);
      },
    },

    {
      id: "PONT-10", categoria: "vírgula proibida — verbo dicendi + que",
      fonte: "Bechara (conclusão b); Moreno p. 60; Squarisi",
      criterio: "Não se usa vírgula entre verbo de dizer/declarar e o 'que' que inicia a subordinada.",
      exemplo: "O presidente anunciou que vai reunir os ministros.",
      contraexemplo: "O presidente anunciou, que vai reunir os ministros.",
      acao: "Remova a vírgula entre o verbo de dizer e 'que'.",
      severity: "alta",
      detect(text) {
        return first(/\b(anunciou|disse|declarou|afirmou|revelou|garantiu|prometeu|alegou|respondeu|retrucou|perguntou|contou|narrou|explicou|confessou),\s+que\b/, text);
      },
    },

    {
      id: "PONT-22", categoria: "vírgula proibida — 'e, sim,' redundante",
      fonte: "Moreno p. 58",
      criterio: "A locução adversativa 'e sim' não leva vírgulas internas.",
      exemplo: "Não devemos desanimar, e sim persistir.",
      contraexemplo: "Não devemos desanimar, e, sim, persistir.",
      acao: "Remova as vírgulas em torno de 'sim': escreva apenas 'e sim'.",
      severity: "baixa",
      detect(text) {
        return first(/,\s*e,\s*sim,\s*/, text);
      },
    },

    // ── VÍRGULA OBRIGATÓRIA ──────────────────────────────────────────────────

    {
      id: "PONT-02", categoria: "vírgula obrigatória — vocativo",
      fonte: "Bechara § 621; Cunha & Cintra p. 651",
      criterio: "Vocativo é sempre isolado por vírgula(s).",
      exemplo: "Maria, venha aqui.",
      contraexemplo: "Maria venha aqui.",
      acao: "Adicione vírgula depois do nome chamado: 'Maria, venha.'",
      severity: "alta",
      detect(text) {
        const re = /\b([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záàâãéèêíîóòôõúùûç]{2,})\s+(venha|veja|ouça|leia|escreva|faça|diga|olhe|tome|traga|venham|fujam|parem|ouçam)\b/;
        const m = text.match(re);
        if (!m) return [];
        const before = text.slice(Math.max(0, text.indexOf(m[0]) - 2), text.indexOf(m[0]));
        return !before.endsWith(",") ? [{ fragment: m[0], pos: text.indexOf(m[0]) }] : [];
      },
    },

    {
      id: "PONT-03", categoria: "vírgula obrigatória — oração adverbial anteposta",
      fonte: "Bechara § 623; Cunha & Cintra p. 655",
      criterio: "Oração adverbial anteposta à principal exige vírgula ao fim.",
      exemplo: "Quando o sol nasceu, Maria saiu.",
      contraexemplo: "Quando o sol nasceu Maria saiu.",
      acao: "Adicione vírgula ao final da oração adverbial, antes da oração principal.",
      severity: "alta",
      detect(text) {
        const issues = [];
        const re = /\b(Quando|Embora|Enquanto|Desde que|Logo que|Assim que|Sempre que|Cada vez que|Se|Caso|Contanto que|Conquanto|Posto que|Ainda que|Mesmo que)\b([^,\.!?]{12,70}?)(?=[A-ZÀ-Ú][a-z])/g;
        let m;
        while ((m = re.exec(text)) !== null) {
          const before = text.slice(Math.max(0, m.index - 3), m.index);
          if (before.includes('"') || before.includes('—')) continue;
          if (!m[0].includes(",")) issues.push({ fragment: m[0].trim().slice(0, 80), pos: m.index });
        }
        return issues;
      },
    },

    {
      id: "PONT-04", categoria: "vírgula obrigatória — aposto explicativo",
      fonte: "Bechara § 626; Cunha & Cintra p. 659",
      criterio: "Aposto explicativo é isolado por vírgulas.",
      exemplo: "Machado de Assis, o maior romancista, nasceu no Rio.",
      contraexemplo: "Machado de Assis o maior romancista nasceu no Rio.",
      acao: "Isole o aposto com vírgulas dos dois lados.",
      severity: "média",
      detect(text) {
        return first(/([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záàâãéèêíîóòôõúùûçA-Z\s]{4,40})\s+(o|a)\s+(maior|menor|melhor|único|primeiro|principal|grande|mais)\b(?![,])/, text);
      },
    },

    {
      id: "PONT-09", categoria: "vírgula obrigatória — advérbio adversativo intercalado",
      fonte: "Bechara § 623 (l); Moreno p. 134; Cunha & Cintra p. 659",
      criterio: "Contudo, todavia, entretanto, no entanto, intercalados ficam obrigatoriamente entre vírgulas.",
      exemplo: "O resultado, contudo, foi satisfatório.",
      contraexemplo: "O resultado contudo foi satisfatório.",
      acao: "Isole o advérbio adversativo com vírgulas dos dois lados: ', contudo,'.",
      severity: "alta",
      detect(text) {
        return all(/\b\w+\s+(contudo|todavia|entretanto|no entanto|não obstante|porém)\s+\w+\b(?<![,\-—]\s*\w+\s*(contudo|todavia|entretanto))/g, text)
          .filter(({ fragment }) => !/,\s*(contudo|todavia|entretanto|no entanto|porém),/.test(fragment));
      },
    },

    {
      id: "PONT-11", categoria: "vírgula obrigatória — adjunto adverbial longo anteposto",
      fonte: "Bechara § 623 (j); Moreno p. 48; Cunha & Cintra p. 655",
      criterio: "Adjunto adverbial de mais de 4 palavras anteposto ao verbo exige vírgula.",
      exemplo: "Na Granja do Torto, o presidente se reuniu com os ministros.",
      contraexemplo: "Na Granja do Torto o presidente se reuniu.",
      acao: "Adicione vírgula ao fim do adjunto adverbial longo, antes do sujeito.",
      severity: "média",
      detect(text) {
        const issues = [];
        const re = /^((?:Em|Na|No|Para|Desde|Após|Antes de|Depois de|Durante|Por causa de|Em virtude de)\s+[A-Za-záàâãéèêíîóòôõúùûç]+(?:\s+[a-záàâãéèêíîóòôõúùûç]+){2,})\s+([a-záàâãéèêíîóòôõúùûç])/mg;
        let m;
        while ((m = re.exec(text)) !== null) {
          if (!m[1].includes(",")) issues.push({ fragment: m[1].trim().slice(0, 80), pos: m.index });
        }
        return issues;
      },
    },

    {
      id: "PONT-15", categoria: "vírgula indevida — 'pois' explicativo com virgulação dupla",
      fonte: "Bechara § 623 (m); Moreno p. 62; Cunha & Cintra p. 663",
      criterio: "'Pois' explicativo (= porque) leva vírgula ANTES, mas não depois.",
      exemplo: "Ela deve estar doente, pois não vem à aula.",
      contraexemplo: "Ela deve estar doente, pois, não vem à aula.",
      acao: "Remova a vírgula depois de 'pois' explicativo: mantenha apenas a vírgula antes.",
      severity: "média",
      detect(text) {
        return first(/,\s*pois,\s+(?!bem|assim|é)/, text);
      },
    },

    {
      id: "PONT-16", categoria: "vírgula obrigatória — 'pois' conclusivo sem isolamento",
      fonte: "Bechara § 623 (l); Moreno p. 66; Cunha & Cintra p. 662",
      criterio: "'Pois' conclusivo (= portanto) intercalado exige vírgulas dos dois lados.",
      exemplo: "Pode, pois, sair com os filhos.",
      contraexemplo: "Pode pois sair com os filhos.",
      acao: "Isole 'pois' conclusivo com vírgulas: 'pode, pois, sair'.",
      severity: "média",
      detect(text) {
        return first(/\b(pode|deve|vai|consegue|fica|está|é|são|tem|têm)\s+pois\s+[a-z]/, text);
      },
    },

    {
      id: "PONT-23", categoria: "vírgula obrigatória — elemento intercalado sem isolamento",
      fonte: "Bechara § 623 (o); Moreno p. 54; Cunha & Cintra p. 650",
      criterio: "Qualquer elemento intercalado (avaliação, comentário, advérbio frasal) exige vírgulas duplas.",
      exemplo: "A notícia, é verdade, deixou-nos estupefatos.",
      contraexemplo: "A notícia é verdade deixou-nos estupefatos.",
      acao: "Isole o elemento intercalado com vírgulas dos dois lados.",
      severity: "média",
      detect(text) {
        const matches = first(/\b\w[\w\s]{1,30}\s+(é verdade|de fato|com efeito|certamente|evidentemente|obviamente|naturalmente|felizmente|infelizmente|surpreendentemente)\s+\w/, text);
        return matches.filter(i => !i.fragment.includes(","));
      },
    },

    // ── PONTO FINAL ──────────────────────────────────────────────────────────

    {
      id: "PONT-05", categoria: "ponto final ausente",
      fonte: "Bechara § 597; Cunha & Cintra p. 648",
      criterio: "Toda oração declarativa termina em pontuação.",
      exemplo: "A escritora terminou o romance.",
      contraexemplo: "A escritora terminou o romance",
      acao: "Acrescente ponto final ao término do período.",
      severity: "alta",
      detect(text) {
        const issues = [];
        for (const p of text.split(/\n+/).filter(Boolean)) {
          const t = p.trim();
          if (t.length > 20 && !/[.!?…—"]$/.test(t) && !/^\s*—/.test(t))
            issues.push({ fragment: t.slice(-50), pos: text.lastIndexOf(t) });
        }
        return issues;
      },
    },

    // ── DOIS-PONTOS ──────────────────────────────────────────────────────────

    {
      id: "PONT-24", categoria: "dois-pontos proibido — verbo + complemento integrado",
      fonte: "Moreno p. 108; Cunha & Cintra p. 670",
      criterio: "Dois-pontos não pode separar verbo do complemento que o integra sintaticamente.",
      exemplo: "As cidades eram as seguintes: Tebas, Alexandria e Atenas.",
      contraexemplo: "As cidades mais importantes eram: Tebas, Alexandria e Atenas.",
      acao: "Remova os dois-pontos e deixe o verbo ligar-se diretamente ao complemento.",
      severity: "alta",
      detect(text) {
        return first(/\b(eram|são|é|foi|serão|incluem|inclui|abrangem|abrange|compreende|compreendem)\s*:(?!\s*"|\s*—|\s*\n)/, text);
      },
    },

    {
      id: "PONT-25", categoria: "dois-pontos ausente — citação após verbo dicendi",
      fonte: "Bechara § 627 (2); Moreno p. 107; Cunha & Cintra p. 670",
      criterio: "Citação direta formal após verbo de dizer exige dois-pontos antes das aspas.",
      exemplo: 'Machado escreveu: "A eternidade é fácil."',
      contraexemplo: 'Machado escreveu "A eternidade é fácil."',
      acao: 'Adicione dois-pontos antes das aspas: \'disse: "..."\' ',
      severity: "média",
      detect(text) {
        return first(/\b(disse|escreveu|afirmou|declarou|respondeu|perguntou|gritou|sussurrou|retrucou|anotou|registrou)\s+"[^"]/, text);
      },
    },

    {
      id: "PONT-27", categoria: "maiúscula indevida após dois-pontos",
      fonte: "Moreno p. 111; Bechara § 627",
      criterio: "Após dois-pontos, a palavra seguinte é minúscula — exceto em citação textual.",
      exemplo: "Comprou três itens: livro, caneta e papel.",
      contraexemplo: "Comprou três itens: Livro, caneta e papel.",
      acao: "Coloque a palavra seguinte ao dois-pontos em minúscula, salvo início de citação.",
      severity: "baixa",
      detect(text) {
        return all(/:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záàâãéèêíîóòôõúùûç]/g, text)
          .filter(({ fragment }) => !fragment.includes('"') && !fragment.includes('—'));
      },
    },

    // ── TRAVESSÃO ────────────────────────────────────────────────────────────

    {
      id: "PONT-28", categoria: "travessão — hífen simples no lugar de travessão em diálogo",
      fonte: "Bechara § 632; Moreno p. 115; Cunha & Cintra p. 682",
      criterio: "Diálogo direto usa travessão (—), nunca hífen (-).",
      exemplo: "— Você quer sair? — perguntou ela.",
      contraexemplo: "- Você quer sair? - perguntou ela.",
      acao: "Substitua o hífen pelo travessão (—) em todas as falas do diálogo.",
      severity: "alta",
      detect(text) {
        return all(/^-\s+[A-ZÀ-Úa-záàâãéèêíîóòôõúùûç]/mg, text);
      },
    },

    // ── PONTO E VÍRGULA ──────────────────────────────────────────────────────

    {
      id: "PONT-08", categoria: "ponto e vírgula — 3+ verbos coordenados sem separação",
      fonte: "Bechara § 615; Cunha & Cintra p. 668",
      criterio: "Sequência de 3+ verbos coordenados sem vírgula ou ponto e vírgula.",
      exemplo: "Trouxe papel; organizou a mesa; acendeu a luz.",
      contraexemplo: "Trouxe papel organizou a mesa acendeu a luz.",
      acao: "Separe os verbos coordenados com vírgula ou ponto e vírgula.",
      severity: "média",
      detect(text) {
        const matches = first(/\b(\w+ou|\w+eu|\w+iu)\s+\w[^,;.!?]{2,30}\b(\w+ou|\w+eu|\w+iu)\s+\w[^,;.!?]{2,30}\b(\w+ou|\w+eu|\w+iu)\b/, text);
        return matches.filter(i => !i.fragment.includes(";") && !i.fragment.includes(","));
      },
    },

    {
      id: "PONT-32", categoria: "ponto e vírgula — conjunção pospositiva após vírgula simples",
      fonte: "Bechara § 615 obs. 2ª; Moreno p. 131; Cunha & Cintra p. 667",
      criterio: "Contudo, todavia, entretanto, portanto, logo, por conseguinte no início de oração coordenada exigem ponto e vírgula antes, não vírgula simples.",
      exemplo: "Ele nadava bem; contudo, não venceu a correnteza.",
      contraexemplo: "Ele nadava bem, contudo não venceu a correnteza.",
      acao: "Substitua a vírgula por ponto e vírgula antes do advérbio pospositivo.",
      severity: "alta",
      detect(text) {
        return all(/,\s*(contudo|todavia|entretanto|no entanto|não obstante|portanto|logo|por conseguinte|consequentemente)\s*,/g, text);
      },
    },

    {
      id: "PONT-33", categoria: "ponto e vírgula — enumeração com vírgulas internas",
      fonte: "Bechara § 615; Moreno p. 128; Cunha & Cintra p. 667",
      criterio: "Itens de lista que já contêm vírgulas internas devem ser separados por ponto e vírgula.",
      exemplo: "João, meu tio; Paulo, meu primo; Ana, minha prima.",
      contraexemplo: "João, meu tio, Paulo, meu primo, Ana, minha prima.",
      acao: "Substitua as vírgulas entre os itens da enumeração por ponto e vírgula.",
      severity: "alta",
      detect(text) {
        const matches = first(/\b[A-ZÁÉÍÓÚ][a-záàâãéèêíîóòôõúùûç]+,\s+(?:meu|minha|seu|sua|nosso|o|a)\s+\w+,\s+[A-ZÁÉÍÓÚ][a-záàâãéèêíîóòôõúùûç]+,\s+(?:meu|minha|seu|sua|nosso|o|a)\s+\w+/, text);
        return matches.filter(i => !i.fragment.includes(";"));
      },
    },

    // ── RETICÊNCIAS ──────────────────────────────────────────────────────────

    {
      id: "PONT-06", categoria: "reticências excessivas por parágrafo",
      fonte: "Bechara § 608; Cunha & Cintra p. 672; Moreno",
      criterio: "3+ reticências no mesmo parágrafo dilui o efeito de hesitação.",
      exemplo: "Não sei... talvez amanhã.",
      contraexemplo: "Era lindo... o sol... e o mar...",
      acao: "Reduza a no máximo duas reticências por parágrafo; use ponto ou vírgula nos outros casos.",
      severity: "média",
      detect(text) {
        const issues = [];
        for (const p of text.split(/\n+/).filter(Boolean)) {
          const count = (p.match(/\.\.\.|…/g) || []).length;
          if (count >= 3) issues.push({ fragment: p.slice(0, 60), pos: text.indexOf(p) });
        }
        return issues;
      },
    },

    {
      id: "PONT-35", categoria: "reticências após 'etc.' — redundância",
      fonte: "Moreno p. 31; Bechara § 608",
      criterio: "'Etc.' e reticências são redundantes: ambos indicam enumeração aberta.",
      exemplo: "atlas, gramáticas, dicionários, etc.",
      contraexemplo: "atlas, gramáticas, dicionários, etc...",
      acao: "Use apenas 'etc.' sem reticências adicionais.",
      severity: "média",
      detect(text) {
        return first(/etc\s*\.?\s*\.{2,}/, text);
      },
    },

    // ── INTERROGAÇÃO / EXCLAMAÇÃO ────────────────────────────────────────────

    {
      id: "PONT-07", categoria: "exclamação múltipla",
      fonte: "Bechara § 600; Moreno p. 124; Cunha & Cintra p. 649",
      criterio: "Múltiplas exclamações enfraquecem o impacto. Uma basta.",
      exemplo: "Que beleza!",
      contraexemplo: "Que beleza!!!",
      acao: "Use apenas uma exclamação — a força vem da palavra escolhida, não da quantidade.",
      severity: "média",
      detect(text) {
        return all(/!{2,}/g, text);
      },
    },

    {
      id: "PONT-43", categoria: "interrogação múltipla",
      fonte: "Bechara § 599 obs.; Moreno p. 125; Cunha & Cintra p. 671",
      criterio: "Múltiplos pontos de interrogação são grafismos tolerados só em ficção informal. Evitar em texto culto.",
      exemplo: "Você não viu o arquivo?",
      contraexemplo: "Você não viu o arquivo???",
      acao: "Use apenas um ponto de interrogação.",
      severity: "baixa",
      detect(text) {
        return all(/\?{2,}/g, text);
      },
    },

    {
      id: "PONT-41", categoria: "interrogação indevida — oração interrogativa indireta",
      fonte: "Bechara § 599; Moreno p. 121; Cunha & Cintra p. 670",
      criterio: "Oração interrogativa indireta (subordinada com 'se/quem/como/onde/quando') não leva ponto de interrogação.",
      exemplo: "Gostaria de saber se os colegas concordam.",
      contraexemplo: "Gostaria de saber se os colegas concordam?",
      acao: "Remova o ponto de interrogação da oração interrogativa indireta.",
      severity: "alta",
      detect(text) {
        return first(/\b(gostaria de saber|quero saber|não sei|perguntei|perguntou|indagou|não sabe|não sabia|desconheço|ignoramos)\s+(se|quem|como|onde|quando|por que|quanto|qual)\b[^?]{5,100}\?/i, text);
      },
    },

    {
      id: "PONT-46", categoria: "vírgula proibida — verbo de opinião + que",
      fonte: "Bechara (conclusão b); Moreno p. 60; Cunha & Cintra p. 651",
      criterio: "Não se usa vírgula entre verbos cognitivos/perceptivos e a subordinada substantiva com 'que'.",
      exemplo: "Acho que era tarde demais.",
      contraexemplo: "Acho, que era tarde demais.",
      acao: "Remova a vírgula antes de 'que' em oração completiva com verbo de opinião.",
      severity: "alta",
      detect(text) {
        return first(/\b(acho|achei|acha|penso|pensei|pensa|sei|sabia|sabe|sinto|senti|sente|vejo|vi|vê|ouço|ouvi|ouve|noto|notei|nota|percebo|percebi|percebe|imagino|imaginei|imagina|acredito|acreditei|acredita|espero|esperei|espera|temo|temia|lembro|lembrei|lembra),\s+que\b/i, text);
      },
    },

    // ── NOVAS REGRAS ─────────────────────────────────────────────────────────

    {
      id: "PONT-50", categoria: "espaço indevido antes de pontuação",
      fonte: "Moreno p. 18; convenção tipográfica brasileira",
      criterio: "Ponto, vírgula, ponto e vírgula, dois-pontos, exclamação e interrogação não levam espaço antes.",
      exemplo: "Ele chegou tarde.",
      contraexemplo: "Ele chegou tarde .",
      acao: "Remova o espaço antes da pontuação.",
      severity: "média",
      detect(text) {
        return all(/\s+[.,;:!?]/g, text)
          .filter(({ fragment }) => !/ (\.{3}|…)/.test(fragment));
      },
    },

    {
      id: "PONT-51", categoria: "vírgula indevida antes de parêntese de abertura",
      fonte: "Moreno p. 97; Bechara § 634",
      criterio: "Não se usa vírgula imediatamente antes de parêntese de abertura.",
      exemplo: "Comprou livros (todos usados) e partiu.",
      contraexemplo: "Comprou livros, (todos usados) e partiu.",
      acao: "Remova a vírgula antes do parêntese de abertura.",
      severity: "baixa",
      detect(text) {
        return all(/,\s*\(/g, text);
      },
    },

    {
      id: "PONT-52", categoria: "ponto final duplicado antes de reticências",
      fonte: "Bechara § 604; Moreno p. 21",
      criterio: "Quando reticências terminam uma frase completa, não se adiciona ponto final após elas.",
      exemplo: "Não sei...",
      contraexemplo: "Não sei....",
      acao: "Remova o ponto final após as reticências.",
      severity: "baixa",
      detect(text) {
        return all(/\.{3,}\./g, text);
      },
    },

    {
      id: "PONT-53", categoria: "travessão duplo sem espaço externo",
      fonte: "Bechara § 630; norma editorial brasileira",
      criterio: "Travessão de inserção exige espaço antes e depois quando isola aposto ou intercalação.",
      exemplo: "Ela — a mais velha — chegou primeiro.",
      contraexemplo: "Ela—a mais velha—chegou primeiro.",
      acao: "Adicione espaço antes e depois do travessão de inserção.",
      severity: "baixa",
      detect(text) {
        return all(/\S—\S/g, text);
      },
    },

    {
      id: "PONT-54", categoria: "aspas retas no lugar de aspas tipográficas",
      fonte: "Moreno 'Guia prático' p. 141; norma editorial brasileira",
      criterio: "Em texto literário e editorial, prefere-se aspas curvas (“texto”) às aspas retas (\"texto\").",
      exemplo: "“Ela sorriu.”",
      contraexemplo: "\"Ela sorriu.\"",
      acao: "Substitua as aspas retas (\") por aspas curvas tipográficas (“ ”).",
      severity: "baixa",
      detect(text) {
        return all(/"[^"\n]{2,}"/g, text);
      },
    },

    {
      id: "PONT-55", categoria: "espaço antes de vírgula ou ponto e vírgula",
      fonte: "Bechara § 599; norma editorial brasileira",
      criterio: "Em português brasileiro, não se usa espaço antes de vírgula ou ponto e vírgula. O espaço pertence ao elemento seguinte.",
      exemplo: "Ela sorriu, saiu.",
      contraexemplo: "Ela sorriu , saiu.",
      acao: "Remova o espaço antes da vírgula ou do ponto e vírgula.",
      severity: "baixa",
      detect(text) {
        return all(/ [,;]/g, text);
      },
    },

  ];

  // ── REGRAS VIA PADRÃO TEXTUAL AVANÇADO (desbloqueadas pelo syntax-engine) ──

  const RULES_SYNTAX = [

    {
      id: "PONT-18", categoria: "vírgula obrigatória — oração adjetiva explicativa",
      fonte: "Bechara § 623 (g); Moreno p. 79; Cunha & Cintra p. 655",
      criterio: "Oração adjetiva explicativa (referência ao conjunto todo) exige vírgula antes de 'que'.",
      exemplo: "As baleias, que têm sangue quente, precisam respirar.",
      contraexemplo: "As baleias que têm sangue quente precisam respirar. [quando sentido é explicativo]",
      acao: "Adicione vírgula antes de 'que' se a oração se refere ao conjunto inteiro do antecedente.",
      severity: "alta",
      detect(text) {
        const issues = [];
        const re = /\b([A-ZÁÉÍÓÚ][a-záàâãéèêíîóòôõúùûç]{2,}(?:\s+[A-ZÁÉÍÓÚ][a-záàâãéèêíîóòôõúùûç]+)*)\s+que\b/g;
        let m;
        while ((m = re.exec(text)) !== null) {
          const before = text.slice(Math.max(0, m.index - 3), m.index);
          if (before.includes(",")) continue;
          if (/^(um|uma|o|a|os|as|seu|sua|meu|minha)\s/.test(m[1].toLowerCase())) continue;
          // Nome próprio simples (sem espaço) — ambíguo demais para marcar com segurança
          if (!/\s/.test(m[1])) continue;
          issues.push({ fragment: m[0].trim(), pos: m.index });
        }
        const reUniv = /\b(todos os|todas as|ambos os|ambas as)\s+[a-záàâãéèêíîóòôõúùûç]+\s+que\b/g;
        while ((m = reUniv.exec(text)) !== null) {
          if (!text.slice(Math.max(0, m.index - 2), m.index).includes(","))
            issues.push({ fragment: m[0].trim(), pos: m.index });
        }
        return issues;
      },
    },

    {
      id: "PONT-19", categoria: "vírgula proibida — oração adjetiva restritiva",
      fonte: "Bechara (conclusão); Moreno p. 79; Cunha & Cintra p. 655",
      criterio: "Oração adjetiva restritiva (delimita o antecedente) não leva vírgula antes de 'que'.",
      exemplo: "Os políticos que são corruptos deveriam perder o mandato.",
      contraexemplo: "Os políticos, que são corruptos, deveriam perder o mandato. [quando sentido é restritivo]",
      acao: "Remova a vírgula antes de 'que' se a oração restringe e identifica o antecedente.",
      severity: "alta",
      detect(text) {
        return all(/\b(um|uma)\s+[a-záàâãéèêíîóòôõúùûç]{3,},\s+que\b/g, text);
      },
    },

    {
      id: "PONT-44", categoria: "vírgula obrigatória — aposto explicativo sem isolamento",
      fonte: "Bechara § 626; Cunha & Cintra p. 659; Moreno p. 94",
      criterio: "Aposto explicativo (nome + descrição) é isolado por vírgulas.",
      exemplo: "Pedro, meu amigo, chegou tarde.",
      contraexemplo: "Pedro meu amigo chegou tarde.",
      acao: "Isole o aposto com vírgulas dos dois lados: 'Pedro, meu amigo, chegou.'",
      severity: "média",
      detect(text) {
        return all(/\b([A-ZÁÉÍÓÚ][a-záàâãéèêíîóòôõúùûç]{2,})\s+(meu|minha|seu|sua|nosso|nossa|o|a)\s+[a-záàâãéèêíîóòôõúùûç]{3,}\b(?!,)/g, text)
          .filter(i => !i.fragment.includes(","));
      },
    },

    {
      id: "PONT-45", categoria: "concordância verbal — sujeito plural + verbo singular",
      fonte: "Bechara Lições §concordância verbal; Cunha & Cintra cap.6",
      criterio: "Sujeito plural exige verbo na mesma pessoa e número.",
      exemplo: "Eles chegaram tarde.",
      contraexemplo: "Eles chegou tarde.",
      acao: "Coloque o verbo no plural para concordar com o sujeito: 'Eles chegaram.'",
      severity: "alta",
      detect(text) {
        const issues = [];
        const re = /\b(eles|elas|vocês|todos|todas)\s+([a-záàâãéèêíîóòôõúùûç]+(ou|eu|iu))\b/gi;
        let m;
        while ((m = re.exec(text)) !== null) {
          issues.push({ fragment: m[0].trim(), pos: m.index });
        }
        const reNos = /\bnós\s+([a-záàâãéèêíîóòôõúùûç]+(ou|eu|iu))\b/gi;
        while ((m = reNos.exec(text)) !== null) {
          issues.push({ fragment: m[0].trim(), pos: m.index });
        }
        return issues;
      },
    },

    {
      id: "PONT-48", categoria: "voz passiva analítica — agente sem preposição 'por'",
      fonte: "Bechara Lições §voz passiva; Cunha & Cintra cap.7",
      criterio: "O agente da passiva é introduzido pela preposição 'por' (pelo/pela/pelos/pelas). Não usar 'de' como agente em voz passiva de ação.",
      exemplo: "O romance foi escrito por Machado.",
      contraexemplo: "O romance foi escrito de Machado.",
      acao: "Substitua 'de' por 'por/pelo/pela' como preposição do agente da passiva.",
      severity: "média",
      detect(text) {
        return all(/\b(foi|foram|é|são|era|eram|será|serão)\s+\w+(ado|ada|idos|idas|ito|ita|tos|tas|to|ta)\s+de\s+(?!acordo|forma|modo|maneira|jeito)/g, text);
      },
    },

    {
      id: "PONT-49", categoria: "vírgula obrigatória — 'mas' adversativo sem vírgula",
      fonte: "Bechara § 623 (b); Moreno p. 42; Cunha & Cintra p. 657",
      criterio: "A conjunção adversativa 'mas' ligando orações coordenadas exige vírgula antes.",
      exemplo: "Ela tentou, mas não conseguiu.",
      contraexemplo: "Ela tentou mas não conseguiu.",
      acao: "Adicione vírgula antes de 'mas': 'tentou, mas não conseguiu.'",
      severity: "alta",
      detect(text) {
        const issues = [];
        const re = /\b([a-záàâãéèêíîóòôõúùûç]{3,})\s+mas\s+(?!sim\b)/gi;
        let m;
        while ((m = re.exec(text)) !== null) {
          const before = text.slice(Math.max(0, m.index - 2), m.index + m[1].length);
          if (!before.endsWith(",")) {
            issues.push({ fragment: m[0].trim().slice(0, 80), pos: m.index });
          }
        }
        return issues;
      },
    },

    {
      id: "PONT-47", categoria: "vírgula obrigatória — conjunção 'e' entre orações longas com sujeitos diferentes",
      fonte: "Bechara § 623 (b); Moreno p. 44; Cunha & Cintra p. 658",
      criterio: "A conjunção 'e' ligando orações com sujeitos diferentes pede vírgula antes para evitar ambiguidade.",
      exemplo: "Os Estados Unidos atacaram o Iraque, e a Rússia reagiu imediatamente.",
      contraexemplo: "Os Estados Unidos atacaram o Iraque e a Rússia reagiu imediatamente.",
      acao: "Adicione vírgula antes de 'e' quando os sujeitos são diferentes nas duas orações.",
      severity: "média",
      detect(text) {
        const issues = [];
        const re = /\b(chegou|saiu|voltou|entrou|fugiu|correu|falou|disse|respondeu|escreveu|publicou|criou|tentou|conseguiu|percebeu|descobriu)\s+e\s+(ele|ela|eles|elas|eu|nós|você|vocês)\s/gi;
        let m;
        while ((m = re.exec(text)) !== null) {
          const before = text.slice(Math.max(0, m.index - 2), m.index);
          if (!before.endsWith(",")) issues.push({ fragment: m[0].trim().slice(0, 80), pos: m.index });
        }
        return issues;
      },
    },

  ];

  // ── Severidade inline por regra ──────────────────────────────────────────
  const ALL_RULES = [...RULES, ...RULES_SYNTAX];
  const SEVERITY_MAP = Object.fromEntries(ALL_RULES.map(r => [r.id, r.severity || "média"]));

  function analyze(text) {
    if (!text?.trim()) return { issues: [], ruleCount: ALL_RULES.length, resumo: { alta: 0, media: 0, baixa: 0 } };
    if (text.trim().split(/\s+/).length < 10) return { issues: [], ruleCount: ALL_RULES.length, resumo: { alta: 0, media: 0, baixa: 0 } };
    const issues = [];
    for (const rule of ALL_RULES) {
      try {
        for (const issue of rule.detect(text)) {
          issues.push({
            ruleId: rule.id, categoria: rule.categoria, fonte: rule.fonte,
            criterio: rule.criterio, exemplo: rule.exemplo, acao: rule.acao || "",
            fragment: issue.fragment, pos: issue.pos ?? -1,
            severity: SEVERITY_MAP[rule.id],
          });
        }
      } catch (_) { /* regex falhou — ignorar */ }
    }
    const resumo = {
      alta:  issues.filter(i => i.severity === "alta").length,
      media: issues.filter(i => i.severity === "média").length,
      baixa: issues.filter(i => i.severity === "baixa").length,
    };
    return { issues, ruleCount: ALL_RULES.length, resumo };
  }

  // ── analyzeDeep — usa syntax-engine quando disponível ────────────────────
  // Bechara Lições §concordância; Cunha & Cintra cap.6 §concordância
  async function analyzeDeep(text) {
    const base = analyze(text);
    if (!global.syntaxEngine?._isReady()) return base;

    const sentences = text.split(/[.!?]+\s+/).filter(Boolean);
    const syntaxIssues = [];

    for (const sent of sentences) {
      try {
        const { resumo } = global.syntaxEngine.analisarPeriodo(sent);

        // Concordância verbal
        for (const alerta of (resumo.alertas || [])) {
          if (alerta) syntaxIssues.push({
            ruleId: "PONT-SYNT-01", categoria: "concordância verbal",
            fonte: "syntax-engine + Bechara Lições",
            criterio: alerta.descricao,
            exemplo: "Os meninos chegaram cedo.",
            acao: "Corrija a concordância verbal para que sujeito e verbo concordem em número e pessoa.",
            fragment: sent.slice(0, 80), pos: text.indexOf(sent),
            severity: "alta",
          });
        }

        // Aposto sem vírgula (detectarApostos)
        for (const aposto of (resumo.apostos || [])) {
          const full = `${aposto.antecedente} ${aposto.aposto}`;
          if (!text.slice(text.indexOf(aposto.antecedente), text.indexOf(aposto.antecedente) + full.length + 5).includes(",")) {
            syntaxIssues.push({
              ruleId: "PONT-SYNT-02", categoria: "aposto explicativo sem vírgula",
              fonte: "syntax-engine + Bechara § 626",
              criterio: "Aposto explicativo isolado por vírgulas.",
              exemplo: `${aposto.antecedente}, ${aposto.aposto}`,
              acao: "Isole o aposto com vírgulas dos dois lados.",
              fragment: full, pos: aposto.pos ?? text.indexOf(sent),
              severity: "média",
            });
          }
        }
      } catch (_) {}
    }

    const allIssues = [...base.issues, ...syntaxIssues];
    const resumo = {
      alta:  allIssues.filter(i => i.severity === "alta").length,
      media: allIssues.filter(i => i.severity === "média").length,
      baixa: allIssues.filter(i => i.severity === "baixa").length,
    };
    return {
      issues: allIssues,
      ruleCount: ALL_RULES.length + 2,
      resumo,
    };
  }

  function getRules() {
    return ALL_RULES.map(({ id, categoria, fonte, criterio, exemplo, contraexemplo, acao, severity }) =>
      ({ id, categoria, fonte, criterio, exemplo, contraexemplo, acao, severity }));
  }

  global.VeredaPunctuation = { analyze, analyzeDeep, getRules };

}(typeof window !== "undefined" ? window : global));
