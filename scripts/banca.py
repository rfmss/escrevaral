#!/usr/bin/env python3
"""
Banca Escrevaral — orquestrador Claude + Codex via OpenAI API.

Uso:
  python3 scripts/banca.py diagnostico "descrição do problema"
  python3 scripts/banca.py revisao "resumo do que foi feito" "diff ou arquivos tocados"
"""

import sys
import os
import json
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

ENV_FILE = Path.home() / ".config" / "escrevaral-banca.env"
PROMPT_FILE = Path(__file__).parent.parent / ".github" / "codex-agente-prompt.md"
INBOX_DIR = Path(__file__).parent.parent / ".agents" / "inbox"
REVIEWS_DIR = Path(__file__).parent.parent / ".agents" / "reviews"


def load_key():
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if line.startswith("OPENAI_API_KEY="):
                return line.split("=", 1)[1].strip()
    key = os.environ.get("OPENAI_API_KEY", "")
    if key:
        return key
    print("Erro: OPENAI_API_KEY não encontrada.")
    print(f"Configure em: {ENV_FILE}")
    sys.exit(1)


def chamar_openai(system_prompt, user_message, api_key):
    payload = json.dumps({
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "max_tokens": 800,
        "temperature": 0.3,
    }).encode()

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
            return data["choices"][0]["message"]["content"].strip()
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"Erro HTTP {e.code}: {body}")
        sys.exit(1)


def salvar(diretorio, slug, conteudo):
    diretorio.mkdir(parents=True, exist_ok=True)
    data = datetime.now().strftime("%Y-%m-%d")
    arquivo = diretorio / f"{data}-{slug}.md"
    arquivo.write_text(conteudo)
    return arquivo


def modo_diagnostico(problema):
    api_key = load_key()
    system_prompt = PROMPT_FILE.read_text()

    mensagem = f"""Problema trazido pelo usuário:

{problema}

Responda no formato de diagnóstico técnico definido nas suas diretrizes."""

    print("\nConsultando Codex...\n")
    resposta = chamar_openai(system_prompt, mensagem, api_key)

    slug = problema[:40].lower().replace(" ", "-").replace("/", "-")
    slug = "".join(c for c in slug if c.isalnum() or c == "-")
    arquivo = salvar(INBOX_DIR, slug, f"# Problema\n{problema}\n\n{resposta}\n")

    print("─" * 60)
    print(resposta)
    print("─" * 60)
    print(f"\nSalvo em: {arquivo}")


def modo_revisao(resumo, diff=""):
    api_key = load_key()
    system_prompt = PROMPT_FILE.read_text()

    mensagem = f"""O Claude acabou de executar uma tarefa. Revise:

## O que foi feito
{resumo}

## Diff / arquivos tocados
{diff if diff else "(não fornecido)"}

Responda no formato de revisão definido nas suas diretrizes."""

    print("\nCodex revisando...\n")
    resposta = chamar_openai(system_prompt, mensagem, api_key)

    slug = resumo[:40].lower().replace(" ", "-").replace("/", "-")
    slug = "".join(c for c in slug if c.isalnum() or c == "-")
    arquivo = salvar(REVIEWS_DIR, slug, f"# Revisão\n## O que foi feito\n{resumo}\n\n{resposta}\n")

    print("─" * 60)
    print(resposta)
    print("─" * 60)
    print(f"\nSalvo em: {arquivo}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    modo = sys.argv[1]
    if modo == "diagnostico":
        modo_diagnostico(" ".join(sys.argv[2:]))
    elif modo == "revisao":
        resumo = sys.argv[2]
        diff = sys.argv[3] if len(sys.argv) > 3 else ""
        modo_revisao(resumo, diff)
    else:
        print(f"Modo desconhecido: {modo}. Use 'diagnostico' ou 'revisao'.")
        sys.exit(1)
