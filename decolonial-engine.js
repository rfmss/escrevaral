(function decolonialEngine(global) {
  let categories = {};
  let entries = [];
  let _loaded = false;
  let _loadError = false;

  async function ensureLoaded() {
    if (_loaded || _loadError) return;
    try {
      const data = await fetch('decolonial-data.json').then(r => r.json());
      categories = data.categories || {};
      entries    = data.entries    || [];
      _loaded = true;
    } catch (_) {
      _loadError = true;
    }
  }

  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function createTermPattern(term) {
    return new RegExp("(^|[^\\p{L}\\p{N}_])(" + escapeRegExp(term) + ")(?=$|[^\\p{L}\\p{N}_])", "giu");
  }

  function countTerm(text, term) {
    const pattern = createTermPattern(term);
    let count = 0;
    while (pattern.exec(text)) count++;
    return count;
  }

  function withCategoryLabel(entry) {
    return { ...entry, categoryLabel: categories[entry.category]?.label || entry.category };
  }

  function listCategories() {
    return Object.entries(categories).map(([id, category]) => ({
      id, ...category,
      count: entries.filter(e => e.category === id).length,
    }));
  }

  function listEntries(options = {}) {
    const query = normalize(options.query);
    const category = options.category || "all";
    const filtered = entries
      .filter(entry => {
        const matchesCategory = category === "all" || entry.category === category;
        const haystack = normalize([entry.avoid, ...entry.alternatives, entry.reason, entry.context, categories[entry.category]?.label].join(" "));
        return matchesCategory && (!query || haystack.includes(query));
      })
      .map(withCategoryLabel);

    if (!query) return filtered;

    // Rank by relevance when searching: avoid exact > avoid starts > avoid includes > alternatives > rest
    return filtered.map(entry => {
      const av = normalize(entry.avoid);
      const score = av === query ? 4 : av.startsWith(query) ? 3 : av.includes(query) ? 2
        : entry.alternatives.some(a => normalize(a).includes(query)) ? 1 : 0;
      return { ...entry, _score: score };
    }).sort((a, b) => b._score - a._score);
  }

  function detectText(text, options = {}) {
    const category = options.category || "all";
    const source = String(text || "");
    if (!source.trim()) return [];
    return entries
      .filter(entry => category === "all" || entry.category === category)
      .map(entry => ({ ...withCategoryLabel(entry), count: countTerm(source, entry.avoid) }))
      .filter(entry => entry.count > 0);
  }

  // Carregar imediatamente — não bloqueia, resolve antes da interação
  ensureLoaded();

  global.VeredaDecolonial = {
    ensureLoaded,
    listCategories,
    listEntries,
    detectText,
    isLoaded:     () => _loaded,
    hasLoadError: () => _loadError,
  };
})(window);
