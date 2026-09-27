# Entrega v6-25 — organização e transporte

- **Objetivo:** pausa técnica aprovada por Rafael: fontes profissionais, cofre transportável, conectores documentados e avaliação de motor brasileiro antes de integração.
- **Base:** `rfmss/escrevaral`, main `f095b784424106f7d00c5285e190a696cd13344f`, conferida em 27/09/2026. Usuário autorizou implementação e publicação autônomas no escopo; auditoria ampla adiada por decisão explícita.
- **Fontes:** código real da main; README/licença/código do Portparser.v2 no commit fixado. Nenhuma nova alegação de leitura dos livros recebidos.
- **Alterações:** 47 módulos JS e 15 fontes CSS declarados no manifesto; index com estrutura e recursos externos; portátil gerado; pacote cofre sem editor; inventários separados; build determinístico, hashes e cache coerente; servidor local e CI; documentação de arquitetura e conectores.
- **Integridade:** 46 dos 47 módulos mantiveram os bytes no momento desta entrega. A única mudança de lógica nesses módulos é não tentar registrar service worker no protocolo `file:`. Manifesto de extração preserva hashes da base. A estrutura do service worker e da montagem foi substituída de forma deliberada para acomodar recursos externos.
- **Evidência técnica:** `npm run build:check`; 17 scripts essenciais via `npm test`; cofre copiado para pasta temporária e executado sem DOM/armazenamento; 290 casos equivalentes entre ordem original e pacote isolado; regressões existentes de revisão, posições, IME, cancelamento, documentos/cadernos e corpus. Cache testado por simulação, incluindo hashes inválidos, versão completa e rotas.
- **Portparser:** código MIT recebido seletivamente com hashes, adaptador CoNLL-U testado com anotação manual própria. Pesos, léxicos e runtime de inferência não instalados. Não há novo motor de produto nem evidência de qualidade do modelo medida por nós.
- **Navegador:** tentativa de executar `tests/ptbr-browser.cjs` interrompida por ausência de `chromium_headless_shell-1187`. Não foi produzida nova certificação visual ou de offline real nesta etapa. Workflow de auditoria disponível separadamente.
- **Estados:** fontes separadas / cofre implementado e testado / integração da montagem feita / modelo externo somente preparado / publicado; CI e deploy confirmados.
- **Limites:** controlador legado grande, namespace de compatibilidade na aplicação, cascata CSS histórica, auditoria ampla e avaliação reservada pendentes. Ausência de achados não certifica qualidade do texto.
- **Reversão:** reverter a entrega via commit normal; não há migração do formato de manuscritos nem mudança das chaves persistidas. Reverter também worker/distribuição de forma coerente; nunca force push.
- **Próxima ação:** preparar ambiente e protocolo reservado do Portparser; somente decidir integração após custo, alinhamento e licenças conhecidos.

## Publicação confirmada

- Commit local de preparação: `6580799f4391731f22dea94cfa479b828415cc25`.
- Commit remoto na main: `db3fde26d0662568ac198f878d3cc861babfc8f0`.
- Árvore idêntica conferida: `8641dcad965017a3f728e8596caddfe480691388`. Main local alinhada sem apagar alterações.
- [CI de integridade](https://github.com/rfmss/escrevaral/actions/runs/36299175168): **success**, incluindo instalação pelo lockfile, 17 verificações, montagem e diff reproduzível em Node 22.
- [GitHub Pages](https://github.com/rfmss/escrevaral/actions/runs/36299174790): **success**.
- Destino: https://escrevaral.com. Confirmação de deploy pela API do GitHub; não equivale a nova inspeção visual do domínio neste ambiente.
- Este registro posterior altera documentação; não altera a distribuição do editor.
