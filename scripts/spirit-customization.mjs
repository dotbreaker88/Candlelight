import { CANDLELIGHT_FRAME_COLORS, CANDLELIGHT_SPIRITS, getSpiritIcon, getSpiritKey, getSpiritLabel } from "./spirit-icons.mjs";

const FRAME_CLASSES = Object.keys(CANDLELIGHT_FRAME_COLORS).map(key => `cl-frame-${key}`);
const FRAME_HEX = Object.freeze({
  purple: "#a978d4",
  gold: "#d3a04c",
  red: "#c8585d",
  blue: "#5d8fd5",
  green: "#77a95e",
  teal: "#4daaaa"
});

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

function currentFrameColor(actor) {
  return CANDLELIGHT_FRAME_COLORS[actor.system.portraitFrameColor] ? actor.system.portraitFrameColor : "gold";
}

function syncControls(root, actor) {
  const key = currentSpiritKey(actor);
  const color = currentFrameColor(actor);
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
    await actor.update({[updatePath]: next}, {render: false});
    syncControls(root, actor);
    updatePortrait(root, actor);
    updateSpiritTab(root, actor);
  }, {capture: true});
}

function ensureControls(root, actor) {
  const key = currentSpiritKey(actor);
  const color = currentFrameColor(actor);
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

  for (const select of root.querySelectorAll("[data-cl-spirit-select]")) bindSelect(select, key, "system.spiritKey", actor, root);
  for (const select of root.querySelectorAll("[data-cl-frame-select]")) bindSelect(select, color, "system.portraitFrameColor", actor, root);
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

function ensurePortraitOrnaments(portrait) {
  let ornaments = portrait.querySelector(":scope > .cl-portrait-frame-ornaments");
  if (ornaments) return ornaments;
  ornaments = document.createElement("div");
  ornaments.className = "cl-portrait-frame-ornaments";
  ornaments.setAttribute("aria-hidden", "true");
  ornaments.innerHTML = `
    <span class="cl-frame-crown"><i></i></span>
    <span class="cl-frame-rail cl-frame-rail-left"><i></i><b></b></span>
    <span class="cl-frame-rail cl-frame-rail-right"><i></i><b></b></span>
    <span class="cl-frame-corner cl-frame-corner-tl"></span>
    <span class="cl-frame-corner cl-frame-corner-tr"></span>
    <span class="cl-frame-corner cl-frame-corner-bl"></span>
    <span class="cl-frame-corner cl-frame-corner-br"></span>
    <span class="cl-frame-pedestal"><i></i><b></b></span>`;
  portrait.prepend(ornaments);
  return ornaments;
}

function tintCanvas(canvas, src, tint) {
  if (!canvas || !src) return;
  const size = Number(canvas.dataset.size || 96);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, size, size);

  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    ctx.clearRect(0, 0, size, size);
    const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const x = (size - width) / 2;
    const y = (size - height) / 2;
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(image, x, y, width, height);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = "source-over";
  };
  image.onerror = () => console.warn(`Candlelight | Could not load Spirit icon ${src}`);
  image.src = src;
}

function updatePortrait(root, actor) {
  const portrait = root.querySelector(".cl-core-portrait");
  if (!portrait) return;

  const color = currentFrameColor(actor);
  portrait.classList.remove(...FRAME_CLASSES);
  portrait.classList.add(`cl-frame-${color}`);
  ensurePortraitOrnaments(portrait);

  const key = currentSpiritKey(actor);
  let medallion = portrait.querySelector(".cl-portrait-spirit");
  if (!key) {
    medallion?.remove();
    portrait.classList.remove("cl-has-spirit");
    return;
  }

  portrait.classList.add("cl-has-spirit");
  const icon = getSpiritIcon(key);
  const label = getSpiritLabel(key);
  if (!medallion) {
    medallion = document.createElement("div");
    medallion.className = "cl-portrait-spirit";
    portrait.appendChild(medallion);
  }
  medallion.title = `${label} Spirit`;
  medallion.innerHTML = `
    <span class="cl-spirit-medallion" aria-hidden="true">
      <span class="cl-spirit-medallion-inner">
        <canvas class="cl-spirit-canvas" data-size="104" role="img" aria-label="${label} Spirit icon"></canvas>
      </span>
    </span>
    <span class="cl-portrait-spirit-name">${label}</span>`;
  tintCanvas(medallion.querySelector(".cl-spirit-canvas"), icon, FRAME_HEX[color]);
}

function updateSpiritTab(root, actor) {
  const key = currentSpiritKey(actor);
  if (!key) return;
  const panel = root.querySelector('[data-tab-panel="spirit"] section');
  if (!panel) return;
  const feature = panel.querySelector(".cl-feature-card");
  if (!feature) return;

  const color = currentFrameColor(actor);
  feature.classList.remove(...FRAME_CLASSES);
  feature.classList.add(`cl-frame-${color}`);
  const oldIcon = feature.querySelector("img, .cl-spirit-feature-mask, .cl-spirit-feature-canvas");
  const canvas = document.createElement("canvas");
  canvas.className = "cl-spirit-feature-canvas";
  canvas.dataset.size = "128";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", `${getSpiritLabel(key)} Spirit icon`);
  oldIcon?.replaceWith(canvas);
  if (!oldIcon) feature.prepend(canvas);
  tintCanvas(canvas, getSpiritIcon(key), FRAME_HEX[color]);
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
