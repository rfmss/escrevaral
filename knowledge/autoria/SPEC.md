# Autoria verificável — SPEC

**Serviço:** SCRVRL-AUTHORSHIP · **Versão:** 0.2.1

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
- transferência externa do iPad 2012 será decidida após testar o QR fragmentado do legado Eskrev.

## Fora do escopo 0.2.1

- assinatura do autor;
- identidade civil;
- timestamp independente;
- Merkle por fragmento;
- registro público;
- detecção infalível de IA ou plágio;
- segurança contra chave roubada ou replay.
- transporte do `.scrvrl` para fora do Safari no iOS 9.

## Critérios do gate físico

1. selar título e texto no iPad alvo;
2. criar e descartar o Worker;
3. recuperar pacote e raiz depois de fechar;
4. repetir em modo avião;
5. rejeitar uma cópia com um caractere alterado;
6. registrar tempos sem travamento observado.
7. guardar em compartimento separado, recomeçar e trazer o pacote em modo avião;
8. recuperar a mesma raiz e recusar um pacote alterado.
