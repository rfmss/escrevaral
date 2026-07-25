# Política de segurança

A segurança do Escrevaral inclui a proteção dos manuscritos, a previsibilidade do armazenamento local, o funcionamento sem internet e a ausência de transmissão indevida de texto.

## Versões cobertas

Enquanto o projeto estiver antes da versão 1.0, recebem correções de segurança:

- a versão publicada em `https://escrevaral.com`;
- a branch `main`, quando a falha também estiver presente nela.

Versões antigas, cópias modificadas e implantações de terceiros não são cobertas.

## Como relatar uma vulnerabilidade

Envie o relato para `oi@escrevaral.com` com o assunto `Segurança — Escrevaral`.

Inclua, quando possível:

- descrição objetiva da falha;
- passos mínimos para reprodução;
- navegador, sistema e dispositivo;
- impacto observado ou provável;
- arquivos ou superfícies afetadas;
- demonstração sem dados pessoais ou manuscritos reais.

Não abra uma issue pública antes da triagem quando a falha puder:

- expor ou apagar manuscritos;
- transmitir conteúdo sem consentimento;
- contornar validações de importação ou cópia de segurança;
- executar código inesperado;
- comprometer o escopo do service worker;
- revelar credenciais ou configuração privada.

## Processo esperado

O mantenedor procurará:

1. confirmar o recebimento;
2. reproduzir ou pedir evidência adicional;
3. classificar o impacto;
4. preparar uma correção e os testes correspondentes;
5. publicar a correção antes da divulgação detalhada.

Não há programa de recompensa financeira. Relatos responsáveis podem receber crédito público, com autorização da pessoa que reportou.

## Limites do produto

O Escrevaral preserva dados no navegador e permite exportação, mas o armazenamento local pode ser apagado pelo navegador, pelo sistema ou pela própria pessoa usuária. Isso não substitui cópias de segurança externas mantidas pela pessoa que escreve.
