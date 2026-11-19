// render.js: the checklist and the trophy detail pane.
// A trophy is veiled while the spoiler guard is on and it is a hidden or story trophy
// the reader has not earned yet: its name and description are replaced, its guide stays shut.
export function isVeiled(trophy, spoilerMode, earned) {
  if (!spoilerMode) return false;
  if (earned.has(trophy.name)) return false;
  return trophy.hidden === true || trophy.kind === 'story';
}

export function filterTrophies(trophies, filters) {
  const query = (filters.query || '').trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (filters.earnedOnly && !filters.earned.has(trophy.name)) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function renderChecklist(listEl, metaEl, emptyEl, trophies, filters, onToggle, onSelect, selectedName) {
  listEl.replaceChildren();
  const visible = filterTrophies(trophies, filters);
  metaEl.textContent = `Showing ${visible.length} of ${trophies.length} trophies` +
    (filters.kind !== 'all' ? ` · kind: ${filters.kind}` : '') +
    (filters.grade !== 'all' ? ` · grade: ${filters.grade}` : '');
  emptyEl.hidden = visible.length > 0;
  for (const trophy of visible) {
    const veiled = isVeiled(trophy, filters.spoilerMode, filters.earned);
    const item = document.createElement('li');
    item.className = 'trophy' + (filters.earned.has(trophy.name) ? ' earned' : '') +
      (selectedName === trophy.name ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = filters.earned.has(trophy.name);
    box.setAttribute('aria-label', `Earned: ${veiled ? 'hidden trophy' : trophy.name}`);
    box.addEventListener('change', () => onToggle(trophy));
    box.addEventListener('click', (event) => event.stopPropagation());
    const body = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'trophy-name';
    name.textContent = veiled ? 'Hidden trophy — earn it to reveal it' : trophy.name;
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = veiled ? 'A story trophy, hidden until earned.' : trophy.description;
    const tags = document.createElement('p');
    tags.className = 'trophy-tags';
    const gradeTag = document.createElement('span');
    gradeTag.className = 'tag';
    gradeTag.textContent = trophy.grade;
    tags.append(gradeTag);
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = trophy.kind;
    tags.append(kindTag);
    if (trophy.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = 'MISSABLE';
      tags.append(missTag);
    }
    if (trophy.hidden) {
      const hidTag = document.createElement('span');
      hidTag.className = 'tag hidden-tag';
      hidTag.textContent = 'hidden';
      tags.append(hidTag);
    }
    if (trophy.count) {
      const countTag = document.createElement('span');
      countTag.className = 'tag';
      countTag.textContent = `× ${trophy.count}`;
      tags.append(countTag);
    }
    body.append(name, desc, tags);
    const right = document.createElement('div');
    const grade = document.createElement('span');
    grade.className = `grade ${trophy.grade}`;
    grade.textContent = trophy.grade;
    right.append(grade);
    if (filters.earned.has(trophy.name)) {
      const mark = document.createElement('p');
      mark.className = 'earned-mark';
      mark.textContent = '✓ Earned';
      right.append(mark);
    }
    item.append(box, body, right);
    item.addEventListener('click', () => onSelect(trophy));
    listEl.append(item);
  }
}

export function renderDetail(paneEl, trophy, spoilerMode, earned) {
  paneEl.replaceChildren();
  if (!trophy) {
    const hint = document.createElement('p');
    hint.className = 'detail-hint';
    hint.textContent = 'Pick a trophy on the left to read its guide and sources here.';
    paneEl.append(hint);
    return;
  }
  const veiled = isVeiled(trophy, spoilerMode, earned);
  if (earned.has(trophy.name)) {
    const banner = document.createElement('p');
    banner.className = 'earned-banner';
    banner.textContent = '✓ Earned — nice work, Leonida legend.';
    paneEl.append(banner);
  }
  if (trophy.missable && !veiled) {
    const warn = document.createElement('p');
    warn.className = 'earned-banner';
    warn.style.borderColor = 'var(--coral)';
    warn.style.color = 'var(--coral)';
    warn.style.background = '#3a1d16';
    warn.textContent = '⚠ MISSABLE — read the warning in the guide before Chapter 1 ends.';
    paneEl.append(warn);
  }
  const title = document.createElement('h2');
  title.textContent = veiled ? 'Hidden trophy' : trophy.name;
  paneEl.append(title);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = veiled
    ? 'This trophy is hidden on PlayStation until earned. Turn the spoiler guard off, or earn it, to reveal its name and description.'
    : `${trophy.description} — ${trophy.grade}, ${trophy.kind}${trophy.missable && trophy.kind !== 'missable' ? ', MISSABLE' : ''}${trophy.hidden ? ', hidden' : ''}.`;
  paneEl.append(desc);
  if (veiled) {
    const veil = document.createElement('p');
    veil.className = 'spoiler-veil';
    veil.textContent = 'Guide veiled with the name. The guide cites Exophase for the official name, description and grade, and the roadmap for when to earn it.';
    paneEl.append(veil);
    return;
  }
  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophy.guide;
  paneEl.append(guideHeading, guide);
  const sourcesHeading = document.createElement('h3');
  sourcesHeading.textContent = 'Sources';
  const sources = document.createElement('ul');
  for (const source of trophy.sources || []) {
    const item = document.createElement('li');
    item.textContent = source;
    sources.append(item);
  }
  paneEl.append(sourcesHeading, sources);
}
