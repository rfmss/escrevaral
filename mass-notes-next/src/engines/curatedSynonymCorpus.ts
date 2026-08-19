// Corpus autoral do Escrevaral.
// As listas abaixo são candidatos lexicais para consulta, não equivalências
// automáticas. Matizes contextuais ficam em lexicalNuanceSupplement.ts.

const CANDIDATES: Record<string, string[]> = {
  abandonar: ['deixar', 'desamparar', 'largar', 'renunciar', 'desistir'],
  abrir: ['descerrar', 'entreabrir', 'escancarar', 'destapar', 'inaugurar'],
  aceitar: ['acolher', 'admitir', 'consentir', 'concordar', 'receber'],
  alegre: ['contente', 'jovial', 'radiante', 'satisfeito', 'exultante'],
  alegria: ['contentamento', 'júbilo', 'felicidade', 'satisfação', 'euforia'],
  amar: ['querer', 'estimar', 'adorar', 'prezar', 'venerar'],
  analisar: ['examinar', 'estudar', 'avaliar', 'investigar', 'decompor'],
  antigo: ['velho', 'ancestral', 'remoto', 'passado', 'tradicional'],
  aparecer: ['surgir', 'despontar', 'manifestar-se', 'emergir', 'mostrar-se'],
  aprender: ['assimilar', 'compreender', 'estudar', 'apreender', 'dominar'],
  bonito: ['belo', 'formoso', 'gracioso', 'atraente', 'harmonioso'],
  calmo: ['sereno', 'tranquilo', 'sossegado', 'plácido', 'pacato'],
  caminho: ['rota', 'trajeto', 'percurso', 'trilha', 'vereda'],
  cansado: ['fatigado', 'exausto', 'esgotado', 'abatido', 'estafado'],
  casa: ['lar', 'morada', 'habitação', 'residência', 'domicílio'],
  claro: ['nítido', 'evidente', 'luminoso', 'transparente', 'compreensível'],
  começar: ['iniciar', 'principiar', 'encetar', 'estrear', 'dar início'],
  compreender: ['entender', 'perceber', 'apreender', 'assimilar', 'alcançar'],
  concluir: ['terminar', 'encerrar', 'finalizar', 'rematar', 'completar'],
  conflito: ['embate', 'choque', 'confronto', 'tensão', 'oposição'],
  contar: ['narrar', 'relatar', 'descrever', 'expor', 'comunicar'],
  criar: ['conceber', 'inventar', 'produzir', 'elaborar', 'gerar'],
  decidir: ['resolver', 'determinar', 'escolher', 'optar', 'definir'],
  dizer: ['afirmar', 'declarar', 'enunciar', 'falar', 'expressar'],
  dor: ['sofrimento', 'padecimento', 'angústia', 'tormento', 'aflição'],
  escrever: ['redigir', 'compor', 'registrar', 'anotar', 'narrar'],
  escuro: ['sombrio', 'obscuro', 'tenebroso', 'opaco', 'sem luz'],
  esquecer: ['olvidar', 'deixar de lembrar', 'negligenciar', 'omitir', 'apagar da memória'],
  esperança: ['expectativa', 'confiança', 'alento', 'anseio', 'perspectiva'],
  esperar: ['aguardar', 'contar com', 'ter expectativa', 'permanecer à espera', 'antecipar'],
  falar: ['dizer', 'declarar', 'conversar', 'expressar-se', 'pronunciar'],
  feliz: ['contente', 'satisfeito', 'alegre', 'radiante', 'afortunado'],
  fechar: ['cerrar', 'trancar', 'encerrar', 'vedar', 'concluir'],
  forte: ['vigoroso', 'robusto', 'resistente', 'firme', 'intenso'],
  frio: ['gelado', 'gélido', 'glacial', 'frígido', 'refrigerado'],
  fugir: ['escapar', 'evadir-se', 'retirar-se', 'esquivar-se', 'debandar'],
  grande: ['amplo', 'vasto', 'imenso', 'enorme', 'extenso'],
  gritar: ['bradar', 'berrar', 'clamar', 'vociferar', 'exclamar'],
  ideia: ['pensamento', 'conceito', 'noção', 'proposta', 'concepção'],
  imaginar: ['conceber', 'fantasiar', 'supor', 'visualizar', 'figurar'],
  importante: ['relevante', 'significativo', 'essencial', 'decisivo', 'notável'],
  iniciar: ['começar', 'principiar', 'encetar', 'abrir', 'dar início'],
  ler: ['examinar', 'percorrer', 'interpretar', 'decifrar', 'consultar'],
  lembrar: ['recordar', 'rememorar', 'evocar', 'relembrar', 'trazer à memória'],
  lento: ['vagaroso', 'demorado', 'pausado', 'moroso', 'lerdo'],
  livre: ['liberto', 'solto', 'independente', 'desimpedido', 'autônomo'],
  luz: ['claridade', 'luminosidade', 'brilho', 'fulgor', 'clarão'],
  medo: ['receio', 'temor', 'apreensão', 'pavor', 'assombro'],
  melancolia: ['tristeza suave', 'nostalgia', 'pesar', 'abatimento', 'saudade'],
  memória: ['lembrança', 'recordação', 'reminiscência', 'evocação', 'retentiva'],
  mudar: ['alterar', 'modificar', 'transformar', 'converter', 'reformular'],
  noite: ['período noturno', 'escuridão', 'madrugada', 'trevas', 'anoitecer'],
  novo: ['recente', 'atual', 'moderno', 'novel', 'renovado'],
  observar: ['notar', 'examinar', 'contemplar', 'perceber', 'verificar'],
  olhar: ['ver', 'observar', 'contemplar', 'fitar', 'encarar'],
  palavra: ['vocábulo', 'termo', 'expressão', 'forma lexical', 'nome'],
  pensar: ['refletir', 'ponderar', 'cogitar', 'meditar', 'raciocinar'],
  pequeno: ['reduzido', 'diminuto', 'minúsculo', 'exíguo', 'miúdo'],
  perder: ['extraviar', 'desperdiçar', 'deixar escapar', 'ficar sem', 'não conservar'],
  permanecer: ['ficar', 'continuar', 'persistir', 'manter-se', 'durar'],
  profundo: ['fundo', 'intenso', 'penetrante', 'denso', 'abissal'],
  procurar: ['buscar', 'pesquisar', 'investigar', 'rastrear', 'perscrutar'],
  rápido: ['veloz', 'ligeiro', 'ágil', 'célere', 'acelerado'],
  revelar: ['mostrar', 'desvelar', 'expor', 'divulgar', 'descobrir'],
  ritmo: ['cadência', 'andamento', 'compasso', 'fluxo', 'pulsação'],
  silêncio: ['quietude', 'calma', 'sossego', 'mudez', 'ausência de ruído'],
  sozinho: ['só', 'isolado', 'solitário', 'desacompanhado', 'sem companhia'],
  sombra: ['penumbra', 'obscuridade', 'escuridão', 'silhueta', 'área sombreada'],
  sonho: ['devaneio', 'fantasia', 'visão', 'quimera', 'imaginação'],
  sofrer: ['padecer', 'suportar', 'aguentar', 'penar', 'sentir dor'],
  terminar: ['concluir', 'encerrar', 'finalizar', 'acabar', 'rematar'],
  tranquilo: ['calmo', 'sereno', 'sossegado', 'pacífico', 'imperturbável'],
  triste: ['melancólico', 'abatido', 'pesaroso', 'sorumbático', 'desolado'],
  verdade: ['realidade', 'veracidade', 'fato', 'autenticidade', 'certeza'],
  velho: ['antigo', 'idoso', 'envelhecido', 'remoto', 'gasto'],
  ver: ['observar', 'enxergar', 'avistar', 'perceber', 'contemplar'],
  vida: ['existência', 'vivência', 'trajetória', 'percurso', 'experiência'],
  voz: ['timbre', 'fala', 'entoação', 'dicção', 'sonoridade'],
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

const REVERSE = (() => {
  const map = new Map<string, string[]>()
  for (const [word, candidates] of Object.entries(CANDIDATES)) {
    for (const candidate of candidates) {
      // Relações frasais não viram chave reversa; a reversão serve apenas a
      // candidatos lexicais simples já presentes no corpus.
      if (/\s/u.test(candidate)) continue
      const key = normalize(candidate)
      const values = map.get(key) ?? []
      if (!values.some((item) => normalize(item) === normalize(word))) values.push(word)
      map.set(key, values)
    }
  }
  return map
})()

export function getCuratedSynonyms(word: string): string[] {
  const key = normalize(word)
  const direct = CANDIDATES[key] ?? []
  const reverse = REVERSE.get(key) ?? []
  const seen = new Set<string>()
  const result: string[] = []

  for (const candidate of [...direct, ...reverse]) {
    const normalized = normalize(candidate)
    if (!normalized || normalized === key || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(candidate)
  }

  return result.slice(0, 12)
}
