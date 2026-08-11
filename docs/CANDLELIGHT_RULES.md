# Candlelight — Canonical Rules Reference

**Status:** Authoritative living rules document.  
**Scope:** This file contains the currently established rules of Candlelight. If a rule is not stated here, it is not considered established merely because it appeared in an older design note, chat, PDF, README, or implementation comment.  
**Source policy:** Rules questions should be answered from this document. Repository code may be consulted only to determine implementation behavior, not to invent or override game rules.  
**TBD means intentionally unresolved.**

---

## 1. Global Rules Conventions

- Candlelight always rounds fractional calculations **down**, unless a specific rule explicitly states otherwise.
- In opposed Tests, **the defender wins ties**.
- Keyword precedence: **NEVER supersedes ALWAYS**.
- Capitalization may identify a formal Candlelight **Keyword**, even where ordinary grammar would not require capitalization.
- When a temporary Status Condition or effect is inflicted without a stated duration, its default duration is **1 Round**, unless the effect is inherently persistent or states another ending condition.
- Negative HP does not inherently kill or incapacitate a character.
- A character dies from **Trauma** when `Current HP <= -(2 × Maximum HP)`.
- A resolved **Massive Wound** position of 10 or greater causes immediate death.

---

## 2. Core Test Mechanic

### 2.1 Dice Pool
Tests use `Nd10`.

For general Statistic-based Tests:

`Dice Pool = Statistic + 1`

A Statistic of 0 therefore still rolls `1d10`.

If a Test uses half a Statistic:

`Dice Pool = floor(Statistic / 2) + 1`

Skills are expected to use numeric ranks that modify rolls; the exact Skill system is TBD.

### 2.2 Successes
- Each die result of **7+** counts as 1 success.
- Results 1–6 currently have no additional effect.
- Critical-failure mechanics are TBD.

### 2.3 Exploding Tens
A natural 10:
- counts as 1 success;
- generates another d10;
- additional natural 10s also count as successes and explode recursively.

### 2.4 Universal Tests

`Universal Test Difficulty = max(Character Tier - 1, 2)`

### 2.5 Opposed Tests
- Both sides roll their applicable dice pools.
- Higher success total wins.
- Defender wins ties.
- Preserve Success Margin: `Attacker Successes - Defender Successes`.

### 2.6 Roll Metadata
Where relevant, preserve total successes, number of natural 10s, individual results including explosions, and success margin.

---

## 3. Characters

### 3.1 Statistics
Characters have ten Statistics:
- Strength
- Speed
- Agility
- Dexterity
- Prowess
- Toughness
- Vigor
- Willpower
- Intelligence
- Charm

### 3.2 Statistic Sources
A Statistic may contain contributions from:
- Base
- Heritage
- Theme
- Temporary/Other

The final Statistic is the sum of its contributions, rounded down where a fractional effect applies.

### 3.3 Level and Tier
Characters have Levels 1–20.

`Tier = floor((Level - 1) / 5) + 1`

| Level | Tier |
|---|---:|
| 1–5 | 1 |
| 6–10 | 2 |
| 11–15 | 3 |
| 16–20 | 4 |

Universal Test Difficulty is 2 for Tiers 1–3 and 3 for Tier 4 under the current formula.

### 3.4 Health
Characters track:
- Current HP
- Maximum HP
- Temporary HP

Negative HP is allowed.

Maximum HP progression is determined by Theme. Known Theme formulas are variations of `1 + floor(Vigor / n)` per level. Whether later Vigor changes retroactively alter previous HP gains is TBD.

### 3.5 HP at 0 or Below
- Reaching **0 HP or lower** automatically causes a Massive Wound. No prevention Test is allowed for this trigger.
- A character at 0 HP or below otherwise acts normally unless another effect prevents it.
- While at 0 HP or below, subsequent qualifying HP loss continues to cause Massive Wounds according to the Massive Wound rules.
- Healing can raise a character from negative HP through 0 into positive HP without an additional penalty.
- Healing does not restore Temporary HP unless specifically stated.
- Healing does not remove Massive Wounds unless specifically stated.

