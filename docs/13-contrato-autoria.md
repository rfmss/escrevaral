# Contrato de autoria do Escrevaral Encore

## Definição do produto

> O Escrevaral é uma carteira de originais verificáveis com uma oficina de escrita dentro. Feito no Brasil para quem escreve em português brasileiro.

Promessa pública:

> Editor sem IA. Texto no seu aparelho. Processo registrado. Anterioridade verificável.

Os dois pilares têm o mesmo peso:

1. carteira privada de originais verificáveis;
2. oficina completa de escrita em português brasileiro.

## O acordo com quem escreve

O Escrevaral registra somente o necessário para sustentar a prova:

- versões hash do título e do texto;
- ordem dos selos;
- duração relativa das sessões;
- quantidades inseridas e removidas;
- colagens, foco, desfoco e pausas;
- declaração explícita do autor no fechamento;
- assinatura da chave do autor, quando essa camada estiver disponível;
- recibo de tempo independente, quando houver conexão.

O rastro não guarda teclas literais, palavras escolhidas, câmera, áudio ou captura de tela. O texto completo permanece no pacote privado `.scrvrl`; o registro público recebe somente prova criptográfica e metadados mínimos.

Sair do aplicativo não apaga a autoria. Fecha um segmento e abre outro. Colagem é registrada como colagem, não tratada automaticamente como fraude.

## O que o certificado prova

| Camada | Evidência | Limite honesto |
|---|---|---|
| Integridade | SHA-256 exato, cadeia de cápsulas e, depois, árvore de fragmentos | Mostra alteração; não identifica sozinho uma pessoa |
| Processo | Eventos quantitativos e tempos relativos, sem conteúdo | Sustenta construção gradual; não torna fraude impossível |
| Identidade | Chave do autor, assinatura e declaração | Prova controle da chave; identidade civil exige vínculo adicional |
| Anterioridade | Testemunha externa do hash | Prova que o hash existia até aquela hora; não lê o texto |

O Escrevaral não declara “texto humano infalível”, não decide plágio e não substitui perícia ou registro legal. Uma raiz anterior é evidência forte a comparar, não sentença automática.

## Tempo offline sem ficção

O runtime mantém três tempos separados:

1. tempo relativo monotônico da sessão: ordem e duração enquanto a página está viva;
2. hora civil declarada pelo aparelho: útil, porém ajustável pelo usuário;
3. hora testemunhada externamente: recibo obtido por um serviço independente sobre o hash.

Depois de pausa, fechamento ou bateria zerada, a cadeia criptográfica sobrevive no armazenamento. O tempo relativo recomeça em uma nova sessão ligada à raiz anterior. O sistema compara a hora civil com o último selo e sinaliza retrocesso, mas não inventa uma “hora da internet” offline.

Uma bateria sem energia interrompe qualquer relógio puramente em software. Portanto, anterioridade independente funciona assim:

`registrar offline -> enfileirar raiz -> conectar quando possível -> enviar somente o hash -> guardar recibo`

## Dois pisos de dispositivo

O ano não será a única decisão. O Escrevaral detecta capacidades e escolhe a implementação mais segura disponível.

| Piso essencial | Piso reforçado |
|---|---|
| iPad 2012 / iOS 9.3.5 como aparelho certificado | Dispositivos com WebCrypto e armazenamento moderno comprovados |
| ES5, Application Cache, Worker descartável | Mesma semântica de certificado |
| SHA-256 puro em JavaScript | SHA-256/WebCrypto quando seguro |
| Chave portável e proteção compatível a validar | Chave não extraível quando o navegador permitir |
| Carimbo externo posterior | Carimbo externo imediato ou posterior |

Os certificados usam o mesmo formato e o mesmo verificador. O piso reforçado protege melhor a chave; não muda o significado da integridade ou do carimbo.

## Plano de voo completo

### Marco 0 — pista comprovada

- iPad MD531GP/A, iOS 9.3.5;
- offline após primeiro carregamento;
- Web Workers criados e descartados;
- morfologia 29/29 no aparelho.

### Marco 1 — piso de integridade e continuidade

