# Architecture

This document describes the current Escrevaral system. It is the stable technical reference for maintainers and reviewers.

Historical snapshots, audit outputs and campaign notes are not architecture sources of truth.

## Product boundary

Escrevaral is a browser-based Brazilian writing workshop built with static HTML, CSS and vanilla JavaScript.

The core product:

- runs without an application server;
- does not require an account;
- keeps manuscripts on the user’s device;
- remains usable without an internet connection after installation;
- does not send manuscript text to third-party artificial-intelligence services.

Optional external services must not become prerequisites for writing, opening, preserving or exporting a manuscript.

## Runtime entry points

| Responsibility | Current entry point |
|---|---|
| Main application | `index.html` |
| Global orchestration | `app.js` |
| Shared state | `state-store.js` |
| Offline installation and cache | `service-worker.js` |
| Web app metadata | `manifest.webmanifest` |
| Privacy and terms | `privacidade.html` |
| Portable companion | `pegar/` |
| Writing guides | root-level `vereda-*.html` files pending classification |

The service worker must remain at the deployed root. Its location participates in its default scope.

## JavaScript organization

The application currently loads classic deferred scripts in an explicit order from `index.html`.

Responsibilities are expressed through file suffixes:

- `*-engine.js`: domain logic, analysis, transformation or export;
- `*-controller.js`: DOM coordination and user interaction;
- `*-data.js`: JavaScript data indexes exposed to the runtime;
- `*-data.json`: linguistic and product data loaded by engines;
- `*-mode.js`: editor behavior modes;
- core files: state, integrity, dialogs, orchestration and codecs.

The repository is migrating these files incrementally into:

```text
js/
├── core/
├── controllers/
├── data/
├── engines/
└── modes/
```

A move is complete only when all consumers are updated: HTML, service-worker assets, dynamic loaders, tests, auditors and workflow path filters.

Physical movement and behavioral refactoring must occur in separate pull requests.

## CSS organization

CSS is divided into numbered modules under `css/` plus the compatibility entry file `styles.css`.

The numbered modules communicate loading order and responsibility. New styles should extend an existing domain module when possible instead of creating a campaign-named patch file.

A visual refinement file may remain separate while experimental. Once stable, its rules should be absorbed into a durable product module.

## Data flow and persistence

Manuscript state is coordinated by the state layer and stored in browser-managed local storage.

The preservation contract is stricter than the interface contract:

- schema changes require explicit migration or compatibility behavior;
- a failed import must not destroy existing local work;
- conflicting changes from multiple tabs must preserve both versions when reconciliation is uncertain;
- export and external backup remain available escape routes from browser storage.

No structural cleanup may silently rename storage keys, alter manuscript schemas or clear existing data.

## Offline model

`service-worker.js` owns installation, cache versioning and offline asset availability.

For every distributed JavaScript or CSS change:

1. promote the shared `?v=YYYYMMDD-slug` identifier in `index.html`;
2. align `ASSET_VERSION` in `service-worker.js`;
3. increment `CACHE_NAME`;
4. update `CORE_ASSETS` for moved or added files;
5. align any dynamic script loader using a pinned version;
6. run the offline publication audit.

A file move is a distribution change even when its contents are byte-identical.

## Privacy boundary

Manuscript contents must remain local by default.

Network features require a narrow, documented purpose. They must never transmit editor text implicitly, and the application must remain useful when those requests fail.

Administrative URLs, credentials, secret names, local credential paths and infrastructure identifiers do not belong in public issues or stable repository documentation.

Security reports follow `SECURITY.md` once that governance baseline is incorporated.

## Interface contracts

User-facing language is Brazilian Portuguese. Technical English may appear in code and maintainer documentation, not as unexplained interface copy.

Core interface invariants:

- no page-level horizontal scrolling in writing surfaces at 320, 390 and 430 pixels;
- keyboard focus remains visible and predictable;
- touch navigation does not summon the virtual keyboard without clear writing intent;
- helper panels do not reduce the manuscript to an unusable width;
- metaphors support writing tasks rather than decorate them.

## Quality gates

The release-candidate workflow is the final integration gate. It combines:

- Python syntax checks for auditors;
- the local Test Master;
- browser-based release checks;
- public-naming consistency;
- production publication checks;
- privacy-network checks;
- product-pillar verification;
- retained reports as temporary workflow artifacts.

Additional workflows cover data integrity, asset-version coherence, navigation, mobile behavior, accessibility focus and stable product surfaces.

A green specialist workflow does not replace the release-candidate verdict.

## Deployment

The public site is deployed from the protected release line. Changes to the default branch may reach production, so structural work must remain in isolated branches until reviewed and fully validated.

Repository cleanup must not be mixed with deployment-path changes unless the pull request is specifically about the deployment boundary.

## Documentation governance

Stable documents:

- `README.md`: public reception and product summary;
- `ARCHITECTURE.md`: current technical system;
- `CONTRIBUTING.md`: accepted collaboration model;
- `SECURITY.md`: vulnerability reporting;
- `SUPPORT.md`: support boundaries;
- `CHANGELOG.md`: release-oriented history;
- `CLAUDE.md`: concise repository instructions for coding agents.

Decision records explain why a durable choice was made. Dated reports and repository snapshots belong to an archive and must not compete with current documentation.

## Known structural debt

The following work remains intentionally separate:

- complete the incremental JavaScript directory migration;
- classify or archive legacy Vereda-named public pages;
- rename the portable companion directory from `pegar/` only with URL compatibility;
- consolidate temporary clarity/refinement modules into durable domains;
- move generated reports out of the source history;
- separate private operational memory, personas and agent-session state from the public product repository;
- consolidate workflow orchestration without reducing test coverage.

Each item requires its own evidence, compatibility plan and pull request.