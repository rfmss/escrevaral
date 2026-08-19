export type VerbCalibrationCase = {
  id: string
  text: string
  expectTitle?: RegExp
  rejectTitle?: RegExp
  note: string
}

export const verbCalibrationC2: VerbCalibrationCase[] = [
  {
    id: 'C2-HAVER-01',
    text: 'Houveram muitos problemas durante a preparação do manuscrito e a equipe precisou revisar cada etapa com cuidado.',
    expectTitle: /Haver existencial permanece no singular/i,
    note: 'Haver com sentido de existir é impessoal.',
  },
  {
    id: 'C2-HAVER-02',
    text: 'Houve muitos problemas durante a preparação do manuscrito e a equipe precisou revisar cada etapa com cuidado.',
    rejectTitle: /Haver existencial permanece no singular/i,
    note: 'Forma singular correta não deve gerar alerta.',
  },
  {
    id: 'C2-HAVER-AUX-01',
    text: 'Devem haver vários problemas escondidos no manuscrito antes da revisão final preparada pela equipe editorial.',
    expectTitle: /impessoalidade de haver alcança o auxiliar/i,
    note: 'Auxiliar de haver existencial também permanece no singular.',
  },
  {
    id: 'C2-EXISTIR-01',
    text: 'Existe muitos problemas de concordância no manuscrito e todos precisam ser examinados antes da publicação final.',
    expectTitle: /Existir concorda com o sujeito/i,
    note: 'Existir é pessoal e concorda com o sujeito plural.',
  },
  {
    id: 'C2-EXISTIR-02',
    text: 'Existem muitos problemas de concordância no manuscrito e todos precisam ser examinados antes da publicação final.',
    rejectTitle: /Existir concorda com o sujeito/i,
    note: 'Forma plural correta não deve gerar alerta.',
  },
  {
    id: 'C2-EXISTIR-AUX-01',
    text: 'Deve existir muitos problemas de coerência no capítulo antes que a equipe consiga concluir a revisão editorial.',
    expectTitle: /auxiliar concorda com o sujeito de existir/i,
    note: 'A locução com existir acompanha o sujeito plural.',
  },
  {
    id: 'C2-FAZER-01',
    text: 'Fazem cinco anos que a autora trabalha neste romance e ainda revisa cuidadosamente cada capítulo antes de publicar.',
    expectTitle: /Fazer temporal permanece no singular/i,
    note: 'Fazer indicando tempo decorrido é impessoal.',
  },
  {
    id: 'C2-FAZER-02',
    text: 'José e Maria fazem dez anos de casamento nesta semana e decidiram escrever juntos uma pequena memória da família.',
    rejectTitle: /Fazer temporal permanece no singular/i,
    note: 'Fazer pessoal com sujeito explícito não pode ser confundido com tempo decorrido impessoal.',
  },
  {
    id: 'C2-TER-01',
    text: 'Tem muitos livros espalhados pela mesa e a narradora observa todos antes de começar a escrever outra vez.',
    rejectTitle: /haver|existir|fazer temporal/i,
    note: 'Ter existencial brasileiro não entra neste bloco como erro absoluto; será tratado por registro.',
  },
]
