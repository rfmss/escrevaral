# Autoria verificável — SPEC

**Serviço:** SCRVRL-AUTHORSHIP · **Versão:** 0.3.1

## Missão

Preservar integridade e continuidade do processo de escrita sem enviar o texto ou registrar teclas literais.

## Entrada e saída

- Entrada: nota, eventos quantitativos da sessão, raiz anterior e tempos locais.
- Saída: cápsula SHA-256 encadeada e pacote privado `scrvrl` verificável.
- Runtime: um Worker por selo; resposta devolvida; Worker terminado.

## Protocolo atual

- serialização canônica com chaves ordenadas;
- SHA-256 do título e texto em UTF-8;
- segundo hash com finais de linha normalizados por `line-endings-v1`;
- sequência iniciada em `GENESIS`;
- cada cápsula inclui o hash da anterior;
- eventos limitados a tipo, tempo relativo e contagens;
- hora civil marcada como `device-declared`;
- testemunha independente marcada como `pending`;
- pacote privado contém o texto; cápsulas não contêm texto.
- exportação determinística e importação verificável rodam no Worker;
- aparelhos modernos podem baixar `.scrvrl`;
- o piso 2012 guarda uma cópia serializada em compartimento local separado;
- `Recomeçar` apaga a folha de teste, não essa cópia;
- transporte `S2` converte o pacote para Base64 UTF-8 e divide em blocos pequenos;
- o hash SHA-256 viaja uma vez no início da carga remontada, não em todo QR;
- cada bloco leva identidade curta, posição, total e CRC-32 local;
- o emissor no iPad mantém o pacote dentro de um Worker e devolve um bloco por vez;
- o Worker e o QR são descartados ao fechar a função;
- o receptor pode aceitar blocos fora de ordem, ignorar repetidos e retomar uma sessão salva;
- a reconstrução só termina quando o SHA-256 do pacote completo confere.

## Fora do escopo 0.3.0

- assinatura do autor;
- identidade civil;
- timestamp independente;
- Merkle por fragmento;
- registro público;
- detecção infalível de IA ou plágio;
- segurança contra chave roubada ou replay.
- criptografia do pacote durante a exposição dos QR;
- câmera/receptor na interface;
- transferência física completa do `.scrvrl` para outro aparelho, ainda em gate.

## Quadro do transporte S2

`S2 | id | posição | total | CRC-32 do bloco | fragmento`

A carga remontada começa com `SHA-256 do pacote | Base64`. Isso preserva a conferência final sem obrigar o iPad a redesenhar os 64 caracteres do hash em cada quadro.

O CRC-32 detecta erro de leitura em um bloco; não é a prova criptográfica. O SHA-256 final é quem confirma a reconstrução exata. O QR carrega fragmentos do pacote privado, portanto esta versão deve ser usada em ambiente controlado: confidencialidade só poderá ser alegada depois de uma camada de criptografia testada.

## Critérios do gate físico

1. selar título e texto no iPad alvo;
2. criar e descartar o Worker;
3. recuperar pacote e raiz depois de fechar;
4. repetir em modo avião;
5. rejeitar uma cópia com um caractere alterado;
6. registrar tempos sem travamento observado.
7. guardar em compartimento separado, recomeçar e trazer o pacote em modo avião;
8. recuperar a mesma raiz e recusar um pacote alterado.
9. abrir `Enviar por QR`, observar rotação e pausa sem travamento;
10. fechar o QR e confirmar que a cápsula deixou de residir;
11. repetir em modo avião.
