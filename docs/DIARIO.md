# Diário de bordo

Cada entrada informa contexto, decisão, mudança, evidência, limite e próxima ação. Ordem cronológica; não apagar decisões antigas, registrar quando forem substituídas. Este arquivo é a passagem de trabalho, não um relato de intenção.

## 14/10/2026 — R01-Mesa — a primeira fatia da reconstrução

**Contexto.** Rafa autorizou iniciar depois da preservação em vaultOUT26. Pediu poucas verificações, riscos baratos e registro suficiente para outra IA continuar. A base preservada é `53c4afe5090f3bcdc3a5fac9bd920c4783a2acae` de rfmss/escrevaral, v6.63. A main não foi alterada por esta reconstrução.

**Decisão.** Nova árvore na branch reconstrucao. Texto simples para provar escrita, recuperação e exportação; formatação continua aberta. Uma folha, sem simular cadernos ou motores. LocalStorage é adaptador inicial limitado; não converte o banco antigo nem substitui a prova de IndexedDB prevista no plano. Fontes ES5 sem biblioteca no navegador. Acorn é ferramenta de desenvolvimento para verificar sintaxe, não dependência do escritor.

**Implementação.** Index declarativa, oito fábricas com dependências injetadas, bootstrap só de composição. Sessão separada de DOM e persistência. Gravação por pausa/prazo, suspensa em IME; cópia de recuperação por sessão e revisão anterior; conflito detectado pela base esperada; origem ilegível preservada. Exportação do rascunho atual em TXT, com cópia selecionável quando necessário. Sage/nanquim, fonte nativa e layout estreito sem framework, animação ou cofre. A mesma montagem gera site e portátil.

**Revisão própria.** A cópia recuperada de uma origem corrompida precisava poder ser aberta para exportação sem liberar overwrite da origem. Esse comportamento foi corrigido e incluído no cenário de corrupção. O indicador inicial que contava unidades UTF-16 foi substituído por um simples estado de escrita para não apresentar unidade técnica como contagem de caracteres. Nenhuma regra linguística foi alterada.

**Verificação.** ES5 dos módulos e bundle, fronteiras declaradas, composição privada, ausência de rede do app e tetos de tamanho. Sete cenários dirigidos: Unicode/reabertura, quota, conflito, IME, corrupção/recuperação, restauração e armazenamento negado. Sem bateria ampla, teste físico ou medição de RAM. Resultado final e tamanhos são acrescentados abaixo após a montagem final.

**Limites aceitos.** Sem importação ou migração; formato rico aberto; HTML portátil não garante storage em file:. localStorage não oferece transação atômica entre abas. Cópias por sessão não têm limpeza automática neste lote e podem atingir quota. O primeiro adaptador não é promessa de suporte a grandes acervos. CSS/teclado virtual ainda dependem do retorno de uso. CI gera artefato, não deploy de produção.

**Próximo passo.** R02-Acervo mínimo, descrito em ESTADO.md. Fechar identidade de documentos, retenção e persistência antes de copiar funcionalidades visuais do Gabinete. Motores só entram pelo contrato de análise em etapa posterior.

**Publicação.** O commit desta entrada é enviado a reconstrucao. Conferir GitHub Actions pelo SHA remoto para o resultado do CI e download do artefato; a entrada não antecipa esse resultado. A referência vaultOUT26 permanece imutável.

**Resultado local final.** `npm test`: passou, com as verificações de fronteira/ES5 e os sete cenários descritos. `npm run build`: passou. JavaScript: 16.677 bytes; CSS: 6.800; index: 3.771; portátil: 27.200 bytes. Valores sem compressão; não são RAM ou latência. Uma repetição dirigida ocorreu após a correção de recuperação de origem corrompida. Sem instalação de navegador ou bateria de outras funcionalidades.
