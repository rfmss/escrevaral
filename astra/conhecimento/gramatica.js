(function (root) {
  'use strict';
  root.Escr.grammarData = {
    version: '2.0.0',
    classes: {
      substantivo: ['casa', 'casas', 'livro', 'livros', 'menina', 'meninas', 'menino', 'meninos', 'mulher', 'mulheres', 'homem', 'homens', 'escritora', 'escritoras', 'escritor', 'escritores', 'poema', 'poemas', 'carta', 'cartas', 'porta', 'portas', 'revista', 'revistas', 'opinião', 'opiniões', 'canto', 'cantos', 'rosa', 'rosas', 'flor', 'flores', 'água', 'águas', 'mar', 'mesa', 'mesas', 'pão', 'pães', 'ana', 'maria', 'joão', 'pedro', 'silêncio', 'silêncios', 'tempo', 'tempos', 'fogo', 'vida', 'vidas', 'música', 'notícia', 'família', 'dia', 'noite', 'vento'],
      artigo: ['o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas'],
      adjetivo: ['bonito', 'bonita', 'bonitos', 'bonitas', 'velho', 'velha', 'velhos', 'velhas', 'novo', 'nova', 'novos', 'novas', 'largo', 'larga', 'largos', 'largas', 'público', 'pública', 'públicos', 'públicas', 'aberto', 'aberta', 'abertos', 'abertas', 'feliz', 'felizes', 'triste', 'tristes', 'seco', 'seca', 'secos', 'secas', 'claro', 'clara', 'claros', 'claras', 'são', 'leve', 'leves'],
      pronome: ['eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'você', 'vocês', 'me', 'te', 'se', 'nos', 'vos', 'lhe', 'lhes', 'mim', 'ti', 'si', 'o', 'a', 'os', 'as', 'que', 'quem', 'qual', 'quais', 'este', 'esta', 'esse', 'essa', 'aquele', 'aquela', 'isto', 'isso', 'aquilo', 'meu', 'minha', 'seu', 'sua', 'nosso', 'nossa'],
      advérbio: ['hoje', 'ontem', 'amanhã', 'aqui', 'ali', 'lá', 'cedo', 'tarde', 'não', 'nunca', 'jamais', 'sempre', 'talvez', 'lentamente', 'rapidamente', 'muito', 'pouco', 'bem', 'mal', 'como'],
      preposição: ['a', 'de', 'em', 'por', 'para', 'com', 'sem', 'sobre', 'sob', 'entre', 'até', 'após', 'ante', 'contra', 'desde', 'perante'],
      conjunção: ['e', 'mas', 'ou', 'nem', 'porque', 'embora', 'quando', 'enquanto', 'se', 'que', 'como', 'pois'],
      interjeição: ['ah', 'oh', 'oba', 'ufa', 'ai', 'ei', 'uai', 'oxente', 'nossa'],
      numeral: ['um', 'uma', 'dois', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'cem', 'mil', 'primeiro', 'primeira', 'segundo', 'segunda', 'terceiro', 'terceira']
    },
    ambiguousVerbs: { 'canto': 'cantar', 'seca': 'secar', 'larga': 'largar', 'leve': 'levar', 'revista': 'revistar' },
    nonFinite: ['cantar', 'amar', 'escrever', 'ler', 'publicar', 'andar', 'correr', 'partir', 'sair', 'ser', 'estar', 'ter', 'pôr', 'cantando', 'amando', 'escrevendo', 'lendo', 'sendo', 'cantado', 'amado', 'escrito', 'lido'],
    subjectPronouns: ['eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'você', 'vocês'],
    directVerbs: ['amar', 'comprar', 'ler', 'escrever', 'publicar', 'ver', 'abrir', 'cortar', 'encontrar', 'trazer'],
    intransitiveVerbs: ['cantar', 'andar', 'correr', 'sair', 'partir', 'trabalhar'],
    linkingVerbs: ['ser', 'estar'],
    finalAdverbs: ['hoje', 'ontem', 'amanhã', 'aqui', 'ali', 'lá', 'cedo', 'tarde', 'lentamente', 'rapidamente'],
    source: { title: 'Recorte escolar de classes e construção simples. Paradigmas do cofre recebido e léxico local testado; calibração bibliográfica individual ainda pendente.', url: null },
    bibliography: [
      { author: 'Evanildo Bechara', title: 'Lições de Português pela Análise Sintática', editionClaimedByArchive: '20ª ed., 2018', status: 'Referência declarada em syntax-data.json; páginas e correspondência regra a regra não verificadas.' },
      { author: 'Celso Cunha e Lindley Cintra', title: 'Nova Gramática do Português Contemporâneo', editionClaimedByArchive: '7ª ed., 2017', status: 'Referência declarada em syntax-data.json; páginas e correspondência regra a regra não verificadas.' },
      { author: 'Antenor Nascentes', title: null, status: 'Obra e edição a definir. Nenhuma regra é atribuída ao autor nesta entrega.' }
    ]
  };
}(typeof window !== 'undefined' ? window : this));