### 3.6 Damage Reduction
Characters may possess:
- Armor DR
- Innate DR
- Universal DR

Default Innate DR is `Toughness`.

### 3.7 Movement

`Movement = 4 + Speed`

Movement is measured in Foundry tiles for implementation purposes.

### 3.8 Initiative

`Initiative = 1d10 + Speed`

Initiative is a numeric Roll, not a success-counting Test.

### 3.9 Action Economy
- Characters normally have **3 Action Points** on their Turn.
- AP resets at the start of the character's Turn.
- Most actions cost 1 AP.
- Challenge Rolls never cost AP.
- Specific rules may alter costs.
- Legacy terms such as Standard Action, Free Action, and Immediate Free Action are not current action-economy terms unless later redefined.

### 3.10 Identity and Progression
Each character has exactly:
- 1 Heritage
- 1 Theme
- 1 Spirit
- 1 Element

A character may possess multiple Classes and may potentially possess all four Classes.

There are exactly four standard Classes:
- Warrior
- Rogue
- Cleric
- Wizard

Theme determines which Class portfolios are available. Known examples:
- Paladin → Warrior + Cleric
- Bard → all four Classes

The complete Theme-to-Class mapping is TBD.

### 3.11 Class Resources
Default maxima:
- Warrior Technique = `1 + Prowess`
- Rogue Guile = `1 + Charm`
- Cleric Spell Slots = `1 + Willpower`
- Wizard Spell Slots = `1 + Intelligence`

Abilities may alter these formulas.

A full day of rest restores class resources. A killing blow restores either Technique or Guile, as applicable. Cleric and Wizard Spell Slots have additional recovery methods that remain TBD.

### 3.12 Heritage
Heritage represents ancestry and provides a fixed starting care package including Statistic bonuses and potentially Skill modifiers or other adjustments. Heritage has an advancement track. Exact Heritage packages and advancement timing are TBD.

### 3.13 Theme
Theme is the primary archetype. A Theme defines at least:
- HP-per-level formula;
- available Classes;
- a starting Theme ability selection;
- future Theme ability choices;
- a fixed starting Statistic package.

Exact progression timing is TBD.

### 3.14 Level Advancement
Levels may unlock choices from Heritage, Spirit, Element, Theme, and Class tracks. Every level also grants some form of assignable Statistic advancement, but amount, caps, and restrictions are TBD.

### 3.15 Character Creation Defaults
Until otherwise defined, Base Statistics begin at 0. Heritage and Theme apply fixed starting packages. Starting freely assignable Statistic points are TBD.

---

## 4. Challenge Rolls

When an attack is declared, the defender normally must choose an eligible Challenge Roll.

A defender **cannot voluntarily decline** a Challenge Roll. If only one legal Challenge remains, the defender must use it. If no legal Challenge exists, the defender has no defense against the Roll. An Ability or Elemental Bond may explicitly override this rule.

### 4.1 Challenge Types
- **Dodge** → Agility
- **Parry** → Dexterity
- **Block** → Strength; requires appropriate equipment
- **Stand Tall** → Toughness

### 4.2 Challenge Sequence
1. Attacker declares the Target.
2. Attacker declares Abilities and Elemental effects being used.
3. Defender chooses an eligible Challenge Roll.
4. Defender rolls.
5. Defender decides whether to keep the result or use a permitted reroll.
6. If rerolled, the new result must be accepted.
7. Defender locks the Challenge result.
8. Attacker rolls.

---

## 5. Attacks and Critical Hits

### 5.1 Attack Statistics
- Melee attacks normally use Prowess.
- Ranged attacks normally use Dexterity.
- Exceptional attacks may specify another Statistic.

### 5.2 Hit Resolution
- Attack successes > Challenge successes → Hit.
- Attack successes <= Challenge successes → Miss.
- Defender wins ties.

### 5.3 Critical Hits
A Critical Hit occurs when:
1. the attack hits; and
2. the attacker rolled more natural 10s than the defender rolled on the Challenge.

