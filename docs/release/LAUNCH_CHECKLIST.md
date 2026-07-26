# Checklist de lançamento 1.0.0

Estado: promoção final preparada e submetida ao último gate.

Este checklist é binário. Um item só é concluído quando há evidência observável ou um mecanismo automático verificável associado ao merge final.

## 1. Repositório

- [x] `main` protegida por trabalho em branches e PRs pequenos.
- [x] Nenhum PR obsoleto ou conflitante aberto na baseline.
- [x] Nenhuma issue bloqueadora aberta.
- [x] Governança, segurança, suporte e contribuição documentados.
- [x] Arquitetura atual possui fonte de verdade única.
- [x] Relatórios gerados não são versionados.
- [x] Fronteira pública possui auditor automático.
- [x] `VERSION`, `README.md`, `CHANGELOG.md` e documentos de release são verificados por CI.

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

## 5. Comunicação e encerramento

- [x] `VERSION` declara `1.0.0`.
- [x] `CHANGELOG.md` possui seção pública datada da versão 1.0.0.
- [x] `README.md` declara o primeiro lançamento estável.
- [x] Notas públicas estão em `RELEASE_NOTES_1.0.0.md`.
- [x] Limitações P2 conhecidas permanecem publicadas.
- [x] O commit final é identificado automaticamente como o `GITHUB_SHA` incorporado em `main`.
- [x] O workflow de publicação cria, de forma idempotente, a tag e a GitHub Release `v1.0.0` nesse SHA.

## Saída

A versão é promovida quando o diff final passa pela candidata completa e o workflow de publicação executa sobre o commit incorporado em `main`.

Depois da promoção:

1. confirmar a tag e a GitHub Release;
2. verificar a produção;
3. registrar o SHA efetivo de encerramento;
4. encerrar a janela de lançamento;
5. reabrir refatorações estruturais apenas em versões posteriores.
