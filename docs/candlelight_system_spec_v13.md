# Candlelight System Specification v13

> Living design document. v13 carries forward the established v12 rules and locks the Massive Wound and Keyword rulings established during the August 2026 mechanics review. Where v13 conflicts with v12, v13 controls.

## Global Rules Added or Clarified in v13

### Rounding
Candlelight always rounds fractional results **down**, unless a specific rule explicitly states otherwise.

### Default Duration
When a temporary Status Condition or effect is inflicted without a stated duration, its default duration is **1 Round**, unless the effect is inherently persistent or specifies another ending condition.

### HP at 0 or Below
- Reaching **0 HP or lower** automatically causes a Massive Wound. No prevention Test is allowed for this trigger.
- A character at 0 HP or below can otherwise act normally unless a Massive Wound, Status Condition, Ability, or other effect prevents them from acting.
- While at 0 HP or below, subsequent qualifying HP loss continues to cause Massive Wounds according to the Massive Wound rules.
- Healing restores regular HP and does not restore Temporary HP unless specifically stated.
- Healing can raise a character from negative HP through 0 into positive HP without an additional penalty.
- Healing does not remove Massive Wounds unless specifically stated.

### Challenge Rolls - Mandatory Defense
A defender cannot voluntarily decline a Challenge Roll. If only one legal Challenge remains, the defender must use it. If no legal Challenge exists, the defender has no defense against the Roll. An Ability or Elemental Bond may explicitly override this rule.

## Damage Modifier Order
For damage dealt by an effect, resolve offensive damage calculation in this order:

1. Determine base damage.
2. Apply all ordinary damage modifiers other than Resistant or Vulnerable.
3. Apply applicable **Resistant** or **Vulnerable** modifiers.
4. Apply modifiers that explicitly modify **Final Damage**.
5. Pass the resulting damage to the Target.
6. The Target applies applicable DR and other defensive or damage-negating effects.
7. Remaining damage is applied according to the normal Health damage rules.

Resistant and Vulnerable are therefore the final ordinary damage modifiers before Final Damage modifiers.

## Massive Wounds

### Trigger at 0 HP
Reaching 0 HP or lower automatically causes a Massive Wound. No Test may negate this Massive Wound.

### Cumulative Severity
When a character suffers a Massive Wound, resolve the result at the final severity and every lower severity result for that Hit Location.

Resolve cumulative effects from highest severity downward. A higher-severity version of an overlapping effect supersedes the lower-severity version.

Examples:
- If Severity 1 allows a Test to avoid Prone and Severity 2 automatically inflicts Prone, Severity 2 supersedes the lower Test. Do not make the Severity 1 Test.
- If cumulative results would grant 1 Infection and 1d6 Infection, gain only 1d6 Infection.
- Distinct effects remain cumulative. HP Bleed and Statistic Bleed, for example, may operate simultaneously.

If a lower-severity Test protects against an effect that is not superseded by a higher result, make that Test normally.

### Death
Any resolved Massive Wound position of 10 or greater causes immediate death. When the final result causes immediate death, no lower-severity effects need to be resolved.

### Massive Wound Location Table
- Legs: location roll 1-2
- Arms: location roll 3-4
- Torso: location roll 5-9
- Head: location roll 10

### Statistic Damage
Statistic damage temporarily reduces the affected Statistic until restored by an applicable rule, healing effect, or Rest as appropriate. If Statistic damage reduces a Statistic below 0, the result is either Unconsciousness or death according to the Statistic or effect involved. The complete Statistic-damage recovery and terminal-state rules remain to be formalized.

## Keyword Glossary

Capitalization identifies formal Candlelight Keywords even where that capitalization would not otherwise be grammatically required.

### Bleed
A persistent effect that deals its specified Bleed damage at the beginning of the affected character's Turn unless otherwise stated. Bleed may deal HP damage or Statistic damage. Statistic Bleed temporarily reduces the named Statistic when its damage is suffered. Existing Bleed rules concerning DR and Massive Wound eligibility remain in force unless specifically overridden.

### Cast
The committed act of attempting to cast a spell. Effects that occur after committing to a Cast occur after the character has committed to the attempt and its associated costs or requirements.

### Disheartened
A negative Status Condition. When making an affected Roll, make the Roll twice and use the worse result.

### Final Damage
The total damage an effect is about to deal after all ordinary offensive damage calculations have resolved, including applicable Resistant or Vulnerable modifiers. Effects that explicitly modify Final Damage resolve after those calculations. The resulting damage is then passed to the Target, which may apply DR and other defensive or damage-negating effects.

### Full Rest
The system's full recovery Rest. Effects that specify recovery on a Full Rest are not removed by a lesser Rest unless another rule explicitly says otherwise.

### Healing
Restoration of regular HP or another specifically stated recoverable value. Healing does not restore Temporary HP or remove Massive Wounds unless specifically stated.

### Hindered
A Status Condition that reduces **Total Movement by half**, rounding down.

### Infection
A stacking effect. "Gain X Infection" adds that many Infection stacks. **Infection damage** is a separate mechanic and must be explicitly identified as Infection damage.

