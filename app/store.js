// store.js: earned progress and settings, saved in localStorage, with export/import.
// Nothing here touches the network. The progress file is plain JSON: a list of trophy names.
export const PROGRESS_KEY = 'leonida-trophy-progress-v1';
export const SETTINGS_KEY = 'leonida-trophy-settings-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { spoilerMode: parsed.spoilerMode !== false, earnedOnly: parsed.earnedOnly === true };
  } catch {
    return { spoilerMode: true, earnedOnly: false };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportProgress(earned, trophies) {
  const payload = {
    app: 'leonida-trophy-guide',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned],
    total: trophies.length,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

export function parseImportedProgress(text, trophies) {
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('Progress file has no earned list.');
  const known = new Set(trophies.map((t) => t.name));
  const earned = new Set();
  for (const name of names) {
    if (typeof name === 'string' && known.has(name)) earned.add(name);
  }
  return earned;
}

export function progressPercent(earned, trophies) {
  if (!trophies.length) return 0;
  return Math.round((earned.size / trophies.length) * 100);
}

export function countByGrade(earned, trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    totals[trophy.grade] += 1;
    if (earned.has(trophy.name)) counts[trophy.grade] += 1;
  }
  return { counts, totals };
}
