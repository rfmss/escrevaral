# Encerramento da versão 1.0.0

Versão: `1.0.0`  
Codinome: Argila  
Commit de promoção: `4186776a9dfb1fa408bdf1387cac82a2ce12e9cd`  
Tag: `v1.0.0`  
Release: `https://github.com/rfmss/escrevaral/releases/tag/v1.0.0`

## Estado final

A janela de estabilização foi encerrada depois de:

- baseline `1.0.0-rc.1` incorporada;
- checklist de lançamento concluído;
- zero P0 e zero P1 reproduzidos;
- Teste Master e candidata de lançamento verdes;
- atualização e recarga offline da PWA validadas;
- tag ligada exatamente ao commit de promoção;
- GitHub Release pública, não rascunho e não pré-release;
- produção acessível em `https://escrevaral.com/`.

## Contratos preservados

A versão foi promovida sem alterar:

- HTML, CSS ou JavaScript do produto na etapa final;
- formato `.esc`;
- esquema de armazenamento local;
- rotas públicas;
- escopo do service worker;
- cache ou versão técnica dos assets;
- filosofia offline-first e funcionamento sem conta.

## Evidência automática

O workflow `stable-release-closure-pr.yml` verifica:

1. existência da tag `v1.0.0`;
2. correspondência exata entre a tag e o commit de promoção;
3. existência da GitHub Release;
4. estado publicado, não rascunho e não pré-release;
5. disponibilidade da produção e presença da identidade Escrevaral.

## Próximo ciclo

A versão 1.0.0 está fechada. Mudanças posteriores devem:

- entrar em PRs pequenos;
- preservar os gates de release;
- usar correção, versão menor ou versão maior conforme o contrato afetado;
- evitar reorganizações cosméticas sem ganho concreto de manutenção.
