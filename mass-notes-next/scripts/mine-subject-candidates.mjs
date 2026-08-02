import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const INITIAL_SCOPE_SPLITS = new Set(['train', 'dev'])
const FINITE_UPOS = new Set(['VERB', 'AUX'])
const PLURAL_NOMINAL_UPOS = new Set(['NOUN', 'PROPN', 'PRON'])

function parseFeatures(raw) {
  if (!raw || raw === '_') return {}
  return Object.fromEntries(raw.split('|').map((item) => {
    const separator = item.indexOf('=')
    return separator === -1
      ? [item, true]
      : [item.slice(0, separator), item.slice(separator + 1)]
  }))
}

function parseComments(lines) {
  const comments = {}
  for (const line of lines) {
    const match = /^#\s*([^=]+?)\s*=\s*(.*)$/u.exec(line)
    if (match) comments[match[1].trim()] = match[2].trim()
  }
  return comments
}

function reconstructText(tokens) {
  let text = ''
  for (const token of tokens) {
    text += token.form
    if (!token.misc.includes('SpaceAfter=No')) text += ' '
  }
  return text.trim()
}

export function parseConllu(content) {
  const blocks = content
    .replace(/^\uFEFF/u, '')
    .split(/\r?\n\s*\r?\n/gu)
    .map((block) => block.trim())
    .filter(Boolean)

  return blocks.map((block, sentenceIndex) => {
    const lines = block.split(/\r?\n/gu)
    const commentLines = lines.filter((line) => line.startsWith('#'))
    const comments = parseComments(commentLines)
    const tokens = []

    for (const line of lines) {
      if (!line || line.startsWith('#')) continue
      const columns = line.split('\t')
      if (columns.length !== 10) {
        throw new Error(`CoNLL-U inválido no bloco ${sentenceIndex + 1}: esperado 10 colunas.`)
      }

      const [idRaw, form, lemma, upos, xpos, featsRaw, headRaw, deprel, deps, miscRaw] = columns
      if (!/^\d+$/u.test(idRaw)) continue
      if (!/^\d+$/u.test(headRaw)) {
        throw new Error(`HEAD inválido em ${comments.sent_id ?? sentenceIndex + 1}:${idRaw}.`)
      }

      tokens.push({
        id: Number(idRaw),
        form,
        lemma,
        upos,
        xpos,
        featsRaw,
        features: parseFeatures(featsRaw),
        head: Number(headRaw),
        deprel,
        deps,
        misc: miscRaw === '_' ? [] : miscRaw.split('|'),
      })
    }

    if (tokens.length === 0) {
      throw new Error(`Sentença sem tokens inteiros no bloco ${sentenceIndex + 1}.`)
    }

    return {
      index: sentenceIndex,
      sentId: comments.sent_id ?? `sentence-${sentenceIndex + 1}`,
      text: comments.text ?? reconstructText(tokens),
      comments,
      tokens,
    }
  })
}

export function parseSentencePosition(sentId) {
  const udMatch = /^(?<document>.+)_SENT(?<ordinal>\d+)$/u.exec(sentId)
  if (udMatch?.groups) {
    return {
      documentId: udMatch.groups.document,
      ordinal: Number(udMatch.groups.ordinal),
      scheme: 'ud_sent_id',
    }
  }

  const projectMatch = /^(?<document>.+)-(?<ordinal>\d+)$/u.exec(sentId)
  if (projectMatch?.groups) {
    return {
      documentId: projectMatch.groups.document,
      ordinal: Number(projectMatch.groups.ordinal),
      scheme: 'project_fixture',
    }
  }

  return null
}

function sentencePositionKey(position) {
  return `${position.documentId}\u0000${position.ordinal}`
}

function buildSentencePositionIndex(sentences) {
  const index = new Map()
  for (const sentence of sentences) {
    const position = parseSentencePosition(sentence.sentId)
    if (!position) continue
    const key = sentencePositionKey(position)
    if (index.has(key)) {
      throw new Error(`sent_id duplicado para posição documental: ${sentence.sentId}`)
    }
    index.set(key, sentence)
  }
  return index
}

function trustedPreviousSentence(sentence, positionIndex) {
  const position = parseSentencePosition(sentence.sentId)
  if (!position || position.ordinal <= 1) return null
  return positionIndex.get(sentencePositionKey({
    ...position,
    ordinal: position.ordinal - 1,
  })) ?? null
}

function isFiniteThirdPlural(token) {
  return FINITE_UPOS.has(token.upos)
    && token.features.VerbForm === 'Fin'
    && token.features.Person === '3'
    && token.features.Number === 'Plur'
}

function isSubjectRelation(deprel) {
  return /^(?:nsubj|csubj)(?::|$)/u.test(deprel)
}

