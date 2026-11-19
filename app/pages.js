// pages.js: the roadmap page and the missables page, both built from trophies.json.
// The roadmap stages live in the data file, so the order shown here is the data's order.
export function renderRoadmap(roadmapEl, stageGridEl, data, earned) {
  roadmapEl.replaceChildren();
  for (const stage of data.roadmap || []) {
    const item = document.createElement('li');
    const heading = document.createElement('h3');
    heading.textContent = `Stage ${stage.stage}: ${stage.title}`;
    const text = document.createElement('p');
    text.textContent = stage.text;
    item.append(heading, text);
    roadmapEl.append(item);
  }
  stageGridEl.replaceChildren();
  for (const stage of data.roadmap || []) {
    const card = document.createElement('div');
    card.className = 'stage-card';
    const heading = document.createElement('h4');
    const stageTrophies = data.trophies.filter((t) => t.stage === stage.stage);
    const done = stageTrophies.filter((t) => earned.has(t.name)).length;
    heading.textContent = `Stage ${stage.stage} — ${done}/${stageTrophies.length} earned`;
    const list = document.createElement('ul');
    for (const trophy of stageTrophies) {
      const row = document.createElement('li');
      if (earned.has(trophy.name)) row.className = 'earned-item';
      row.textContent = (earned.has(trophy.name) ? '✓ ' : '') + trophy.name +
        ` (${trophy.grade}${trophy.missable ? ', MISSABLE' : ''})`;
      list.append(row);
    }
    card.append(heading, list);
    stageGridEl.append(card);
  }
}

export function renderMissables(missableEl, data, earned, onSelect) {
  missableEl.replaceChildren();
  const missables = data.trophies.filter((t) => t.missable);
  const pill = document.getElementById('missablePill');
  if (pill) pill.textContent = String(missables.length);
  for (const trophy of missables) {
    const card = document.createElement('div');
    card.className = 'missable-card';
    const heading = document.createElement('h3');
    heading.textContent = `⚠ ${trophy.name} — ${trophy.grade}` +
      (earned.has(trophy.name) ? ' ✓ earned, safe' : ' — NOT YET EARNED');
    const warning = document.createElement('p');
    const entry = (data.missables || []).find((m) => m.id === trophy.id);
    warning.textContent = entry ? entry.warning : trophy.guide;
    const open = document.createElement('p');
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = 'Read the full guide';
    link.addEventListener('click', (event) => {
      event.preventDefault();
      onSelect(trophy);
    });
    open.append(link);
    card.append(heading, warning, open);
    missableEl.append(card);
  }
  if (!missables.length) {
    const none = document.createElement('p');
    none.textContent = 'No missable trophies are flagged in the data.';
    missableEl.append(none);
  }
}

export function showView(view, elements) {
  const isChecklist = view === 'checklist';
  elements.toolbar.hidden = !isChecklist;
  elements.spoilerNote.hidden = !isChecklist;
  elements.layout.hidden = !isChecklist;
  elements.roadmapPage.hidden = view !== 'roadmap';
  elements.missablesPage.hidden = view !== 'missables';
  for (const tab of elements.tabs) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
}
