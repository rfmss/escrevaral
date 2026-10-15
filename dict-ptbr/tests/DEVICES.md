# Ensaios de aparelho — Fase 0

Estado em 09/10/2026: nenhum aparelho-alvo executado. Especificação ES5 e DOM
simulado não equivalem a aceite. Não trocar user agent ou viewport para fingir
Android 4.4/iOS 9.3.5. Ausência de execução não é falha demonstrada do produto.

## Ambiente disponível e resultados

Linux 6.18.44 x86_64, Node 24.19.0, Acorn 8.15.0, Playwright 1.55.0.
`contract.cjs`: 23 grupos aprovados, zero falhas finais. DOM e transporte são
simulados; bibliotecas/API modernas explicitamente removidas do contexto VM.
`npm run build:check`: sete saídas existentes conferidas sem alteração.

Ensaio suplementar com os binários de navegador encontrados no ambiente:
Chromium encerrou com SIGSEGV antes de abrir a página; WebKit não iniciou por
ausência de `libgstreamer-1.0.so.0`. `browser.cjs` terminou com código 1 e ambos
foram registrados como falha de ambiente, zero consultas em navegador medidas.
Não se certifica nenhuma versão desses binários. Registro resumido persistido
em `../../docs/dict-ptbr/TESTES-FASE-0.json`.

Android SDK/adb/emulator, macOS/Xcode/simulador iOS e aparelhos físicos não
estão disponíveis nesta execução. Não foi tentada instalação de imagens
históricas ou substituição por versões modernas.

## Preparação comum

Na raiz do repo, `npm ci --ignore-scripts` instala somente ferramentas de teste;
o dispositivo recebe apenas HTML/JS/manifesto locais. Gerar a fixture e conferir:

```sh
node dict-ptbr/build/fixture.cjs
node dict-ptbr/tests/contract.cjs
python3 dict-ptbr/tests/serve.py --bind 0.0.0.0 --port 8765
```

Usar rede local controlada e o IP do computador: `http://IP:8765/demo/index.html`.
O servidor é só para a primeira transferência e o ensaio; a consulta instalada
deve funcionar depois de desligá-lo. HTTP local evita confundir teste de engine
com certificados/TLS antigos; HTTPS do hospedador será um ensaio separado.
Guardar SHA do commit, modelo, versão/build do SO, versão/UA real da engine,
origem HTTP/file, capturas, registro copiável da demo e logs do servidor.

## Android 4.4 / Chromium 30

Usar imagem legalmente obtida de Android 4.4/API 19 em emulador e, se disponível,
aparelho físico. Conferir build/UA: API 19 sozinho não basta; revisões posteriores
de KitKat podem ter outra engine. Não usar o Chrome atualizado como substituto
da WebView do sistema. Registrar memória/RAM configurada do emulador.

Abrir a demo em um hospedeiro mínimo de WebView com JavaScript habilitado,
sem polyfills, bibliotecas ou substituição da engine. Registrar configuração
do hospedeiro; cache de aplicação precisa estar habilitado para o ensaio AppCache.
O hospedeiro de teste ainda precisa ser disponibilizado/identificado no laboratório.
Conferir UA Chromium 30 e, se disponível, console por depuração remota.
O carregamento inicial deve mostrar `found: café`, uma leitura, nenhum erro.
Consultar `cafés`, `CAFÉ`, `zzzzz`, `cafe`; resultados esperados são
encontrado/encontrado/ausente-na-fixture/ausente-na-fixture.
Bloquear/remover ca.js: deve aparecer erro de carga, nunca palavra inexistente.

Repetir a consulta fria após recarregar e a quente na mesma página. Registrar
20 execuções e min/mediana/máximo sem apresentá-las como cobertura de corpus.
Fase 0 exige consulta funcional; meta de <1 s e maior fragmento pertencem ao
aceite de desempenho da Fase 7, ainda sem medições.

## iPad 2 / iOS 9.3.5

Preferir iPad 2 físico já em 9.3.5; conferir Ajustes e registrar versão/build.
Safari real, sem proxy de renderização. Abrir a mesma URL pela rede local e
executar os mesmos casos. Tela inicial e Safari em aba são modos separados.
Copiar o registro da demo ou fotografá-lo; inspeção remota em Mac compatível
é apoio, não requisito para observar o resultado.

Simulador de iOS 9, se houver Mac/Xcode compatível e imagem disponível, é ensaio
complementar identificado pela versão exata. Não equivale ao iPad 2, à sua RAM
ou a iOS 9.3.5; não presumir que essa versão específica de simulador existe.
Não declarar aceite físico a partir de WebKit desktop/Playwright.

## Prova offline nos dois alvos

Abrir `http://IP:8765/demo/offline.html`; conferir MIME de `offline.manifest`
e lista dos cinco recursos. Aguardar mensagem de cache concluído. Só depois
desligar servidor e rede, fechar/reabrir URL e executar `café` novamente.
Repetir após encerrar o navegador e reiniciar o aparelho. Anotar falha, limpeza
de cache, quota e diferença entre Safari e tela inicial. Testar arquivo ausente
durante atualização e conservar a versão anterior se a engine oferecer isso.

Guardar HTML sozinho não prova offline: os scripts e fragmentos precisam
estar presentes. `file://` com pasta completa é ensaio separado onde houver
um método real de abrir essa pasta; não presumir esse fluxo no Safari iOS 9.
O ensaio desktop com rede bloqueada, quando executável, é só controle adicional.
Se nenhum caminho estático proposto funcionar no alvo, PARAR e relatar a
incompatibilidade; não adicionar worker/IndexedDB obrigatório ou wrapper de
produto sem decisão do dono.

Teto de 300.000 bytes continua provisório: bytes não são heap. Na Fase 7,
com dados autorizados, comparar baseline/pico/retorno de memória ao abrir maior
fragmento e ao alternar fragmentos; registrar ferramenta e método. Não inventar
RAM do aparelho com base em estatística de payload.

## APIs marcadas VERIFICAR

`let/const`, arrows, classes, templates, módulos, Promise, fetch, Map/Set,
normalize e Array.from não são usados. Parser ES5 e guarda textual conferem
isso agora; não existe necessidade de descobrir suporte para começar a usá-los.
AppCache, abertura local, retenção, limite real por fragmento e comportamento
de erro/carga em ambos os alvos continuam pendentes de ensaio. IndexedDB é
opcional pelo plano e não está implementado. Nunca marcar pendência como teste
aprovado somente porque uma documentação histórica descreve o recurso.

## Critério de fechamento

Dois registros de execução reais, um por alvo, com lookup `café` funcionando,
origem do carregamento e identificação inequívoca da engine/SO. AppCache tem
resultado separado. Sem esses registros, a Fase 0 permanece aguardando aceite;
não avançar à Fase 1 sem autorização explícita do dono.
