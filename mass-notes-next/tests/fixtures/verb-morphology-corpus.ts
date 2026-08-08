export type VerbMorphologyCase = {
  id: string
  manuscript: string
  query: string
  expected: string[]
}

export const REGULAR_VERB_CASES: VerbMorphologyCase[] = [
  {
    id: 'presente-1s',
    manuscript: 'Eu canto toda manhã.',
    query: 'canto',
    expected: ['cantar', 'Presente do indicativo', '1ª pessoa do singular'],
  },
  {
    id: 'imperfeito-1p',
    manuscript: 'Nós cantávamos juntos depois do trabalho.',
    query: 'cantávamos',
    expected: ['cantar', 'Pretérito imperfeito do indicativo', '1ª pessoa do plural'],
  },
  {
    id: 'futuro-1s',
    manuscript: 'Amanhã eu cantarei na varanda.',
    query: 'cantarei',
    expected: ['cantar', 'Futuro do presente do indicativo', '1ª pessoa do singular'],
  },
  {
    id: 'condicional-1s',
    manuscript: 'Eu cantaria com mais tempo.',
    query: 'cantaria',
    expected: ['cantar', 'Futuro do pretérito do indicativo', '1ª pessoa do singular'],
  },
  {
    id: 'subjuntivo-presente',
    manuscript: 'Talvez eu cante antes do amanhecer.',
    query: 'cante',
    expected: ['cantar', 'Presente do subjuntivo', '1ª pessoa do singular'],
  },
  {
    id: 'subjuntivo-imperfeito',
    manuscript: 'Se nós cantássemos, a sala mudaria.',
    query: 'cantássemos',
    expected: ['cantar', 'Pretérito imperfeito do subjuntivo', '1ª pessoa do plural'],
  },
  {
    id: 'subjuntivo-futuro',
    manuscript: 'Quando eles cantarem, abriremos a janela.',
    query: 'cantarem',
    expected: ['cantar', 'Futuro do subjuntivo', '3ª pessoa do plural'],
  },
  {
    id: 'infinitivo',
    manuscript: 'É melhor cantar com a própria voz.',
    query: 'cantar',
    expected: ['cantar', 'Infinitivo'],
  },
  {
    id: 'infinitivo-pessoal',
    manuscript: 'Para cantarmos juntos, precisamos respirar.',
    query: 'cantarmos',
    expected: ['cantar', 'Infinitivo pessoal', '1ª pessoa do plural'],
  },
  {
    id: 'gerundio',
    manuscript: 'Ela segue cantando enquanto escreve.',
    query: 'cantando',
    expected: ['cantar', 'Gerúndio'],
  },
  {
    id: 'participio',
    manuscript: 'O verso cantado permaneceu na memória.',
    query: 'cantado',
    expected: ['cantar', 'Particípio'],
  },
]

