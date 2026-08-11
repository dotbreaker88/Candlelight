# Candlelight — Foundry Implementation Status

**System version audited:** 0.6.14  
**Target:** Foundry VTT 14  
**Status:** Code-audited implementation inventory.  
**Authority:** This file describes what the repository currently implements. It does **not** define Candlelight rules; `CANDLELIGHT_RULES.md` does.

This document is intentionally conservative. A feature is marked Implemented only when repository code/data clearly supports it. A rule appearing in the rules reference is not considered implemented merely because it is documented.

---

## 1. Package and Registration — Implemented

- Foundry system id: `candlelight`.
- Current manifest version: `0.6.14`.
- Minimum/verified Foundry version: 14.
- Actor types registered: `character`, `loot`.
- Item types registered: `weapon`, `armor`, `accessory`, `equipment`, `ability`, `heritage`, `theme`, `class`, `spirit`, `element`, `massiveWound`, `talent`.
- Custom Character, Loot, and Item sheets are registered as defaults.
- Character combat turns reset Action Points through the `combatTurn` hook.
- GitHub manifest/download fields are configured for update/install distribution.

---

## 2. Character Data Model — Implemented

### Stored Character Fields
- Level, minimum 1.
- Ten Statistics: Strength, Speed, Agility, Dexterity, Prowess, Toughness, Vigor, Willpower, Intelligence, Charm.
- Each Statistic stores Base, Heritage, Theme, and Other contributions.
- HP: current, maximum, Temporary HP.
- Action Points.
- Technique, Guile, Cleric Slots, Wizard Slots.
- Universal DR.
- Spirit key.
- Portrait frame color.
- Dead state and death cause.
- Biography.

### Derived Values
- Tier = `floor((Level - 1) / 5) + 1`, clamped 1–4.
- Universal Difficulty = `max(Tier - 1, 2)`.
- Statistic total = Base + Heritage + Theme + Other.
- Movement = `4 + Speed`.
- Initiative bonus = Speed.
- Innate DR = Toughness.
- Action Point maximum forced to 3.
- Technique max = `1 + Prowess`.
- Guile max = `1 + Charm`.
- Cleric Slot max = `1 + Willpower`.
- Wizard Slot max = `1 + Intelligence`.
- Resource values are clamped to their maxima.
- Temporary HP is clamped to non-negative values.

### Important Gaps
- Heritage and Theme packages are represented in data but are **not automatically applied from selected Heritage/Theme Items**.
- Character creation/progression does not yet assign legal starting Statistics or advancement choices.
- HP progression from Theme is not automated.
- Statistic damage is not modeled as a dedicated rules subsystem.

---

## 3. Test and Roll Engine — Implemented

- General Test pool: `Statistic + 1`, minimum 1 die.
- Test dice use d10s with exploding 10s.
- 7+ counts as a success.
- Natural 10s are counted separately.
- Difficulty-based Tests calculate success/failure and margin.
- Opposed comparison support preserves successes and 10s.
- Initiative uses `1d10 + Speed`.
- Numeric Roll helper supports roll-twice and selecting high or low as better.

### Embolden / Dishearten — Implemented
- Recognized from ActiveEffect flag `candlelight.rollTwice` or legacy effect name.
- Embolden = roll twice, keep better.
- Dishearten = roll twice, keep worse.
- Dishearten takes precedence if both are present.
- Success Tests compare successes, then 10s.
- Numeric Rolls can define high or low as better.
- Quick-create effect presets exist on the character sheet.

### Gaps
- Arbitrary `NEVER > ALWAYS` effect precedence is not a generic rules engine.
- Most other Keywords/Status Conditions are not automatically enforced.

---

## 4. Challenge Rolls — Substantially Implemented

Canonical challenge data in code defines:
- Dodge → Agility.
- Parry → Dexterity.
- Block → Strength.
- Stand Tall → Toughness.

Attack workflow:
1. Requires exactly one targeted token.
2. Attacker gets a declaration text step for Abilities/Elemental effects.
3. Defender chooses among currently offered Challenges.
4. Defender rolls and may use a Challenge reroll if they possess an Ability with `grantsChallengeReroll`.
5. A reroll must be kept.
6. Challenge is locked before attacker rolls.

### Eligibility Implemented
- Dodge always offered.
- Parry offered for melee non-Spell attacks.
- Block offered when defender has equipped Armor/Equipment with `canBlock`.
- Stand Tall always offered.

### Known Rules Discrepancy
The rules reference states that a defender cannot voluntarily decline a Challenge and that if no legal Challenge exists the attack proceeds with no defense. The current dialog can return `null` if closed/no valid choice, which cancels the attack workflow rather than resolving a no-defense state. Because Dodge and Stand Tall are currently always offered, the no-legal-Challenge branch is normally unreachable without future effects.

---

## 5. Parry — Implemented

