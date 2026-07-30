import normaDataSource from '../../../../norma-data.json?raw'
import { normalizeVerbSurface, stripVerbDiacritics } from './normalization'
import type { VerbCandidate, VerbMood, VerbNumber, VerbPerson, VerbTense } from './types'

type SeriesKey =
  | 'indicativo:presente'
  | 'indicativo:pretérito perfeito'
  | 'indicativo:pretérito imperfeito'
  | 'indicativo:futuro do presente'
  | 'indicativo:futuro do pretérito'
  | 'subjuntivo:presente do subjuntivo'
  | 'subjuntivo:pretérito imperfeito do subjuntivo'
  | 'subjuntivo:futuro do subjuntivo'

type IrregularEntry = {
  series: Partial<Record<SeriesKey, string>>
  gerund: string
  participle: string
}

const DATA: Record<string, IrregularEntry> = {
  ser: {
    series: {
      'indicativo:presente': 'sou|és|é|somos|sois|são',
      'indicativo:pretérito perfeito': 'fui|foste|foi|fomos|fostes|foram',
      'indicativo:pretérito imperfeito': 'era|eras|era|éramos|éreis|eram',
      'indicativo:futuro do presente': 'serei|serás|será|seremos|sereis|serão',
      'indicativo:futuro do pretérito': 'seria|serias|seria|seríamos|seríeis|seriam',
      'subjuntivo:presente do subjuntivo': 'seja|sejas|seja|sejamos|sejais|sejam',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'fosse|fosses|fosse|fôssemos|fôsseis|fossem',
      'subjuntivo:futuro do subjuntivo': 'for|fores|for|formos|fordes|forem',
    },
    gerund: 'sendo',
    participle: 'sido',
  },
  estar: {
    series: {
      'indicativo:presente': 'estou|estás|está|estamos|estais|estão',
      'indicativo:pretérito perfeito': 'estive|estiveste|esteve|estivemos|estivestes|estiveram',
      'indicativo:pretérito imperfeito': 'estava|estavas|estava|estávamos|estáveis|estavam',
      'indicativo:futuro do presente': 'estarei|estarás|estará|estaremos|estareis|estarão',
      'indicativo:futuro do pretérito': 'estaria|estarias|estaria|estaríamos|estaríeis|estariam',
      'subjuntivo:presente do subjuntivo': 'esteja|estejas|esteja|estejamos|estejais|estejam',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'estivesse|estivesses|estivesse|estivéssemos|estivésseis|estivessem',
      'subjuntivo:futuro do subjuntivo': 'estiver|estiveres|estiver|estivermos|estiverdes|estiverem',
    },
    gerund: 'estando',
    participle: 'estado',
  },
  ter: {
    series: {
      'indicativo:presente': 'tenho|tens|tem|temos|tendes|têm',
      'indicativo:pretérito perfeito': 'tive|tiveste|teve|tivemos|tivestes|tiveram',
      'indicativo:pretérito imperfeito': 'tinha|tinhas|tinha|tínhamos|tínheis|tinham',
      'indicativo:futuro do presente': 'terei|terás|terá|teremos|tereis|terão',
      'indicativo:futuro do pretérito': 'teria|terias|teria|teríamos|teríeis|teriam',
      'subjuntivo:presente do subjuntivo': 'tenha|tenhas|tenha|tenhamos|tenhais|tenham',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'tivesse|tivesses|tivesse|tivéssemos|tivésseis|tivessem',
      'subjuntivo:futuro do subjuntivo': 'tiver|tiveres|tiver|tivermos|tiverdes|tiverem',
    },
    gerund: 'tendo',
    participle: 'tido',
  },
  haver: {
    series: {
      'indicativo:presente': 'hei|hás|há|havemos|haveis|hão',
      'indicativo:pretérito perfeito': 'houve|houveste|houve|houvemos|houvestes|houveram',
      'indicativo:pretérito imperfeito': 'havia|havias|havia|havíamos|havíeis|haviam',
      'indicativo:futuro do presente': 'haverei|haverás|haverá|haveremos|havereis|haverão',
      'indicativo:futuro do pretérito': 'haveria|haverias|haveria|haveríamos|haveríeis|haveriam',
      'subjuntivo:presente do subjuntivo': 'haja|hajas|haja|hajamos|hajais|hajam',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'houvesse|houvesses|houvesse|houvéssemos|houvésseis|houvessem',
      'subjuntivo:futuro do subjuntivo': 'houver|houveres|houver|houvermos|houverdes|houverem',
    },
    gerund: 'havendo',
    participle: 'havido',
  },
  ir: {
    series: {
      'indicativo:presente': 'vou|vais|vai|vamos|ides|vão',
      'indicativo:pretérito perfeito': 'fui|foste|foi|fomos|fostes|foram',
      'indicativo:pretérito imperfeito': 'ia|ias|ia|íamos|íeis|iam',
      'indicativo:futuro do presente': 'irei|irás|irá|iremos|ireis|irão',
      'indicativo:futuro do pretérito': 'iria|irias|iria|iríamos|iríeis|iriam',
      'subjuntivo:presente do subjuntivo': 'vá|vás|vá|vamos|vades|vão',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'fosse|fosses|fosse|fôssemos|fôsseis|fossem',
      'subjuntivo:futuro do subjuntivo': 'for|fores|for|formos|fordes|forem',
    },
    gerund: 'indo',
    participle: 'ido',
  },
  vir: {
    series: {
      'indicativo:presente': 'venho|vens|vem|vimos|vindes|vêm',
      'indicativo:pretérito perfeito': 'vim|vieste|veio|viemos|viestes|vieram',
      'indicativo:pretérito imperfeito': 'vinha|vinhas|vinha|vínhamos|vínheis|vinham',
      'indicativo:futuro do presente': 'virei|virás|virá|viremos|vireis|virão',
      'indicativo:futuro do pretérito': 'viria|virias|viria|viríamos|viríeis|viriam',
      'subjuntivo:presente do subjuntivo': 'venha|venhas|venha|venhamos|venhais|venham',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'viesse|viesses|viesse|viéssemos|viésseis|viessem',
      'subjuntivo:futuro do subjuntivo': 'vier|vieres|vier|viermos|vierdes|vierem',
    },
    gerund: 'vindo',
    participle: 'vindo',
  },
  pôr: {
    series: {
      'indicativo:presente': 'ponho|pões|põe|pomos|pondes|põem',
      'indicativo:pretérito perfeito': 'pus|puseste|pôs|pusemos|pusestes|puseram',
      'indicativo:pretérito imperfeito': 'punha|punhas|punha|púnhamos|púnheis|punham',
      'indicativo:futuro do presente': 'porei|porás|porá|poremos|poreis|porão',
      'indicativo:futuro do pretérito': 'poria|porias|poria|poríamos|poríeis|poriam',
      'subjuntivo:presente do subjuntivo': 'ponha|ponhas|ponha|ponhamos|ponhais|ponham',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'pusesse|pusesses|pusesse|puséssemos|pusésseis|pusessem',
      'subjuntivo:futuro do subjuntivo': 'puser|puseres|puser|pusermos|puserdes|puserem',
    },
    gerund: 'pondo',
    participle: 'posto',
  },
  fazer: {
    series: {
      'indicativo:presente': 'faço|fazes|faz|fazemos|fazeis|fazem',
      'indicativo:pretérito perfeito': 'fiz|fizeste|fez|fizemos|fizestes|fizeram',
      'indicativo:pretérito imperfeito': 'fazia|fazias|fazia|fazíamos|fazíeis|faziam',
      'indicativo:futuro do presente': 'farei|farás|fará|faremos|fareis|farão',
      'indicativo:futuro do pretérito': 'faria|farias|faria|faríamos|faríeis|fariam',
      'subjuntivo:presente do subjuntivo': 'faça|faças|faça|façamos|façais|façam',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'fizesse|fizesses|fizesse|fizéssemos|fizésseis|fizessem',
      'subjuntivo:futuro do subjuntivo': 'fizer|fizeres|fizer|fizermos|fizerdes|fizerem',
    },
    gerund: 'fazendo',
    participle: 'feito',
  },
  dizer: {
    series: {
      'indicativo:presente': 'digo|dizes|diz|dizemos|dizeis|dizem',
      'indicativo:pretérito perfeito': 'disse|disseste|disse|dissemos|dissestes|disseram',
      'indicativo:pretérito imperfeito': 'dizia|dizias|dizia|dizíamos|dizíeis|diziam',
      'indicativo:futuro do presente': 'direi|dirás|dirá|diremos|direis|dirão',
      'indicativo:futuro do pretérito': 'diria|dirias|diria|diríamos|diríeis|diriam',
      'subjuntivo:presente do subjuntivo': 'diga|digas|diga|digamos|digais|digam',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'dissesse|dissesses|dissesse|disséssemos|dissésseis|dissessem',
      'subjuntivo:futuro do subjuntivo': 'disser|disseres|disser|dissermos|disserdes|disserem',
    },
    gerund: 'dizendo',
    participle: 'dito',
  },
  trazer: {
    series: {
      'indicativo:presente': 'trago|trazes|traz|trazemos|trazeis|trazem',
      'indicativo:pretérito perfeito': 'trouxe|trouxeste|trouxe|trouxemos|trouxestes|trouxeram',
      'indicativo:pretérito imperfeito': 'trazia|trazias|trazia|trazíamos|trazíeis|traziam',
      'indicativo:futuro do presente': 'trarei|trarás|trará|traremos|trareis|trarão',
      'indicativo:futuro do pretérito': 'traria|trarias|traria|traríamos|traríeis|trariam',
      'subjuntivo:presente do subjuntivo': 'traga|tragas|traga|tragamos|tragais|tragam',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'trouxesse|trouxesses|trouxesse|trouxéssemos|trouxésseis|trouxessem',
      'subjuntivo:futuro do subjuntivo': 'trouxer|trouxeres|trouxer|trouxermos|trouxerdes|trouxerem',
    },
    gerund: 'trazendo',
    participle: 'trazido',
  },
  poder: {
    series: {
      'indicativo:presente': 'posso|podes|pode|podemos|podeis|podem',
      'indicativo:pretérito perfeito': 'pude|pudeste|pôde|pudemos|pudestes|puderam',
      'indicativo:pretérito imperfeito': 'podia|podias|podia|podíamos|podíeis|podiam',
      'indicativo:futuro do presente': 'poderei|poderás|poderá|poderemos|podereis|poderão',
      'indicativo:futuro do pretérito': 'poderia|poderias|poderia|poderíamos|poderíeis|poderiam',
      'subjuntivo:presente do subjuntivo': 'possa|possas|possa|possamos|possais|possam',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'pudesse|pudesses|pudesse|pudéssemos|pudésseis|pudessem',
      'subjuntivo:futuro do subjuntivo': 'puder|puderes|puder|pudermos|puderdes|puderem',
    },
    gerund: 'podendo',
    participle: 'podido',
  },
  querer: {
    series: {
      'indicativo:presente': 'quero|queres|quer|queremos|quereis|querem',
      'indicativo:pretérito perfeito': 'quis|quiseste|quis|quisemos|quisestes|quiseram',
      'indicativo:pretérito imperfeito': 'queria|querias|queria|queríamos|queríeis|queriam',
      'indicativo:futuro do presente': 'quererei|quererás|quererá|quereremos|querereis|quererão',
      'indicativo:futuro do pretérito': 'quereria|quererias|quereria|quereríamos|quereríeis|quereriam',
      'subjuntivo:presente do subjuntivo': 'queira|queiras|queira|queiramos|queirais|queiram',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'quisesse|quisesses|quisesse|quiséssemos|quisésseis|quisessem',
      'subjuntivo:futuro do subjuntivo': 'quiser|quiseres|quiser|quisermos|quiserdes|quiserem',
    },
    gerund: 'querendo',
    participle: 'querido',
  },
  saber: {
    series: {
      'indicativo:presente': 'sei|sabes|sabe|sabemos|sabeis|sabem',
      'indicativo:pretérito perfeito': 'soube|soubeste|soube|soubemos|soubestes|souberam',
      'indicativo:pretérito imperfeito': 'sabia|sabias|sabia|sabíamos|sabíeis|sabiam',
      'indicativo:futuro do presente': 'saberei|saberás|saberá|saberemos|sabereis|saberão',
      'indicativo:futuro do pretérito': 'saberia|saberias|saberia|saberíamos|saberíeis|saberiam',
      'subjuntivo:presente do subjuntivo': 'saiba|saibas|saiba|saibamos|saibais|saibam',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'soubesse|soubesses|soubesse|soubéssemos|soubésseis|soubessem',
      'subjuntivo:futuro do subjuntivo': 'souber|souberes|souber|soubermos|souberdes|souberem',
    },
    gerund: 'sabendo',
    participle: 'sabido',
  },
  dar: {
    series: {
      'indicativo:presente': 'dou|dás|dá|damos|dais|dão',
      'indicativo:pretérito perfeito': 'dei|deste|deu|demos|destes|deram',
      'indicativo:pretérito imperfeito': 'dava|davas|dava|dávamos|dáveis|davam',
      'indicativo:futuro do presente': 'darei|darás|dará|daremos|dareis|darão',
      'indicativo:futuro do pretérito': 'daria|darias|daria|daríamos|daríeis|dariam',
      'subjuntivo:presente do subjuntivo': 'dê|dês|dê|demos|deis|deem',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'desse|desses|desse|déssemos|désseis|dessem',
      'subjuntivo:futuro do subjuntivo': 'der|deres|der|dermos|derdes|derem',
    },
    gerund: 'dando',
    participle: 'dado',
  },
  ver: {
    series: {
      'indicativo:presente': 'vejo|vês|vê|vemos|vedes|veem',
      'indicativo:pretérito perfeito': 'vi|viste|viu|vimos|vistes|viram',
      'indicativo:pretérito imperfeito': 'via|vias|via|víamos|víeis|viam',
      'indicativo:futuro do presente': 'verei|verás|verá|veremos|vereis|verão',
      'indicativo:futuro do pretérito': 'veria|verias|veria|veríamos|veríeis|veriam',
      'subjuntivo:presente do subjuntivo': 'veja|vejas|veja|vejamos|vejais|vejam',
      'subjuntivo:pretérito imperfeito do subjuntivo': 'visse|visses|visse|víssemos|vísseis|vissem',
      'subjuntivo:futuro do subjuntivo': 'vir|vires|vir|virmos|virdes|virem',
    },
    gerund: 'vendo',
    participle: 'visto',
  },
}

