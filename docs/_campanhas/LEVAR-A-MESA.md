# Levar a mesa — pilar de produto e discurso de alternativa

**Última revisão:** 2026-06-24

---

## O argumento central

A nuvem resolve um problema que ela mesma criou: como acessar seus dados em outro dispositivo.

A solução dela: *coloque seus dados num servidor nosso e nós deixamos você acessar de qualquer lugar.*

O custo disso não é só o plano mensal. É conta obrigatória. É conexão contínua. É confiar que eles não leem — e eles leem. É confiar que eles não somem — e eles somem.

O Escrevaral resolve o mesmo problema de forma diferente: **sua câmera lê a tela. Nenhum servidor no meio.**

---

## O que acontece tecnicamente — em linguagem humana

Quando você clica em "Levar a mesa", o Escrevaral divide sua escrita em pedaços e exibe cada um como um código luminoso na tela. O celular aponta a câmera, vai coletando os pedaços — fora de ordem, sem pressa — e quando recebe todos, reconstrói tudo.

A transferência acontece por luz. Da tela para a câmera.

Nenhum byte passa pela internet durante o processo. Nenhum servidor está envolvido. Nenhuma conta é necessária.

---

## O argumento do pingo de 4G

Esta é a frase que muda a conversa:

> *Você usou internet uma única vez — para abrir a página de recepção. Uns poucos kilobytes de 4G. A transferência em si nunca tocou a rede.*

Isso destrói o argumento "mas você precisa de internet pra sincronizar". Não precisa sincronizar. Você leva.

**O celular não é um terminal de acesso ao servidor. É o seu acervo portátil.**

Fica no bolso. Funciona sem rede. É só seu.

---

## Para quem vem do Google Docs, Notion ou Word Online

Não dizer que somos melhores. Dizer que resolvemos diferente.

| Google Docs precisa que você | Escrevaral precisa que você |
|---|---|
| Tenha uma conta Google | Tenha uma câmera |
| Confie no Google com seus textos | Confie em você mesmo |
| Tenha internet para acessar | Tenha aberto a página uma vez |
| Pague se quiser mais espaço | Tenha memória no celular |

**Câmera você já tem.**

---

## Ciclo completo de transferência — todos os caminhos

| De → Para | Via QR (sem fio, sem cabo) | Via arquivo .esc (qualquer canal) |
|---|---|---|
| PC → Celular | PC exibe QR · celular abre /pegar · câmera lê | PC exporta .esc · celular abre /pegar · "Abrir arquivo .esc" |
| Celular → PC | /pegar "Enviar para outro PC" · webcam do PC lê | /pegar "Baixar cópia .esc" · PC importa pelo app |
| Celular → Celular | /pegar dos dois lados | "Baixar .esc" · qualquer canal · "Abrir .esc" |

O arquivo `.esc` viaja por qualquer canal que o usuário já usa: cabo USB, AirDrop, WhatsApp "Mensagens salvas", e-mail para si mesmo. Câmera não é obrigatória — é a opção mais rápida.

---

## Taglines aprovadas para este pilar

- **"Sua mesa vai com você."**
- **"Sem conta. Sem cabo. Sem servidor."**
- **"A transferência acontece por luz."**
- **"A nuvem é de outra pessoa."**
- **"Você usou internet uma vez. Para abrir esta página. O resto é seu."**
- **"Zero bytes pela rede. Só câmera e tela."**

---

## Narrativa de primeiro contato (toast no app)

Aparece depois de 3 minutos de uso, uma única vez:

> *Ei — sua mesa inteira pode ir pro celular agora, sem internet. Só câmera e tela.*
> → **Levar a mesa**

Depois de dispensada: o ícone 📡 fica na barra inferior. Clicando: abre o modal "Trazer do celular" (webcam do PC lê QR do celular).

---

## O que NÃO dizer

- ~~"Exportar por QR code"~~ — soa técnico, vira feature menor
- ~~"Backup via QR"~~ — backup é o que você faz quando tem medo de perder. Isso é levar.
- ~~"Sincronização offline"~~ — sincronização pressupõe servidor. Aqui não há.
- ~~"Alternativa ao Google Drive"~~ — comparação posiciona o Escrevaral como segundo. Apresentar como escolha, não como substituto.
- ~~"QR streaming"~~ — jargão técnico. Usar "transferência por luz" ou simplesmente "levar a mesa".

---

## Onde este discurso aparece

| Lugar | Formato |
|---|---|
| `escrevaral.com/pegar` | Manifesto completo na tela inicial; botões para todos os fluxos |
| App principal (3 min de uso) | Toast — uma vez, uma linha, link |
| Statusbar do app (📡) | Abre "Trazer do celular" (webcam) depois do primeiro contato |
| Campanha social | Frase curta + vídeo de 15s mostrando os blocos colorindo |
| README do repositório | Seção "Como funciona / Levar a mesa" |

---

## Arquitetura técnica do pilar (para referência interna)

**Protocolo QR:** `v1|id|idx|total|crc32|data` — chunks LZString+base64, CRC-32 por chunk.

**Parâmetros por direção:**
- PC → celular (câmera traseira lê tela grande): chunkSize 200, 450ms, EC Q
- Modo vídeo (chamada de vídeo): chunkSize 90, 1000ms, EC H, preto/branco puro
- Celular → PC (webcam lê tela pequena): chunkSize 90, 800ms, EC H, QR preenche tela

**Formato .esc:** envelope JSON com `format:"esc"`, `schemaVersion:1`, `checksum` FNV1a de payload com chaves ordenadas. Armazena em `vereda.manuscripts.v1`. Compatível entre todas as direções.

**PWA:** `/pegar/` tem SW próprio (escopo `/pegar/`), cacheando jsQR, LZString, qrcode.min.js. Instalável independente do app principal.

---

## O que isso diz sobre o produto

Este pilar não é uma feature. É uma posição.

Quase toda ferramenta de escrita digital assume que o escritor precisa de um servidor entre os seus dispositivos. O Escrevaral assume que o escritor tem um celular e uma câmera — e isso é suficiente.

Isso não é uma limitação técnica disfarçada de filosofia. É uma escolha deliberada: **dados do escritor ficam com o escritor**.

A nuvem é útil. A nuvem também é um acordo que você faz sem ler. O Escrevaral não pede esse acordo.
