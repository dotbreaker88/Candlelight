# Candlelight v0.2

Prototype Foundry VTT 14 game system.

## v0.2 Combat
- Weapon Attack button uses exactly one targeted token.
- Attacker declaration step for abilities/Elemental effects.
- Defender Challenge selection: Dodge, Parry, Block, Stand Tall.
- Parry eligibility is stored on the attacking weapon.
- Block requires an equipped Armor or Equipment item flagged `Enables Block`.
- Challenge rerolls are available when the defender has an Ability flagged `Grants Challenge Reroll`; the reroll must be kept.
- Attack uses Prowess for melee and Dexterity for ranged.
- Defender wins ties.
- Exploding 10s count toward critical-hit comparison.
- Critical hits maximize weapon damage dice.
- Hit-location d10: 1 Left Leg, 2 Right Leg, 3 Left Arm, 4 Right Arm, 5–9 Torso, 10 Head.
- Armor is per hit location and only one armor piece contributes. If invalid stacked armor exists, only the highest DR piece is used.
- Armor Penetration reduces Armor DR only.
- Magical attacks bypass Armor and Innate DR by default.
- Dragonfire bypasses Universal DR.
- Damage applies to Temporary HP before HP.
- Damage absorbed by Temporary HP does not count toward the Massive Wound threshold.
- Entering negative HP automatically causes a Massive Wound.
- While already negative, any HP damage causes a Massive Wound.
- Otherwise, HP damage in excess of 50% of current HP triggers the Universal Toughness Test.
- Massive Wounds preserve roll, Result Modifier, Magnitude Modifier, and final table position.
- Massive Wound position 10+ marks the Actor dead.
- Trauma at HP <= -(2 × Max HP) marks the Actor dead.

## Still incomplete
- Full wound-table text/results.
- Ability/Element effect execution beyond declaration and challenge reroll flag.
- Automatic enforcement of NEVER > ALWAYS precedence for arbitrary effects.
- Killing-blow Technique/Guile recovery.
- Spell-slot alternative recovery.
- Skills and advancement workflows.
- Theme/Heritage automatic stat package application.

## v0.2.1 hotfix
- Critical damage no longer crashes on blank weapon damage formulas.
- Blank formulas fall back to the standard profile for the weapon type.
- Critical maximization supports standard Candlelight arithmetic formulas plus a Foundry Roll fallback.

## v0.2.2 hotfix
- Item sheets now explicitly expose the Item TypeDataModel to the template.
- Weapon/armor/item form changes submit immediately and persist through `Item.update`.
- Added an explicit Save Item button as a reliable manual save path.


## v0.3.0
- Added character-sheet tabs for Core, Paper Doll & Gear, Effects, Talents, Spirit, Element, and Heritage.
- Added armor paper doll with one equipped armor piece per hit location.
- Added permanent Remove, Drop to Scene, and Pick Up workflows for equipment.
- Dropped Items use temporary Loot Actors/Tokens because Foundry Items are not native canvas placeables.
- Added Positive/Negative/Other ActiveEffect management.
- Added Talent Item type and future progression placeholders.

## v0.3.1
- Added system-recognized Embolden and Dishearten ActiveEffects.
- Embolden rolls applicable character dice twice and keeps the better result.
- Dishearten rolls applicable character dice twice and keeps the worse result.
- Success Tests compare successes first, then 10s.
- Numeric initiative/damage rolls treat higher as better.
- Massive Wound severity treats lower as better for the wounded character.
- Added quick-create buttons on the Effects tab.

## v0.3.2
- Fixed armor DR lookup/application on the struck hit location.
- Damage chat cards now display the exact armor piece, listed DR, Armor Penetration, and effective Armor DR.
- Stand Tall no longer behaves like Dodge.
- Stand Tall always allows the attack to hit.
- If Stand Tall succeeds against the attack roll, physical damage is halved (round down) before Armor, Innate, and Universal DR.

## v0.3.3 combat mitigation diagnostic/fix
- Stand Tall success is recalculated from the actual locked Challenge and attack result during damage resolution.
- Armor lookup normalizes hit-location values and reads the equipped armor piece directly from the defender.
- Damage mitigation is now a single staged pipeline: Stand Tall -> Armor -> Innate -> Universal -> Temp HP -> HP.
- Damage Resolution chat card is always posted, even when damage is reduced to zero.
- Added console debug output containing the exact armor and Stand Tall values used.

## v0.3.4
- Character sheet remembers the current tab across automatic Foundry re-renders.
- Editing fields, toggling equipment/effects, or changing values no longer returns the user to Core.
- Replaced embedded section buttons with a top portfolio-style tab strip.

