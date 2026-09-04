# Runtime de cápsulas — contrato operacional

## Decisão

O Escrevaral guarda todos os recursos necessários no cache offline durante o primeiro acesso, mas não executa nem mantém todas as engines na memória.

Cache em disco e RAM são responsabilidades diferentes:

- `encore.appcache` prepara os arquivos para reabertura offline no iOS 9.
- `src/core/engine-capsule-worker.js` importa somente a oficina selecionada.
- Trocar a lente, fechá-la ou editar o texto encerra o Worker anterior.
- Resultado único ou vazio fecha a cápsula imediatamente.
- Havendo vários resultados, a cápsula permanece apenas para Anterior/Próximo e mostra um achado por vez.
- Um timeout de 20 segundos fecha a oficina que não responder, protegendo a escrita.

## Dependências por oficina

| Oficina | Código/dados residentes durante o uso |
|---|---|
| Morfologia | tokenizer, seed, exceções, lemas core, morphology |
| Orações adjetivas | relative-clause |
| Vocabulário decolonial | decolonial-data, decolonial |
| Rima e métrica | rima-metro |
| Voz e estilística | voz-estilistica |
| Pontuação | pontuacao + relative-clause como apoio interno às regras PONT-18/19 |
| Sintaxe | syntax-data, norma-data, sintaxe |

O apoio de orações relativas na pontuação vive e morre dentro da mesma cápsula. Ele não registra uma segunda oficina na página.

## Evidência local em 4 de setembro de 2026

- Sete configurações de cápsula executadas com as dependências reais: 7/7.
- Fechamento, isolamento e Anterior/Próximo exercitados em VM.
- Manifesto ligado à página, sem caminhos ausentes e sem scripts de engine/dados no HTML: 7/7.
- Regressão total do branch: 20/20 suítes, 234/234 casos.

Isso verifica código e integração local. Não verifica Safari iOS 9, consumo real de RAM nem AppCache no dispositivo.

## Limite ainda aberto: “achou, parou”

A interface apresenta um achado por vez, mas as engines atuais ainda calculam a lista inteira de forma síncrona dentro do Worker. Portanto, a escrita não trava, porém o cálculo ainda não para no primeiro achado.

Para cumprir o princípio por inteiro, cada engine precisará de um cursor próprio:

```text
scan(snapshot, cursor, limit=1) -> { finding, nextCursor, done }
```

Essa mudança será feita por engine, com banca de equivalência. Não será tratada como pronta por existir paginação visual.

## Gate físico no iPad certificado

Na próxima sessão com o iPad MD531GP/A, iOS 9.3.5:

1. Abrir `experiments/piso-2012/engine-house.html` online e aguardar o AppCache concluir.
2. Ativar modo avião, fechar e reabrir a página.
3. Testar primeiro Decolonial e Sintaxe, as cápsulas mais pesadas.
4. Confirmar resultado, escrita responsiva e ausência de recarga.
5. Alternar rapidamente entre duas lentes e confirmar que só a última responde.
6. Editar o manuscrito durante uma lente e confirmar o descarte da análise antiga.
7. Percorrer Anterior/Próximo numa oficina com vários achados.
8. Repetir a morfologia 29/29 por causa do tokenizador 1.0.1.

O gate automático executa as sete oficinas em sequência, mantém no máximo um Worker residente, mede tempo e atraso visual e não exige digitação.

Somente depois desse gate o runtime poderá receber evidência física. Nenhuma engine muda de maturidade por este trabalho.
