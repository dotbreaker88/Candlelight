import { CandlelightRolls } from "./rolls.mjs";

const DialogV2 = foundry.applications.api.DialogV2;

export class CandlelightCombat {
  static CHALLENGES = {
    dodge: {label: "Dodge", statistic: "agility"},
    parry: {label: "Parry", statistic: "dexterity"},
    block: {label: "Block", statistic: "strength"},
    standTall: {label: "Stand Tall", statistic: "toughness"}
  };

  static HIT_LOCATIONS = {
    1: "leftLeg",
    2: "rightLeg",
    3: "leftArm",
    4: "rightArm",
    5: "torso",
    6: "torso",
    7: "torso",
    8: "torso",
    9: "torso",
    10: "head"
  };

  static LOCATION_LABELS = {
    leftLeg: "Left Leg",
    rightLeg: "Right Leg",
    leftArm: "Left Arm",
    rightArm: "Right Arm",
    torso: "Torso",
    head: "Head"
  };

  static async attack(weapon) {
    const attacker = weapon.actor;
    if (!attacker) return ui.notifications.warn("Candlelight | This weapon must belong to an Actor.");

    const targets = Array.from(game.user.targets ?? []);
    if (targets.length !== 1) return ui.notifications.warn("Candlelight | Target exactly one token before attacking.");
    const targetToken = targets[0];
    const defender = targetToken.actor;
    if (!defender) return ui.notifications.warn("Candlelight | The targeted token has no Actor.");

    const declaration = await DialogV2.input({
      window: {title: `Declare Attack — ${weapon.name}`},
      content: `
        <div class="candlelight combat-dialog">
          <p><strong>Target:</strong> ${foundry.utils.escapeHTML(defender.name)}</p>
          <p>Declare any abilities or Elemental effects before the Challenge Roll.</p>
          <textarea name="declaration" rows="4" placeholder="Abilities, Elemental effects, or other pre-attack declarations"></textarea>
        </div>`,
      ok: {label: "Declare Attack"},
      rejectClose: false
    });
    if (declaration === null) return null;

    const declarationText = this._formValue(declaration, "declaration") ?? "";
    const challenge = await this._resolveChallenge({attacker, defender, weapon});
    if (!challenge) return null;

    const attackStatistic = weapon.system.weaponType === "ranged" ? "dexterity" : "prowess";
    const attackRoll = await CandlelightRolls.test({
      actor: attacker,
      pool: attacker.testPool(attackStatistic),
      statistic: attackStatistic,
      label: `${weapon.name} Attack`,
      difficulty: null,
      chat: false
    });

    const standTall = challenge.key === "standTall";
    const parryChosen = challenge.key === "parry";
    const parryCheck = parryChosen ? this._parryEligibility({attacker, defender, weapon}) : null;
    const invalidParry = parryChosen && parryCheck?.eligible === false;

    // An invalid Parry is only discovered after the defender has committed to
    // and locked that Challenge Roll. The attack then strikes automatically.
    const hit = standTall ? true : invalidParry ? true : attackRoll.successes > challenge.successes;
    const standTallSuccessful = standTall && challenge.successes >= attackRoll.successes;
    const critical = hit && attackRoll.tens > challenge.tens;
    const margin = attackRoll.successes - challenge.successes;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({actor: attacker}),
      content: `
        <div class="candlelight combat-card">
          <h3>${foundry.utils.escapeHTML(weapon.name)} vs ${foundry.utils.escapeHTML(defender.name)}</h3>
          ${declarationText ? `<p><strong>Declared:</strong> ${foundry.utils.escapeHTML(declarationText)}</p>` : ""}
          <p><strong>Challenge:</strong> ${challenge.label} — ${challenge.successes} successes, ${challenge.tens} tens</p>
          <p><strong>Attack:</strong> ${attackRoll.successes} successes, ${attackRoll.tens} tens</p>
          <p><strong>Margin:</strong> ${margin >= 0 ? "+" : ""}${margin}</p>
          ${invalidParry ? `<p><strong>Parry Failed:</strong> the defender's effective Strength was insufficient after the Parry was locked.</p>` : ""}
          <p class="cl-result ${hit ? "hit" : "miss"}"><strong>${
            invalidParry
              ? (critical ? "CRITICAL HIT — PARRY OVERPOWERED" : "HIT — PARRY OVERPOWERED")
              : standTall
                ? (standTallSuccessful ? "HIT — STAND TALL SUCCESS" : "HIT — STAND TALL FAILED")
                : (hit ? (critical ? "CRITICAL HIT" : "HIT") : "MISS")
          }</strong></p>
        </div>`
    });

    if (!hit) return {hit, critical, attackRoll, challenge};

    const hitLocation = await this._rollHitLocation(attacker, defender);
    const damage = await this._rollWeaponDamage(weapon, {critical});
    const resolution = await this._applyDamage({
      attacker,
      defender,
      weapon,
      hitLocation,
      rawDamage: damage.total,
      critical,
      challenge,
      attackRoll
    });

    return {hit, critical, attackRoll, challenge, parryCheck, invalidParry, hitLocation, damage, resolution};
  }

  static _parryEligibility({attacker, defender, weapon}) {
    const weaponType = String(weapon.system?.weaponType ?? "").trim().toLowerCase();

    if (weaponType === "ranged") {
      return {eligible: false, reason: "Ranged attacks cannot normally be parried."};
    }

    if (weapon.system?.spellAttack === true) {
      return {eligible: false, reason: "Spell attacks cannot normally be parried."};
    }

    const attackerStrength = Math.max(Number(attacker.getStat?.("strength") ?? 0) || 0, 0);
    const defenderStrength = Math.max(Number(defender.getStat?.("strength") ?? 0) || 0, 0);

    // Heavy/Pole modifies Strength for this Parry-eligibility function only,
    // whether the character is attacking or defending.
    const attackerUsesHeavyPole = ["heavy", "pole"].includes(weaponType);

    const defenderParryWeapon = [...defender.items].find(i =>
      i.type === "weapon" &&
      i.system?.equipped === true &&
      ["heavy", "pole"].includes(String(i.system?.weaponType ?? "").trim().toLowerCase())
    ) ?? null;

    const effectiveAttackerStrength = Math.floor(attackerStrength * (attackerUsesHeavyPole ? 1.5 : 1));
    const effectiveDefenderStrength = Math.floor(defenderStrength * (defenderParryWeapon ? 1.5 : 1));
    const parryStrengthLimit = effectiveDefenderStrength * 2;

    if (effectiveAttackerStrength > parryStrengthLimit) {
      return {
        eligible: false,
        reason: `Effective attacker Strength ${effectiveAttackerStrength} exceeds twice effective defender Strength (${parryStrengthLimit}).`
      };
    }

    return {
      eligible: true,
      reason: "",
      attackerStrength,
      effectiveAttackerStrength,
      defenderStrength,
      effectiveDefenderStrength,
      defenderParryWeapon: defenderParryWeapon?.name ?? null,
      parryStrengthLimit
    };
  }

  static async _resolveChallenge({attacker, defender, weapon}) {
    const weaponType = String(weapon.system?.weaponType ?? "").trim().toLowerCase();
    const parryOffered = weaponType !== "ranged" && weapon.system?.spellAttack !== true;

    const eligible = {
      dodge: true,
      parry: parryOffered,
      block: defender.items.some(i => i.system?.equipped && i.system?.canBlock),
      standTall: true
    };

    const buttons = Object.entries(this.CHALLENGES)
      .filter(([key]) => eligible[key])
      .map(([key, data]) => ({action: key, label: data.label}));

    if (!buttons.length) return {key: "denied", label: "No Challenge", successes: 0, tens: 0, results: []};

    const defenderUser = this._controllingUser(defender);
    const config = {
      window: {title: `${defender.name}: Choose Challenge`},
      content: `<div class="candlelight combat-dialog">
        <p>${foundry.utils.escapeHTML(attacker.name)} attacks with <strong>${foundry.utils.escapeHTML(weapon.name)}</strong>.</p>
        <p>Choose your Challenge Roll.</p>
      </div>`,
      buttons,
      rejectClose: false
    };

    const choice = defenderUser && defenderUser.id !== game.user.id
      ? await DialogV2.query(defenderUser, "wait", config)
      : await DialogV2.wait(config);

    if (!choice || !this.CHALLENGES[choice]) return null;

    const challenge = this.CHALLENGES[choice];
    let result = await CandlelightRolls.test({
      actor: defender,
      pool: defender.testPool(challenge.statistic),
      statistic: challenge.statistic,
      label: `${challenge.label} Challenge`,
      difficulty: null,
      chat: false
    });

    const canReroll = defender.items.some(i => i.type === "ability" && i.system?.grantsChallengeReroll);
    if (canReroll) {
      const reroll = defenderUser && defenderUser.id !== game.user.id
        ? await DialogV2.query(defenderUser, "confirm", {
            window: {title: `${challenge.label}: Keep or Reroll?`},
            content: `<p>${result.successes} successes, ${result.tens} tens.</p><p>If rerolled, the new result must be accepted.</p>`,
            yes: {label: "Reroll"},
            no: {label: "Keep"},
            rejectClose: false
          })
        : await DialogV2.confirm({
            window: {title: `${challenge.label}: Keep or Reroll?`},
            content: `<p>${result.successes} successes, ${result.tens} tens.</p><p>If rerolled, the new result must be accepted.</p>`,
            yes: {label: "Reroll"},
            no: {label: "Keep"},
            rejectClose: false
          });

      if (reroll === true) {
        result = await CandlelightRolls.test({
          actor: defender,
          pool: defender.testPool(challenge.statistic),
          statistic: challenge.statistic,
          label: `${challenge.label} Challenge — Reroll`,
          difficulty: null,
          chat: false
        });
      }
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({actor: defender}),
      content: `<div class="candlelight combat-card"><h3>${challenge.label} Locked</h3><p>${result.successes} successes · ${result.tens} tens</p></div>`
    });

    return {...result, key: choice, label: challenge.label};
  }

  static async _rollHitLocation(attacker, defender) {
    const result = await CandlelightRolls.evaluateNumeric("1d10", {actor: attacker, better: "high"});
    const roll = result.roll;
    const value = roll.total;
    const location = this.HIT_LOCATIONS[value];
    const note = result.mode ? ` | ${result.mode === "best" ? "Embolden" : "Dishearten"}: rolled twice, kept roll ${result.kept}` : "";
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: attacker}),
      flavor: `Hit Location: ${this.LOCATION_LABELS[location]} (${value})${note}`
    });
    return location;
  }

  static async _rollWeaponDamage(weapon, {critical = false} = {}) {
    const actor = weapon.actor;
    const strength = actor?.getStat?.("strength") ?? 0;
    const isRanged = weapon.system.weaponType === "ranged";
    const strengthBonus = isRanged ? 0 : strength;
    const flat = weapon.system.damageModifier ?? 0;
    const baseFormula = this._weaponBaseDamageFormula(weapon);

    if (critical) {
      const baseMax = await this._maximizeDamageFormula(baseFormula);
      const total = Math.max(0, baseMax + strengthBonus + flat);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({actor}),
        content: `<div class="candlelight combat-card"><h3>${foundry.utils.escapeHTML(weapon.name)} Critical Damage</h3><p>Base: ${foundry.utils.escapeHTML(baseFormula)} → maximized ${baseMax}</p><p><strong>Total: ${total}</strong></p></div>`
      });
      return {total, critical: true, formula: `${baseMax} + ${strengthBonus} + ${flat}`, baseFormula};
    }

    const formula = `${baseFormula} + ${strengthBonus} + ${flat}`;
    const result = await CandlelightRolls.evaluateNumeric(formula, {actor, better: "high"});
    const roll = result.roll;
    const note = result.mode ? ` — ${result.mode === "best" ? "Embolden" : "Dishearten"}: rolled twice, kept roll ${result.kept}` : "";
    await roll.toMessage({speaker: ChatMessage.getSpeaker({actor}), flavor: `${weapon.name} Damage${note}`});
    return {total: Math.max(0, roll.total), critical: false, roll, formula, baseFormula, rollTwiceMode: result.mode};
  }

  static async _applyDamage({attacker, defender, weapon, hitLocation, rawDamage, critical, challenge = null, attackRoll = null}) {
    const magical = weapon.system?.magical === true;
    const dragonfire = weapon.system?.dragonfire === true;
    const physical = !magical;
    const ap = Number(weapon.system?.armorPenetration ?? 0) || 0;

    // Recalculate Stand Tall from the actual locked Challenge at the point of
    // damage resolution so the mitigation cannot be lost between stages.
    const standTallChosen = challenge?.key === "standTall";
    const challengeSuccesses = Number(challenge?.successes ?? 0) || 0;
    const attackSuccesses = Number(attackRoll?.successes ?? 0) || 0;
    const standTallSuccessful = standTallChosen && challengeSuccesses >= attackSuccesses;

    const raw = Math.max(Number(rawDamage ?? 0) || 0, 0);
    const afterStandTall = standTallSuccessful && physical
      ? Math.floor(raw / 2)
      : raw;

    // Normalize locations to make existing items resilient to whitespace/case
    // quirks from earlier prototype sheets.
    const normalizeLocation = value => String(value ?? "").trim().toLowerCase();
    const targetLocation = normalizeLocation(hitLocation);

    const armorCandidates = [...defender.items].filter(i =>
      i.type === "armor" &&
      Boolean(i.system?.equipped) &&
      normalizeLocation(i.system?.location) === targetLocation
    );

    // Stacking is illegal. If legacy data somehow has more than one equipped,
    // use only the first and expose that fact in the debug card.
    const armorPiece = armorCandidates[0] ?? null;
    const listedArmorDR = Math.max(Number(armorPiece?.system?.dr ?? 0) || 0, 0);
    const effectiveArmorDR = magical ? 0 : Math.max(listedArmorDR - ap, 0);

    const innateDR = magical
      ? 0
      : Math.max(Number(defender.system?.innateDR ?? defender.system?.toughness ?? 0) || 0, 0);
    const universalDR = dragonfire
      ? 0
      : Math.max(Number(defender.system?.universalDR ?? 0) || 0, 0);

    const afterArmor = Math.max(afterStandTall - effectiveArmorDR, 0);
    const afterInnate = Math.max(afterArmor - innateDR, 0);
    const finalDamage = Math.max(afterInnate - universalDR, 0);

    const hpBefore = Number(defender.system.health.value ?? 0) || 0;
    const maxHP = Math.max(Number(defender.system.health.max ?? 1) || 1, 1);
    const tempBefore = Math.max(Number(defender.system.health.temp ?? 0) || 0, 0);

    const tempDamage = Math.min(tempBefore, finalDamage);
    const hpDamage = Math.max(finalDamage - tempDamage, 0);
    const tempAfter = tempBefore - tempDamage;
    const hpAfter = hpBefore - hpDamage;

    await defender.update({
      "system.health.temp": tempAfter,
      "system.health.value": hpAfter
    });

    const trauma = hpAfter <= -(2 * maxHP);
    if (trauma) await defender.markDead("Trauma");

    let wound = null;
    let prevented = false;

    if (!trauma && hpDamage > 0) {
      const enteredNegative = hpBefore >= 0 && hpAfter < 0;
      const alreadyNegative = hpBefore < 0;
      const threshold = Math.floor(Math.max(hpBefore, 0) / 2);
      const exceedsHalf = hpBefore >= 0 && hpDamage > threshold;

      let massiveWound = enteredNegative || alreadyNegative;

      if (!massiveWound && exceedsHalf) {
        const save = await defender.rollTest("toughness", {label: "Massive Wound Toughness Test"});
        prevented = !!save.passed;
        massiveWound = !save.passed;
      }

      if (massiveWound) {
        wound = await this._resolveMassiveWound({defender, weapon, hitLocation});
      }
    }

    // Always report mitigation, even when damage is fully prevented.
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({actor: defender}),
      content: `
        <div class="candlelight combat-card">
          <h3>Damage Resolution — ${foundry.utils.escapeHTML(defender.name)}</h3>
          <p><strong>Hit Location:</strong> ${this.LOCATION_LABELS[hitLocation] ?? hitLocation}</p>
          <p><strong>Raw Damage:</strong> ${raw}${critical ? " (maximized critical)" : ""}</p>
          <p><strong>Stand Tall:</strong> ${
            standTallChosen
              ? `${challengeSuccesses} vs Attack ${attackSuccesses} — ${standTallSuccessful ? "SUCCESS" : "FAILURE"}`
              : "Not used"
          }</p>
          ${standTallSuccessful && physical ? `<p>Physical damage halved first: ${raw} → <strong>${afterStandTall}</strong></p>` : ""}
          ${standTallSuccessful && !physical ? `<p>Stand Tall succeeded, but this attack is not physical.</p>` : ""}
          <p><strong>Armor:</strong> ${
            armorPiece
              ? `${foundry.utils.escapeHTML(armorPiece.name)} — DR ${listedArmorDR}; AP ${ap}; effective Armor DR <strong>${effectiveArmorDR}</strong>`
              : `No equipped armor found for ${this.LOCATION_LABELS[hitLocation] ?? hitLocation}`
          }</p>
          ${armorCandidates.length > 1 ? `<p><strong>Warning:</strong> ${armorCandidates.length} armor pieces are equipped at this location; stacking is illegal and only one was used.</p>` : ""}
          <p>After Armor: ${afterArmor}</p>
          <p>Innate DR ${innateDR} → ${afterInnate}</p>
          <p>Universal DR ${universalDR} → <strong>${finalDamage} damage through</strong></p>
          <p>Temporary HP absorbed: ${tempDamage} · HP damage: ${hpDamage}</p>
          <p>HP: ${hpBefore} → ${hpAfter}</p>
          ${prevented ? "<p>Massive Wound prevented by Toughness Test.</p>" : ""}
          ${wound ? `<p><strong>Massive Wound:</strong> ${wound.finalPosition >= 10 ? "Death" : `Severity ${wound.finalPosition}`}</p>` : ""}
          ${trauma ? "<p><strong>TRAUMA: DEAD</strong></p>" : ""}
        </div>`
    });

    console.debug("Candlelight | Damage Resolution", {
      attacker: attacker?.name,
      defender: defender?.name,
      weapon: weapon?.name,
      hitLocation,
      rawDamage: raw,
      standTallChosen,
      challengeSuccesses,
      attackSuccesses,
      standTallSuccessful,
      physical,
      afterStandTall,
      armorCandidates: armorCandidates.map(i => ({
        id: i.id,
        name: i.name,
        location: i.system?.location,
        dr: i.system?.dr,
        equipped: i.system?.equipped
      })),
      armorPiece: armorPiece?.name ?? null,
      listedArmorDR,
      ap,
      effectiveArmorDR,
      innateDR,
      universalDR,
      finalDamage,
      hpBefore,
      hpAfter
    });

    return {
      rawDamage: raw,
      afterStandTall,
      standTallChosen,
      standTallSuccessful,
      armorPieceId: armorPiece?.id ?? null,
      listedArmorDR,
      armorDR: effectiveArmorDR,
      innateDR,
      universalDR,
      finalDamage,
      tempDamage,
      hpDamage,
      hpBefore,
      hpAfter,
      trauma,
      wound
    };
  }

  static async _resolveMassiveWound({defender, weapon, hitLocation}) {
    // Lower severity is better for the wounded character.
    const severityResult = await CandlelightRolls.evaluateNumeric("1d10", {actor: defender, better: "low"});
    const roll = severityResult.roll;
    const baseRoll = roll.total;
    const resultModifier = weapon.system.massiveWoundResultModifier ?? 0;
    const magnitudeModifier = weapon.system.massiveWoundMagnitudeModifier ?? 0;
    const modifiedRoll = baseRoll + resultModifier;
    const finalPosition = modifiedRoll + magnitudeModifier;
    const fatal = finalPosition >= 10;

    await defender.createEmbeddedDocuments("Item", [{
      name: fatal ? `Fatal ${this.LOCATION_LABELS[hitLocation]} Wound` : `${this.LOCATION_LABELS[hitLocation]} Massive Wound ${finalPosition}`,
      type: "massiveWound",
      system: {
        location: hitLocation,
        severity: Math.max(1, finalPosition),
        permanent: finalPosition >= 8,
        baseRoll,
        resultModifier,
        magnitudeModifier,
        finalPosition,
        description: fatal ? "Massive Wound result 10+: death." : "Wound-table text is not yet defined."
      }
    }]);

    if (fatal) await defender.markDead("Massive Wound");

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: defender}),
      flavor: `Massive Wound — ${this.LOCATION_LABELS[hitLocation]} | Roll ${baseRoll} + Result ${resultModifier} + Magnitude ${magnitudeModifier} = ${finalPosition}${fatal ? " — DEATH" : ""}${severityResult.mode ? ` | ${severityResult.mode === "best" ? "Embolden" : "Dishearten"}: rolled twice, kept roll ${severityResult.kept}` : ""}`
    });

    return {baseRoll, resultModifier, magnitudeModifier, modifiedRoll, finalPosition, fatal};
  }

  static _weaponBaseDamageFormula(weapon) {
    const entered = String(weapon.system.damage ?? "").trim();
    if (entered) return entered;

    const defaults = {
      improvised: "1d4-1",
      light: "1d4",
      hybrid: "1d6",
      medium: "1d10",
      heavy: "2d6",
      pole: "1d8",
      ranged: "1d8"
    };

    const fallback = defaults[weapon.system.weaponType] ?? "1d4";
    ui.notifications?.warn?.(`Candlelight | ${weapon.name} had no damage formula. Using ${fallback} for its ${weapon.system.weaponType ?? "unknown"} profile.`);
    return fallback;
  }

  static async _maximizeDamageFormula(formula) {
    const clean = String(formula ?? "").trim();
    if (!clean) return 0;

    const compact = clean.replace(/\s+/g, "");
    const replaced = compact.replace(/(\d*)d(\d+)/gi, (_, n, faces) => String((Number(n) || 1) * Number(faces)));
    if (/^[0-9+\-*/().]+$/.test(replaced)) {
      return Math.floor(Function(`"use strict"; return (${replaced});`)());
    }

    const roll = await new Roll(clean).evaluate();
    let rolledDiceTotal = 0;
    let maxDiceTotal = 0;
    for (const die of roll.dice) {
      rolledDiceTotal += die.total ?? 0;
      const number = die.number ?? die.results?.length ?? 0;
      maxDiceTotal += number * (die.faces ?? 0);
    }
    return Math.floor((roll.total ?? 0) - rolledDiceTotal + maxDiceTotal);
  }

  static _controllingUser(actor) {
    const owners = game.users.filter(u => u.active && !u.isGM && actor.testUserPermission(u, "OWNER"));
    return owners[0] ?? game.users.find(u => u.active && u.isGM) ?? game.user;
  }

  static _formValue(result, key) {
    if (!result) return null;
    if (typeof result.get === "function") return result.get(key);
    if (result.object && key in result.object) return result.object[key];
    if (key in result) return result[key];
    return null;
  }
}