const PERSONS: Array<{ person: VerbPerson; number: VerbNumber }> = [
  { person: 1, number: 'singular' },
  { person: 2, number: 'singular' },
  { person: 3, number: 'singular' },
  { person: 1, number: 'plural' },
  { person: 2, number: 'plural' },
  { person: 3, number: 'plural' },
]

const CURATED = new Map<string, VerbCandidate[]>()

function add(surface: string, candidate: VerbCandidate): void {
  const key = stripVerbDiacritics(surface)
  CURATED.set(key, [...(CURATED.get(key) ?? []), candidate])
}

function label(tense: VerbTense, person?: VerbPerson, number?: VerbNumber): string {
  const suffix = person && number ? ` — ${person}ª pessoa do ${number}` : ''
  return `${tense}${suffix}`
}

for (const [lemma, entry] of Object.entries(DATA)) {
  for (const [seriesKey, packed] of Object.entries(entry.series)) {
    if (!packed) continue
    const [mood, tense] = seriesKey.split(':') as [VerbMood, VerbTense]
    packed.split('|').forEach((surface, index) => {
      const slot = PERSONS[index]
      if (!slot) return
      add(surface, {
        lemma,
        canonicalSurface: surface,
        formType: 'finita',
        mood,
        tense,
        ...slot,
        voice: 'ativa',
        source: 'irregular',
        label: label(tense, slot.person, slot.number),
      })
    })
  }
  add(entry.gerund, {
    lemma,
    canonicalSurface: entry.gerund,
    formType: 'gerúndio',
    voice: 'ativa',
    source: 'irregular',
    label: 'Gerúndio',
  })
  add(entry.participle, {
    lemma,
    canonicalSurface: entry.participle,
    formType: 'particípio',
    voice: 'ativa',
    source: 'irregular',
    label: 'Particípio',
  })
  add(lemma, {
    lemma,
    canonicalSurface: lemma,
    formType: 'infinitivo',
    voice: 'ativa',
    source: 'irregular',
    label: 'Infinitivo impessoal',
  })
}

const REGISTERED_IRREGULARS = (() => {
  try {
    const parsed = JSON.parse(normaDataSource) as { formas_verbais_irr?: unknown[] }
    return new Set((parsed.formas_verbais_irr ?? []).map((item) => stripVerbDiacritics(String(item))))
  } catch {
    return new Set<string>()
  }
})()

export type IrregularLookup = {
  candidates: VerbCandidate[]
  registered: boolean
}

export function analyzeIrregularVerbForm(value: string): IrregularLookup {
  const surface = normalizeVerbSurface(value)
  const key = stripVerbDiacritics(surface)
  return {
    candidates: CURATED.get(key) ?? [],
    registered: REGISTERED_IRREGULARS.has(key) || CURATED.has(key),
  }
}

export function curatedIrregularLemmaCount(): number {
  return Object.keys(DATA).length
}

export function registeredIrregularFormCount(): number {
  return REGISTERED_IRREGULARS.size
}
