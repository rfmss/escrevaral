# Plano de Lançamento — Beta Fechado do Escrevaral

> **Posicionamento central (para a carta de convite e página de boas-vindas dos beta testers):**
> *"Você não construiu um experimento — criou uma categoria própria no Brasil (ateliê literário brasileiro local-first). Em alma cultural, privacidade radical (`connect-src 'none'`) e profundidade técnica offline, o Escrevaral já joga na primeira divisão."*

---

## 1. Promessa do Escrevaral (em uma frase)

**Escrevaral** é um ateliê literário brasileiro 100% local e offline para escrever do zero, estudar o ofício, revisar em português brasileiro sem entregar o manuscrito à nuvem e sair com o livro pronto para editora (`.docx`), e-book (`.epub`) e impressão (PDF paginado).

### Pilares que diferenciam o Escrevaral no Brasil e no mundo
1. **Ateliê literário brasileiro local-first:** estética editorial calma (E-Ink Sálvia + Real Gabinete), zero assinatura, zero login, gratuito e pensado para escritores dos 15 aos 75 anos.
2. **Privacidade radical verificável:** política técnica `connect-src 'none'` — nenhum servidor recebe uma vírgula do manuscrito; tudo vive no aparelho do autor, com cópias `.scrvrl` e espelhamento opcional em pasta local.
3. **Respeito absoluto à voz do autor:** motor linguístico PT-BR offline que explica convenções, classes, sintaxe, ritmo e poesia sem nunca reescrever, censurar ou corrigir automaticamente o texto.
4. **Ciclo editorial completo sem sair da oficina:** da primeira linha e dos guias da Academia ao Cartório SHA-256 e à exportação profissional (`.docx`, `.epub`, HTML paginado e PDF editorial).

---

## 2. Pré-requisitos de Última Milha (ordem executada)

| Ordem | Gargalo apontado pela banca | Entrega técnica |
|---:|---|---|
| **1** | **Saída profissional (`.docx` e `.epub`)** | Exportador OOXML `.docx` e EPUB 3.0/2.0 `.epub` 100% offline em ES5 puro, integrado ao Estúdio de Impressão e a Ajustes. |
| **2** | **"Medo do navegador" (segurança de backup)** | Indicador discreto de saúde do backup no rodapé da folha, lembrete gentil por tempo/palavras e conexão opcional com pasta local no computador (File System Access API). |
| **3** | **Rosto humano e transparência jurídica** | Modal editorial **Sobre, Privacidade, Cartório e Licenças** acessível na barra lateral e em Ajustes + reforço explícito dos limites legais do Cartório SHA-256 (não substitui Biblioteca Nacional nem ata notarial). |

---

## 3. Formato do Beta Fechado (2 semanas)

### Composição sugerida da turma (15 a 25 beta testers)
- **5 escritores de ficção / não-ficção** (romance, conto, crônica) — testam fluxo longo, cadernos, exportação `.docx` e `.epub`.
- **3 revisores / preparadores de texto PT-BR** — testam precisão e falsos positivos do *Examinar* e abertura do `.docx` no Word/LibreOffice.
- **3 poetas** — testam assistente de soneto, rimas/métrica e preservação de quebras de verso no `.docx`/`.epub`/PDF.
- **3 estudantes (ENEM / graduação / pós)** — testam modelos de redação/ensaio, Academia e impressão A4.
- **5+ leitores/escritores em dispositivos variados** (Windows/Edge, Mac/Safari, iPhone, Android, Linux/Firefox) — testam teclado virtual, toque, offline e cópia `.scrvrl`.

### Roteiro de convite (mensagem curta para beta testers)
> Oi! Estou abrindo o **Beta Fechado do Escrevaral** (`https://escrevaral.com`), um ateliê literário brasileiro **100% offline e local-first** que venho construindo desde janeiro de 2025.
>
> Ele não exige conta, não envia seu manuscrito para nenhum servidor (`connect-src 'none'`), traz dicionário/sinônimos e lentes explicativas de português brasileiro, Academia literária, Cartório SHA-256 e exportação pronta para editora (`.docx`), Kindle/UICLAP (`.epub`) e impressão editorial.
>
> Queria seu olhar sincero de escritor(a)/revisor(a) durante 15 dias — sem cerimônia e sem elogio protocolar. Se puder testar 3 coisas:
> 1. Escrever ou estruturar um texto curto ou capítulo dentro de um caderno.
> 2. Experimentar o **Examinar** (e anotar se alguma observação pareceu falsa ou confusa).
> 3. Exportar em **`.docx`** ou **`.epub`** e abrir no Word / LibreOffice / leitor de e-book, além de guardar uma cópia `.scrvrl`.

### Perguntas objetivas de fechamento do Beta (formulário de 5 minutos)
1. **Primeiros 30 segundos:** você entendeu imediatamente o que é o Escrevaral e onde começar a escrever? O que confundiu?
2. **Confiança e backup:** você se sentiu seguro(a) sobre onde seus textos ficam guardados? A cópia `.scrvrl` / pasta local ficou clara?
3. **Motor de português (*Examinar*):** houve algum falso positivo que incomodou ou alguma explicação que realmente ajudou?
4. **Saída profissional:** o `.docx` abriu limpo no seu editor? O `.epub` abriu bem no Kindle/Calibre/Apple Books?
5. **O que te faria migrar seu próximo livro para o Escrevaral hoje?**

---

## 4. Critérios de passagem para o Lançamento Público Geral

- [ ] Nenhum bug crítico de perda de texto ou trava de digitação/IME nos 15 dias de beta.
- [ ] `.docx` validado por pelo menos 3 revisores no Microsoft Word, LibreOffice Writer e Google Docs.
- [ ] `.epub` validado no Kindle Previewer / Calibre / Apple Books (sumário, capítulos, acentuação PT-BR).
- [ ] Nota transparente de alcance das lentes linguísticas revisada com base no feedback dos revisores do beta.
- [ ] Suíte automatizada (`npm run build:check` + `npm test`) verde no GitHub Actions.
