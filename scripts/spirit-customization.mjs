import { CANDLELIGHT_FRAME_COLORS, CANDLELIGHT_SPIRITS, getSpiritIcon, getSpiritKey, getSpiritLabel } from "./spirit-icons.mjs";

const FRAME_CLASSES = Object.keys(CANDLELIGHT_FRAME_COLORS).map(key => `cl-frame-${key}`);

function optionMarkup(options, selected, blankLabel = null) {
  const rows = [];
  if (blankLabel !== null) rows.push(`<option value=""${selected ? "" : " selected"}>${blankLabel}</option>`);
  for (const [value, label] of Object.entries(options)) {
    rows.push(`<option value="${value}"${value === selected ? " selected" : ""}>${label}</option>`);
  }
  return rows.join("");
}

function currentSpiritKey(actor) {
  const stored = getSpiritKey(actor.system.spiritKey);
  if (stored) return stored;
  const legacy = actor.items.find(item => item.type === "spirit");
  return getSpiritKey(legacy);
}

function syncControls(root, actor) {
  const key = currentSpiritKey(actor);
  const color = CANDLELIGHT_FRAME_COLORS[actor.system.portraitFrameColor] ? actor.system.portraitFrameColor : "gold";
  for (const select of root.querySelectorAll("[data-cl-spirit-select]")) select.value = key;
  for (const select of root.querySelectorAll("[data-cl-frame-select]")) select.value = color;
}

function bindSelect(select, value, updatePath, actor, root) {
  select.value = value ?? "";
  if (select.dataset.clBound === "true") return;
  select.dataset.clBound = "true";

  select.addEventListener("change", async event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const next = event.currentTarget.value;

    // Keep these customization changes surgical. A normal Actor update rerenders
    // the legacy AppV1 sheet, which destroys these injected controls before the
    // visual refresh can complete. Persist without rendering, then update the
    // current DOM directly.
    await actor.update({[updatePath]: next}, {render: false});
    syncControls(root, actor);
    updatePortrait(root, actor);
    updateSpiritTab(root, actor);
  }, {capture: true});
}

function ensureControls(root, actor) {
  const key = currentSpiritKey(actor);
  const color = CANDLELIGHT_FRAME_COLORS[actor.system.portraitFrameColor] ? actor.system.portraitFrameColor : "gold";
  const controls = `
    <div class="cl-portrait-customizer cl-spirit-customizer" data-cl-spirit-customizer>
      <label><span><i class="fa-solid fa-paw"></i> Spirit</span><select class="cl-custom-select" data-cl-spirit-select aria-label="Spirit selection">${optionMarkup(CANDLELIGHT_SPIRITS, key, "Choose Spirit")}</select></label>
      <label><span><i class="fa-solid fa-palette"></i> Frame</span><select class="cl-custom-select" data-cl-frame-select aria-label="Portrait frame color">${optionMarkup(CANDLELIGHT_FRAME_COLORS, color)}</select></label>
    </div>`;

  if (!root.querySelector("[data-cl-spirit-customizer]")) {
    const levelStrip = root.querySelector(".cl-level-strip");
    if (levelStrip) levelStrip.insertAdjacentHTML("afterend", controls);
  }

  if (!root.querySelector("[data-cl-spirit-tab-customizer]")) {
    const spiritSection = root.querySelector('[data-tab-panel="spirit"] section');
    if (spiritSection) {
      const panel = controls.replace("data-cl-spirit-customizer", "data-cl-spirit-tab-customizer");
      spiritSection.querySelector("h2")?.insertAdjacentHTML("afterend", panel);
    }
  }

  for (const select of root.querySelectorAll("[data-cl-spirit-select]")) {
    bindSelect(select, key, "system.spiritKey", actor, root);
  }
  for (const select of root.querySelectorAll("[data-cl-frame-select]")) {
    bindSelect(select, color, "system.portraitFrameColor", actor, root);
  }
}

function neutralizeDuplicateLevelField(root) {
  const headerLevel = root.querySelector('.cl-header .cl-summary input[name="system.level"]');
  if (!headerLevel) return;
  headerLevel.removeAttribute("name");
  headerLevel.readOnly = true;
  headerLevel.tabIndex = -1;
  headerLevel.title = "Level is edited from the Core panel below.";
  headerLevel.setAttribute("aria-label", "Current level");
  headerLevel.classList.add("cl-level-mirror");
}

function updatePortrait(root, actor) {
  const portrait = root.querySelector(".cl-core-portrait");
  if (!portrait) return;

  const color = CANDLELIGHT_FRAME_COLORS[actor.system.portraitFrameColor] ? actor.system.portraitFrameColor : "gold";
  portrait.classList.remove(...FRAME_CLASSES);
  portrait.classList.add(`cl-frame-${color}`);

  const key = currentSpiritKey(actor);
  let medallion = portrait.querySelector(".cl-portrait-spirit");
  if (!key) {
    medallion?.remove();
    return;
  }

  const icon = getSpiritIcon(key);
  const label = getSpiritLabel(key);
  if (!medallion) {
    medallion = document.createElement("div");
    medallion.className = "cl-portrait-spirit";
    portrait.appendChild(medallion);
  }
  medallion.title = `${label} Spirit`;
  medallion.innerHTML = `
    <span class="cl-portrait-spirit-icon" role="img" aria-label="${label} Spirit icon" style="--cl-spirit-mask:url(${icon})"></span>
    <span class="cl-portrait-spirit-name">${label}</span>`;
}

function updateSpiritTab(root, actor) {
  const key = currentSpiritKey(actor);
  if (!key) return;
  const panel = root.querySelector('[data-tab-panel="spirit"] section');
  if (!panel) return;
  const feature = panel.querySelector(".cl-feature-card");
  if (!feature) return;
  const color = CANDLELIGHT_FRAME_COLORS[actor.system.portraitFrameColor] ? actor.system.portraitFrameColor : "gold";
  feature.classList.remove(...FRAME_CLASSES);
  feature.classList.add(`cl-frame-${color}`);
  const oldIcon = feature.querySelector("img, .cl-spirit-feature-mask");
  const mask = document.createElement("span");
  mask.className = "cl-spirit-feature-mask";
  mask.style.setProperty("--cl-spirit-mask", `url(${getSpiritIcon(key)})`);
  mask.setAttribute("role", "img");
  mask.setAttribute("aria-label", `${getSpiritLabel(key)} Spirit icon`);
  oldIcon?.replaceWith(mask);
}

Hooks.on("renderActorSheet", (app, html) => {
  const actor = app.actor;
  if (!actor || actor.type !== "character") return;
  const root = html?.[0] ?? html;
  if (!root?.querySelector?.(".candlelight-sheet")) return;
  const form = root.matches?.(".candlelight-sheet") ? root : root.querySelector(".candlelight-sheet");
  if (!form) return;
  neutralizeDuplicateLevelField(form);
  ensureControls(form, actor);
  updatePortrait(form, actor);
  updateSpiritTab(form, actor);
});