Exploding 10s count toward this comparison.

On a Critical Hit, damage dice are not rolled; they are treated as having rolled their maximum possible values. Flat modifiers still apply.

---

## 6. Hit Locations

On a successful attack, roll `1d10`:

| Roll | Hit Location |
|---:|---|
| 1 | Left Leg |
| 2 | Right Leg |
| 3 | Left Arm |
| 4 | Right Arm |
| 5–9 | Torso |
| 10 | Head |

---

## 7. Weapons

### 7.1 Weapon Types
- Improvised
- Light
- Hybrid
- Medium
- Heavy
- Pole
- Ranged

### 7.2 Weapon Profile
Human-readable profile:

`Damage / Armor Penetration / MW Result Modifier / MW Magnitude Modifier`

### 7.3 Standard Profiles
| Type | Base Damage | AP | MW Result Mod | MW Magnitude Mod |
|---|---|---:|---:|---:|
| Improvised | `1d4-1` | TBD | TBD | TBD |
| Light | `1d4` | 4 | 0 | 0 |
| Hybrid | `1d6` | 2 | +1 | 0 |
| Medium | `1d10` | 0 | 0 | 0 |
| Heavy | `2d6` | 0 | +1 | 0 |
| Pole | `1d8` | 4 | 0 | 0 |
| Ranged | `1d8` | 4 | 0 | 0 |

### 7.4 Strength Scaling
- Non-Ranged weapons normally add Strength to damage 1:1.
- Ranged weapons do not normally add Strength.
- Abilities may alter this.

---

## 8. Damage Calculation and Mitigation

### 8.1 Offensive Damage Order
Resolve damage-dealing modifiers in this order:
1. Determine base damage.
2. Apply all ordinary damage modifiers other than Resistant or Vulnerable.
3. Apply applicable **Resistant** or **Vulnerable**.
4. Apply modifiers that explicitly modify **Final Damage**.
5. Pass the resulting damage to the Target.
6. The Target applies applicable DR and other defensive/damage-negating effects.
7. Remaining damage proceeds to Health.

Resistant/Vulnerable are therefore the final ordinary damage modifiers before Final Damage modifiers.

### 8.2 Armor DR
Armor DR comes from the single equipped armor piece covering the struck Hit Location.

`Effective Armor DR = max(Armor DR - Armor Penetration, 0)`

Armor Penetration reduces Armor DR only. Multiple armor pieces do not stack on one Hit Location.

### 8.3 Innate DR
Innate DR normally equals Toughness. Most normal weapon attacks cannot bypass it unless a rule says otherwise.

### 8.4 Universal DR
Universal DR applies to all damage by default. **Dragonfire** bypasses Universal DR.

### 8.5 Magical Attacks
By default Magical attacks:
- bypass Armor DR;
- bypass Innate DR;
- do not inherently bypass Universal DR.

### 8.6 Health Damage Application
Damage that remains after mitigation is applied to Temporary HP first, then regular HP.

Temporary HP does not increase the Massive Wound threshold. Damage absorbed by Temporary HP does not count as HP damage when determining whether a hit exceeded the Massive Wound HP threshold.

---

## 9. Stand Tall

Stand Tall is not hit negation.

- Uses Toughness.
- The attack hits regardless of whether Stand Tall succeeds.
- Stand Tall succeeds when the defender's Challenge result meets or exceeds the attack's success total; defender wins ties.
- On success, qualifying **physical damage** is reduced by 50%, rounding down.
- This reduction occurs before Armor DR, Innate DR, and Universal DR.
- Specific effects may state that Stand Tall does not apply.

---

## 10. Parry

### 10.1 Default Eligibility
- Melee weapon attacks may normally be Parried.
- Ranged attacks may not normally be Parried.
- Spell attacks may not normally be Parried.

### 10.2 Strength Denial
A melee attack cannot be Parried if:

`Effective Attacker Strength > 2 × Effective Defender Strength`