- Ranged attacks cannot normally be Parried.
- Spell attacks cannot normally be Parried.
- Parry uses commit-then-validate timing.
- After Parry is locked, effective Strength is checked.
- Parry fails automatically if Effective Attacker Strength > 2 × Effective Defender Strength.
- Heavy/Pole weapons multiply effective Strength by 1.5 for this eligibility check only, rounding down.
- Defender can also receive the 1.5 multiplier when wielding an equipped Heavy/Pole weapon.
- Invalid committed Parry produces an automatic hit.

---

## 6. Attack Resolution — Implemented

- Melee attack pool uses Prowess.
- Ranged attack pool uses Dexterity.
- Attacker must exceed Challenge successes to hit; ties favor defender for hit-negating Challenges.
- Stand Tall is handled specially and does not negate the hit.
- Critical Hit occurs on a hit when attacker has more 10s than defender.
- Hit Location is rolled on 1d10 with the canonical mapping.
- Hit Location Roll uses the numeric roll-twice engine and therefore supports Embolden/Dishearten.

### Critical Damage — Implemented
- Critical weapon damage maximizes the weapon's base damage dice.
- Melee/non-Ranged Strength bonus and flat damage modifier are then added.

---

## 7. Weapon Data — Implemented

Weapon fields include:
- Weapon Type: improvised, light, hybrid, medium, heavy, pole, ranged.
- Damage formula.
- Armor Penetration.
- Massive Wound Result Modifier.
- Massive Wound Magnitude Modifier.
- Flat damage modifier.
- Equipped.
- Magical.
- Dragonfire.
- Spell Attack.

Weapon damage:
- Ranged weapons do not add Strength.
- Other weapon types add Strength.
- Normal weapon damage uses the numeric roll-twice engine.
- Critical damage is maximized rather than rolled.

---

## 8. Damage Mitigation — Implemented for Current Weapon Attack Pipeline

Current combat code implements a staged weapon-damage pipeline including:
- Stand Tall physical-damage halving on successful Stand Tall, rounding down.
- Armor lookup by struck Hit Location.
- Only one equipped armor piece contributes.
- Armor Penetration reduces Armor DR only.
- Magical attacks bypass Armor DR.
- Magical attacks bypass Innate DR.
- Innate DR otherwise applies.
- Dragonfire bypasses Universal DR.
- Universal DR otherwise applies.
- Damage then proceeds to Temporary HP and HP.

### Important Rules/Implementation Gap
The canonical rules now define a broader offensive modifier order including ordinary modifiers → Resistant/Vulnerable → Final Damage modifiers → Target defenses. The current combat engine does **not** implement a generic Resistant/Vulnerable system or Final Damage modifier stage.

The current Stand Tall implementation is a specific pre-DR reduction inside weapon resolution rather than a generalized damage-modifier framework.

---

## 9. Health, Massive Wounds, and Death — Partially Implemented

The combat engine contains HP/Temporary HP handling and Massive Wound generation logic. The Massive Wound Item model stores:
- location;
- severity;
- permanent flag;
- base roll;
- Result Modifier;
- Magnitude Modifier;
- final position.

Implemented concepts include:
- Hit-location-specific Massive Wound generation.
- Weapon Result and Magnitude modifiers.
- Final wound-table position storage.
- Position 10+ death handling.
- Trauma/death state support exists in combat logic/state model.

### Major Gap: Current Massive Wound Rules Are Not Fully Implemented
The new canonical cumulative Head/Torso/Arms/Legs wound tables are **not automated as their actual effects**. The system can create/store a Massive Wound result, but it does not automatically apply the complete table consequences such as Prone, Stunned, Infection, Bleed, Statistic damage, Silenced, Suffocating, limb loss, etc.

### Rules Drift Requiring Code Review
The rules reference now says reaching **0 HP or lower** automatically causes a Massive Wound. Earlier implementation was built around entering negative HP/remaining negative. This should be treated as a rules-vs-code audit item until explicitly brought into exact alignment and tested.

---

## 10. Armor and Equipment — Implemented Foundation

Armor fields:
- Hit Location: Head, Torso, Left Arm, Right Arm, Left Leg, Right Leg.
- DR.
- Equipped.
- Enables Block.

Equipment/Accessory fields:
- Equipped.
- Enables Block.

Character sheet:
- Paper-doll armor display.
- One equipped armor piece per Hit Location enforced by sheet equip workflow.
- Equipped non-armor gear display.
- Item editing.
- Permanent item removal.
- Drop-to-Scene.
- Pick-up workflow using temporary Loot Actors/Tokens.

---

## 11. Character Sheet — Implemented Foundation

Current sheet supports:
- Core, Gear, Effects, Talents, Spirit, Element, Heritage tabs.
- Tab state persists across Foundry rerenders.
- Ten Statistics displayed.
- Statistics are normally read-only with manual edit dialog for Base/Heritage/Theme/Temporary values.
- HP, Temp HP, AP, Movement, Initiative, Innate DR, Universal DR, Universal Difficulty, and class resources displayed.
- Equipped weapon quick actions.
- Armor paper doll and inventory management.
- Positive/Negative/Other ActiveEffect management.
- Talent display.
- Spirit, Element, Heritage, Theme, and Class identity data surfaced in the sheet context.
- Level form normalization prevents blank/invalid Level submissions from invalidating unrelated updates.

