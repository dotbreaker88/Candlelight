export class CandlelightRolls {
  static STAT_LABELS = {
    strength:"Strength", speed:"Speed", agility:"Agility", dexterity:"Dexterity",
    prowess:"Prowess", toughness:"Toughness", vigor:"Vigor",
    willpower:"Willpower", intelligence:"Intelligence", charm:"Charm"
  };

  static statLabel(k) { return this.STAT_LABELS[k] ?? k; }

  static rollTwiceMode(actor) {
    if (!actor) return null;
    const active = [...(actor.effects ?? [])].filter(e => !e.disabled && !e.isSuppressed);

    // Prefer explicit Candlelight flags. Name matching is kept as a convenience
    // for older/manual ActiveEffects.
    const hasEmbolden = active.some(e =>
      e.getFlag?.("candlelight", "rollTwice") === "best" ||
      String(e.name ?? "").trim().toLowerCase() === "embolden"
    );
    const hasDishearten = active.some(e =>
      e.getFlag?.("candlelight", "rollTwice") === "worst" ||
      String(e.name ?? "").trim().toLowerCase() === "dishearten"
    );

    // NEVER > ALWAYS is the global Candlelight convention. For these opposed
    // fortune states, Dishearten is treated as the restrictive state when both
    // are present, so it wins rather than cancelling silently.
    if (hasDishearten) return "worst";
    if (hasEmbolden) return "best";
    return null;
  }

  static async evaluateNumeric(formula, {actor = null, better = "high"} = {}) {
    const mode = this.rollTwiceMode(actor);
    const first = await new Roll(formula).evaluate();
    if (!mode) return {roll:first, rolls:[first], mode:null, kept:1};

    const second = await new Roll(formula).evaluate();
    const highWins = better !== "low";
    const firstBetter = highWins ? first.total >= second.total : first.total <= second.total;
    const chooseFirst = mode === "best" ? firstBetter : !firstBetter;
    const kept = chooseFirst ? 1 : 2;
    return {roll: chooseFirst ? first : second, rolls:[first, second], mode, kept};
  }

  static _testOutcome(roll, pool, statistic, difficulty) {
    const results = roll.dice.flatMap(d => d.results.map(r => r.result));
    const successes = results.filter(r => r >= 7).length;
    const tens = results.filter(r => r === 10).length;
    const margin = difficulty === null ? null : successes - difficulty;
    const passed = difficulty === null ? null : successes >= difficulty;
    return {roll, pool, statistic, successes, tens, difficulty, margin, passed, results};
  }

  static _compareTests(a, b) {
    if (a.successes !== b.successes) return a.successes - b.successes;
    if (a.tens !== b.tens) return a.tens - b.tens;
    return 0;
  }

  static async test({actor, pool, statistic = null, label = "Test", difficulty = null, chat = true}) {
    pool = Math.max(1, Math.floor(pool));
    const mode = this.rollTwiceMode(actor);

    const firstRoll = await new Roll(`${pool}d10x10`).evaluate();
    const first = this._testOutcome(firstRoll, pool, statistic, difficulty);

    let chosen = first;
    let second = null;
    let kept = 1;

    if (mode) {
      const secondRoll = await new Roll(`${pool}d10x10`).evaluate();
      second = this._testOutcome(secondRoll, pool, statistic, difficulty);
      const cmp = this._compareTests(first, second);
      const firstIsBetter = cmp >= 0;
      const chooseFirst = mode === "best" ? firstIsBetter : !firstIsBetter;
      chosen = chooseFirst ? first : second;
      kept = chooseFirst ? 1 : 2;
    }

    if (chat) {
      const resultLine = difficulty === null
        ? `<strong>${chosen.successes} Success${chosen.successes === 1 ? "" : "es"}</strong>`
        : `<strong>${chosen.successes} Success${chosen.successes === 1 ? "" : "es"}</strong> vs Difficulty ${difficulty} — <strong>${chosen.passed ? "SUCCESS" : "FAILURE"}</strong> (${chosen.margin >= 0 ? "+" : ""}${chosen.margin})`;

      const twiceLine = mode && second
        ? `<div class="cl-roll-twice"><strong>${mode === "best" ? "Embolden" : "Dishearten"}:</strong> rolled twice; kept roll ${kept}. ` +
          `Roll 1: ${first.successes} successes/${first.tens} tens · Roll 2: ${second.successes} successes/${second.tens} tens.</div>`
        : "";

      await chosen.roll.toMessage({
        speaker: ChatMessage.getSpeaker({actor}),
        flavor: `<div class="candlelight chat-test"><h3>${foundry.utils.escapeHTML(label)}</h3><div>Pool: ${pool}d10 · 7+ succeeds · 10 explodes</div>${twiceLine}<div>${resultLine}</div><div>10s rolled: <strong>${chosen.tens}</strong></div></div>`
      });
    }

    return {...chosen, rollTwiceMode:mode, alternate: second, kept};
  }

  static async initiative(actor) {
    const b = actor.getStat("speed");
    const result = await this.evaluateNumeric(`1d10 + ${b}`, {actor, better:"high"});
    const note = result.mode
      ? ` — ${result.mode === "best" ? "Embolden" : "Dishearten"}: rolled twice, kept ${result.roll.total}`
      : "";
    await result.roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor}),
      flavor: `Initiative — 1d10 + Speed (${b})${note}`
    });
    return result.roll;
  }
}
