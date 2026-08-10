import { CANDLELIGHT_CHALLENGES } from "./rules/challenges.mjs";

function ensureChallengePanel(root, actor) {
  const defense = root.querySelector(".cl-defense-panel");
  if (!defense || defense.querySelector("[data-cl-challenges]")) return;
  const list = defense.querySelector(".cl-defense-list");
  const panel = document.createElement("div");
  panel.className = "cl-challenge-panel";
  panel.dataset.clChallenges = "true";
  panel.innerHTML = `
    <div class="cl-challenge-heading"><span>Challenges</span><small>Defensive reactions · no AP cost</small></div>
    <div class="cl-challenge-grid">
      ${Object.values(CANDLELIGHT_CHALLENGES).map(c => `
        <button type="button" class="cl-challenge-card" data-action="challenge-roll" data-challenge="${c.key}" data-stat="${c.statistic}" title="Roll ${c.label} (${c.statistic})">
          <i class="fa-solid ${c.icon}"></i>
          <span class="cl-challenge-label">${c.label}</span>
          <strong>${actor.getStat(c.statistic)}</strong>
          <small>${c.statistic}</small>
        </button>`).join("")}
    </div>`;
  list?.insertAdjacentElement("afterend", panel);
  panel.querySelectorAll('[data-action="challenge-roll"]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      const rule = CANDLELIGHT_CHALLENGES[event.currentTarget.dataset.challenge];
      if (rule) actor.rollTest(rule.statistic, {label: `${rule.label} Challenge`});
    });
  });
}

Hooks.on("renderActorSheet", (app, html) => {
  const actor = app.actor;
  if (!actor || actor.type !== "character") return;
  const root = html?.[0] ?? html;
  const form = root?.matches?.(".candlelight-sheet") ? root : root?.querySelector?.(".candlelight-sheet");
  if (!form) return;
  ensureChallengePanel(form, actor);
});
