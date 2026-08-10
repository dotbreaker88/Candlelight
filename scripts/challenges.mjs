const CHALLENGES = Object.freeze([
  {key:"dodge", label:"Dodge", stat:"agility", icon:"fa-person-running"},
  {key:"parry", label:"Parry", stat:"prowess", icon:"fa-sword"},
  {key:"block", label:"Block", stat:"toughness", icon:"fa-shield-halved"},
  {key:"standTall", label:"Stand Tall", stat:"willpower", icon:"fa-person-rays"}
]);

function ensureChallengePanel(root, actor) {
  const defense = root.querySelector(".cl-defense-panel");
  if (!defense || defense.querySelector("[data-cl-challenges]")) return;
  const list = defense.querySelector(".cl-defense-list");
  const panel = document.createElement("div");
  panel.className = "cl-challenge-panel";
  panel.dataset.clChallenges = "true";
  panel.innerHTML = `
    <div class="cl-challenge-heading"><span>Challenges</span><small>Defensive reactions</small></div>
    <div class="cl-challenge-grid">
      ${CHALLENGES.map(c => `
        <button type="button" class="cl-challenge-card" data-action="challenge-roll" data-challenge="${c.key}" data-stat="${c.stat}" title="Roll ${c.label} (${c.stat})">
          <i class="fa-solid ${c.icon}"></i>
          <span class="cl-challenge-label">${c.label}</span>
          <strong>${actor.getStat(c.stat)}</strong>
          <small>${c.stat}</small>
        </button>`).join("")}
    </div>`;
  list?.insertAdjacentElement("afterend", panel);
  panel.querySelectorAll('[data-action="challenge-roll"]').forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      actor.rollTest(event.currentTarget.dataset.stat);
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
