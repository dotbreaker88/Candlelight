// Canonical Candlelight Challenge rules.
// Source: Candlelight Foundry VTT Living Rules & Implementation Specification v12,
// especially sections 4, 19, 20, and 21.

export const CANDLELIGHT_CHALLENGES = Object.freeze({
  dodge: Object.freeze({
    key: "dodge",
    label: "Dodge",
    statistic: "agility",
    icon: "fa-person-running",
    negatesHitOnWin: true,
    requiresEquipment: false,
    costsActionPoints: false
  }),
  parry: Object.freeze({
    key: "parry",
    label: "Parry",
    statistic: "dexterity",
    icon: "fa-sword",
    negatesHitOnWin: true,
    requiresEquipment: false,
    costsActionPoints: false,
    eligibility: Object.freeze({
      meleeOnlyByDefault: true,
      rangedAllowedByDefault: false,
      spellAttackAllowedByDefault: false,
      validateStrengthAfterLock: true,
      heavyPoleStrengthMultiplier: 1.5,
      denyWhenEffectiveAttackerStrengthGreaterThanDefenderMultiplier: 2
    })
  }),
  block: Object.freeze({
    key: "block",
    label: "Block",
    statistic: "strength",
    icon: "fa-shield-halved",
    negatesHitOnWin: true,
    requiresEquipment: true,
    equipmentFlag: "canBlock",
    costsActionPoints: false
  }),
  standTall: Object.freeze({
    key: "standTall",
    label: "Stand Tall",
    statistic: "toughness",
    icon: "fa-person-rays",
    negatesHitOnWin: false,
    defenderWinsTies: true,
    requiresEquipment: false,
    costsActionPoints: false,
    physicalDamageMultiplierOnSuccess: 0.5,
    physicalDamageRound: "down",
    damageReductionTiming: "beforeDR"
  })
});

export const CANDLELIGHT_CHALLENGE_KEYS = Object.freeze(Object.keys(CANDLELIGHT_CHALLENGES));

export function getChallengeRule(key) {
  return CANDLELIGHT_CHALLENGES[key] ?? null;
}