Equality still allows Parry.

### 10.3 Heavy and Pole Weapons
For this Parry eligibility check only, a character wielding an equipped Heavy or Pole weapon treats Strength as 50% higher, rounding down:

`Effective Strength = floor(Strength × 1.5)`

This applies to attacker and defender and affects no other calculation unless another rule says otherwise.

### 10.4 Commit-Then-Validate
For melee non-Spell attacks, Parry is offered without revealing the Strength eligibility result. The defender chooses, rolls, rerolls if permitted, and locks Parry first. Only then is Strength eligibility checked. If insufficient, the attack automatically hits regardless of the Parry result.

---

## 11. Massive Wounds

### 11.1 Threshold While Above 0 HP
If a damaging hit exceeds 50% of the character's relevant current HP and the character remains above 0 HP after the hit, make a Universal Toughness Test. Success prevents the Massive Wound; failure causes it.

Temporary HP does not increase this threshold, and damage absorbed by Temporary HP does not count as HP damage for this comparison.

### 11.2 Reaching 0 HP or Lower
Reaching 0 HP or lower automatically causes a Massive Wound. No Massive Wound prevention Test is allowed.

While at 0 HP or below, subsequent qualifying HP loss continues to cause Massive Wounds according to these rules.

### 11.3 Severity Roll
Once a Massive Wound occurs, roll `1d10` and reference the table for the affected Hit Location.

### 11.4 Result Modifier
Massive Wound Result Modifier directly modifies the Massive Wound d10 result.

### 11.5 Magnitude
Massive Wound Magnitude shifts the wound-table position up or down and is mechanically distinct from Result Modifier. Example: Magnitude +2 makes table position 1 resolve as position 3.

### 11.6 Cumulative Severity
Resolve the final severity and **every lower severity** for that Hit Location.

Resolve from highest severity downward. A higher-severity version of an overlapping effect supersedes lower versions.

- If a lower severity allows a Test to avoid an effect and a higher severity automatically inflicts that same effect, skip the lower Test.
- If cumulative results grant different amounts of Infection, gain only the highest applicable amount.
- Distinct effects remain cumulative.
- If a lower Test protects against an effect not superseded by a higher result, make that Test normally.

### 11.7 Death
A resolved Massive Wound position of 10+ causes immediate death. Do not resolve lower-severity effects when immediate death is certain.

### 11.8 Head — Location 10
| Severity | Effect |
|---:|---|
| 1 | Intelligence Test or become Disoriented for 1 Round. |
| 2 | Become Disoriented; Agility Test or become Prone. |
| 3 | Become Prone; Toughness Test or become Stunned. |
| 4 | Become Stunned. |
| 5 | Gain 1d4 Infection; Vigor Test or begin Bleeding for 1 Intelligence damage. |
| 6 | Begin Bleeding for 1 Intelligence damage; Vigor Test or become Silenced until Medical Attention; Toughness Test or become Unconscious. |
| 7 | Become Silenced until Medical Attention and Unconscious; Vigor Test or die. |
| 8 | Die immediately. |
| 9 | Die immediately. |
| 10 | Die immediately. |

Head Infection is Infection stacks. Intelligence Bleed is persistent Statistic damage until restored.

### 11.9 Torso — Location 5–9
| Severity | Effect |
|---:|---|
| 1 | Strength Test or become Prone. |
| 2 | Become Prone. |
| 3 | Toughness Test or become Stunned. |
| 4 | Become Stunned; Vigor Test or gain 1 Infection. |
| 5 | Gain 1 Infection; Vigor Test or begin Bleeding for 1d4 HP damage. |
| 6 | Gain 1d3 Infection and begin Bleeding for 1d4 HP damage. |
| 7 | Innate DR becomes 0 until a Full Rest; Vigor Test or begin Bleeding for 1 Vigor damage. |
| 8 | Begin Bleeding for 1 Vigor damage; become Suffocating until Medical Attention. |
| 9 | Gain 1d6 Infection; become Vulnerable (All) until a Full Rest; Vigor Test or die. |
| 10 | Die immediately. |

