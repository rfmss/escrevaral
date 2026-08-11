# M1-R0 — candidatos de modelos para a pré-banca sintética v2

Atualizado em: 2026-08-11  
Baseline técnica anterior: `e95fda0009651b6a086429000966b5f4b5a605ae` — 18/18 workflows verdes após rerun de um 404 externo transitório de Google Fonts  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Baseline linguística sintética eleita: **não**  
Sintaxe de produção: `not_authorized`

## CLARO

### C — cenário

O harness sintético v1 já conseguia cegar casos, chamar um modelo, validar JSON, produzir três perfis de julgamento e calcular consenso, acordo bruto, Cohen's kappa e matrizes de confusão. Ele ainda deixava dois riscos experimentais abertos:

1. usar uma única família de pesos com três prompts poderia confundir diversidade de persona com independência real de modelo;
2. percorrer `caso → perfil/modelo` faria uma execução local com três pesos grandes alternar modelos repetidamente, aumentando custo de carga e ruído operacional.

### L — limites e risco registrado antes da fronteira

Nenhum modelo candidato é baseline por ter boa licença, benchmark geral ou português listado no model card. O fenômeno M1-R0 exige avaliação local em português brasileiro e contexto discursivo. A máquina onde o piloto será executado ainda precisa provar memória disponível, latência, aderência ao JSON estruturado e digest efetivamente instalado.

Portanto esta tranche:

- não aumenta nota Eva;
- não altera `Validação humana e acadêmica`;
- não cria gold;
- não abre a engine de Sintaxe;
- não versiona pesos, pacote observado nem saídas observadas;
- não declara superioridade entre modelos.

### A — arquitetura

Foi registrado um painel de **três famílias distintas**, todas com pesos sob Apache 2.0 e distribuição local conhecida no Ollama:

1. **Qwen3.5 9B** — `qwen3.5:9b-q4_K_M`;
2. **Mistral NeMo 12B** — `mistral-nemo:12b`;
3. **Granite 3.3 8B** — `granite3.3:8b`.

Fontes upstream consultadas em 2026-08-11:

- Qwen: `https://github.com/QwenLM/Qwen3.5` e `https://huggingface.co/Qwen/Qwen3.5-9B`;
- Mistral: `https://mistral.ai/news/mistral-nemo/` e `https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407`;
- IBM: `https://github.com/ibm-granite/granite-3.3-language-models` e `https://huggingface.co/ibm-granite/granite-3.3-8b-instruct`;
- runtime: páginas oficiais da biblioteca e API do Ollama.

Evidência upstream é usada apenas para **elegibilidade de benchmark**:

- Qwen3.5 declara ampla cobertura multilíngue e o checkpoint 9B usa Apache 2.0;
- Mistral NeMo cita português entre os idiomas fortes e publica MMLU Portuguese de 63,3%;
- Granite 3.3 8B inclui português entre os 12 idiomas suportados e usa Apache 2.0.

Nada disso prova a distinção `subject_recoverable × subject_indeterminate` em pt-BR.

Para separar efeito de prompt do efeito de pesos, a comparação usa três rotações balanceadas:

```text
round-a: s1→Qwen     s2→Mistral   s3→Granite
round-b: s1→Mistral  s2→Granite   s3→Qwen
round-c: s1→Granite  s2→Qwen      s3→Mistral
```

Cada perfil encontra cada família exatamente uma vez.

O runner v2 usa ordem **perfil/modelo → todos os casos**, mantém o modelo vivo durante seu lote e o descarrega ao final do perfil. Antes de executar, consulta `/api/tags`, exige os três modelos locais e registra o digest completo realmente instalado. Cada resposta usa JSON Schema, `think: false`, temperatura do perfil e seed determinística. O relatório privado registra também SHA-256 do pacote de entrada, config e registro de modelos.

### R — resultado reproduzível esperado do instrumento

A auditoria versionada deve provar, sem chamar modelo ou rede:

```text
M1-R0 modelos sintéticos: 3 famílias
Rotações balanceadas: 3
Cada perfil vê cada família exatamente uma vez: true
Piloto operacional: 4 casos
Pacote privado integral: 16 casos
Baseline eleita: false
```

A execução observada continua fora do repositório.

### O — aberto

1. recuperar ou regenerar deterministicamente o pacote privado de 16 casos;
2. instalar conscientemente os três tags locais e registrar os digests completos;
3. executar primeiro `round-a` em apenas 4 casos;
4. verificar memória, latência, JSON válido, flags e distribuição de confiança;
5. se o instrumento estiver estável, executar as três rotações nos 16 casos — 144 julgamentos sintéticos;
6. comparar efeito de perfil e efeito de família sem eleger vencedor por benchmark genérico;
7. preservar todos os desacordos e baixa confiança;
8. convocar Eva antes de qualquer teste vermelho experimental de Sintaxe;
9. manter banca humana independente e comunidade para a fase madura.

## Critério para eleger uma baseline depois

A baseline só poderá ser proposta após evidência local no recorte M1-R0. A decisão deve considerar ao menos: aderência ao contrato, estabilidade entre seeds/rodadas, capacidade de manter ambiguidade, erros contra controles explícitos, custo local e padrão de desacordo. **A maior taxa de consenso não vence automaticamente**, porque consenso fácil pode ser sobreconfiança correlacionada.
