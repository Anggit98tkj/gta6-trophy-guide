// app.js: entry point. Loads trophies.json, wires the checklist, detail pane,
// roadmap and missables pages, and the toolbar. Everything runs offline:
// the only fetch is the relative path data/trophies.json, a file of this app.
import {
  loadEarned, saveEarned, loadSettings, saveSettings,
  exportProgress, parseImportedProgress, countByGrade, progressPercent,
} from './store.js';
import { renderChecklist, renderDetail } from './render.js';
import { renderRoadmap, renderMissables, showView } from './pages.js';

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;

const state = {
  earned: loadEarned(),
  settings: loadSettings(),
  filters: { query: '', kind: 'all', grade: 'all', earnedOnly: false },
  selectedName: null,
};

const elements = {
  list: document.getElementById('trophyList'),
  meta: document.getElementById('listMeta'),
  empty: document.getElementById('emptyState'),
  detail: document.getElementById('detailPane'),
  toolbar: document.getElementById('toolbar'),
  spoilerNote: document.getElementById('spoilerNote'),
  layout: document.querySelector('.layout'),
  roadmapPage: document.getElementById('roadmapPage'),
  missablesPage: document.getElementById('missablesPage'),
  tabs: [...document.querySelectorAll('.tab')],
};

function currentFilters() {
  return {
    ...state.filters,
    earnedOnly: state.settings.earnedOnly,
    earned: state.earned,
    spoilerMode: state.settings.spoilerMode,
  };
}

function renderProgress() {
  const { counts, totals } = countByGrade(state.earned, trophies);
  document.getElementById('spoilerNote').textContent = state.settings.spoilerMode
    ? 'Spoiler guard is on: hidden and story trophies stay veiled until you earn them. Turn it off to see every name.'
    : 'Spoiler guard is off: every hidden and story trophy name is visible. Turn it back on to veil them again.';
  document.getElementById('earnedCount').textContent = String(state.earned.size);
  document.getElementById('progressLabel').textContent =
    `${state.earned.size} trophies earned · platinum ${progressPercent(state.earned, trophies)}% there`;
  document.getElementById('gradeLine').textContent =
    `Platinum ${counts.platinum}/${totals.platinum} · Gold ${counts.gold}/${totals.gold} · ` +
    `Silver ${counts.silver}/${totals.silver} · Bronze ${counts.bronze}/${totals.bronze}`;
  const fill = document.getElementById('progressFill');
  fill.style.width = `${progressPercent(state.earned, trophies)}%`;
  document.getElementById('progressBar').setAttribute('aria-valuenow', String(state.earned.size));
}

function selectedTrophy() {
  return trophies.find((t) => t.name === state.selectedName) || null;
}

function renderAll() {
  renderProgress();
  renderChecklist(
    elements.list, elements.meta, elements.empty, trophies, currentFilters(),
    toggleEarned, selectTrophy, state.selectedName,
  );
  renderDetail(elements.detail, selectedTrophy(), state.settings.spoilerMode, state.earned);
  renderRoadmap(
    document.getElementById('roadmapList'),
    document.getElementById('stageGrid'),
    data, state.earned,
  );
  renderMissables(
    document.getElementById('missableList'), data, state.earned, selectTrophyFromPage,
  );
}

function toggleEarned(trophy) {
  if (state.earned.has(trophy.name)) state.earned.delete(trophy.name);
  else state.earned.add(trophy.name);
  saveEarned(state.earned);
  renderAll();
}

function selectTrophy(trophy) {
  state.selectedName = trophy.name;
  renderAll();
}

function selectTrophyFromPage(trophy) {
  state.selectedName = trophy.name;
  showView('checklist', elements);
  renderAll();
  document.getElementById('detailPane').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Wire the toolbar and the tabs, then paint the first view.
const searchInput = document.getElementById('search');
const kindFilter = document.getElementById('kindFilter');
const gradeFilter = document.getElementById('gradeFilter');
const earnedOnlyBox = document.getElementById('earnedOnly');
const spoilerBox = document.getElementById('spoilerMode');

searchInput.addEventListener('input', () => {
  state.filters.query = searchInput.value;
  renderAll();
});
kindFilter.addEventListener('change', () => {
  state.filters.kind = kindFilter.value;
  renderAll();
});
gradeFilter.addEventListener('change', () => {
  state.filters.grade = gradeFilter.value;
  renderAll();
});
earnedOnlyBox.checked = state.settings.earnedOnly;
earnedOnlyBox.addEventListener('change', () => {
  state.settings.earnedOnly = earnedOnlyBox.checked;
  saveSettings(state.settings);
  renderAll();
});
spoilerBox.checked = state.settings.spoilerMode;
spoilerBox.addEventListener('change', () => {
  state.settings.spoilerMode = spoilerBox.checked;
  saveSettings(state.settings);
  renderAll();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  exportProgress(state.earned, trophies);
});
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    state.earned = parseImportedProgress(await file.text(), trophies);
    saveEarned(state.earned);
    renderAll();
  } catch (error) {
    alert(`Could not import that file: ${error.message}`);
  }
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies? Your exported file, if you saved one, is untouched.')) return;
  state.earned = new Set();
  saveEarned(state.earned);
  renderAll();
});

for (const tab of elements.tabs) {
  tab.addEventListener('click', () => {
    showView(tab.dataset.view, elements);
  });
}

renderAll();
