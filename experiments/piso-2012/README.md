# Prova do Piso 2012

Experimento isolado do Escrevaral Encore para verificar o piso real no iPad mini de 2012 com iOS 9.3.5. Este é o dispositivo de certificação. O Android 4.4 foi adiado e não bloqueia a linha atual.

## Capacidade testada

`instalar offline -> carregar uma cápsula -> carregar um fragmento -> encontrar um resultado -> parar -> terminar o Worker`

Não é editor nem interface candidata ao produto. Os fragmentos artificiais medem o mecanismo; a prova de morfologia usa a engine real M3 do Encore.

## Restrições

- HTML/CSS/JavaScript compatíveis com o alvo legado;
- ES5, sem framework, bundler, módulos, `fetch`, Promise ou Service Worker;
- Application Cache para instalação no iOS 9;
- um Web Worker por execução;
- uma fonte de dados por Worker;
- o Worker é terminado assim que responde;
- a posição de retomada fica na casca, não na cápsula;
- os três fragmentos artificiais não provam qualidade linguística.

## Evidência física — 2026-09-01

Dispositivo: iPad MD531GP/A, iOS 9.3.5 (13G36), Safari.

- instalação offline confirmada no primeiro carregamento;
- página fechada e reaberta em modo avião;
- fragmentos de 1.024, 8.192 e 32.768 entradas concluídos sem travamento observado;
- cápsulas executadas em sequência e descartadas após cada resposta;
- morfologia real encontrou `cantávamos`, `veio`, `fazê-lo` e `comam`;
- partida fria da morfologia: 2.310 ms;
- execuções seguintes: 36–48 ms (amostras informadas: 36, 47 e 48 ms);
- nenhuma cápsula permaneceu ativa após a resposta.

A partida fria inclui criação do Worker, cinco `importScripts`, interpretação dos arquivos, construção da trie, análise e descarte. A faixa de 36–48 ms representa a repetição com os recursos já armazenados pelo navegador. O teste não mede heap diretamente.

## Evidência física da morfologia 1.2.0 — 2026-09-01

No mesmo iPad alvo, a banca congelada de infinitivo pessoal concluiu 12/12 casos:

- primeira passagem: 4.774 ms;
- repetições: 1.586, 1.571 e 1.563 ms;
- mediana das repetições: 1.571 ms;
- aproximadamente 131 ms por caso na mediana, incluindo criação, carga, análise e descarte do Worker;
- um Worker foi descartado após cada caso.

A reabertura em modo avião não foi repetida especificamente para a versão 1.2.0 nesta sessão. Portanto, esta evidência aprova execução e descarte físicos da tranche; o offline permanece comprovado para a arquitetura anterior, sem extrapolação silenciosa.

## Evidência física da morfologia 1.2.1 — 2026-09-02

Após a banca negativa do legado reproduzir e corrigir os homógrafos nominais `deveres` e `olhares`, o gate ampliado foi executado no mesmo iPad alvo:

- 21/21 casos;
- primeira passagem: 4.967 ms;
- repetições: 2.662, 2.658 e 2.654 ms;
- mediana das repetições: 2.658 ms;
- aproximadamente 127 ms por caso na mediana, incluindo criação, carga, análise e descarte do Worker;
- um Worker descartado após cada caso.

O total cresceu porque a banca passou de 12 para 21 Workers. O custo quente por caso permaneceu na mesma faixa e caiu de aproximadamente 131 para 127 ms. A reabertura em modo avião não foi repetida especificamente para a versão 1.2.1.

## Evidência física da morfologia 1.2.2 — 2026-09-02

Após o corpus externo UD Portuguese-GSD reproduzir um falso positivo (`três andares`) e um falso negativo (`Ao passarem`), a versão corrigida atravessou o gate ampliado no mesmo iPad alvo:

- 29/29 casos;
- primeira passagem: 6.634 ms;
- repetições: 3.642, 3.641 e 3.642 ms;
- mediana das repetições: 3.642 ms;
- aproximadamente 126 ms por caso na mediana, incluindo criação, carga, análise e descarte do Worker;
- um Worker descartado após cada caso.

O total cresceu com a banca de 21 para 29 Workers, mas o custo quente por caso permaneceu estável: ~127 ms na versão 1.2.1 e ~126 ms na 1.2.2. A reabertura em modo avião não foi repetida especificamente para a versão 1.2.2.

