#!/usr/bin/env python3
"""
Teste Master — Escrevaral
Orquestra os auditores existentes, coleta resultados e emite veredito unificado.
Salva em reports/teste-master/YYYY-MM-DD.md

Nunca envia manuscritos de usuários para API. Apenas código e relatórios.

Uso:
  python3 scripts/teste-master.py [--sem-local] [--sem-rede] [--notificar]

  --sem-local   Pula auditorias que precisam de servidor local (overflow, console)
  --sem-rede    Pula auditorias que precisam de rede (privacidade, publicacao, pilares, navegacao)
  --notificar   Envia veredito por Telegram (requer .escrevaral-qa.env preenchido)
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TODAY = date.today().isoformat()
REPORT_DIR = ROOT / "reports" / "teste-master"
REPORT_DIR.mkdir(parents=True, exist_ok=True)
REPORT_FILE = REPORT_DIR / f"{TODAY}.md"

SEM_LOCAL       = "--sem-local"       in sys.argv
SEM_REDE        = "--sem-rede"        in sys.argv
NOTIFICAR       = "--notificar"       in sys.argv
USAR_EXISTENTES = "--usar-existentes" in sys.argv  # lê relatórios já gerados hoje, não re-roda auditores

ENV_FILE = ROOT / ".escrevaral-qa.env"

# (nome_exibido, script, prefixo_report, precisa_local, precisa_rede, timeout_s)
AUDITORS: list[tuple[str, str, str, bool, bool, int]] = [
    ("Dados linguísticos",  "scripts/auditor-dados.py",           f"dados-linguisticos-{TODAY}",   False, False, 60),
    ("Publicação/Offline",  "scripts/auditor-publicacao.py",      f"publicacao-offline-{TODAY}",   False, True,  120),
    ("Privacidade/Rede",    "scripts/auditor-privacidade-rede.py", f"privacidade-rede-{TODAY}",    False, True,  180),
    ("Pilares",             "scripts/auditoria-pilares.py",        f"pilares-{TODAY}",              False, True,  180),
    ("Navegação Visual",    "scripts/auditor-navegacao-visual.py", f"navegacao-visual-{TODAY}",    False, True,  300),
    ("Overflow Mobile",     "scripts/auditor-overflow-mobile.py",  f"overflow-mobile-{TODAY}",     True,  False, 120),
    ("Console Errors",      "scripts/auditor-console-errors.py",   f"console-errors-{TODAY}",      True,  False, 120),
]

RE_SEMAFORO = re.compile(r"\*\*Sem[aá]foro:\*\*\s*[🟢🟡🔴]?\s*(VERDE|AMARELO|VERMELHO)", re.IGNORECASE)
RE_COUNTS   = re.compile(r"\*\*P0:\*\*\s*(\d+)\s+\*\*P1:\*\*\s*(\d+)\s+\*\*P2:\*\*\s*(\d+)")
RE_CONSOLE  = re.compile(r"\*\*Erros JS:\*\*\s*(\d+)\s*\|\s*\*\*Erros de rede:\*\*\s*(\d+)")
RE_OVF_FAIL = re.compile(r"\|\s*fail\b", re.IGNORECASE)


def _auditor_requires_playwright(script: str) -> bool:
    path = ROOT / script
    try:
        source = path.read_text(encoding="utf-8")
    except OSError:
        return False
    return "playwright.async_api" in source


def run_auditor(script: str, timeout: int) -> tuple[int, str]:
    """Roda um auditor e retorna (exit_code, stderr_resumido)."""
    command = [sys.executable, script]
    if _auditor_requires_playwright(script):
        command = ["uv", "run", "--with", "playwright", "python3", script]

    try:
        result = subprocess.run(
            command,
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return result.returncode, result.stderr[-500:] if result.stderr else ""
    except subprocess.TimeoutExpired:
        return -1, f"timeout após {timeout}s"
    except Exception as exc:
        return -1, str(exc)


def _find_report(prefix: str) -> Path | None:
    """Localiza o relatório .md de hoje pelo prefixo."""
    auditoria_dir = ROOT / "reports" / "auditoria"
    candidate = auditoria_dir / f"{prefix}.md"
    return candidate if candidate.exists() else None


def parse_report(prefix: str, nome: str, exit_code: int, stderr: str) -> dict:
    """Lê o relatório gerado e extrai semáforo e contagens P0/P1/P2."""
    base = {"nome": nome, "semaforo": "ERRO", "p0": 0, "p1": 0, "p2": 0, "nota": ""}

    path = _find_report(prefix)

    if exit_code == -1:
        base["nota"] = f"falhou (timeout/spawn) — {stderr}"
        return base

    if path is None and exit_code != 0:
        # Auditor crashou antes de salvar relatório
        resumo = (stderr or "sem stderr")[:200].replace("\n", " ")
        base["nota"] = f"falhou (exit {exit_code}) — {resumo}"
        return base

    if path is None:
        base["nota"] = "relatório não gerado (auditor saiu sem erro mas não salvou)"
        return base

    text = path.read_text(encoding="utf-8")

    # Semáforo padrão
    m = RE_SEMAFORO.search(text)
    if m:
        base["semaforo"] = m.group(1).upper()

    # Contagens P0/P1/P2 padrão
    m = RE_COUNTS.search(text)
    if m:
        base["p0"] = int(m.group(1))
        base["p1"] = int(m.group(2))
        base["p2"] = int(m.group(3))
        return base

    # console-errors: formato próprio
    if "console-errors" in prefix:
        m = RE_CONSOLE.search(text)
        if m:
            erros = int(m.group(1)) + int(m.group(2))
            if erros > 0:
                base["p1"] = erros
                base["semaforo"] = "VERMELHO"
            else:
                base["semaforo"] = "VERDE"
        return base

    # overflow-mobile: formato de tabela
    if "overflow-mobile" in prefix:
        falhas = len(RE_OVF_FAIL.findall(text))
        if falhas > 0:
            base["p1"] = falhas
            base["semaforo"] = "VERMELHO"
        else:
            base["semaforo"] = "VERDE"
        return base

    # pilares: sem contagens, deriva do semáforo
    if "pilares" in prefix and base["semaforo"] == "ERRO":
        if "VERDE" in text.upper() or "Limpo" in text or "sem falhas" in text.lower():
            base["semaforo"] = "VERDE"

    return base


def _semaforo_icon(s: str) -> str:
    return {"VERDE": "🟢", "AMARELO": "🟡", "VERMELHO": "🔴", "PULADO": "⏭️"}.get(s, "❓")


def verdict(resultados: list[dict]) -> tuple[str, str, str]:
    """Retorna (status_geral, pode_publicar, proximo_passo)."""
    ativos = [r for r in resultados if r["semaforo"] not in ("PULADO",)]

    total_p0 = sum(r["p0"] for r in ativos)
    total_p1 = sum(r["p1"] for r in ativos)
    total_p2 = sum(r["p2"] for r in ativos)
    # Distingue ERRO real (auditor rodou, encontrou problema) de ERRO de ambiente
    erros_reais   = [r for r in ativos if r["semaforo"] == "VERMELHO"]
    erros_ambiente = [r for r in ativos if r["semaforo"] == "ERRO"]

    if total_p0 > 0 or erros_reais:
        status = "VERMELHO"
    elif total_p1 > 0 or erros_ambiente:
        status = "AMARELO"
    else:
        status = "VERDE"

    if status == "VERMELHO":
        pode = "Não — resolver P0 antes de qualquer publicação."
    elif status == "AMARELO":
        pode = "Sim, com ressalva — P1 pendente."
    else:
        pode = "Sim."

    # Próximo passo: auditor com maior urgência (achados reais têm prioridade sobre ERROs de ambiente)
    prioridade = [r for r in ativos if r["p0"] > 0]
    if not prioridade:
        prioridade = [r for r in ativos if r["semaforo"] == "VERMELHO"]
    if not prioridade:
        prioridade = [r for r in ativos if r["p1"] > 0]
    if not prioridade:
        prioridade = [r for r in ativos if r["semaforo"] == "ERRO"]
    if not prioridade:
        prioridade = [r for r in ativos if r["p2"] > 0]

    if prioridade:
        passo = f"Resolver achados de '{prioridade[0]['nome']}' (reporte em reports/auditoria/)."
    else:
        passo = "Avançar engine mais próxima de 100% — ver META_ENGINES_100.md."

    return status, pode, passo


def build_report(resultados: list[dict], duracao: float) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    ativos = [r for r in resultados if r["semaforo"] not in ("PULADO",)]
    total_p0 = sum(r["p0"] for r in ativos)
    total_p1 = sum(r["p1"] for r in ativos)
    total_p2 = sum(r["p2"] for r in ativos)

    status, pode, passo = verdict(resultados)
    icon = _semaforo_icon(status)

    linhas = [
        f"# Teste Master — {now}",
        "",
        f"**Status geral:** {icon} {status}",
        "",
        f"| Indicador | Total |",
        f"|---|---|",
        f"| P0 (crítico) | {total_p0} |",
        f"| P1 (importante) | {total_p1} |",
        f"| P2 (menor) | {total_p2} |",
        "",
        "## Veredito",
        "",
        f"**Pode publicar?** {pode}",
        f"**Próximo passo:** {passo}",
        "",
        "## Resultado por auditor",
        "",
        "| Auditor | Semáforo | P0 | P1 | P2 | Nota |",
        "|---|---|---|---|---|---|",
    ]

    for r in resultados:
        icon_r = _semaforo_icon(r["semaforo"])
        p0 = "—" if r["semaforo"] in ("PULADO",) else str(r["p0"])
        p1 = "—" if r["semaforo"] in ("PULADO",) else str(r["p1"])
        p2 = "—" if r["semaforo"] in ("PULADO",) else str(r["p2"])
        nota = r.get("nota", "")
        linhas.append(f"| {r['nome']} | {icon_r} {r['semaforo']} | {p0} | {p1} | {p2} | {nota} |")

    linhas += [
        "",
        f"*Duração total: {duracao:.0f}s*",
        f"*Relatórios individuais: `reports/auditoria/`*",
    ]

    return "\n".join(linhas)


def _load_env() -> dict[str, str]:
    """Carrega variáveis: env vars do sistema têm prioridade sobre .escrevaral-qa.env (para CI)."""
    env: dict[str, str] = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            env[key.strip()] = val.strip()
    # Variáveis de ambiente do sistema (GitHub Secrets) sobrescrevem o arquivo local
    for key in ("TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "N8N_WEBHOOK_URL"):
        if key in os.environ:
            env[key] = os.environ[key]
    return env


def _telegram_icon(status: str) -> str:
    return {"VERDE": "✅", "AMARELO": "⚠️", "VERMELHO": "🚨"}.get(status, "❓")


def notificar_telegram(resultados: list[dict], status: str, pode: str, passo: str) -> None:
    """Envia veredito resumido ao Telegram via Bot API."""
    env = _load_env()
    token   = env.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = env.get("TELEGRAM_CHAT_ID", "")

    if not token or not chat_id or "SEU_" in token:
        print("⚠  Telegram: credenciais não configuradas em .escrevaral-qa.env")
        return

    icon = _telegram_icon(status)
    ativos = [r for r in resultados if r["semaforo"] not in ("PULADO",)]
    p0 = sum(r["p0"] for r in ativos)
    p1 = sum(r["p1"] for r in ativos)
    p2 = sum(r["p2"] for r in ativos)

    linhas_auditores = []
    for r in resultados:
        if r["semaforo"] == "PULADO":
            continue
        i = _semaforo_icon(r["semaforo"])
        linhas_auditores.append(f"  {i} {r['nome']}: P0={r['p0']} P1={r['p1']} P2={r['p2']}")

    texto = (
        f"{icon} *Escrevaral QA — {TODAY}*\n"
        f"Status: *{status}*  |  P0: {p0}  P1: {p1}  P2: {p2}\n\n"
        + "\n".join(linhas_auditores)
        + f"\n\n*Publicar?* {pode}\n*Próximo:* {passo}"
    )

    # Opcional: também notifica o n8n para log centralizado
    n8n_url = env.get("N8N_WEBHOOK_URL", "")
    if n8n_url:
        try:
            payload = json.dumps({"status": status, "p0": p0, "p1": p1, "p2": p2,
                                   "pode_publicar": pode, "proximo_passo": passo,
                                   "data": TODAY}).encode()
            req = urllib.request.Request(n8n_url, data=payload,
                                         headers={"Content-Type": "application/json"})
            urllib.request.urlopen(req, timeout=10)
        except Exception:
            pass  # notificação n8n é opcional, não bloqueia

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": texto,
        "parse_mode": "Markdown",
    }).encode()
    try:
        req = urllib.request.Request(url, data=payload,
                                     headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=10)
        print("✅ Telegram: notificação enviada")
    except urllib.error.HTTPError as e:
        print(f"⚠  Telegram: erro HTTP {e.code} — verifique token e chat_id")
    except Exception as exc:
        print(f"⚠  Telegram: {exc}")


def manage_local_server() -> subprocess.Popen | None:
    """Inicia servidor local se não houver um rodando na porta 8799."""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(("localhost", 8799)) == 0:
            return None  # já rodando
    proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", "8799"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    time.sleep(1.5)
    return proc


def main() -> int:
    inicio = time.time()
    resultados: list[dict] = []
    servidor_local: subprocess.Popen | None = None

    if USAR_EXISTENTES:
        # Modo CI: lê relatórios já gerados hoje sem re-rodar auditores
        print("→ Modo --usar-existentes: lendo relatórios de hoje")
        for nome, _script, prefix, precisa_loc, precisa_rede, _timeout in AUDITORS:
            path = _find_report(prefix)
            if path is None:
                resultados.append({"nome": nome, "semaforo": "PULADO", "p0": 0, "p1": 0, "p2": 0, "nota": "sem relatório hoje"})
            else:
                r = parse_report(prefix, nome, 0, "")
                print(f"  {_semaforo_icon(r['semaforo'])} {nome}")
                resultados.append(r)
    else:
        precisa_local = any(local for _, _, _, local, _, _ in AUDITORS if not SEM_LOCAL)
        if precisa_local and not SEM_LOCAL:
            servidor_local = manage_local_server()
            if servidor_local:
                print("→ Servidor local iniciado na porta 8799")

        try:
            for nome, script, prefix, precisa_loc, precisa_rede, timeout in AUDITORS:
                if precisa_loc and SEM_LOCAL:
                    resultados.append({"nome": nome, "semaforo": "PULADO", "p0": 0, "p1": 0, "p2": 0, "nota": "pulado (--sem-local)"})
                    continue
                if precisa_rede and SEM_REDE:
                    resultados.append({"nome": nome, "semaforo": "PULADO", "p0": 0, "p1": 0, "p2": 0, "nota": "pulado (--sem-rede)"})
                    continue

                print(f"→ {nome}...", end=" ", flush=True)
                t0 = time.time()
                exit_code, stderr = run_auditor(script, timeout)
                elapsed = time.time() - t0

                r = parse_report(prefix, nome, exit_code, stderr)
                print(f"{_semaforo_icon(r['semaforo'])} {r['semaforo']} ({elapsed:.0f}s)")
                resultados.append(r)
        finally:
            if servidor_local:
                servidor_local.terminate()
                servidor_local.wait()

    duracao = time.time() - inicio
    status, pode, passo = verdict(resultados)

    relatorio = build_report(resultados, duracao)
    REPORT_FILE.write_text(relatorio, encoding="utf-8")

    print()
    print("=" * 50)
    print(f"Status geral : {_semaforo_icon(status)} {status}")
    print(f"Pode publicar: {pode}")
    print(f"Próximo passo: {passo}")
    print(f"Relatório    : {REPORT_FILE.relative_to(ROOT)}")
    print("=" * 50)

    if NOTIFICAR:
        notificar_telegram(resultados, status, pode, passo)

    return 0 if status == "VERDE" else 1


if __name__ == "__main__":
    sys.exit(main())
