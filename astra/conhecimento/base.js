(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  root.Escr.knowledge = {
    version: '3.0.0',
    sources: {
      lexical: { title: 'ABL — Vocabulário Ortográfico (referência de conferência; base não incorporada)', url: 'https://www.academia.org.br/nossa-lingua/busca-no-vocabulario' },
      accent: { title: 'Acordo Ortográfico de 1990, Base VIII (oxítonas)', url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/decreto/d6583.htm' },
      mechanical: { title: 'Convenção mecânica editorial local, versão 1 — não é juízo gramatical', url: null }
    },
    rules: [
      { id: 'PTBR-ORT-001', lens: 'ortografia', confidence: 'moderada', severity: 'aviso', source: 'lexical',
        title: 'Uma grafia para conferir',
        forms: { 'excessão': 'exceção', 'excessões': 'exceções', 'concerteza': 'com certeza', 'derrepente': 'de repente', 'impecilho': 'empecilho', 'previlégio': 'privilégio' },
        observation: 'O trecho coincide exatamente com uma entrada da lista local de grafias para conferir.',
        interpretation: 'Na escrita convencional, a forma de referência é',
        ambiguity: 'Pode ser invenção, nome, citação sem aspas ou registro intencional de fala.',
        limit: 'Lista artesanal de seis entradas; não é um dicionário. Palavras desconhecidas ficam sem diagnóstico.' },
      { id: 'PTBR-ACE-001', lens: 'acentuacao', confidence: 'moderada', severity: 'aviso', source: 'accent',
        title: 'Um acento para conferir',
        forms: { 'voce': 'você', 'voces': 'vocês', 'tambem': 'também', 'ninguem': 'ninguém', 'alguem': 'alguém', 'atraves': 'através' },
        observation: 'O trecho coincide com uma das seis formas sem acento da lista local.',
        interpretation: 'Se esta é a palavra pretendida, a forma acentuada é',
        ambiguity: 'Pode ser outra língua, nome ou uma escolha gráfica. A intenção não pode ser inferida.',
        limit: 'Não resolve pares como pode/pôde, por/pôr, esta/está ou pais/país; não interpreta a sintaxe.' },
      { id: 'PTBR-PON-001', lens: 'pontuacao', confidence: 'alta', severity: 'informação', source: 'mechanical',
        title: 'Vírgulas consecutivas', pattern: ',{2,}',
        observation: 'Há duas ou mais vírgulas consecutivas.',
        interpretation: 'Pode haver uma tecla repetida.',
        ambiguity: 'A repetição também pode ser um recurso gráfico deliberado.',
        limit: 'A certeza é sobre a sequência de sinais, não sobre a intenção. Não determina onde cabe uma vírgula.' },
      { id: 'PTBR-PON-002', lens: 'pontuacao', confidence: 'alta', severity: 'informação', source: 'mechanical',
        title: 'Pontos e vírgulas consecutivos', pattern: ';{2,}',
        observation: 'Há dois ou mais pontos e vírgulas consecutivos.',
        interpretation: 'Pode haver uma tecla repetida.',
        ambiguity: 'A sequência pode ter intenção visual ou pertencer a uma notação.',
        limit: 'Não avalia estilo, reticências, exclamações ou interrogações repetidas.' }
    ]
  };
}(typeof window !== 'undefined' ? window : this));
