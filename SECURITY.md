# Política de segurança

O Escrevaral é uma aplicação local-first que pode lidar com textos pessoais e manuscritos. Mesmo sem armazenar esses textos em um backend próprio, falhas no navegador podem afetar privacidade, integridade ou disponibilidade dos dados.

## Problemas que devem ser relatados em privado

- risco de perda ou sobrescrita silenciosa de manuscritos;
- importação, exportação ou restauração que corrompa dados;
- exposição do conteúdo do editor em requisições externas, logs ou analytics;
- execução indevida de HTML ou JavaScript a partir de arquivos importados ou texto colado;
- falhas de isolamento entre arquivos, abas ou origens;
- comportamento inseguro de `localStorage`, IndexedDB, Cache API ou service worker;
- vazamento de provas de autoria, hashes ou metadados pessoais.

## Como relatar

Envie um relato para **rafamass@proton.me** com:

1. descrição do impacto;
2. passos mínimos para reproduzir;
3. navegador, versão e sistema operacional;
4. demonstração usando somente dados fictícios;
5. sugestões de mitigação, se houver.

Não abra uma issue pública antes de receber confirmação quando o problema puder expor textos, dados pessoais ou um caminho de perda de dados. Não envie manuscritos reais, cópias `.esc` pessoais, tokens ou segredos.

## Processo de resposta

O projeto é mantido por uma pessoa. O objetivo é:

- confirmar o recebimento em até **7 dias corridos**;
- avaliar impacto e possibilidade de reprodução;
- preparar uma correção ou mitigação antes da divulgação pública;
- registrar a correção no changelog quando ela puder ser publicada com segurança.

Esses prazos são metas de comunicação, não garantia de resolução. Relatos responsáveis e reproduzíveis serão creditados, se a pessoa desejar.

## Fora do escopo

Resultados automáticos sem reprodução, engenharia social, indisponibilidade de serviços de terceiros e problemas que exijam acesso físico prévio a um dispositivo desbloqueado podem não receber tratamento como vulnerabilidade. Ainda assim, riscos reais de perda de texto são relevantes para o produto e podem ser relatados como bugs.