### Massive Wound
A severe injury resolved using the Massive Wound rules and the affected Hit Location's severity table. Massive Wounds are cumulative by severity, subject to superseding overlapping effects.

### Medical Attention
Treatment associated with the **Medicine Skill**. Its exact Test, action economy, equipment requirements, and procedure remain TBD.

### Resistant (Damage Type)
After all other ordinary damage modifiers have resolved, reduce damage of the specified Damage Type by **50%**. Resistant resolves immediately before Final Damage modifiers. **Resistant (All)** applies to all Damage Types.

### Silenced
A Status Condition. A Silenced character cannot speak or Cast spells.

### Suffocating
A progressive Status Condition involving successive Vigor Tests and ultimately death. Its progression table and exact timing remain TBD.

### Unconscious
A Status Condition. An Unconscious character cannot act.

### Vulnerable (Damage Type)
After all other ordinary damage modifiers have resolved, increase damage of the specified Damage Type by **50%**. Vulnerable resolves immediately before Final Damage modifiers. **Vulnerable (All)** applies to all Damage Types.

## Massive Wound Location Rulings

### Head
- Unspecified Disoriented effects last 1 Round under the default-duration rule.
- Head Infection entries are Infection stacks; at Severity 5+ use the highest applicable 1d4 Infection result only once.
- Intelligence Bleed deals 1 Intelligence damage and is persistent until restored.
- Severity 6 Tests may negate Silenced and Unconscious respectively.
- Severity 7 automatically inflicts Silenced and Unconscious, superseding those Severity 6 Tests, and requires a normal Vigor Test against death; ordinary reroll effects may apply.
- Severity 8+ is immediate death.

### Torso
- Severity 2 Prone supersedes the Severity 1 Strength Test.
- Severity 4 Stunned supersedes the Severity 3 Toughness Test.
- Severity 5 grants 1 Infection automatically and supersedes the Severity 4 Vigor Test against Infection.
- Torso Infection references are Infection stacks. Severity 6 grants 1d3 Infection, superseding lower Infection amounts.
- HP Bleed for 1d4 damage is persistent. Severity 6+ automatically carries this Bleed, superseding the Severity 5 Test to avoid it.
- Severity 7 sets Innate DR to 0 until a Full Rest and allows a Vigor Test to avoid persistent 1 Vigor Bleed.
- Severity 8 automatically applies the 1 Vigor Bleed and therefore supersedes the Severity 7 Test; it also inflicts Suffocating until Medical Attention.
- HP Bleed and Vigor Bleed are distinct and operate simultaneously.
- Severity 9 grants 1d6 Infection, inflicts Vulnerable (All) until a Full Rest, and requires a normal Vigor Test against death.
- Severity 10 is immediate death.

### Arms
- Severity 2 dropping the held item supersedes the Severity 1 Toughness Test. A two-handed item is dropped if either participating Arm is affected.
- Severity 4 Hand Injury supersedes the Severity 3 Toughness Test.
- Hand Injury makes attacks and Parry Challenge Rolls involving the injured hand Disheartened.
- After committing to a Cast, each injured hand contributes a 50% spell-failure chance. One injured hand is 50%; two injured hands cause automatic failure.
- Severity 6 makes the Arm unusable until Medical Attention and grants 1d6 Infection, superseding lower Infection amounts and the Severity 5 Test.
- An unusable Arm cannot hold or wield items, attack, Block, Parry, or satisfy an Ability or spell requirement requiring that Arm.
- Severity 8 automatically removes the Arm, superseding the Severity 7 Toughness Test against limb loss. Limb loss supersedes Hand Injury and unusable-Arm states for that Arm.
- The Severity 8 Toughness Test against Stunned remains relevant at Severity 9.
- Severity 9 also requires a normal Vigor Test against death.
- Severity 10 is immediate death.

### Legs
- Severity 2 Prone supersedes the Severity 1 Agility Test.
- Severity 4 Hindered supersedes the Severity 3 Toughness Test.
- Severity 5 grants 1 Infection automatically and supersedes the Severity 4 Vigor Test against Infection.
- At Severity 5+, while Standing, make the recurring Toughness Test at the beginning of each Turn or become Prone. No roll is required while already Prone.
- Severity 6 prevents standing after becoming Prone. This persists until Medical Attention, an applicable Ability, or Healing removes it. A Target initially Standing therefore continues making the Severity 5 Test until they fall Prone.
- Severity 7 grants 1d3 Infection, superseding lower Infection amounts.
- Severity 8 automatically removes the Leg, superseding the Severity 7 Toughness Test against limb loss.
- Losing one Leg reduces Agility by half, rounding down. Losing both Legs sets Agility to 0. The reduction persists while the limb is missing.
- Limb loss supersedes Hindered and the inability-to-stand injury associated with that same Leg.
- The Severity 8 Toughness Test against Stunned remains relevant at Severity 9.
- Severity 9 also requires a normal Vigor Test against death.
- Severity 10 is immediate death.

## Deferred Definitions
The following are intentionally referenced but not fully designed in v13:
- Medicine Skill and exact Medical Attention procedure.
- Suffocating progression table.
- Complete Statistic damage recovery rules and which negative Statistics cause Unconsciousness versus death.
- Broader Healing system exceptions.
