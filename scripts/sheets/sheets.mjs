import { CandlelightLoot } from "../loot.mjs";
import { getSpiritIcon } from "../spirit-icons.mjs";

const LOCATION_LABELS = {
  head: "Head", torso: "Torso", leftArm: "Left Arm", rightArm: "Right Arm", leftLeg: "Left Leg", rightLeg: "Right Leg"
};

export class CandlelightCharacterSheet extends foundry.appv1.sheets.ActorSheet {
  _activeCandlelightTab = "core";

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:["candlelight","sheet","actor","character"],
      template:"systems/candlelight/templates/character-sheet.hbs",
      width:920, height:820, resizable:true, submitOnChange:true, closeOnSubmit:false
    });
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    const actor = this.actor;
    const items = [...actor.items];
    const abilities = items.filter(i => i.type === "ability");
    const armor = items.filter(i => i.type === "armor");
    const equipment = items.filter(i => ["weapon","armor","accessory","equipment"].includes(i.type));
    const spirit = items.find(i => i.type === "spirit") ?? null;
    const spiritIcon = getSpiritIcon(spirit);
    const byLoc = Object.fromEntries(Object.keys(LOCATION_LABELS).map(k => [k, armor.find(i => i.system.equipped && i.system.location === k) ?? null]));

    context.cl = {
      tier: actor.system.tier,
      universalDifficulty: actor.system.universalDifficulty,
      movement: actor.system.movement,
      innateDR: actor.system.innateDR,
      stats: Object.fromEntries(Object.keys(actor.system.statistics).map(key => [key, {key, label:key.charAt(0).toUpperCase()+key.slice(1), total:actor.getStat(key), data:actor.system.statistics[key]}])),
      weapons: items.filter(i => i.type === "weapon"),
      inventory: equipment,
      equippedGear: equipment.filter(i => i.type !== "armor" && i.system.equipped),
      armorByLocation: byLoc,
      armorLocations: Object.entries(LOCATION_LABELS).map(([key,label]) => ({key,label,item:byLoc[key]})),
      effects: [...actor.effects].map(e => ({effect:e, polarity:e.getFlag("candlelight","polarity") ?? "neutral"})),
      positiveEffects: [...actor.effects].filter(e => (e.getFlag("candlelight","polarity") ?? "neutral") === "positive"),
      negativeEffects: [...actor.effects].filter(e => (e.getFlag("candlelight","polarity") ?? "neutral") === "negative"),
      neutralEffects: [...actor.effects].filter(e => !["positive","negative"].includes(e.getFlag("candlelight","polarity") ?? "neutral")),
      talents: items.filter(i => i.type === "talent").concat(abilities.filter(i => ["class","theme"].includes(i.system.sourceType))),
      spirit,
      spiritIcon,
      spiritAbilities: abilities.filter(i => i.system.sourceType === "spirit"),
      element: items.find(i => i.type === "element") ?? null,
      elementAbilities: abilities.filter(i => i.system.sourceType === "element"),
      heritage: items.find(i => i.type === "heritage") ?? null,
      heritageAbilities: abilities.filter(i => i.system.sourceType === "heritage"),
      theme: items.find(i => i.type === "theme") ?? null,
      classes: items.filter(i => i.type === "class")
    };
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    this._activateTab(html, this._activeCandlelightTab ?? "core");

    html.find("[data-tab-button]").on("click", e => {
      this._activeCandlelightTab = e.currentTarget.dataset.tabButton;
      this._activateTab(html, this._activeCandlelightTab);
    });

    if (!this.isEditable) return;

    html.find("[data-action='roll-stat']").on("click", e => this.actor.rollTest(e.currentTarget.dataset.stat));
    html.find("[data-action='edit-stat']").on("click", e => this._editStatistic(e.currentTarget.dataset.stat));
    html.find("[data-action='initiative']").on("click", () => this.actor.rollInitiativeCandlelight());
    html.find("[data-action='full-rest']").on("click", () => this.actor.fullRest());
    html.find("[data-action='attack']").on("click", e => this.actor.items.get(e.currentTarget.dataset.itemId)?.attack());
    html.find("[data-action='roll-damage']").on("click", e => this.actor.items.get(e.currentTarget.dataset.itemId)?.rollDamage());
    html.find("[data-action='edit-item']").on("click", e => this.actor.items.get(e.currentTarget.dataset.itemId)?.sheet.render(true));
    html.find("[data-action='delete-item']").on("click", e => this._deleteItem(e.currentTarget.dataset.itemId));
    html.find("[data-action='drop-item']").on("click", e => CandlelightLoot.dropItem(this.actor, this.actor.items.get(e.currentTarget.dataset.itemId)));
    html.find("[data-action='toggle-equip']").on("click", e => this._toggleEquip(e.currentTarget.dataset.itemId));
    html.find("[data-action='create-effect']").on("click", e => this._createEffect(e.currentTarget.dataset.polarity));
    html.find("[data-action='create-candlelight-effect']").on("click", e => this._createCandlelightEffect(e.currentTarget.dataset.effectKey));
    html.find("[data-action='edit-effect']").on("click", e => this.actor.effects.get(e.currentTarget.dataset.effectId)?.sheet.render(true));
    html.find("[data-action='delete-effect']").on("click", e => this.actor.deleteEmbeddedDocuments("ActiveEffect", [e.currentTarget.dataset.effectId]));
    html.find("[data-action='toggle-effect']").on("click", async e => {
      const effect=this.actor.effects.get(e.currentTarget.dataset.effectId); if(effect) await effect.update({disabled:!effect.disabled});
    });
  }

  _activateTab(html, tab) {
    const validTabs = new Set(["core", "gear", "effects", "talents", "spirit", "element", "heritage"]);
    if (!validTabs.has(tab)) tab = "core";
    this._activeCandlelightTab = tab;

    html.find("[data-tab-button]").removeClass("active").attr("aria-selected", "false");
    html.find(`[data-tab-button='${tab}']`).addClass("active").attr("aria-selected", "true");

    html.find("[data-tab-panel]").removeClass("active");
    html.find(`[data-tab-panel='${tab}']`).addClass("active");
  }

  async _editStatistic(key) {
    const stat = this.actor.system.statistics?.[key];
    if (!stat) return;

    const label = key.charAt(0).toUpperCase() + key.slice(1);

    const result = await foundry.applications.api.DialogV2.input({
      window: {title: `Edit ${label}`},
      content: `
        <div class="candlelight cl-stat-editor">
          <p class="hint">Manual override editor. Normal character creation/progression should eventually manage these values automatically.</p>
          <label>Base <input type="number" name="base" value="${stat.base ?? 0}"></label>
          <label>Heritage <input type="number" name="heritage" value="${stat.heritage ?? 0}"></label>
          <label>Theme <input type="number" name="theme" value="${stat.theme ?? 0}"></label>
          <label>Temporary <input type="number" name="other" value="${stat.other ?? 0}"></label>
        </div>`,
      ok: {label: "Apply"},
      rejectClose: false
    });

    if (result === null) return;

    const getValue = name => {
      if (typeof result?.get === "function") return Number(result.get(name) ?? 0) || 0;
      if (result?.object && name in result.object) return Number(result.object[name] ?? 0) || 0;
      if (name in (result ?? {})) return Number(result[name] ?? 0) || 0;
      return 0;
    };

    await this.actor.update({
      [`system.statistics.${key}.base`]: getValue("base"),
      [`system.statistics.${key}.heritage`]: getValue("heritage"),
      [`system.statistics.${key}.theme`]: getValue("theme"),
      [`system.statistics.${key}.other`]: getValue("other")
    });
  }

  async _deleteItem(id) {
    const item=this.actor.items.get(id); if(!item) return;
    const ok = await foundry.applications.api.DialogV2.confirm({window:{title:"Remove Item"}, content:`<p>Remove <strong>${foundry.utils.escapeHTML(item.name)}</strong> from ${foundry.utils.escapeHTML(this.actor.name)}?</p>`});
    if(ok) await this.actor.deleteEmbeddedDocuments("Item", [id]);
  }

  async _toggleEquip(id) {
    const item=this.actor.items.get(id); if(!item || item.system.equipped === undefined) return;
    const equip=!item.system.equipped;
    if(equip && item.type === "armor") {
      const conflicts=this.actor.items.filter(i => i.type === "armor" && i.id !== item.id && i.system.equipped && i.system.location === item.system.location);
      if(conflicts.length) await this.actor.updateEmbeddedDocuments("Item", conflicts.map(i => ({_id:i.id,"system.equipped":false})));
    }
    await item.update({"system.equipped":equip});
  }


  async _createCandlelightEffect(key) {
    const presets = {
      embolden: {
        name: "Embolden",
        icon: "icons/svg/upgrade.svg",
        polarity: "positive",
        mode: "best",
        description: "While active, applicable dice rolls are made twice and the better result is kept."
      },
      dishearten: {
        name: "Dishearten",
        icon: "icons/svg/downgrade.svg",
        polarity: "negative",
        mode: "worst",
        description: "While active, applicable dice rolls are made twice and the worse result is kept."
      }
    };
    const preset = presets[key];
    if (!preset) return;

    const existing = [...this.actor.effects].find(e => String(e.name ?? "").toLowerCase() === preset.name.toLowerCase());
    if (existing) {
      if (existing.disabled) await existing.update({disabled:false});
      return ui.notifications.info(`Candlelight | ${preset.name} is already present on ${this.actor.name}.`);
    }

    await this.actor.createEmbeddedDocuments("ActiveEffect", [{
      name: preset.name,
      icon: preset.icon,
      disabled: false,
      description: preset.description,
      flags: {
        candlelight: {
          polarity: preset.polarity,
          rollTwice: preset.mode,
          systemEffect: key
        }
      }
    }]);
  }

  async _createEffect(polarity="neutral") {
    const label = polarity === "positive" ? "New Positive Effect" : polarity === "negative" ? "New Negative Effect" : "New Effect";
    const [effect] = await this.actor.createEmbeddedDocuments("ActiveEffect", [{name:label, icon:"icons/svg/aura.svg", disabled:false, flags:{candlelight:{polarity}}}]);
    effect?.sheet.render(true);
  }
}

export class CandlelightLootSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {classes:["candlelight","sheet","actor","loot"], template:"systems/candlelight/templates/loot-sheet.hbs", width:420, height:360, resizable:true});
  }
  async getData(options={}) { const c=await super.getData(options); c.cl={items:[...this.actor.items]}; return c; }
  activateListeners(html) { super.activateListeners(html); html.find("[data-action='pickup']").on("click", e => CandlelightLoot.pickup(this.actor, e.currentTarget.dataset.itemId)); html.find("[data-action='pickup-all']").on("click", () => CandlelightLoot.pickup(this.actor)); }
}

export class CandlelightItemSheet extends foundry.appv1.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {classes:["candlelight","sheet","item"],template:"systems/candlelight/templates/item-sheet.hbs",width:520,height:600,resizable:true,submitOnChange:true,closeOnSubmit:false});
  }
  async getData(options={}) { const c=await super.getData(options); c.system=this.item.system; return c; }
  async _updateObject(event,formData) { await this.item.update(formData); }
}
