const esc = value => foundry.utils.escapeHTML(String(value ?? ""));

const ARMOR_SLOTS = [
  ["head","Head"],["leftArm","Left Arm"],["torso","Torso"],["rightArm","Right Arm"],["leftLeg","Left Leg"],["rightLeg","Right Leg"]
];

function equippedArmor(actor,key){return actor.items.find(i=>i.type==="armor"&&i.system.equipped&&i.system.location===key)??null;}
function equippedWeapons(actor){return actor.items.filter(i=>i.type==="weapon"&&i.system.equipped);}
function spellItems(actor){
  const abilities=actor.items.filter(i=>i.type==="ability"&&(
    ["cleric","wizard"].some(k=>String(i.system.sourceName??"").toLowerCase().includes(k)) ||
    String(i.name??"").toLowerCase().includes("spell")
  ));
  const spellWeapons=actor.items.filter(i=>i.type==="weapon"&&i.system.spellAttack);
  return [...abilities,...spellWeapons];
}

function paperDollMarkup(actor){
  const slots=ARMOR_SLOTS.map(([key,label])=>{
    const item=equippedArmor(actor,key);
    return `<div class="cl-core-doll-slot slot-${key}"><span>${label}</span>${item?`<img src="${esc(item.img)}"><strong>${esc(item.name)}</strong><small>DR ${item.system.dr??0}</small><button type="button" data-core-toggle-equip="${item.id}">Unequip</button>`:`<em>Empty</em>`}</div>`;
  }).join("");
  return `<section class="cl-core-paper-doll"><div class="cl-section-heading"><h2>Equipment</h2><span class="hint">Current armor layout</span></div><div class="cl-core-doll">${slots}<div class="cl-core-doll-figure"><i class="fa-solid fa-person"></i></div></div></section>`;
}

function attackMarkup(actor){
  const weapons=equippedWeapons(actor);
  const rows=weapons.map(item=>`<div class="cl-core-attack-row"><img src="${esc(item.img)}"><div><strong>${esc(item.name)}</strong><small>${esc(item.system.weaponType)} · ${esc(item.system.damage)} · AP ${item.system.armorPenetration??0}</small></div><button type="button" data-core-attack="${item.id}"><i class="fa-solid fa-crosshairs"></i> Attack</button></div>`).join("");
  return `<section class="cl-core-attacks"><div class="cl-section-heading"><h2>Attack</h2><span class="hint">Readied weapons</span></div><div class="cl-core-attack-list">${rows||`<div class="hint">No equipped weapons.</div>`}</div></section>`;
}

function manualStatsMarkup(actor){
  const stats=Object.keys(actor.system.statistics??{}).map(key=>`<button type="button" data-core-edit-stat="${key}"><span>${esc(key)}</span><strong>${actor.getStat(key)}</strong><i class="fa-solid fa-pen-to-square"></i></button>`).join("");
  return `<details class="cl-manual-stats"><summary><i class="fa-solid fa-sliders"></i> Manual Statistics</summary><p class="hint">Administrative overrides only. Normal play uses the persistent Attribute readouts.</p><div>${stats}</div></details>`;
}

function ensureCoreLayout(app,root){
  const core=root.querySelector('[data-tab-panel="core"]');
  if(!core||core.querySelector(".cl-core-equipment-stage"))return;
  core.querySelector(".cl-stat-section")?.remove();
  core.querySelector(".cl-quick-gear")?.remove();
  const columns=core.querySelector(".cl-core-columns");
  if(columns){
    const stage=document.createElement("div");
    stage.className="cl-core-equipment-stage";
    stage.innerHTML=paperDollMarkup(app.actor)+attackMarkup(app.actor);
    columns.prepend(stage);
  }
  core.insertAdjacentHTML("beforeend",manualStatsMarkup(app.actor));

  core.querySelectorAll("[data-core-edit-stat]").forEach(btn=>btn.addEventListener("click",()=>app._editStatistic?.(btn.dataset.coreEditStat)));
  core.querySelectorAll("[data-core-toggle-equip]").forEach(btn=>btn.addEventListener("click",()=>app._toggleEquip?.(btn.dataset.coreToggleEquip)));
  core.querySelectorAll("[data-core-attack]").forEach(btn=>btn.addEventListener("click",()=>app.actor.items.get(btn.dataset.coreAttack)?.attack()));
}

function ensureSpellsTab(app,root){
  const nav=root.querySelector(":scope > .cl-portfolio-tabs");
  if(!nav||nav.querySelector('[data-tab-button="spells"]'))return;
  const btn=document.createElement("button");
  btn.type="button";btn.className="cl-portfolio-tab cl-tab-spells";btn.dataset.tabButton="spells";btn.setAttribute("role","tab");btn.setAttribute("aria-selected","false");btn.innerHTML='<i class="fa-solid fa-book-sparkles"></i><span>Spells</span>';
  const spirit=nav.querySelector('[data-tab-button="spirit"]');
  nav.insertBefore(btn,spirit??null);

  const panel=document.createElement("div");
  panel.className="cl-tab-panel cl-spells-panel";panel.dataset.tabPanel="spells";
  const spells=spellItems(app.actor);
  const cards=spells.map(item=>`<article class="cl-spell-card"><img src="${esc(item.img)}"><div><h3>${esc(item.name)}</h3><small>${esc(item.system.sourceName|| (item.system.spellAttack?"Spell Attack":"Magic"))}</small><div class="cl-spell-description">${item.system.description||""}</div></div><button type="button" data-spell-details="${item.id}">Details</button>${item.type==="weapon"?`<button type="button" data-spell-attack="${item.id}"><i class="fa-solid fa-wand-magic-sparkles"></i> Attack</button>`:""}</article>`).join("");
  panel.innerHTML=`<section><div class="cl-section-heading"><h2>Spells</h2><span class="hint">Cleric, Wizard, and spell-attack abilities</span></div><div class="cl-spell-grid">${cards||'<p class="hint">No spells are currently recorded on this character.</p>'}</div></section>`;
  root.appendChild(panel);
  panel.querySelectorAll("[data-spell-details]").forEach(b=>b.addEventListener("click",()=>app.actor.items.get(b.dataset.spellDetails)?.sheet.render(true)));
  panel.querySelectorAll("[data-spell-attack]").forEach(b=>b.addEventListener("click",()=>app.actor.items.get(b.dataset.spellAttack)?.attack()));

  btn.addEventListener("click",()=>{
    app._activeCandlelightTab="spells";
    nav.querySelectorAll("[data-tab-button]").forEach(x=>{x.classList.toggle("active",x===btn);x.setAttribute("aria-selected",x===btn?"true":"false");});
    root.querySelectorAll("[data-tab-panel]").forEach(x=>x.classList.toggle("active",x===panel));
  });
}

Hooks.on("renderActorSheet",(app,html)=>{
  if(app.actor?.type!=="character")return;
  const root=(html?.[0]??html)?.matches?.(".candlelight-sheet")?(html?.[0]??html):(html?.[0]??html)?.querySelector?.(".candlelight-sheet");
  if(!root)return;
  ensureCoreLayout(app,root);
  ensureSpellsTab(app,root);
});
