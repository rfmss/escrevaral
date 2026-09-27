(function (root) {
  'use strict';
  root.Escr.poetryData = {
    version: '2.0.0',
    source: { title: 'RimaLab recebido: contagem até a última tônica. Divisão gráfica: Acordo Ortográfico, Base XX. A escansão é uma hipótese local de leitura.', url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/decreto/d6583.htm' },
    sourceFileSha256: 'abda0addc23fb4baf44f01e8b3e9a179c24b684879d0dfd3723559e7899ff373',
    inseparable: ['br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr', 'vr', 'bl', 'cl', 'fl', 'gl', 'pl', 'tl', 'ch', 'lh', 'nh', 'qu', 'gu'],
    diphthongs: ['ai', 'ei', 'oi', 'ui', 'au', 'eu', 'ou', 'ãe', 'ão', 'õe'],
    readings: {
      'água': ['á', 'gua'], 'águas': ['á', 'guas'], 'mágoa': ['má', 'goa'],
      'pátria': ['pá', 'tria'], 'glória': ['gló', 'ria'], 'série': ['sé', 'rie'],
      'história': ['his', 'tó', 'ria'], 'vitória': ['vi', 'tó', 'ria'], 'memória': ['me', 'mó', 'ria'],
      'caiu': ['ca', 'iu'], 'saiu': ['sa', 'iu'], 'ruim': ['ru', 'im'],
      'gratuito': ['gra', 'tui', 'to'], 'saudade': ['sau', 'da', 'de'],
      'muito': ['mui', 'to'], 'muita': ['mui', 'ta'], 'herói': ['he', 'rói'],
      'heróis': ['he', 'róis'], 'ideia': ['i', 'dei', 'a'], 'assembleia': ['as', 'sem', 'blei', 'a'],
      'quaisquer': ['quais', 'quer'], 'quieto': ['qui', 'e', 'to'], 'linguiça': ['lin', 'gui', 'ça']
    },
    names: { '5': 'redondilha menor', '7': 'redondilha maior', '10': 'decassílabo', '12': 'dodecassílabo' },
    limit: 'A fala pode reunir ou separar vogais de outra maneira. Diérese, sinérese, dialeto e intenção podem levar a medidas fora deste intervalo. Não há reconhecimento fonético.'
  };
}(typeof window !== 'undefined' ? window : this));
