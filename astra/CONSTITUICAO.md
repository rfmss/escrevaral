## 3. A CONSTITUIÇÃO INEGOCIÁVEL

### 3.1 O que é

Uma mesa de escritor: "um lugar de fazer nada, com tudo que precisa". A interface é uma oficina silenciosa em volta do manuscrito. Não é chatbot, não é corretor com IA, não é plataforma. É uma **máquina local de instrumentos linguísticos** e um **sistema especialista de linguagem**: gramática artesanal, verificável, que explica cada diagnóstico. Assim como o Grammarly é nativo do inglês, o Escrevaral é a ferramenta nativa de quem escreve em português brasileiro.

### 3.2 Modelos de linguagem (decisão irreversível)

O Escrevaral **não depende de modelo treinado, LLM, API, rede ou IA para funcionar** — planeje zero disso no produto final. Regra de ouro: **nenhuma tecnologia usada para construir é requisito para executar.** A IA é a fábrica, não a máquina. Todo conhecimento produzido com ajuda de IA aterrissa em artefatos duráveis e independentes dela. Modelos locais opcionais só no futuro, para fenômenos comprovadamente não determinísticos, com benefício mensurável, cabendo no hardware e sem inutilizar o editor na ausência deles. Se der para resolver por regra, resolva por regra.

### 3.3 Três pilares

- **Privacidade por princípio:** o manuscrito nunca sai do aparelho; sem conta, servidor, nuvem, análise remota ou telemetria; não existe backend.
- **Transparência por design:** nada é caixa preta; cada sinalização tem regra identificável, evidência e limite de confiança; a escritora pode discordar; o sistema sabe dizer "não sei".
- **Sem agenda corporativa:** gratuito para sempre, sem plano pago, sem anúncio, sem gamificação (nada de racha, metas, placares, produtividade).

### 3.4 Tese de experiência: dois estados mentais

- **Escrever** — a tela quase nua: silêncio, tipografia confortável, cursor, respiro; as ferramentas somem.
- **Examinar** — quando a pessoa pede, a oficina se revela sob demanda, com evidência, contexto, ambiguidade e instrumentos.

Nenhuma análise roda continuamente a cada tecla. A análise é ação consciente: **uma lente por vez**, a lente analisa, a análise termina. Não existe "corrigir tudo".

### 3.5 Neurociência como régua de revisão

Antes de fechar cada decisão, revise o projeto inteiro pelas lentes da neurociência e da ergonomia cognitiva: escrever é atenção contínua que qualquer interrupção quebra — o silêncio da interface é neurologia, não estética; carga cognitiva baixa durante a escrita; tipografia, espaçamento, contraste e temperatura do fundo para sessões longas e olhos cansados; feedback discreto e tardio em vez de alerta imediato; distinção nítida entre produção e exame; comando consistente por teclado; sons e animações sempre opcionais, nunca exigidos, porque custam atenção e bateria. Se uma escolha de design aumentar o atrito mental ou competir com o texto, ela está errada.

### 3.6 O cofre de análise é plug-and-play

O cofre é **independente de layout, display, tema e editor por arquitetura**: recebe texto como entrada, devolve somente diagnósticos estruturados como saída — nunca toca em DOM, tela, estilo ou apresentação. Qualquer superfície pode consumi-lo. A ponte entre cofre e interface é uma camada própria e substituível. Trocar de visual nunca reescreve o cofre.

### 3.7 O contrato de diagnóstico

Todo diagnóstico é um Finding reprodutível com: identidade (`PTBR-<DOMÍNIO>-<NÚMERO>`), lente/feature, severidade (erro / aviso / estilo / informação), confiança (alta, moderada, baixa, insuficiente — sem falsa precisão percentual), mensagem curta e específica, trecho afetado e evidência. As mensagens falam primeiro com a escritora, depois com a técnica: "A forma verbal não concorda em número com o sujeito identificado", nunca "sua escrita está incorreta". Quando a leitura é ambígua ou a variação é legítima, a classe aceita é **"não se meta"**: o bom analisador sabe ficar calado.

### 3.8 A oficina visual

A mesa segue a disciplina do iA Writer / Standard Notes (absorver a hierarquia radical, não copiar): o texto é a interface primária; o espaço vazio é funcional e protegido; largura de coluna é ergonomia; ferramentas existem sem presença permanente. Além da folha limpa, um **tema de escrita de roteiro**: fundo de papel envelhecido, tipografia de máquina de escrever e som opcional de teclado ao digitar, ao apagar (backspace) e ao enter — opt-in, discretos, desligáveis, que respeitem bateria, fones e hardware antigo. O papel velho é textura leve, não decoração que compete com a leitura.

