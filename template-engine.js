(function templateEngine(global) {
  let _oficios   = [];
  let _templates = [];
  let _loaded    = false;
  let _loadError = false;

  async function ensureLoaded() {
    if (_loaded || _loadError) return;
    try {
      const data  = await fetch('templates-data.json').then(r => r.json());
      _oficios    = data.oficios   || [];
      _templates  = data.templates || [];
      _loaded     = true;
    } catch (_) {
      _loadError = true;
    }
  }

  // Carregar imediatamente — não bloqueia, resolve antes da interação
  const _ready = ensureLoaded();

  function listTemplates(options = {}) {
    return _templates
      .filter(t => !options.oficio || t.oficio === options.oficio)
      .map(({ id, oficio, label, icon, title, description, steps }) => ({ id, oficio, label, icon, title, description, stepCount: steps?.length || 1 }));
  }

  function listOficios() {
    return _oficios.map(o => ({
      ...o,
      count: _templates.filter(t => t.oficio === o.id).length,
    }));
  }

  function getTemplate(templateId) {
    if (!templateId) return null;
    return _templates.find(t => t.id === templateId) || null;
  }

  function getStep(templateId, stepIndex) {
    const template = getTemplate(templateId);
    if (!template?.steps?.length) return null;
    const index = Math.min(Math.max(Number(stepIndex) || 0, 0), template.steps.length - 1);
    return { ...template.steps[index], index, total: template.steps.length };
  }

  function createManuscript(templateId, options = {}) {
    const template = getTemplate(templateId);
    if (!template) return null;
    return {
      id:          options.id    || `manuscrito-${Date.now()}`,
      title:       options.title || "",
      text:        template.text,
      kind:        template.kind,
      status:      "Em escrita",
      chapter:     template.chapter,
      progress:    0,
      description: template.description,
      templateId:  template.id,
    };
  }

  global.VeredaTemplates = {
    ensureLoaded,
    isLoaded:        () => _loaded,
    hasLoadError:    () => _loadError,
    ready:           () => _ready,
    createManuscript,
    getStep,
    getTemplate,
    listOficios,
    listTemplates,
  };
})(window);
