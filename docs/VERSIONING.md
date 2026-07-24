# Política de versionamento

O Escrevaral adota [Versionamento Semântico](https://semver.org/lang/pt-BR/) no formato `MAJOR.MINOR.PATCH`.

## Durante a fase `0.x`

O projeto está em evolução estrutural. Antes da versão `1.0.0`:

- `0.MINOR.0` identifica um conjunto relevante de funcionalidades, mudanças de experiência ou evolução técnica;
- `0.MINOR.PATCH` identifica correções compatíveis e ajustes de documentação;
- mudanças que afetem dados locais, formato de backup ou cache precisam incluir migração, compatibilidade ou instruções explícitas de recuperação.

A primeira versão pública planejada é **`0.1.0`**, com o nome **“Base pública do Escrevaral”**. Ela ainda não deve ser criada apenas porque a documentação está pronta.

## Critérios para `v0.1.0`

- README, licença, política de segurança e changelog revisados;
- site publicado abrindo sem erros críticos;
- fluxo principal de escrita e retomada testado;
- backup, exportação e restauração documentados e verificados;
- layout e navegação revisados nas larguras prioritárias;
- teste de integridade aprovado;
- nenhum segredo, manuscrito pessoal ou arquivo privado no repositório.

## Critérios para `1.0.0`

A versão `1.0.0` só será considerada quando editor, acervo, backup/importação, cache offline e fluxos principais tiverem comportamento estável e limites documentados nos navegadores suportados.

## Releases

Cada release deve:

1. usar uma tag `vMAJOR.MINOR.PATCH`;
2. mover as mudanças correspondentes de `Não publicado` para uma seção datada no `CHANGELOG.md`;
3. informar migrações, limitações e riscos de compatibilidade;
4. registrar os comandos e ambientes de teste;
5. evitar chamar uma versão de estável sem evidência dos fluxos de conservação de texto.