### 3.9 Régua linguística

Observação / evidência / interpretação / ambiguidade / limite sempre distinguidas. Respostas aceitas: correto, incorreto, ambíguo e **"não se meta"**. **O autor é soberano:** analisar ≠ reescrever; nunca substituir texto ou léxico sozinho; não uniformizar voz. **Estilo não é erro:** frase longa, passiva, advérbio, repetição, gerúndio, coloquialismo, "e"/"mas" no início, inversão, parágrafo curto ou longo nunca são erros. **Na ficção não há "erro" — há escolha consciente e equívoco.** O cânone excluiu muitos: variação legítima brasileira não é defeito. **Falso positivo destrói confiança:** melhor perder diagnóstico duvidoso que interromper a autora com correção errada.

### 3.10 Vocabulário da interface (100% em pt-BR de gente)

Manuscrito (não conteúdo/draft), Acervo (não repositório), Guia de escrita (não template), Prova de autoria (não certificado), Cópia de segurança (não backup), Sem internet (não offline), Janela (não modal), Dica (não tooltip), Baixar/trazer arquivo (não download/upload), Assinatura do texto (não hash), Olhar do texto (não motor/precision). Metáforas de ofício: mesa, folha, acervo, guia, oficina, voz, autoria, rascunho.

O cofre completo de análise (visão de crescimento após a Entrega Mínima): **análise gramatical em camadas** — as dez classes de palavras + função sintática, calibrada contra Bechara, Cunha & Cintra e Nascentes; **lentes normativas** — ortografia, acentuação, hífen, pontuação, concordância, regência, crase; **lentes de texto e estilo** — repetição, legibilidade, ritmo, coesão, registro, estilometria, sempre como observação; **Espelho de Voz**; **RimaLab** (poesia como cidadã de primeira classe); **Vocabulário Decolonizador**; **Prova de Autoria** (cadência, sessões, alterações, assinatura do texto, carimbo de anterioridade); **Acervo de manuscritos**, cópia de segurança automática e exportação. Tudo no aparelho.

### 3.11 Arquitetura à prova do tempo

Três mundos separados: **Conhecimento** (regras, exceções, corpus, léxico, fontes — o que sabemos); **Máquina** (analyzers, orquestrador, serviços, cofre, bridge de editor — como executamos); **Oficina de construção** (agentes e ferramentas atuais — como construímos). A Oficina nunca é requisito de execução. Runtime concebível com tecnologia de ~2012: HTML, CSS simples, JavaScript clássico, estruturas locais, algoritmos determinísticos, armazenamento local; sem framework, dependência pesada, build obrigatório ou serviço remoto. O produto abre sem internet, escreve sem conta, analisa sem servidor, roda em hardware antigo e é mantido por humanos que nunca usaram as ferramentas que o criaram.

### 3.12 Qualidade auditável

O conhecimento linguístico vem com bateria pública de casos: corretos, incorretos, ambíguos, "não se meta"; testes normativos, de exceção, de ambiguidade, adversariais (para induzir falso positivo), de regressão e de hardware legado; corpus ouro anotado com regra e confiança esperada; controle de falso positivo sobre literatura brasileira real (Lispector, Machado, Rosa). Uma regra sem teste não está pronta.

### 3.13 Entrega mínima que valida a arquitetura

Editor off-line + orquestrador + pelo menos três lentes reais (ortografia, acentuação, pontuação mecânica) + conhecimento-base pequena com identidade de regra + diagnósticos padronizados + corpus ouro inicial + testes + tudo rodando sem rede, sem conta e sem IA. A partir daí, cresce por adição de lentes e profundidade.

### 3.14 O que o Escrevaral NÃO tem, jamais

IA escrevendo, completando ou "melhorando" frase; modelo treinado obrigatório; empresa lendo rascunho; nuvem, login, publicidade, versão paga/pro; framework por conveniência; notificação, sugestão automática, polícia da escrita, gamificação; reescrever em silêncio; tratar originalidade como defeito.

### 3.15 Critério de sucesso

Uma escritora brasileira abre, escreve por uma hora e a ferramenta fica fora do caminho; quando ela pede, a mesa se revela com instrumentos que se explicam; o que ela escreveu jamais sai do aparelho; cada diagnóstico é auditável e discordável; o cofre continua idêntico quando o visual muda; e o produto continuaria existindo se toda a IA que ajudou a criá-lo sumisse amanhã. Você usou neurociência para justificar cada atrito removido.

