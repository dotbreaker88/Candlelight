import "./spirit-customization.mjs";
import {CharacterData,LootData,WeaponData,ArmorData,AbilityData,TalentData,HeritageData,ThemeData,ClassData,SpiritData,ElementData,EquipmentData,MassiveWoundData} from "./data/models.mjs";
import {CandlelightActor,CandlelightItem} from "./documents.mjs";
import {CandlelightCharacterSheet,CandlelightLootSheet,CandlelightItemSheet} from "./sheets/sheets.mjs";
import {CandlelightRolls} from "./rolls.mjs";
import {CandlelightLoot} from "./loot.mjs";

Hooks.once("init",()=>{
  console.log("Candlelight | Initializing v0.5.3");
  CONFIG.Actor.documentClass=CandlelightActor; CONFIG.Item.documentClass=CandlelightItem;
  CONFIG.Actor.dataModels={character:CharacterData,loot:LootData};
  CONFIG.Item.dataModels={weapon:WeaponData,armor:ArmorData,accessory:EquipmentData,equipment:EquipmentData,ability:AbilityData,talent:TalentData,heritage:HeritageData,theme:ThemeData,class:ClassData,spirit:SpiritData,element:ElementData,massiveWound:MassiveWoundData};
  CONFIG.Actor.trackableAttributes={character:{bar:["health","actionPoints"],value:["level","universalDR"]},loot:{bar:[],value:[]}};
  Actors.unregisterSheet("core",foundry.appv1.sheets.ActorSheet,{types:["character","loot"]});
  Actors.registerSheet("candlelight",CandlelightCharacterSheet,{types:["character"],makeDefault:true,label:"Candlelight Character Sheet"});
  Actors.registerSheet("candlelight",CandlelightLootSheet,{types:["loot"],makeDefault:true,label:"Candlelight Loot"});
  Items.unregisterSheet("core",foundry.appv1.sheets.ItemSheet);
  Items.registerSheet("candlelight",CandlelightItemSheet,{makeDefault:true,label:"Candlelight Item Sheet"});
  game.candlelight={rolls:CandlelightRolls,loot:CandlelightLoot};
});
Hooks.on("combatTurn",async()=>{const actor=game.combat?.combatant?.actor;if(actor?.type==="character")await actor.startTurn();});
