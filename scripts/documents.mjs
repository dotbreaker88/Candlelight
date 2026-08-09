import { CandlelightRolls } from "./rolls.mjs";
import { CandlelightCombat } from "./combat.mjs";

export class CandlelightActor extends Actor {
  getStat(key) { return this.system.statisticTotal?.(key) ?? 0; }
  get tier() { return this.system.tier ?? 1; }
  get universalDifficulty() { return this.system.universalDifficulty ?? 2; }

  testPool(statistic, {scale = 1, bonusDice = 0} = {}) {
    return Math.max(1, Math.floor(this.getStat(statistic) * scale) + 1 + bonusDice);
  }

  async rollTest(statistic, {label = null, scale = 1, bonusDice = 0, difficulty = null} = {}) {
    return CandlelightRolls.test({
      actor: this,
      pool: this.testPool(statistic, {scale, bonusDice}),
      statistic,
      label: label ?? `${CandlelightRolls.statLabel(statistic)} Test`,
      difficulty: difficulty ?? this.universalDifficulty
    });
  }

  async rollInitiativeCandlelight() { return CandlelightRolls.initiative(this); }
  async startTurn() { return this.update({"system.actionPoints.value": 3}); }
  async markDead(cause = "Unknown") { return this.update({"system.state.dead": true, "system.state.deathCause": cause}); }

  async fullRest() {
    const r = this.system.resources;
    return this.update({
      "system.resources.technique.value": r.technique.max,
      "system.resources.guile.value": r.guile.max,
      "system.resources.clericSlots.value": r.clericSlots.max,
      "system.resources.wizardSlots.value": r.wizardSlots.max
    });
  }
}

export class CandlelightItem extends Item {
  async attack() {
    if (this.type !== "weapon") return;
    return CandlelightCombat.attack(this);
  }

  async rollDamage() {
    if (this.type !== "weapon") return;
    const actor = this.actor;
    const strength = actor?.getStat?.("strength") ?? 0;
    const strengthBonus = this.system.weaponType === "ranged" ? 0 : strength;
    const flat = this.system.damageModifier ?? 0;
    const base = String(this.system.damage ?? "").trim() || "1d4";
    const formula = `${base} + ${strengthBonus} + ${flat}`;
    const result = await CandlelightRolls.evaluateNumeric(formula, {actor, better:"high"});
    const note = result.mode ? ` — ${result.mode === "best" ? "Embolden" : "Dishearten"}: rolled twice, kept roll ${result.kept}` : "";
    await result.roll.toMessage({speaker: ChatMessage.getSpeaker({actor}), flavor: `${this.name} Damage${note}`});
    return result.roll;
  }
}
