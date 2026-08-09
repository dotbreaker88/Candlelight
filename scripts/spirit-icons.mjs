/**
 * Canonical character-sheet icon assets for Candlelight Spirits.
 *
 * Spirit Items are currently identified by their display name. Keeping the
 * resolver centralized means a future character-creation workflow can move to
 * a stored key without requiring template changes.
 */
const SPIRIT_KEYS = new Set([
  "ant", "axolotl", "badger", "bat", "bear", "dragon", "fox", "hawk",
  "lion", "mantis", "mongoose", "monkey", "ox", "rabbit", "rat", "shark",
  "snake", "sphinx", "spider", "stag", "turtle", "vulture", "wolf",
  "phoenix", "barguest", "golem", "exile", "kraken", "thunderbird", "unicorn"
]);

const SPIRIT_ALIASES = Object.freeze({
  barghest: "barguest"
});

function normalizeSpiritKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^spirit/, "")
    .replace(/spirit$/, "");
}

export function getSpiritIcon(spirit) {
  if (!spirit) return null;

  // Prefer a future explicit key if one is added to Spirit data, while keeping
  // v0.5.x fully compatible with existing Spirit Items that only have a name.
  const explicitKey = spirit.system?.spiritKey;
  let key = normalizeSpiritKey(explicitKey || spirit.name);
  key = SPIRIT_ALIASES[key] ?? key;

  if (!SPIRIT_KEYS.has(key)) return null;
  return `systems/candlelight/assets/icons/spirits/${key}.webp`;
}

export const CANDLELIGHT_SPIRIT_KEYS = Object.freeze([...SPIRIT_KEYS]);
