# Bancada pública

Na raiz do repositório:

```sh
node astra/testes/run.js
node astra/oficina/empacotar.js --check
```

O produto não requer Node. A bancada usa módulos internos do Node e seu parser Acorn para a verificação ES5. Se uma distribuição não incluir esse parser interno, a oficina pode fornecer `acorn` separadamente; isso nunca entra no produto.

Resultado executado em 9 de setembro de 2026, Node v24.19.0: 351 verificações aprovadas, zero falhas. Destas, 168 são casos anotados do corpus. Há também 47 casos de transplante, testes de poesia e 52 verificações gramaticais; veja [o balanço da Fase 2](../FASE2.md). As demais verificam contrato, limites, determinismo, desacoplamento, armazenamento, concorrência, quota, corrupção, exportação, importação, edição durante importação, invalidação de diagnósticos, atalhos, tema, sintaxe ES5 e recursos locais da edição portátil.

`corpus-ouro.json` registra texto, lente, categoria, justificativa e os achados esperados com regra, confiança, trecho e offsets. São casos sintéticos desta oficina, exceto os fragmentos literários creditados. Categorias: correto, incorreto convencional, ambíguo, não se meta, exceção, adversarial, regressão e literatura. Não se atribuem exemplos inventados a escritoras reais.

No corpus original há nove execuções literárias: três fragmentos curtos (Machado, Clarice, Rosa), cada um passado pelas três lentes. A ausência de apontamentos nesses fragmentos não demonstra uma taxa de falso positivo representativa da literatura brasileira. A expansão para obras extensas, diferentes edições e autorização de uso permanece pendente. As novas lentes também exercitam esses fragmentos em verificações agrupadas. URLs de conferência estão nos casos; a bancada não as acessa.

Os testes de `superficie.js` usam DOM, relógio, FileReader e armazenamento simulados. Não são testes reais de navegador, renderização, leitor de tela ou aparelho. Sintaxe ES5 também não garante suporte a todas as APIs no iOS 9.3.5. A edição portátil teve os scripts extraídos e o cofre executado em contexto sem navegador e sem rede.

## Verificação no aparelho — pendente

- [ ] Abrir a edição portátil pelo aplicativo disponível, depois repetir com o aparelho desconectado.
- [ ] Escrever por uma hora; alternar aplicativos; reabrir e conferir a última versão guardada.
- [ ] Examinar uma lente por vez e verificar seleção de trecho, evidência, escolha mantida e retorno à escrita.
- [ ] Baixar `.txt` e `.json`, trazer a cópia em acervo separado e comparar os textos.
- [ ] Verificar 320, 390, 430 e 768 px, zoom de 200%, teclado virtual, foco e rolagem horizontal.
- [ ] Medir latência/memória com 200 mil caracteres e comportamento sem armazenamento disponível.
- [ ] Confirmar som opt-in e desligamento ao alternar aplicativos, quando a API existir.

Uma falha nessa etapa deve ser registrada como falha; não substituí-la por uma aprovação de sintaxe.

## Importação e medição reproduzíveis

```sh
node astra/oficina/importar-cofre.js /caminho/para/02-nosso-experimento-pr155
node astra/oficina/empacotar.js
node astra/oficina/medir-cofre.js
```

A importação exige o snapshot fornecido, confere hashes e lê somente literais. Não executa engines herdadas. O resultado da medição desta entrega está em `oficina/medicao-cofre.json`; representa V8/Linux, rede bloqueada e APIs modernas desativadas, sem DOM. Há amostras que atingem o limite de achados. Não substitui medição no navegador ou aparelho.

Atualização da roleta: oito verificações adicionais cobrem segundos, identidade no mesmo milissegundo, criação fixa, cópias antigas, folhas vazias, revelação da nota e carregamento progressivo com posição preservada. A restauração de datas foi adicionada ao teste de backup existente. Movimento e inércia reais continuam pendentes de conferência no aparelho.
