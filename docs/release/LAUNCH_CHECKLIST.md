# Checklist de lançamento 1.0.0

Estado: baseline `1.0.0-rc.1` validada; promoção final em preparação.

Este checklist é binário. Um item só é concluído quando há evidência observável; intenção ou aparência não bastam.

## 1. Repositório

- [x] `main` protegida por trabalho em branches e PRs pequenos.
- [x] Nenhum PR obsoleto ou conflitante aberto.
- [x] Nenhuma issue bloqueadora aberta.
- [x] Governança, segurança, suporte e contribuição documentados.
- [x] Arquitetura atual possui fonte de verdade única.
- [x] Relatórios gerados não são versionados.
- [x] Fronteira pública possui auditor automático.
- [x] `VERSION`, `README.md`, `CHANGELOG.md` e documentos de release coerentes na `main`.

## 2. Produto e dados

- [x] Criação e edição de manuscrito cobertas pela candidata.
- [x] Salvamento local e recuperação cobertos por testes.
- [x] Conflito entre abas não sobrescreve silenciosamente trabalho recente.
- [x] Exportação e cópia de segurança permanecem disponíveis.
- [x] Formato `.esc` e esquema de armazenamento não foram alterados na estabilização.
- [x] Nenhum conteúdo de manuscrito foi observado em requisições de rede.

## 3. Interface e acessibilidade

- [x] Navegação principal validada em desktop e celular.
- [x] Teclado e foco cobertos por auditoria.
- [x] Controles visíveis possuem nome acessível.
- [x] Nenhum overflow horizontal bloqueador nas larguras auditadas.
- [x] Editor, Palavras, Autoria, Acervo, Ateliê e Plano permanecem acessíveis.

## 4. PWA e publicação

- [x] `service-worker.js` permanece na raiz.
- [x] Cache e versão de assets estão coerentes.
- [x] Recursos obrigatórios do cache respondem sem erro.
- [x] Manifesto, ícones, sitemap e robots estão disponíveis.
- [x] Domínio canônico é `escrevaral.com`.
- [x] Candidata de lançamento sem P0/P1.
- [x] Verificação pós-merge da baseline na produção concluída.
- [x] Atualização da PWA remove caches antigos, preserva caches não relacionados e recarrega offline.

## 5. Comunicação de versão

- [x] `CHANGELOG.md` registra e encerra a candidata `1.0.0-rc.1`.
- [x] `README.md` aponta para a versão e o checklist atuais.
- [x] Limitações P2 conhecidas permanecem publicadas.
- [ ] Commit final de promoção identificado.
- [ ] Tag ou GitHub Release `v1.0.0` criada após o último gate verde.

## Saída

A promoção para `1.0.0` exige os dois itens finais acima, a atualização da documentação para a versão estável e uma última execução verde da candidata sobre o diff de promoção.

Depois da promoção:

1. verificar a produção;
2. testar abertura, digitação, salvamento, recarga, exportação e restauração;
3. confirmar atualização do service worker;
4. encerrar a janela de lançamento;
5. reabrir refatorações estruturais apenas em versões posteriores.
