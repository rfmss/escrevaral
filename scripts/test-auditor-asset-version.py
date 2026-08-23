#!/usr/bin/env python3
"""Regressões da fronteira entre a distribuição pública e aplicações isoladas."""

from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).with_name("auditor-asset-version.py")
SPEC = importlib.util.spec_from_file_location("auditor_asset_version", SCRIPT_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Não foi possível carregar {SCRIPT_PATH}")

AUDITOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDITOR)


class PublicDistributionBoundaryTests(unittest.TestCase):
    def test_public_root_assets_require_global_version(self) -> None:
        public_paths = (
            "app.js",
            "styles.css",
            "css/00-tokens.css",
            "js/controllers/reader-controller.js",
        )

        for path in public_paths:
            with self.subTest(path=path):
                self.assertTrue(AUDITOR.is_public_distributed_asset(path))

    def test_isolated_mass_notes_assets_do_not_require_public_version(self) -> None:
        isolated_paths = (
            "mass-notes-next/src/styles/app.css",
            "mass-notes-next/src/engines/lexicalAdapter.js",
            "mass-notes-next/public/assets/index.css",
            "mass-notes-next/dist/assets/index.js",
        )

        for path in isolated_paths:
            with self.subTest(path=path):
                self.assertFalse(AUDITOR.is_public_distributed_asset(path))

    def test_reports_and_non_distributed_sources_are_ignored(self) -> None:
        ignored_paths = (
            "reports/audit.css",
            "scripts/build-anatomia-runtime.py",
            "mass-notes-next/src/App.tsx",
            "docs/product/MASS_NOTES_TIPTAP_GATE_10.md",
        )

        for path in ignored_paths:
            with self.subTest(path=path):
                self.assertFalse(AUDITOR.is_public_distributed_asset(path))


if __name__ == "__main__":
    unittest.main(verbosity=2)
