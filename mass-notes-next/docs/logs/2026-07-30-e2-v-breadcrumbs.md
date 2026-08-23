# E2-V — Breadcrumbs do Pack Verbal PT-BR

Data: 2026-07-30  
PR: `#155`, rascunho  
Branch: `experiment/mass-notes-tiptap`

Registro aditivo: tentativas rejeitadas não serão apagadas.

## B0 — Restabelecimento da baseline

### Cabeça inicial

`d0d12ca4f0bf1ecebaea2ddb7fa223c9be83c8d8`

A cabeça documental posterior à OBS-02/03 estava vermelha em três provas Firefox: sincronização de exportação e dock. A cabeça funcional anterior `f7c2db1` permanecia como evidência verde de produto.

### Primeira estabilização

Foram corrigidos os contratos das provas:

- dock: aguardar `data-toolbar-docked="true"` antes de medir geometria;
- exportação: observar o recovery snapshot do rascunho antes de enviar `Ctrl+S`.

Cabeça intermediária: `7bb7cd21735c4c448b91935aa19b5e54073b42c6`.

Resultado: 335/338. Dock e Gate 9 passaram. As falhas migraram para recuperação, seleção lexical e conflito integrado.

### Segunda estabilização

Correções sem aumento de timeout ou retry:

- recuperação: exigir no recovery snapshot o texto completo, incluindo o último caractere, antes de fechar a aba;
- seleção lexical: usar `Control+Home` e provar a seleção real antes de abrir Palavras;
- conflito simples: provar que as duas abas estão em `Alterado` antes de salvar a versão remota.

O conflito integrado M0.9 não foi alterado sem nova reprodução.

### Baseline aprovada

Cabeça: `81c4b0752e101ca2d9404a954cb575b9175bbffe`

- Mass Notes: `30564061964`;
- job: `90944097660`;
- matriz: **338/338**;
- auditoria lexical, TypeScript e build: aprovados;
- publicação, cache e smoke: aprovados;
- coerência: `30564062161`, aprovada;
- Argila: `30564061951`, aprovada.

Classificação: **B0 verde; feature verbal autorizada a começar**.

## V0–V6 — Primeira candidata integrada

Cabeça testada: `1ab5e3825888fff2e4428a70da91fae524e395ec`  
Mass Notes: `30567353563`  
Job: `90955115548`

Entregas presentes:

- contrato tipado de análise verbal;
- paradigmas regulares por regra;
- irregulares frequentes em dados curados;
- reconhecimento seguro do inventário irregular legado;
- próclise, ênclise e mesóclise;
- tempos compostos, progressivo, futuro perifrástico e voz passiva;
- contexto exato da ocorrência selecionada;
- cartão verbal genérico e independente do verbete lexical;
- corpus verbal positivo, negativo e contextual;
- seis cenários novos por navegador.

Resultado:

- auditoria, TypeScript e build: aprovados;
- Argila e coerência: aprovadas;
- matriz: 350 execuções iniciadas, **317 aprovadas e 33 falhas**;
- publicação, cache e smoke: bloqueados corretamente.

### Causas provadas

1. **Sobregeração morfológica:** qualquer palavra terminada como uma flexão possível podia gerar lemas inexistentes, por exemplo `melancolia → melancoliar/melancolier/melancoliir`.
2. **Precedência indevida:** uma hipótese verbal fraca ocultava classes contextuais já resolvidas pela engine lexical, como conjunção, advérbio, substantivo e adjetivo.
3. **Compatibilidade de rótulo:** `Forma verbal analisada` não satisfazia o contrato histórico `/verbo/i`.
4. **Ambiguidade estrutural:** `cantarem` foi escolhido como infinitivo pessoal mesmo depois do conector `quando`.
5. **Expectativa editorial:** a banca procurava `tempo composto` em minúsculas, enquanto o cartão apresenta `Tempo composto`.
6. **Falha antiga isolada:** uma criação de documento no Gate 6 falhou uma vez no Firefox; nenhuma correção foi aplicada sem repetição.

### Correções da segunda candidata

- formas regulares simples só são apresentadas quando o lema reconstruído existe no inventário local;
- construções explícitas com clíticos e locuções continuam podendo analisar lemas produtivos;
- a classe lexical contextual tem precedência, exceto quando ela própria reconhece verbo/particípio ou a construção é explicitamente verbal;
- o heading passa a `Verbo — forma analisada`;
- `quando/se/caso` favorecem futuro do subjuntivo; preposições favorecem infinitivo pessoal;
- infinitivo pessoal deixa de receber rótulo de modo subjuntivo;
- capitalização do corpus de locuções é alinhada à interface sem afrouxar a classificação.

## Guardrails ativos

- baseline e feature permanecem em commits separáveis;
- nenhuma mudança em `lexical-engine.js`;
- nenhuma promoção para `main`;
- PR permanece rascunho;
- Gate 14 suspenso;
- nenhuma rede, substituição automática ou alteração do JSON autoral;
- nenhuma falha antiga é alterada sem repetição;
- nenhum retry ou aumento global de timeout foi adicionado.
