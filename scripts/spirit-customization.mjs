import { CANDLELIGHT_FRAME_COLORS, CANDLELIGHT_SPIRITS, getSpiritIcon, getSpiritKey, getSpiritLabel } from "./spirit-icons.mjs";

const FRAME_CLASSES = Object.keys(CANDLELIGHT_FRAME_COLORS).map(key => `cl-frame-${key}`);
const FRAME_HEX = Object.freeze({
  purple: "#a978d4", gold: "#d3a04c", red: "#c8585d",
  blue: "#5d8fd5", green: "#77a95e", teal: "#4daaaa"
});

function optionMarkup(options, selected, blankLabel = null) {
  const rows = [];
  if (blankLabel !== null) rows.push(`<option value=""${selected ? "" : " selected"}>${blankLabel}</option>`);
  for (const [value, label] of Object.entries(options)) rows.push(`<option value="${value}"${value === selected ? " selected" : ""}>${label}</option>`);
  return rows.join("");
}

function currentSpiritKey(actor) {
  const stored = getSpiritKey(actor.system.spiritKey);
  if (stored) return stored;
  return getSpiritKey(actor.items.find(item => item.type === "spirit"));
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
    await actor.update({[updatePath]: event.currentTarget.value}, {render: false});
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
  if (!root.querySelector("[data-cl-spirit-customizer]")) root.querySelector(".cl-level-strip")?.insertAdjacentHTML("afterend", controls);
  if (!root.querySelector("[data-cl-spirit-tab-customizer]")) {
    const spiritSection = root.querySelector('[data-tab-panel="spirit"] section');
    if (spiritSection) spiritSection.querySelector("h2")?.insertAdjacentHTML("afterend", controls.replace("data-cl-spirit-customizer", "data-cl-spirit-tab-customizer"));
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
    <span class="cl-frame-crown"><i></i><b></b></span>
    <span class="cl-frame-shoulder cl-frame-shoulder-left"><i></i></span>
    <span class="cl-frame-shoulder cl-frame-shoulder-right"><i></i></span>
    <span class="cl-frame-rail cl-frame-rail-left"><i></i><b></b></span>
    <span class="cl-frame-rail cl-frame-rail-right"><i></i><b></b></span>
    <span class="cl-frame-scroll cl-frame-scroll-left"></span>
    <span class="cl-frame-scroll cl-frame-scroll-right"></span>
    <span class="cl-frame-pedestal"><i></i><b></b></span>`;
  portrait.prepend(ornaments);
  return ornaments;
}

function alphaBounds(ctx, width, height) {
  const {data} = ctx.getImageData(0, 0, width, height);
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < 8) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return maxX >= minX && maxY >= minY ? {x:minX, y:minY, width:maxX-minX+1, height:maxY-minY+1} : null;
}

function tintCanvas(canvas, src, tint) {
  if (!canvas || !src) return;
  const size = Number(canvas.dataset.size || 96);
  canvas.width = size;
  canvas.height = size;
  const out = canvas.getContext("2d");
  if (!out) return;
  out.clearRect(0, 0, size, size);

  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    const scratch = document.createElement("canvas");
    scratch.width = image.naturalWidth;
    scratch.height = image.naturalHeight;
    const sctx = scratch.getContext("2d", {willReadFrequently:true});
    if (!sctx) return;
    sctx.drawImage(image, 0, 0);
    const bounds = alphaBounds(sctx, scratch.width, scratch.height) ?? {x:0,y:0,width:scratch.width,height:scratch.height};

    out.clearRect(0, 0, size, size);
    const pad = Math.max(7, Math.round(size * 0.1));
    const avail = size - pad * 2;
    const scale = Math.min(avail / bounds.width, avail / bounds.height);
    const width = bounds.width * scale;
    const height = bounds.height * scale;
    const x = (size - width) / 2;
    const y = (size - height) / 2;

    out.save();
    out.drawImage(scratch, bounds.x, bounds.y, bounds.width, bounds.height, x, y, width, height);
    out.globalCompositeOperation = "source-in";
    out.fillStyle = tint;
    out.fillRect(0, 0, size, size);
    out.restore();
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
      <span class="cl-spirit-medallion-inner"><canvas class="cl-spirit-canvas" data-size="88" role="img" aria-label="${label} Spirit icon"></canvas></span>
    </span>
    <span class="cl-portrait-spirit-name">${label}</span>`;
  tintCanvas(medallion.querySelector(".cl-spirit-canvas"), icon, FRAME_HEX[color]);
}

function updateSpiritTab(root, actor) {
  const key = currentSpiritKey(actor);
  if (!key) return;
  const feature = root.querySelector('[data-tab-panel="spirit"] section .cl-feature-card');
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