function pluralNominals(sentence) {
  return sentence.tokens
    .filter((token) => PLURAL_NOMINAL_UPOS.has(token.upos) && token.features.Number === 'Plur')
    .map((token) => ({
      id: token.id,
      form: token.form,
      lemma: token.lemma,
      upos: token.upos,
      deprel: token.deprel,
      head: token.head,
    }))
}

function directDependents(sentence, headId, predicate) {
  return sentence.tokens.filter((token) => token.head === headId && predicate(token))
}

function passiveSignals(sentence, target) {
  const targetHead = sentence.tokens.find((token) => token.id === target.head)
  const linkedIds = new Set([target.id, target.head])
  const relations = sentence.tokens.filter((token) => {
    const linked = linkedIds.has(token.id) || linkedIds.has(token.head)
    return linked && (
      token.deprel === 'aux:pass'
      || token.deprel === 'nsubj:pass'
      || token.features.Voice === 'Pass'
    )
  })

  if (target.deprel === 'aux:pass' || target.features.Voice === 'Pass') relations.push(target)
  if (targetHead?.features.Voice === 'Pass') relations.push(targetHead)

  return [...new Map(relations.map((token) => [token.id, {
    id: token.id,
    form: token.form,
    deprel: token.deprel,
    voice: token.features.Voice ?? null,
  }])).values()]
}

function seSignals(sentence) {
  return sentence.tokens
    .filter((token) => token.form.toLocaleLowerCase('pt-BR') === 'se' || token.lemma.toLocaleLowerCase('pt-BR') === 'se')
    .map((token) => ({
      id: token.id,
      form: token.form,
      deprel: token.deprel,
      head: token.head,
    }))
}

function impersonalSignals(sentence, target) {
  return directDependents(
    sentence,
    target.id,
    (token) => token.deprel === 'expl:impers' || token.deprel === 'expl',
  ).map((token) => ({
    id: token.id,
    form: token.form,
    deprel: token.deprel,
  }))
}

export function mineSubjectCandidates(content, metadata) {
  const {
    sourceId,
    revision,
    split,
    repository = null,
    license = null,
  } = metadata

  if (!sourceId || !revision || !split) {
    throw new Error('sourceId, revision e split são obrigatórios.')
  }
  if (!INITIAL_SCOPE_SPLITS.has(split)) {
    throw new Error(`Split ${split} bloqueado: a mineração inicial aceita apenas train ou dev.`)
  }

  const sentences = parseConllu(content)
  const positionIndex = buildSentencePositionIndex(sentences)
  const candidates = []
  let sentencesWithTrustedPreviousContext = 0
  let candidatesWithTrustedPreviousContext = 0

  for (const sentence of sentences) {
    const previous = trustedPreviousSentence(sentence, positionIndex)
    if (previous) sentencesWithTrustedPreviousContext += 1
    const sentencePluralNominals = pluralNominals(sentence)
    const previousPluralNominals = previous ? pluralNominals(previous) : []

    for (const target of sentence.tokens.filter(isFiniteThirdPlural)) {
      const directSubjects = directDependents(sentence, target.id, (token) => isSubjectRelation(token.deprel))
        .map((token) => ({
          id: token.id,
          form: token.form,
          lemma: token.lemma,
          upos: token.upos,
          deprel: token.deprel,
          features: token.features,
        }))
      const passive = passiveSignals(sentence, target)
      const se = seSignals(sentence)
      const impersonal = impersonalSignals(sentence, target)

      let structuralBucket = directSubjects.length > 0
        ? 'explicit_subject_control'
        : 'no_direct_subject_candidate'
      const exclusions = []

      if (target.upos === 'AUX') exclusions.push('finite_auxiliary')
      if (passive.length > 0) exclusions.push('passive_signal')
      if (se.length > 0) exclusions.push('contains_se')
      if (impersonal.length > 0) exclusions.push('impersonal_expletive_signal')
      if (exclusions.length > 0) structuralBucket = 'outside_initial_scope'
      if (previous) candidatesWithTrustedPreviousContext += 1

      candidates.push({
        candidateId: `${sourceId}:${split}:${sentence.sentId}:${target.id}`,
        source: {
          sourceId,
          repository,
          revision,
          split,
          license,
          sentId: sentence.sentId,
        },
        sentence: {
          text: sentence.text,
          tokenCount: sentence.tokens.length,
        },
        previousContext: previous
          ? {
              sentId: previous.sentId,
              text: previous.text,
              pluralNominals: previousPluralNominals,
              continuity: 'same_document_consecutive_sentence_id',
            }
          : null,
        target: {
          id: target.id,
          form: target.form,
          lemma: target.lemma,
          upos: target.upos,
          head: target.head,
          deprel: target.deprel,
          features: target.features,
        },
        structuralBucket,
        exclusions,
        signals: {
          directSubjects,
          sentencePluralNominals,
          previousPluralNominals,
          passive,
          se,
          impersonal,
        },
        humanAnnotation: {
          status: 'pending',
          label: null,
          confidence: null,
          referent: null,
          rationale: null,
          annotators: [],
        },
      })
    }
  }

  return {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    purpose: 'Fila privada de candidatos estruturais; não contém decisão linguística automática.',
    source: {
      sourceId,
      repository,
      revision,
      split,
      license,
    },
    boundaries: {
      networkUsed: false,
      automaticDownload: false,
      linguisticDecisionMade: false,
      testSplitOpened: false,
      requiresHumanAnnotation: true,
      maySupportVerified: false,
      fileOrderTrustedAsDiscourseOrder: false,
      previousContextRequiresSameDocumentConsecutiveId: true,
    },
    counts: {
      sentences: sentences.length,
      sentencesWithTrustedPreviousContext,
      candidates: candidates.length,
      candidatesWithTrustedPreviousContext,
      byStructuralBucket: candidates.reduce((counts, candidate) => {
        counts[candidate.structuralBucket] = (counts[candidate.structuralBucket] ?? 0) + 1
        return counts
      }, {}),
    },
    candidates,
  }
}

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (!argument.startsWith('--')) throw new Error(`Argumento inesperado: ${argument}`)
    const key = argument.slice(2)
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`Valor ausente para --${key}.`)
    values[key] = value
    index += 1
  }
  return values
}