export const IRREGULAR_AND_CLITIC_CASES: VerbMorphologyCase[] = [
  {
    id: 'irregular-saber',
    manuscript: 'Eu sabia a resposta desde ontem.',
    query: 'sabia',
    expected: ['saber', 'Pretérito imperfeito do indicativo', '1ª pessoa do singular'],
  },
  {
    id: 'irregular-fazer',
    manuscript: 'Amanhã eu farei a revisão final.',
    query: 'farei',
    expected: ['fazer', 'Futuro do presente do indicativo', '1ª pessoa do singular'],
  },
  {
    id: 'irregular-ambiguo-ser-ir',
    manuscript: 'Eu fui até a praça.',
    query: 'fui',
    expected: ['Ambíguo', 'ser', 'ir', 'Pretérito perfeito do indicativo'],
  },
  {
    id: 'mesoclise-piloto-informal',
    manuscript: 'Amanhã varre-lo-ei antes da visita.',
    query: 'varre-lo-ei',
    expected: ['varrer', 'Futuro do presente do indicativo', 'Mesóclise', 'varrê-lo-ei', 'varrer + o + ei', 'eu o varrerei', 'eu vou varrê-lo'],
  },
  {
    id: 'mesoclise-condicional',
    manuscript: 'Com ajuda, carregá-lo-ia até a varanda.',
    query: 'carregá-lo-ia',
    expected: ['carregar', 'Futuro do pretérito do indicativo', 'Mesóclise', 'carregá-lo-ia', 'carregar + o + ia', 'Ambíguo'],
  },
  {
    id: 'enclise-infinitivo',
    manuscript: 'Quero fazê-lo agora, sem demora.',
    query: 'fazê-lo',
    expected: ['fazer', 'Infinitivo', 'Ênclise', 'fazer + o'],
  },
  {
    id: 'enclise-irregular-finita',
    manuscript: 'Ele disse-me a verdade.',
    query: 'disse-me',
    expected: ['dizer', 'Pretérito perfeito do indicativo', '3ª pessoa do singular', 'Ênclise'],
  },
  {
    id: 'enclise-nasal',
    manuscript: 'Eles puseram-no sobre a mesa.',
    query: 'puseram-no',
    expected: ['pôr', 'Pretérito perfeito do indicativo', '3ª pessoa do plural', 'Ênclise', 'terminada em som nasal'],
  },
  {
    id: 'proclise-negativa',
    manuscript: 'Não me diga isso novamente.',
    query: 'não me diga',
    expected: ['dizer', 'Imperativo negativo', 'Próclise', '3ª pessoa do singular'],
  },
  {
    id: 'proclise-objeto',
    manuscript: 'Eu o vi ontem na praça.',
    query: 'o vi',
    expected: ['ver', 'Pretérito perfeito do indicativo', 'Próclise', '1ª pessoa do singular'],
  },
  {
    id: 'proclise-reflexiva',
    manuscript: 'Ela se lembra daquele verão.',
    query: 'se lembra',
    expected: ['lembrar', 'Presente do indicativo', 'Próclise', '3ª pessoa do singular'],
  },
]

export const COMPOUND_VERB_CASES: VerbMorphologyCase[] = [
  {
    id: 'mais-que-perfeito-composto',
    manuscript: 'Ela tinha cantado antes da chuva.',
    query: 'tinha cantado',
    expected: ['cantar', 'Pretérito mais-que-perfeito composto', 'Locução verbal', 'Tempo composto'],
  },
  {
    id: 'futuro-composto',
    manuscript: 'Ela terá cantado até o fim da noite.',
    query: 'terá cantado',
    expected: ['cantar', 'Futuro do presente composto', 'Locução verbal'],
  },
  {
    id: 'futuro-perifrastico',
    manuscript: 'Ela vai cantar depois do intervalo.',
    query: 'vai cantar',
    expected: ['cantar', 'Futuro perifrástico', 'Locução verbal', 'Valor prospectivo'],
  },
  {
    id: 'progressivo',
    manuscript: 'Ela estava cantando quando chegamos.',
    query: 'estava cantando',
    expected: ['cantar', 'Pretérito imperfeito progressivo', 'Locução verbal', 'Aspecto progressivo'],
  },
  {
    id: 'passiva',
    manuscript: 'A canção foi cantada pela comunidade.',
    query: 'foi cantada',
    expected: ['cantar', 'Construção passiva', 'Voz', 'Passiva'],
  },
  {
    id: 'composta-passiva',
    manuscript: 'Ela teria sido carregada até a casa.',
    query: 'teria sido carregada',
    expected: ['carregar', 'Futuro do pretérito composto', 'Passiva', 'Tempo composto em voz passiva'],
  },
]

export const NEGATIVE_VERB_CASES: Array<{ id: string; manuscript: string; query: string }> = [
  { id: 'canto-substantivo', manuscript: 'O canto da sala é escuro.', query: 'canto' },
  { id: 'sabia-adjetivo', manuscript: 'A mulher sábia respondeu com calma.', query: 'sábia' },
  { id: 'larga-adjetivo', manuscript: 'A estrada larga cortava o vale.', query: 'larga' },
  { id: 'publica-adjetivo', manuscript: 'A instituição pública local abriu as portas.', query: 'pública' },
]

export const CONTEXTUAL_VERB_CASES: VerbMorphologyCase[] = [
  {
    id: 'larga-verbo',
    manuscript: 'A menina larga a mochila no chão.',
    query: 'larga',
    expected: ['largar', 'Presente do indicativo', '3ª pessoa do singular'],
  },
  {
    id: 'publica-verbo',
    manuscript: 'Ela publica o texto amanhã.',
    query: 'publica',
    expected: ['publicar', 'Presente do indicativo', '3ª pessoa do singular'],
  },
]
