const PLAN_URL = 'plans/plan-365.json';
const STORAGE_KEY = 'gideon-365-progress';

let currentDayIndex = null;

// Plan laden
async function loadPlan() {
  const res = await fetch(PLAN_URL);
  return res.json();
}

// Fortschritt aus localStorage laden
function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { completedDays: [] };
}

// Fortschritt speichern
function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// Index des Tages seit Startdatum berechnen
function getDayIndexFromDate(startDateString) {
  const start = new Date(startDateString);
  const today = new Date();

  // Uhrzeit egal machen
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diff = today - start;
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Vor dem Startdatum immer Tag 0 (also Tag 1) anzeigen
  return diffDays < 0 ? 0 : diffDays;
}

// Heutigen Tag anhand des Plans darstellen
function renderToday(plan, progress) {
  document.getElementById('plan-description').textContent =
    plan.description || '';

  const totalDays = plan.days.length;
  let index = getDayIndexFromDate(plan.start);

  // Wenn wir über das Ende des Plans hinaus sind → Plan beendet
  if (index >= totalDays) {
    currentDayIndex = null;

    document.getElementById('day-title').textContent = 'Plan beendet 🎉';
    document.getElementById('day-info').textContent = '';
    document.getElementById('readings').innerHTML = '';
    document.getElementById('status-text').textContent = '';
    document.getElementById('progress-text').textContent =
      `Abgeschlossen: ${progress.completedDays.length} von ${totalDays} Tagen`;
    return;
  }

  // Index im gültigen Bereich halten
  if (index < 0) index = 0;

  currentDayIndex = index;
  const dayEntry = plan.days[index];

  const todayStr = new Date().toLocaleDateString('de-AT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  document.getElementById('day-title').textContent =
    `Tag ${dayEntry.day}: ${dayEntry.title}`;
  document.getElementById('day-info').textContent = todayStr;

  const r = dayEntry.readings || {};
  const morning = r.morning || '–';
  const evening = r.evening || '–';

  document.getElementById('readings').innerHTML = `
    <h3>Lesung heute:</h3>
    <ul>
      <li><strong>Morgens:</strong> ${morning}</li>
      <li><strong>Abends:</strong> ${evening}</li>
    </ul>
  `;

  const done = progress.completedDays.includes(dayEntry.day);

  document.getElementById('status-text').textContent =
    done
      ? '✅ Dieser Tag ist schon als gelesen markiert.'
      : 'Noch nicht als gelesen markiert.';

  document.getElementById('progress-text').textContent =
    `Abgeschlossen: ${progress.completedDays.length} von ${totalDays} Tagen`;
}

// Button-Logik: Tag als gelesen markieren
function setupButton(plan, progress) {
  const btn = document.getElementById('mark-done-btn');

  if (!btn) return;

  btn.addEventListener('click', () => {
    if (currentDayIndex === null) return;

    const dayEntry = plan.days[currentDayIndex];
    const dayNumber = dayEntry.day;

    if (!progress.completedDays.includes(dayNumber)) {
      progress.completedDays.push(dayNumber);
      saveProgress(progress);

      document.getElementById('status-text').textContent =
        '✅ Als gelesen markiert.';
      document.getElementById('progress-text').textContent =
        `Abgeschlossen: ${progress.completedDays.length} von ${plan.days.length} Tagen`;
    }
  });
}

// Initialisierung
async function init() {
  const plan = await loadPlan();
  const progress = loadProgress();
  renderToday(plan, progress);
  setupButton(plan, progress);
}

document.addEventListener('DOMContentLoaded', init);
