export type PunctuationCalibrationCase = {
  id: string
  text: string
  expectRuleIds?: string[]
  rejectRuleIds?: string[]
  note: string
}

export const punctuationCalibrationC1: PunctuationCalibrationCase[] = [
  {
    id: 'C1-SV-01',
    text: 'Depois da reunião, a pesquisadora responsável pelo projeto, publicou o relatório completo para toda a equipe.',
    expectRuleIds: ['PONT-SYNT-03'],
    note: 'Vírgula não pode separar diretamente o sujeito do núcleo verbal.',
  },
  {
    id: 'C1-SV-02',
    text: 'Depois da reunião, a pesquisadora responsável pelo projeto publicou o relatório completo para toda a equipe.',
    rejectRuleIds: ['PONT-SYNT-03'],
    note: 'Ordem direta sem intercalação não recebe vírgula entre sujeito e verbo.',
  },
  {
    id: 'C1-SV-03',
    text: 'A pesquisadora responsável pelo projeto, segundo a comissão, publicou o relatório completo para toda a equipe.',
    rejectRuleIds: ['PONT-SYNT-03'],
    note: 'Intercalação legítima entre sujeito e verbo não pode ser confundida com corte direto do vínculo.',
  },
  {
    id: 'C1-VC-01',
    text: 'Naquela manhã, a pesquisadora publicou, o relatório completo depois da reunião com toda a equipe editorial.',
    expectRuleIds: ['PONT-SYNT-04'],
    note: 'Vírgula não pode separar diretamente verbo e objeto integrado.',
  },
  {
    id: 'C1-VC-02',
    text: 'Naquela manhã, a pesquisadora publicou o relatório completo depois da reunião com toda a equipe editorial.',
    rejectRuleIds: ['PONT-SYNT-04'],
    note: 'Verbo e complemento em ordem direta permanecem ligados sem vírgula.',
  },
  {
    id: 'C1-VC-03',
    text: 'Naquela manhã, a pesquisadora publicou, como todos já sabiam, o relatório completo depois da reunião editorial.',
    rejectRuleIds: ['PONT-SYNT-04'],
    note: 'Uma intercalação real pode aparecer entre verbo e complemento e deve permanecer isolada por vírgulas.',
  },
  {
    id: 'C1-VP-01',
    text: 'Depois de tantas horas de trabalho, a sala permaneceu, silenciosa durante toda a leitura final do manuscrito.',
    expectRuleIds: ['PONT-SYNT-04'],
    note: 'Verbo de ligação e predicativo também formam vínculo sintático essencial.',
  },
  {
    id: 'C1-ADV-01',
    text: 'No fim daquela longa manhã de trabalho, a pesquisadora publicou o relatório completo para toda a equipe.',
    rejectRuleIds: ['PONT-SYNT-03', 'PONT-SYNT-04'],
    note: 'Adjunto deslocado corretamente isolado não deve contaminar os vínculos centrais da oração.',
  },
]
