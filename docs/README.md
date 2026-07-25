# Documentation

This directory contains product decisions, technical references and historical evidence for Escrevaral.

The current system is described in the repository-level `ARCHITECTURE.md`. Dated files should be read as evidence from a specific moment, not as present-tense instructions.

## Current references

| Subject | Source of truth |
|---|---|
| Public product summary | `../README.md` |
| Current technical architecture | `../ARCHITECTURE.md` |
| Agent maintenance rules | `../CLAUDE.md` |
| Release history | `../CHANGELOG.md` |
| Security reporting | `../SECURITY.md` |
| Support boundaries | `../SUPPORT.md` |
| Collaboration rules | `../CONTRIBUTING.md` |

Some governance files are being introduced through separate pull requests. A link may temporarily resolve only after the corresponding pull request is incorporated.

## Decisions

`_decisoes/` contains records of consequential product and engineering choices.

A decision record should answer:

- what problem was observed;
- which evidence was available;
- what was decided;
- which alternatives were rejected;
- what would justify reopening the decision.

Decision records must not become daily progress logs.

## Campaign and product communication

`_campanhas/` contains launch, voice and communication material. It does not define runtime architecture.

Brand language may inform interface copy, but technical behavior must still be grounded in tests and architecture contracts.

## Historical snapshots

Files named `repo-structure-YYYYMMDD.md` describe former repository states. They are retained only for historical comparison until moved into a dedicated archive directory.

Do not update an old snapshot to describe the present. Update `ARCHITECTURE.md` instead.

## Reports

Generated audit output should be stored as GitHub Actions summaries or temporary artifacts.

Only durable baselines, fixtures, decision evidence and deliberately curated reports belong in source control. A successful scheduled run is not an open issue and should not produce a source commit.

## Documentation rules

- Prefer one maintained current document over repeated dated copies.
- Use Git history for ordinary textual evolution.
- Add a decision record only for choices with lasting consequences.
- Keep local infrastructure, credentials and administrative identifiers outside the public repository.
- Mark historical documents clearly when they remain searchable.
- Update paths when source files move; do not rewrite historical quotations merely to appear current.