HP Bleed and Vigor Bleed are distinct and may operate simultaneously.

### 11.10 Arms — Location 3–4
| Severity | Effect |
|---:|---|
| 1 | Toughness Test or drop the item held by the affected Arm. |
| 2 | Drop the item held by the affected Arm. A two-handed item is dropped if either required Arm is affected. |
| 3 | Toughness Test or suffer a Hand Injury. |
| 4 | Gain 1 Infection and suffer a Hand Injury. |
| 5 | Toughness Test or the affected Arm becomes unusable until Medical Attention. |
| 6 | Gain 1d6 Infection; affected Arm becomes unusable until Medical Attention. |
| 7 | Toughness Test or lose the affected Arm. |
| 8 | Lose the affected Arm; Toughness Test or become Stunned. |
| 9 | Vigor Test or die. |
| 10 | Die immediately. |

**Hand Injury:** Attacks and Parry Challenge Rolls involving the injured hand are Disheartened. After committing to a Cast, each injured hand contributes a 50% chance for the Cast to fail. Two injured hands cause automatic Cast failure.

**Unusable Arm:** Cannot hold/wield items, attack, Block, Parry, or satisfy an Ability or spell requirement requiring that Arm.

Losing the Arm supersedes Hand Injury and the unusable-Arm state for that Arm.

### 11.11 Legs — Location 1–2
| Severity | Effect |
|---:|---|
| 1 | Agility Test or become Prone. |
| 2 | Become Prone. |
| 3 | Toughness Test or become Hindered. |
| 4 | Become Hindered; Vigor Test or gain 1 Infection. |
| 5 | Gain 1 Infection. At the beginning of each Turn while Standing, Toughness Test or become Prone. Persists until Medical Attention. |
| 6 | Once Prone, cannot stand. Persists until Medical Attention, an applicable Ability, or Healing. |
| 7 | Gain 1d3 Infection; Toughness Test or lose the affected Leg. |
| 8 | Lose the affected Leg; Toughness Test or become Stunned. |
| 9 | Vigor Test or die. |
| 10 | Die immediately. |

While already Prone, the recurring Severity 5 Test is not rolled.

Losing one Leg halves Agility, rounding down. Losing both Legs sets Agility to 0. This persists while the limb is missing. Limb loss supersedes Hindered and the inability-to-stand injury associated with that Leg.

---

## 12. Trauma

Trauma is separate from Massive Wounds.

`Current HP <= -(2 × Maximum HP)` → death from Trauma.

Negative HP by itself is otherwise survivable.

---

## 13. Other Combat Rules

### 13.1 Flanking
Two allied characters flank an opponent when positioned on opposite sides of that opponent.

Default benefit: `+1 die to Attack Rolls`.

Abilities may alter positioning, ally requirements, or the bonus.

### 13.2 Dual Wielding
A Dual Wield attack attacks with both weapons.

By default:
- each weapon attack suffers a 2-die penalty;
- final attack pool cannot fall below 1 die;
- defender makes a separate Challenge Roll against each weapon attack;
- each attack resolves independently for hit/miss, Critical Hit, Hit Location, damage, DR, and effects.

`Dual Wield Attack Pool = max(1, Normal Attack Pool - 2)`

### 13.3 Foe of Consequence
A Foe of Consequence is a designated enemy considered a miniboss or boss. It is a designation, not something inferred from Statistics.

---

## 14. Keyword Glossary

### Bleed
A persistent effect that deals its specified Bleed damage at the beginning of the affected character's Turn unless otherwise stated. Bleed may deal HP damage or Statistic damage.

By default Bleed damage:
- bypasses Armor DR;
- bypasses Innate DR;
- is reduced by Universal DR;
- cannot cause Massive Wounds unless explicitly enabled.

A Bleeding effect may define its own source and removal/staunch condition.

### Cast
The committed act of attempting to cast a spell. Effects that occur after committing to a Cast occur after the character has committed to the attempt and associated costs/requirements.