- SHA-256 local, licenciado e versionado;
- rastro sem conteúdo;
- debounce antes de selar;
- uma cápsula Worker por selo;
- cadeia `GENESIS -> cápsula -> cápsula`;
- persistência local;
- verificador que rejeita um caractere alterado;
- gate físico no iPad, inclusive reabertura em modo avião.

Saída: prova técnica de integridade local, ainda sem assinatura e sem hora independente.

### Marco 2 — pacote privado `.scrvrl`

- nota, título, histórico e cápsulas;
- hash exato e hash normalizado apenas para finais de linha;
- árvore Merkle privada para provar fragmentos sem publicar a obra inteira;
- exportar, importar e verificar offline;
- teste de corrupção e recuperação.

Saída: original portátil e verificável em qualquer Escrevaral compatível.

### Marco 3 — assinatura do autor

- avaliar TweetNaCl/Ed25519 no iPad físico;
- gerar a chave no aparelho;
- separar chave privada, chave pública e declaração;
- criar recuperação consciente da chave;
- piso reforçado usa proteção nativa quando disponível;
- ataques de chave copiada e pacote reencenado entram na banca adversarial.

Saída: prova de que a mesma chave declarou e assinou aquele original.

### Marco 4 — testemunha temporal

- fila offline de raízes pendentes;
- endpoint recebe somente raiz, assinatura, chave pública e nonce;
- primeiro adaptador: OpenTimestamps ou autoridade equivalente avaliada;
- trilha futura: ACT ICP-Brasil para modalidade de maior rigor;
- recibos são guardados no `.scrvrl` e na carteira;
- relógio alterado, repetição e recibo inválido entram nos testes.

Saída: anterioridade verificável por terceiro sem revelar o texto.

### Marco 5 — carteira e validador público

- calendário organiza originais por criação;
- código público curto aponta para a raiz registrada;
- `validar` mostra hash, chave, assinatura, carimbo, protocolo e estado;
- o validador não mostra o texto;
- o autor pode provar um fragmento com um pacote seletivo;
- comparação de duas reivindicações exibe datas e evidências sem emitir sentença de plágio.

Saída: carteira privada no aparelho e conferência pública mínima.

### Marco 6 — casa do escritor

- abertura com citação diária offline;
- novo papel, título obrigatório e uma nota por vez;
- várias notas por dia, ordenadas pela hora de criação;
- salvamento e recuperação;
- linha do tempo à direita;
- tema e-ink creme e interface sem menus permanentes;
- rodapé com a promessa pública.

Saída: o mecanismo de prova vira uma experiência de escrita, não um painel forense.

### Marco 7 — oficina PT-BR

- cada análise carrega uma única engine;
- o Worker acha um resultado, devolve, para e é descartado;
- cofre linguístico com proveniência, specs, corpora e maturidade;
- morfologia, orações adjetivas, pontuação, sintaxe, voz, rima e decolonial entram somente após seus gates;
- dicionários grandes são divididos em fragmentos sob demanda.

Saída: oficina completa sem obrigar o escritor a trocar de janela e quebrar a continuidade da sessão.

### Marco 8 — resistência e lançamento

- replay automatizado, colagem, transcrição humana, relógio adulterado e chave roubada;
- privacidade e minimização LGPD;
- revisão jurídica e pericial independente das alegações;
- teste com escritores de diferentes idades e perfis de atenção;
- recuperação de desastre, backup e migração;
- política de protocolo e verificador durável.

Saída: lançamento com afirmações proporcionais à evidência.

## Regra de avanço

Cada marco só avança quando muda algo observável no mundo: código executado, teste reproduzido ou validação externa. Documento sem gate não promove maturidade.

Decisão atual -> executar o Marco 2 em fatias verificáveis, sem promover maturidade antes do gate físico.

Próxima ação -> guardar uma cópia separada no iPad, recomeçar e trazê-la em modo avião.

Critério -> recuperar título, texto, número de cápsulas e a mesma raiz sem selecionar ou digitar o pacote.

Teste -> confirmar descarte do Worker e distinguir recuperação local de transporte entre aparelhos. Depois, avaliar o QR fragmentado do Eskrev como canal físico do piso 2012.
