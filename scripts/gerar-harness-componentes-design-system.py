#!/usr/bin/env python3
"""Gera um harness local para ActionButton e TextStatistic.

O HTML resultante fica em reports/, que é ignorado pelo Git e não integra
a superfície publicada do produto.
"""

from __future__ import annotations

from pathlib import Path
from textwrap import dedent


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = (
    ROOT
    / "reports"
    / "auditoria"
    / "design-system-components-harness"
)
OUTPUT_FILE = OUTPUT_DIR / "index.html"


HTML = dedent(
    """\
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="noindex, nofollow">
        <title>Harness interno — componentes do Design System</title>

        <!--
          Carrega apenas a fundação necessária ao teste.
          14-archive-inspector.css importa 15-brand-argila.css,
          preservando os overrides atuais de Vereda.
        -->
        <link rel="stylesheet" href="../../../css/00-tokens.css">
        <link rel="stylesheet" href="../../../css/14-archive-inspector.css">

        <style>
          * {
            box-sizing: border-box;
          }

          html {
            min-height: 100%;
          }

          body {
            min-height: 100vh;
            margin: 0;
            padding: 32px;
            background: #d8d3cb;
            color: #1e1915;
            font-family: system-ui, sans-serif;
          }

          .harness-header {
            width: min(100%, 1180px);
            margin: 0 auto 24px;
          }

          .harness-header h1 {
            margin: 0 0 8px;
            font-size: 1.5rem;
          }

          .harness-header p {
            max-width: 72ch;
            margin: 0;
            line-height: 1.5;
          }

          .harness-themes {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px;
            width: min(100%, 1180px);
            margin-inline: auto;
          }

          .harness-theme {
            min-width: 0;
            padding: 24px;
            border: 1px solid var(--line);
            border-radius: var(--argila-radius-md);
            background: var(--paper);
            color: var(--ink);
          }

          .harness-theme__header {
            margin-bottom: 24px;
          }

          .harness-theme__header h2 {
            margin: 0 0 4px;
            color: var(--ink);
            font-family: var(--argila-font-ui);
            font-size: 1.25rem;
          }

          .harness-theme__header p {
            margin: 0;
            color: var(--muted);
            font-size: 0.875rem;
          }

          .harness-group + .harness-group {
            margin-top: 32px;
          }

          .harness-group h3 {
            margin: 0 0 16px;
            color: var(--ink);
            font-family: var(--argila-font-ui);
            font-size: 0.875rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .harness-row {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 12px;
          }

          .harness-row + .harness-row {
            margin-top: 12px;
          }

          .harness-statistics {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px;
          }

          .harness-statistic-cell {
            min-width: 0;
            padding: 16px;
            border: 1px solid var(--line);
            border-radius: var(--argila-radius-sm);
            background: var(--card);
          }

          .harness-keyboard-note {
            margin-top: 32px;
            padding: 12px 16px;
            border: 1px solid var(--line);
            border-radius: var(--argila-radius-sm);
            background: var(--surface-low);
            color: var(--soft-ink);
            font-size: 0.875rem;
            line-height: 1.5;
          }

          @media (max-width: 760px) {
            body {
              padding: 16px;
            }

            .harness-themes {
              grid-template-columns: 1fr;
            }

            .harness-statistics {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>

      <body>
        <header class="harness-header">
          <h1>Componentes compartilhados</h1>
          <p>
            Harness interno para inspeção visual, teclado, estados e
            contraste de ActionButton e TextStatistic. Nenhuma tela do
            produto utiliza estes exemplos.
          </p>
        </header>

        <main
          class="harness-themes"
          data-harness="design-system-components"
        >
          <section
            class="harness-theme"
            data-theme-case="alvorada"
            aria-labelledby="harness-alvorada-title"
          >
            <header class="harness-theme__header">
              <h2 id="harness-alvorada-title">Alvorada</h2>
              <p>Tema claro canônico.</p>
            </header>

            <div class="harness-group">
              <h3>ActionButton — variantes</h3>

              <div class="harness-row">
                <button
                  class="action-button"
                  data-component="action-button"
                  data-variant="primary"
                  type="button"
                >
                  Ação principal
                </button>

                <button
                  class="action-button"
                  data-component="action-button"
                  data-variant="secondary"
                  type="button"
                >
                  Ação secundária
                </button>

                <button
                  class="action-button"
                  data-component="action-button"
                  data-variant="ghost"
                  type="button"
                >
                  Ação silenciosa
                </button>
              </div>

              <div class="harness-row">
                <button
                  class="action-button"
                  data-component="action-button"
                  data-size="compact"
                  data-variant="primary"
                  type="button"
                >
                  Compacto
                </button>

                <button
                  class="action-button"
                  data-component="action-button"
                  data-icon-only="true"
                  data-variant="secondary"
                  type="button"
                  aria-label="Adicionar item"
                >
                  <span class="action-button__icon" aria-hidden="true">+</span>
                </button>
              </div>
            </div>

            <div class="harness-group">
              <h3>ActionButton — desabilitado</h3>

              <div class="harness-row">
                <button
                  class="action-button"
                  data-component="action-button"
                  data-state="disabled-native"
                  data-variant="primary"
                  type="button"
                  disabled
                >
                  Desabilitado
                </button>

                <button
                  class="action-button"
                  data-component="action-button"
                  data-state="disabled-aria"
                  data-variant="secondary"
                  type="button"
                  aria-disabled="true"
                >
                  Indisponível
                </button>
              </div>
            </div>

            <div class="harness-group">
              <h3>TextStatistic</h3>

              <div class="harness-statistics">
                <div class="harness-statistic-cell">
                  <div
                    class="text-statistic"
                    data-component="text-statistic"
                    data-example="default"
                  >
                    <span class="text-statistic__label">Palavras</span>
                    <strong class="text-statistic__value">12.345</strong>
                    <span class="text-statistic__detail">
                      No manuscrito atual
                    </span>
                  </div>
                </div>

                <div class="harness-statistic-cell">
                  <div
                    class="text-statistic"
                    data-component="text-statistic"
                    data-example="percentage"
                  >
                    <span class="text-statistic__label">Progresso</span>
                    <strong class="text-statistic__value">87%</strong>
                    <span class="text-statistic__detail">
                      Meta de revisão
                    </span>
                  </div>
                </div>

                <div class="harness-statistic-cell">
                  <div
                    class="text-statistic"
                    data-component="text-statistic"
                    data-example="inline"
                    data-layout="inline"
                  >
                    <span class="text-statistic__label">Tempo</span>
                    <strong class="text-statistic__value">01:24:36</strong>
                  </div>
                </div>

                <div class="harness-statistic-cell">
                  <div
                    class="text-statistic"
                    data-component="text-statistic"
                    data-example="compact"
                    data-size="compact"
                  >
                    <span class="text-statistic__label">Ocorrências</span>
                    <strong class="text-statistic__value">1.234.567</strong>
                  </div>
                </div>
              </div>
            </div>

            <p class="harness-keyboard-note">
              Verificação manual: pressione Tab e confirme foco visível,
              ordem previsível e ausência de foco no botão com atributo
              disabled.
            </p>
          </section>

          <section
            class="harness-theme"
            data-theme="scriptorium"
            data-theme-case="vereda"
            aria-labelledby="harness-vereda-title"
          >
            <header class="harness-theme__header">
              <h2 id="harness-vereda-title">Vereda</h2>
              <p>Tema escuro canônico.</p>
            </header>

            <!--
              O conteúdo é clonado pelo script local abaixo somente dentro
              deste harness. Não há dependência de código do produto.
            -->
            <div data-vereda-content></div>
          </section>
        </main>

        <script>
          const alvorada = document.querySelector(
            '[data-theme-case="alvorada"]'
          );
          const veredaTarget = document.querySelector(
            "[data-vereda-content]"
          );

          const groups = alvorada.querySelectorAll(
            ".harness-group, .harness-keyboard-note"
          );

          for (const group of groups) {
            const clone = group.cloneNode(true);

            for (const element of clone.querySelectorAll("[id]")) {
              element.removeAttribute("id");
            }

            veredaTarget.append(clone);
          }
        </script>
      </body>
    </html>
    """
)


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(HTML, encoding="utf-8")

    relative_path = OUTPUT_FILE.relative_to(ROOT)
    print(f"Harness gerado: {relative_path}")
    print("Sirva a raiz do repositório com:")
    print("  python3 -m http.server 8799")
    print("Abra:")
    print(
        "  http://127.0.0.1:8799/"
        "reports/auditoria/design-system-components-harness/index.html"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