### Not Yet Implemented
- Full character-creation workflow.
- Automatic Heritage/Theme stat package application.
- Level-up choice workflow.
- Complete Spell tab/spellcasting workflow.
- Complete Skills UI/system.

---

## 12. Spirit Presentation — Implemented

- Exactly 30 canonical Spirit presentation keys are supported:
  Ant, Axolotl, Badger, Bat, Bear, Dragon, Fox, Hawk, Lion, Mantis, Mongoose, Monkey, Ox, Rabbit, Rat, Shark, Snake, Sphinx, Spider, Stag, Turtle, Vulture, Wolf, Phoenix, Barguest, Golem, Exile, Kraken, Thunderbird, Unicorn.
- `Barghest` is accepted as an alias for canonical `Barguest`.
- Character data allows blank/unselected Spirit or one canonical Spirit key.
- Canonical Spirit WebP assets exist under `assets/icons/spirits/`.
- Portrait and Spirit tab resolve canonical icons.
- Spirit icons are tinted to match the selected portrait-frame color.
- Supported frame colors: Purple, Gold, Red, Blue, Green, White.
- Teal is no longer a valid model choice; old Teal presentation data falls back to White in customization code.
- Portrait frame production asset is integrated.
- Spirit icon placement uses alpha-weighted visual-mass centering with optional per-Spirit calibration hooks.

### Not Implemented
- Spirit mechanics/Abilities are not automatically granted or executed merely by selecting a Spirit.
- Spirit progression/level-up choice system is not implemented.

---

## 13. Heritage, Theme, Class, Spirit, Element, Ability, Talent Models — Implemented as Data Foundations

### Heritage
- Description.
- Ten fixed Statistic bonus fields.
- Notes.

### Theme
- Description.
- HP divisor.
- Array of Classes from Warrior/Rogue/Cleric/Wizard.
- Ten Statistic bonus fields.

### Class
- Class key from Warrior/Rogue/Cleric/Wizard.

### Ability
- Source type: Heritage, Spirit, Element, Theme, Class, Other.
- Source name.
- Level requirement.
- Challenge-reroll flag.

### Spirit / Element
- Description data foundation.

### Talent
- Source Class.
- Level requirement.

### Gaps
- Legal-choice calculation, prerequisites, automatic grants, and progression are not implemented.
- Ability execution is generally not automated beyond the Challenge-reroll flag and attack declaration text.
- Element mechanics are not automated.

---

## 14. Rest — Partially Implemented

`fullRest()` currently restores Technique, Guile, Cleric Slots, and Wizard Slots to their maxima.

It does **not** currently constitute a complete implementation of all canonical Full Rest rules. Wound recovery, Status removal, Statistic damage restoration, HP recovery, and other Full Rest interactions are not comprehensively automated.

---

## 15. Conditions and Keywords — Mostly Not Automated

### Automated / System-Recognized
- Embolden.
- Dishearten.
- ActiveEffect polarity/category management.

### Defined in Rules but Not Generally Automated
- Hindered.
- Resistant.
- Vulnerable.
- Final Damage modifiers.
- Infection.
- Bleed/Bleeding as a full timed damage subsystem.
- Silenced.
- Suffocating.
- Unconscious.
- Medical Attention.
- Statistic damage terminal states.
- Prone/Stunned/Disoriented consequences as Candlelight-specific wound automation.

Foundry core statuses may exist independently, but that is not equivalent to Candlelight rules automation unless Candlelight code explicitly implements the rule.

---

## 16. Flanking and Dual Wielding — Rules Defined, Not Automated

The canonical rules define Flanking and Dual Wielding, but the audited repository does not contain a complete automatic implementation of those rules in the current attack workflow.

---

## 17. Distribution — Implemented

- `system.json` points to the public GitHub repository.
- Manifest URL uses the raw `main/system.json` file.
- Download URL uses the latest GitHub Release `candlelight.zip`.
- GitHub Actions release workflow exists in the repository.
- Repository contains packaged release artifacts and production assets.

---

## 18. Highest-Priority Rules/Code Alignment Work

1. Bring the HP/Massive Wound trigger logic into exact alignment with the canonical 0-HP rule.
2. Implement the actual cumulative Massive Wound tables and their consequences.
3. Build a generalized damage-modifier pipeline supporting Resistant/Vulnerable and Final Damage.
4. Implement core Status/Keyword automation needed by Massive Wounds: Bleed, Infection, Hindered, Silenced, Unconscious, Statistic damage, and later Suffocating/Medical Attention when defined.
5. Implement character creation and automatic Heritage/Theme contributions.
6. Implement Skills.
7. Implement progression/legal-choice workflows for Heritage, Theme, Spirit, Element, Class, and Talents.
8. Implement spellcasting once the canonical spell rules are defined.

---

## 19. Audit Rule

When this file claims a feature is implemented, that claim should be traceable to current repository code or assets. When code behavior conflicts with `CANDLELIGHT_RULES.md`, record the discrepancy here and treat the rules document as authoritative for intended behavior.