function assertOutsideRepository(pathValue, label) {
  const cwd = resolve(process.cwd())
  const candidate = resolve(pathValue)
  if (candidate === cwd || candidate.startsWith(`${cwd}${sep}`)) {
    throw new Error(`${label} deve ficar fora do diretório do repositório: ${candidate}`)
  }
  return candidate
}

function loadApprovedSource(sourceId, revision) {
  const registry = JSON.parse(readFileSync(new URL('../docs/corpora/m1-r0-subject-corpus-sources.json', import.meta.url), 'utf8'))
  const source = registry.sources.find((item) => item.id === sourceId)
  if (!source) throw new Error(`Fonte não registrada: ${sourceId}`)
  if (source.status !== 'accepted_for_development_mining' || source.textMayEnterRepository !== true) {
    throw new Error(`Fonte não autorizada para mineração de desenvolvimento: ${sourceId}`)
  }
  if (source.revision !== revision) {
    throw new Error(`Revisão divergente para ${sourceId}: esperado ${source.revision}, recebido ${revision}.`)
  }
  return source
}

function printHelp() {
  console.log(`Uso:\n  node scripts/mine-subject-candidates.mjs \\\n    --input /caminho/fora/do/repo/arquivo.conllu \\\n    --output /caminho/fora/do/repo/candidatos.json \\\n    --source-id ud-portuguese-porttinari-2.18 \\\n    --revision 87a07e1fb761d6d0a6e2a4d82b11b308344dabb9 \\\n    --split train|dev\n\nO comando não baixa dados, rejeita split test, não confia na ordem física do arquivo e não produz rótulo linguístico.`)
}

function main() {
  if (process.argv.includes('--help')) {
    printHelp()
    return
  }

  const args = parseArgs(process.argv.slice(2))
  const required = ['input', 'output', 'source-id', 'revision', 'split']
  const missing = required.filter((key) => !args[key])
  if (missing.length > 0) throw new Error(`Argumentos obrigatórios ausentes: ${missing.join(', ')}`)
  if (!INITIAL_SCOPE_SPLITS.has(args.split)) {
    throw new Error(`Split ${args.split} bloqueado: use somente train ou dev.`)
  }

  const inputPath = assertOutsideRepository(args.input, 'O corpus de entrada')
  const outputPath = assertOutsideRepository(args.output, 'A fila privada de saída')
  const source = loadApprovedSource(args['source-id'], args.revision)
  const content = readFileSync(inputPath, 'utf8')
  const report = mineSubjectCandidates(content, {
    sourceId: source.id,
    repository: source.repository,
    revision: source.revision,
    split: args.split,
    license: source.license,
  })

  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' })
  console.log(`Fila privada criada: ${outputPath}`)
  console.log(`Sentenças lidas: ${report.counts.sentences}`)
  console.log(`Contextos anteriores confiáveis: ${report.counts.sentencesWithTrustedPreviousContext}`)
  console.log(`Candidatos estruturais: ${report.counts.candidates}`)
  console.log('Nenhum rótulo linguístico foi atribuído.')
}

const executedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
if (executedDirectly) {
  try {
    main()
  } catch (error) {
    console.error(`[M1-R0] ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}
