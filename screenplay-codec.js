// screenplay-codec.js — representação reversível do editor de roteiro
(function exposeScreenplayCodec(global) {
  "use strict";

  const VALID_TYPES = new Set(["scene", "dialogue", "action"]);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeBlocks(blocks) {
    if (!Array.isArray(blocks)) return [];
    return blocks.flatMap((block) => {
      if (!block || !VALID_TYPES.has(block.type)) return [];
      if (block.type === "scene") {
        return [{
          type: "scene",
          slug: String(block.slug || ""),
          action: String(block.action || ""),
        }];
      }
      if (block.type === "dialogue") {
        return [{
          type: "dialogue",
          character: String(block.character || ""),
          lines: Array.isArray(block.lines)
            ? block.lines.map((line) => String(line))
            : String(block.lines || "").split("\n"),
        }];
      }
      return [{ type: "action", text: String(block.text || "") }];
    });
  }

  function parseText(text) {
    const blocks = [];
    const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
    let current = null;

    function flush() {
      if (current) blocks.push(current);
      current = null;
    }

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        flush();
        continue;
      }
      const isSlug = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(trimmed);
      const isCharacter = /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]{2,}$/.test(trimmed) && trimmed.length < 40;

      if (isSlug) {
        flush();
        current = { type: "scene", slug: trimmed, action: "" };
      } else if (current?.type === "scene" && !isCharacter) {
        current.action = current.action ? `${current.action}\n${trimmed}` : trimmed;
      } else if (isCharacter) {
        flush();
        current = { type: "dialogue", character: trimmed, lines: [] };
      } else if (current?.type === "dialogue") {
        current.lines.push(trimmed);
      } else {
        flush();
        current = { type: "action", text: trimmed };
      }
    }
    flush();

    return blocks.length ? normalizeBlocks(blocks) : [{ type: "scene", slug: "", action: "" }];
  }

  function toText(blocks) {
    return normalizeBlocks(blocks).map((block) => {
      if (block.type === "scene") {
        return [block.slug.trim().toUpperCase(), block.action.trim()].filter(Boolean).join("\n");
      }
      if (block.type === "dialogue") {
        return [
          block.character.trim().toUpperCase(),
          block.lines.join("\n").trim(),
        ].filter(Boolean).join("\n");
      }
      return block.text.trim();
    }).filter(Boolean).join("\n\n");
  }

  function fromStored(manuscript) {
    const stored = manuscript?.editorData;
    if (stored?.format === "screenplay" && stored.version === 1 && Array.isArray(stored.blocks)) {
      const normalized = normalizeBlocks(clone(stored.blocks));
      if (normalized.length) return normalized;
    }
    return parseText(manuscript?.text || "");
  }

  const api = Object.freeze({
    fromStored,
    normalizeBlocks,
    parseText,
    toText,
  });

  global.VeredaScreenplayCodec = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
