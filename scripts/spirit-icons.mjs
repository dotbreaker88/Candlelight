/** Canonical Spirit presentation data for Candlelight characters. */
const SPIRITS = Object.freeze({
  ant: "Ant", axolotl: "Axolotl", badger: "Badger", bat: "Bat", bear: "Bear",
  dragon: "Dragon", fox: "Fox", hawk: "Hawk", lion: "Lion", mantis: "Mantis",
  mongoose: "Mongoose", monkey: "Monkey", ox: "Ox", rabbit: "Rabbit", rat: "Rat",
  shark: "Shark", snake: "Snake", sphinx: "Sphinx", spider: "Spider", stag: "Stag",
  turtle: "Turtle", vulture: "Vulture", wolf: "Wolf", phoenix: "Phoenix",
  barguest: "Barguest", golem: "Golem", exile: "Exile", kraken: "Kraken",
  thunderbird: "Thunderbird", unicorn: "Unicorn"
});

const SPIRIT_ALIASES = Object.freeze({barghest: "barguest"});

export const CANDLELIGHT_FRAME_COLORS = Object.freeze({
  purple: "Purple", gold: "Gold", red: "Red", blue: "Blue", green: "Green", white: "White"
});

export function normalizeSpiritKey(value) {
  return String(value ?? "")
    .trim().toLowerCase().replace(/[^a-z0-9]+/g, "")
    .replace(/^spirit/, "").replace(/spirit$/, "");
}

export function getSpiritKey(spiritOrKey) {
  if (!spiritOrKey) return "";
  const raw = typeof spiritOrKey === "string" ? spiritOrKey : (spiritOrKey.system?.spiritKey || spiritOrKey.name);
  let key = normalizeSpiritKey(raw);
  key = SPIRIT_ALIASES[key] ?? key;
  return Object.hasOwn(SPIRITS, key) ? key : "";
}

export function getSpiritIcon(spiritOrKey) {
  const key = getSpiritKey(spiritOrKey);
  // Use an absolute Foundry URL. Relative URLs inside CSS mask variables can resolve
  // against the current application route rather than the system root.
  return key ? `/systems/candlelight/assets/icons/spirits/${key}.webp` : null;
}

export function getSpiritLabel(spiritOrKey) {
  const key = getSpiritKey(spiritOrKey);
  return key ? SPIRITS[key] : "";
}

export const CANDLELIGHT_SPIRITS = SPIRITS;
export const CANDLELIGHT_SPIRIT_KEYS = Object.freeze(Object.keys(SPIRITS));
