(function (root) {
  'use strict';
  root.Escr.poetryData = {
    version: '2.1.0',
    source: { title: 'RimaLab recebido: contagem até a última tônica. Divisão gráfica: Acordo Ortográfico, Base XX. A escansão é uma hipótese local de leitura.', url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/decreto/d6583.htm' },
    sourceFileSha256: 'abda0addc23fb4baf44f01e8b3e9a179c24b684879d0dfd3723559e7899ff373',
    inseparable: ['br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr', 'vr', 'bl', 'cl', 'fl', 'gl', 'pl', 'tl', 'ch', 'lh', 'nh', 'qu', 'gu'],
    diphthongs: ['ai', 'ei', 'oi', 'ui', 'au', 'eu', 'ou', 'ãe', 'ão', 'õe'],
    readings: {
      'água': ['á', 'gua'], 'águas': ['á', 'guas'], 'mágoa': ['má', 'goa'],
      'pátria': ['pá', 'tria'], 'glória': ['gló', 'ria'], 'série': ['sé', 'rie'],
      'história': ['his', 'tó', 'ria'], 'vitória': ['vi', 'tó', 'ria'], 'memória': ['me', 'mó', 'ria'],
      'silêncio': ['si', 'lên', 'cio'], 'mistério': ['mis', 'té', 'rio'], 'diário': ['di', 'á', 'rio'],
      'solitário': ['so', 'li', 'tá', 'rio'], 'solitária': ['so', 'li', 'tá', 'ria'],
      'poesia': ['po', 'e', 'si', 'a'], 'poeta': ['po', 'e', 'ta'], 'poema': ['po', 'e', 'ma'],
      'lua': ['lu', 'a'], 'luas': ['lu', 'as'], 'rua': ['ru', 'a'], 'ruas': ['ru', 'as'],
      'rio': ['ri', 'o'], 'rios': ['ri', 'os'], 'frio': ['fri', 'o'], 'fria': ['fri', 'a'],
      'país': ['pa', 'ís'], 'países': ['pa', 'í', 'ses'], 'raiz': ['ra', 'iz'], 'raízes': ['ra', 'í', 'zes'],
      'saída': ['sa', 'í', 'da'], 'caída': ['ca', 'í', 'da'], 'voar': ['vo', 'ar'],
      'suave': ['su', 'a', 've'], 'viagem': ['vi', 'a', 'gem'], 'ciúme': ['ci', 'ú', 'me'],
      'mãe': ['mãe'], 'mães': ['mães'], 'pão': ['pão'], 'pães': ['pães'],
      'coração': ['co', 'ra', 'ção'], 'solidão': ['so', 'li', 'dão'], 'canção': ['can', 'ção'],
      'noite': ['noi', 'te'], 'noites': ['noi', 'tes'],
      'caiu': ['ca', 'iu'], 'saiu': ['sa', 'iu'], 'ruim': ['ru', 'im'],
      'gratuito': ['gra', 'tui', 'to'], 'saudade': ['sau', 'da', 'de'],
      'muito': ['mui', 'to'], 'muita': ['mui', 'ta'], 'herói': ['he', 'rói'],
      'heróis': ['he', 'róis'], 'ideia': ['i', 'dei', 'a'], 'assembleia': ['as', 'sem', 'blei', 'a'],
      'quaisquer': ['quais', 'quer'], 'quieto': ['qui', 'e', 'to'], 'linguiça': ['lin', 'gui', 'ça']
    },
    names: {
      '1': 'monossílabo', '2': 'dissílabo', '3': 'trissílabo', '4': 'tetrassílabo',
      '5': 'redondilha menor', '6': 'hexassílabo', '7': 'redondilha maior',
      '8': 'octossílabo', '9': 'eneassílabo', '10': 'decassílabo',
      '11': 'hendecassílabo', '12': 'alexandrino'
    },
    limit: 'A fala pode reunir ou separar vogais de outra maneira. Diérese, sinérese, dialeto e intenção podem levar a medidas fora deste intervalo. Não há reconhecimento fonético.'
  };
}(typeof window !== 'undefined' ? window : this));