## Interpretação correta

O gate comprova a arquitetura de roletagem no aparelho-alvo: carregar uma engine, analisar, devolver e descartar. Não comprova cobertura linguística, corpus adversarial nem qualidade normativa da morfologia.

## Estado do gate

APROVADO no iPad alvo para:

`offline -> uma engine -> uma frase -> resposta -> descarte`

A capacidade básica do aparelho está provada. O próximo gargalo é amadurecer outra capacidade linguística, uma cápsula por vez. Nenhuma compatibilidade Android é alegada.

## Piso de autoria 0.2.1 — recuperação local aprovada

`authorship-floor.html` inicia a primeira prova do outro pilar do produto:

`escrever -> debounce -> SHA-256 -> encadear -> persistir -> reabrir -> verificar adulteração`

O rastro guarda tipos e quantidades de mudança, nunca teclas ou palavras. A hora do aparelho é explicitamente não testemunhada. Uma cápsula Worker calcula cada selo e é terminada após responder.

Gate no iPad certificado:

1. escrever título e uma frase;
2. aguardar `REGISTRADO`;
3. tocar em `Testar alteração` e obter `ALTERAÇÃO PEGA`;
4. fechar a página;
5. ativar modo avião e reabrir;
6. obter `RECUPERADO` com a mesma raiz;
7. repetir três vezes e registrar os tempos.

Gate do pacote privado:

1. depois de `REGISTRADO`, tocar em `Guardar cópia`;
2. confirmar `CÓPIA GUARDADA`;
3. tocar em `Recomeçar`;
4. tocar em `Trazer cópia guardada`;
5. confirmar `IMPORTADO`, o texto original e a mesma raiz;
6. repetir em modo avião;

O primeiro gate físico chegou a gerar o pacote, mas a cópia por `execCommand` falhou. O Safari do iOS 9 colocou o cursor no código e não ofereceu `Selecionar tudo`. Essa rota foi descartada como experiência principal.

A versão 0.2.1 testa recuperação local sem seleção manual: o pacote serializado fica em uma chave separada da folha. Isso ainda não prova transporte entre aparelhos. Em navegadores modernos permanece o download; para o iPad 2012, o próximo candidato é recuperar e adaptar o QR fragmentado do Eskrev.

## Evidência física da recuperação local — 2026-09-02

No iPad MD531GP/A, iOS 9.3.5, a sequência corrigida foi concluída:

`Guardar cópia -> CÓPIA GUARDADA -> Recomeçar -> Trazer cópia guardada -> IMPORTADO`

O autor confirmou a recuperação do texto e da mesma raiz, inclusive no fluxo offline, sem seleção ou digitação manual do pacote. Não foram informados tempos nem medido o pico de memória. O gate aprova recuperação local; transporte entre aparelhos permanece pendente.

## Emissor QR S1 — aguardando gate físico

O QR do Eskrev foi auditado no commit `d6b3851444a68921d50b8618340e4d183b6dbed8`. A ideia de blocos numerados foi preservada; módulos, Promises, câmera, clipboard e carga conjunta de bibliotecas foram recusados para o piso 2012.

O novo fluxo é:

`pacote íntegro -> Worker exclusivo -> Base64 UTF-8 -> bloco S1 -> um QR -> próximo bloco -> fechar -> descartar`

Cada bloco contém identidade, posição, total, SHA-256 do pacote completo e CRC-32 do fragmento. O receptor de protocolo aceita ordem livre, repetição e retomada; só libera o pacote quando o SHA-256 final confere. A interface receptora e a câmera não fazem parte deste gate.

Teste físico com texto sintético:

1. selar uma nota e tocar em `Enviar por QR`;
2. confirmar que aparece `BLOCO 1 DE N` e que os blocos avançam;
3. tocar em `Pausar`, `Anterior`, `Próximo` e `Retomar`;
4. tocar em `Fechar QR` e voltar a escrever;
5. fechar a página, entrar em modo avião, reabrir e repetir;
6. informar quantidade de blocos e qualquer travamento ou recarregamento.

Este emissor ainda não cifra o pacote. Os QR expõem fragmentos reconstruíveis a quem os escanear; até a criptografia existir, o teste deve usar texto sem valor privado.
