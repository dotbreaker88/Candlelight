const { ArrayField, BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

const intField = (initial = 0, min = null) => new NumberField({
  required: true,
  nullable: false,
  integer: true,
  initial,
  ...(min === null ? {} : {min})
});

const statField = () => new SchemaField({
  base: intField(0),
  heritage: intField(0),
  theme: intField(0),
  other: intField(0)
});

const resourceField = (initial = 0) => new SchemaField({
  value: intField(initial),
  max: intField(initial, 0)
});

export class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      level: intField(1, 1),
      statistics: new SchemaField({
        strength: statField(), speed: statField(), agility: statField(), dexterity: statField(),
        prowess: statField(), toughness: statField(), vigor: statField(), willpower: statField(),
        intelligence: statField(), charm: statField()
      }),
      health: new SchemaField({value: intField(1), max: intField(1, 1), temp: intField(0, 0)}),
      actionPoints: resourceField(3),
      resources: new SchemaField({
        technique: resourceField(1),
        guile: resourceField(1),
        clericSlots: resourceField(1),
        wizardSlots: resourceField(1)
      }),
      universalDR: intField(0, 0),
      spiritKey: new StringField({
        required: false, nullable: false, blank: true, initial: "",
        choices: ["", "ant", "axolotl", "badger", "bat", "bear", "dragon", "fox", "hawk", "lion", "mantis", "mongoose", "monkey", "ox", "rabbit", "rat", "shark", "snake", "sphinx", "spider", "stag", "turtle", "vulture", "wolf", "phoenix", "barguest", "golem", "exile", "kraken", "thunderbird", "unicorn"]
      }),
      portraitFrameColor: new StringField({
        required: true, nullable: false, initial: "gold",
        choices: ["purple", "gold", "red", "blue", "green", "white"]
      }),
      state: new SchemaField({
        dead: new BooleanField({required: true, nullable: false, initial: false}),
        deathCause: new StringField({required: false, nullable: true, initial: ""})
      }),
      biography: new HTMLField({required: false, nullable: true, initial: ""})
    };
  }

  get tier() { return Math.clamp(Math.floor((this.level - 1) / 5) + 1, 1, 4); }
  get universalDifficulty() { return Math.max(this.tier - 1, 2); }
  statisticTotal(key) {
    const s = this.statistics[key];
    return s ? Math.floor(s.base + s.heritage + s.theme + s.other) : 0;
  }
  get movement() { return 4 + this.statisticTotal("speed"); }
  get initiativeBonus() { return this.statisticTotal("speed"); }
  get innateDR() { return this.statisticTotal("toughness"); }

  prepareDerivedData() {
    super.prepareDerivedData();
    this.actionPoints.max = 3;
    this.resources.technique.max = Math.max(0, 1 + this.statisticTotal("prowess"));
    this.resources.guile.max = Math.max(0, 1 + this.statisticTotal("charm"));
    this.resources.clericSlots.max = Math.max(0, 1 + this.statisticTotal("willpower"));
    this.resources.wizardSlots.max = Math.max(0, 1 + this.statisticTotal("intelligence"));
    for (const r of Object.values(this.resources)) r.value = Math.clamp(r.value, 0, r.max);
    this.actionPoints.value = Math.clamp(this.actionPoints.value, 0, this.actionPoints.max);
    this.health.temp = Math.max(0, this.health.temp);
  }
}

class DescribedItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {description: new HTMLField({required: false, nullable: true, initial: ""})};
  }
}

export class WeaponData extends DescribedItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      weaponType: new StringField({required: true, nullable: false, initial: "light", choices: ["improvised", "light", "hybrid", "medium", "heavy", "pole", "ranged"]}),
      damage: new StringField({required: true, nullable: false, initial: "1d4"}),
      armorPenetration: intField(0, 0),
      massiveWoundResultModifier: intField(0),
      massiveWoundMagnitudeModifier: intField(0),
      damageModifier: intField(0),
      equipped: new BooleanField({required: true, nullable: false, initial: false}),
      magical: new BooleanField({required: true, nullable: false, initial: false}),
      dragonfire: new BooleanField({required: true, nullable: false, initial: false}),
      spellAttack: new BooleanField({required: true, nullable: false, initial: false})
    };
  }
}

export class ArmorData extends DescribedItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      location: new StringField({required: true, nullable: false, initial: "torso", choices: ["leftLeg", "rightLeg", "leftArm", "rightArm", "torso", "head"]}),
      dr: intField(0, 0),
      equipped: new BooleanField({required: true, nullable: false, initial: false}),
      canBlock: new BooleanField({required: true, nullable: false, initial: false})
    };
  }
}

export class AbilityData extends DescribedItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      sourceType: new StringField({required: true, nullable: false, initial: "theme", choices: ["heritage", "spirit", "element", "theme", "class", "other"]}),
      sourceName: new StringField({required: false, nullable: true, initial: ""}),
      levelRequirement: intField(1, 1),
      grantsChallengeReroll: new BooleanField({required: true, nullable: false, initial: false})
    };
  }
}

export class HeritageData extends DescribedItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      statisticBonuses: new SchemaField({strength: intField(0), speed: intField(0), agility: intField(0), dexterity: intField(0), prowess: intField(0), toughness: intField(0), vigor: intField(0), willpower: intField(0), intelligence: intField(0), charm: intField(0)}),
      notes: new StringField({required: false, nullable: true, initial: ""})
    };
  }
}

export class ThemeData extends DescribedItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      hpDivisor: intField(1, 1),
      classes: new ArrayField(new StringField({choices: ["warrior", "rogue", "cleric", "wizard"]})),
      statisticBonuses: new SchemaField({strength: intField(0), speed: intField(0), agility: intField(0), dexterity: intField(0), prowess: intField(0), toughness: intField(0), vigor: intField(0), willpower: intField(0), intelligence: intField(0), charm: intField(0)})
    };
  }
}

export class ClassData extends DescribedItemData {
  static defineSchema() {
    return {...super.defineSchema(), classKey: new StringField({required: true, nullable: false, initial: "warrior", choices: ["warrior", "rogue", "cleric", "wizard"]})};
  }
}

export class SpiritData extends DescribedItemData {}
export class ElementData extends DescribedItemData {}

export class EquipmentData extends DescribedItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      equipped: new BooleanField({required: true, nullable: false, initial: false}),
      canBlock: new BooleanField({required: true, nullable: false, initial: false})
    };
  }
}

export class MassiveWoundData extends DescribedItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      location: new StringField({required: true, nullable: false, initial: "torso", choices: ["leftLeg", "rightLeg", "leftArm", "rightArm", "torso", "head"]}),
      severity: intField(1, 1),
      permanent: new BooleanField({required: true, nullable: false, initial: false}),
      baseRoll: intField(1, 1),
      resultModifier: intField(0),
      magnitudeModifier: intField(0),
      finalPosition: intField(1)
    };
  }
}

export class LootData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {note: new StringField({required:false, nullable:true, initial:"Dropped item"})};
  }
}

export class TalentData extends DescribedItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      sourceClass: new StringField({required:false, nullable:true, initial:""}),
      levelRequirement: intField(1, 1)
    };
  }
}