## v0.3.5
- Removed manual Parryable flag from weapons.
- All melee weapon attacks are parry-eligible by default.
- Ranged attacks and attacks marked as Spell Attacks cannot normally be parried.
- Parry is also denied when effective attacker Strength exceeds twice defender Strength.
- Heavy and Pole weapons count attacker Strength as 50% higher for this check, rounded down.
- Challenge dialog explains why Parry is unavailable.

## v0.3.6
- Corrected Heavy/Pole Parry Strength handling.
- For Parry eligibility only, a character wielding an equipped Heavy or Pole weapon counts Strength as 50% higher, rounded down.
- This applies to both attacker and defender.
- The 1.5x Strength adjustment does not affect damage, Tests, DR, resources, or any other calculation unless a separate ability explicitly says so.

## v0.3.7
- Parry now uses commit-then-validate timing.
- Eligible melee/non-spell attacks offer Parry without revealing the Strength check.
- Defender rolls and locks Parry first.
- Only after Parry is locked does Candlelight compare effective Strength.
- If the defender's Strength is insufficient, the attack automatically hits.
- Ranged and Spell attacks still do not offer Parry by default.

## v0.4.0 visual refresh
- Added a dedicated Candlelight dark-fantasy backdrop asset.
- Reworked the character sheet into a charcoal parchment / candle-gold visual theme.
- Improved header hierarchy, portrait framing, resources, statistics, derived values, panels, effects, paper doll, and tabs.
- No combat or rules logic changed in this release.

## v0.4.1
- Restored functional character-sheet tab panels after the v0.4.0 visual refresh.
- Added Font Awesome icons to Core, Gear, Effects, Talents, Spirit, Element, and Heritage tabs.
- Added distinct accent colors per tab to match the Candlelight mockup direction.
- Added subtle glyph styling to section headings.

## v0.4.2
- Fixed portfolio tabs not appearing in some Foundry V14 window/class configurations.
- Critical tab-strip selectors now target the Candlelight sheet form directly.
- Tabs are explicitly visible, sized, layered, and separated from the content area.
- Preserved icon colors and per-tab active styling.

## v0.4.3
- Simplified the player-facing Statistic cards.
- Base and Other remain editable.
- Heritage and Theme statistic contributions are shown as read-only values.
- Heritage/Theme contribution fields remain in the underlying model so they can later be populated automatically when those Items are selected.

## v0.4.4
- Statistics now expose only Base as a player-editable field.
- Heritage, Theme, and Temporary/Other bonuses are read-only.
- Hovering/focusing a Statistic displays a source breakdown: Base, Heritage, Theme, Temporary, and Final.
- `system.statistics.*.other` is now treated as a temporary/system-managed modifier slot rather than a player-editable value.

## v0.4.5
- Statistics are now read-only in normal sheet use.
- Each Statistic displays only its final score.
- Hover still shows the source breakdown.
- Added a small edit icon per Statistic.
- The edit icon opens a manual override dialog for Base, Heritage, Theme, and Temporary values.
- This is intended as a GM/debug/manual-correction path until Candlelight character creation/progression manages these values automatically.

## v0.5.0
- Rebuilt the Core tab to more closely resemble the approved Candlelight visual mockup.
- Uses only real Candlelight fields; removed invented mockup-only statistics and categories.
- Displays all ten actual Statistics.
- Added real identity chips for Heritage, Theme, Spirit, Element, and Classes.
- Added real HP/Temp HP, AP, Movement, Initiative, Innate DR, Universal DR, Universal Difficulty, and class resources.
- Added equipped-weapon quick actions while keeping full inventory on the Gear tab.

## v0.5.1
- Added 30 production Spirit medallion assets: 23 animal Spirits and 7 mythological Spirits.
- The Core tab now resolves the character's assigned Spirit by name and displays its canonical medallion beneath the portrait.
- The Spirit tab uses the same canonical medallion, falling back to the Spirit Item image for custom/unrecognized Spirits.
- Added a centralized Spirit icon resolver, including a `Barghest` alias for the canonical `Barguest` asset.
- No combat or rules logic changed in this release.


---

## GitHub / Foundry distribution

This repository is configured to publish an installable Foundry VTT system automatically.

### One-time Foundry installation

In Foundry's **Install System** dialog, use this Manifest URL:

`https://raw.githubusercontent.com/dotbreaker88/Candlelight/main/system.json`

After installation, Foundry uses the same manifest to discover newer versions.

### Publishing an update

1. Make the system changes.
2. Increment `version` in `system.json` (for example `0.5.1` to `0.5.2`).
3. Push the complete update to `main`.
4. GitHub Actions validates the package, builds `candlelight.zip`, and publishes/refreshes the GitHub Release for that version.
5. Foundry will detect the higher version the next time updates are checked.

The workflow verifies that all 30 Spirit WebP assets are present before publishing.