### Disheartened
A negative Status Condition. When making an affected Roll, make the Roll twice and use the worse result.

For success Tests, worse means fewer successes; if tied, fewer 10s. For ordinary numeric Rolls, lower is normally worse. For Massive Wound severity, higher is worse for the wounded character.

### Emboldened / Embolden
A positive ongoing effect. When making an applicable Roll, make the Roll twice and keep the better result.

For success Tests, better means more successes; if tied, more 10s. For ordinary numeric Rolls such as Initiative and damage, higher is better. For Massive Wound severity, lower is better for the wounded character.

If Embolden and Dishearten are both active, **Dishearten takes precedence**.

### Final Damage
The damage total after all ordinary offensive damage calculations, including Resistant or Vulnerable, have resolved. Effects explicitly modifying Final Damage resolve after those calculations. The result is then passed to the Target for DR and other defensive or damage-negating effects.

### Full Rest
The system's full recovery Rest. Effects specifying recovery on a Full Rest are not removed by a lesser Rest unless another rule explicitly says otherwise.

### Healing
Restoration of regular HP or another specifically stated recoverable value. Healing does not restore Temporary HP or remove Massive Wounds unless specifically stated.

### Hindered
A Status Condition that reduces **Total Movement by half**, rounding down.

### Infection
A stacking effect. `Gain X Infection` adds that many Infection stacks. **Infection damage** is a separate mechanic and must be explicitly identified as Infection damage.

### Massive Wound
A severe injury resolved using the Massive Wound rules and affected Hit Location's severity table. Massive Wounds are cumulative by severity, subject to superseding overlapping effects.

### Medical Attention
Treatment associated with the **Medicine Skill**. Exact Test, action economy, equipment requirements, and procedure are TBD.

### Resistant (Damage Type)
After all other ordinary damage modifiers have resolved, reduce damage of the specified Damage Type by **50%**. Resistant resolves immediately before Final Damage modifiers. **Resistant (All)** applies to all Damage Types.

### Silenced
A Status Condition. A Silenced character cannot speak or Cast spells.

### Suffocating
A progressive Status Condition involving successive Vigor Tests and ultimately death. Its progression table and exact timing are TBD.

### Unconscious
A Status Condition. An Unconscious character cannot act.

### Vulnerable (Damage Type)
After all other ordinary damage modifiers have resolved, increase damage of the specified Damage Type by **50%**. Vulnerable resolves immediately before Final Damage modifiers. **Vulnerable (All)** applies to all Damage Types.

---

## 15. Statistic Damage

Statistic damage temporarily lowers the affected Statistic until restored by an applicable rule, healing effect, or Rest as appropriate.

If Statistic damage reduces a Statistic below 0, the result is either **Unconsciousness or death**, depending on the Statistic or effect involved. The complete mapping and recovery rules remain TBD.

---

## 16. Explicitly Unresolved Rules

The following are known gaps rather than permission to infer rules:
- Skill list and Skill-rank interaction.
- Medicine Skill and exact Medical Attention procedure.
- Suffocating progression.
- Complete Statistic-damage recovery rules and which negative Statistics cause Unconsciousness versus death.
- Detailed Healing exceptions.
- Starting assignable Statistic points and caps.
- Full Heritage packages and advancement.
- Full Theme/Class progression tables.
- Full Spirit and Element mechanics/progression.
- Exact Technique/Guile killing-blow recovery procedure.
- Cleric/Wizard alternative spell-slot recovery.
- Spellcasting system beyond established Keywords/interactions.
- Improvised weapon AP/Massive Wound profile.
- Whether Vigor changes retroactively alter previously gained HP.
- Exceptional AP costs and nonstandard AP interactions.

---

## 17. Authority Rule

This document is the **sole canonical rules reference** in the repository. Historical specs, PDFs, README release notes, code comments, and conversation history are not rules authority. When code conflicts with this file, that is an implementation discrepancy to be recorded in `IMPLEMENTATION_STATUS.md`, not a reason to silently change the rule.