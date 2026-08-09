export class CandlelightLoot {
  static async dropItem(sourceActor, item) {
    if (!canvas?.scene) return ui.notifications.error("Candlelight | Open a Scene before dropping an item.");
    const tokens = sourceActor.getActiveTokens?.() ?? [];
    const token = tokens[0] ?? canvas.tokens?.controlled?.find(t => t.actor?.id === sourceActor.id);
    if (!token) return ui.notifications.warn("Candlelight | Place this character's Token on the active Scene before dropping an item.");

    const itemData = item.toObject();
    delete itemData._id;

    const lootActor = await Actor.create({
      name: `Dropped • ${item.name}`,
      type: "loot",
      img: item.img,
      ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER},
      flags: {candlelight: {droppedItem: true}},
      prototypeToken: {
        name: item.name,
        actorLink: false,
        disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
        texture: {src: item.img},
        width: 1,
        height: 1,
        displayName: CONST.TOKEN_DISPLAY_MODES.HOVER
      }
    });
    await lootActor.createEmbeddedDocuments("Item", [itemData]);
    const tokenDoc = await lootActor.getTokenDocument({x: token.document.x, y: token.document.y});
    await canvas.scene.createEmbeddedDocuments("Token", [tokenDoc.toObject()]);
    await sourceActor.deleteEmbeddedDocuments("Item", [item.id]);
    ui.notifications.info(`Candlelight | Dropped ${item.name}.`);
  }

  static pickupActor() {
    const controlled = canvas?.tokens?.controlled ?? [];
    const candidate = controlled.find(t => t.actor?.type === "character")?.actor;
    return candidate ?? game.user.character ?? null;
  }

  static async pickup(lootActor, itemId = null) {
    const picker = this.pickupActor();
    if (!picker || picker.type !== "character") {
      return ui.notifications.warn("Candlelight | Control a character Token (or assign yourself a Character) before picking up loot.");
    }
    const items = itemId ? [lootActor.items.get(itemId)].filter(Boolean) : [...lootActor.items];
    if (!items.length) return ui.notifications.warn("Candlelight | There is nothing here to pick up.");

    const data = items.map(i => { const x=i.toObject(); delete x._id; return x; });
    await picker.createEmbeddedDocuments("Item", data);

    const tokenDocs = canvas?.scene?.tokens?.filter(t => t.actorId === lootActor.id) ?? [];
    if (tokenDocs.length) await canvas.scene.deleteEmbeddedDocuments("Token", tokenDocs.map(t => t.id));
    await lootActor.delete();
    ui.notifications.info(`Candlelight | ${picker.name} picked up ${items.map(i=>i.name).join(", ")}.`);
  }
}
