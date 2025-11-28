const PLAN_URL = 'plans/plan-365.json';
const STORAGE_KEY = 'gideon-365-progress';

let currentDayIndex = null;

// Helper: textContent aman
function safeSetText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Helper: innerHTML aman
function safeSetHTML(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = value;
}

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

  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diff = today - start;
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  return diffDays < 0 ? 0 : diffDays;
}

// Heutigen Tag anhand des Plans darstellen
function renderToday(plan, progress) {
  // Beschreibung nur setzen, wenn Element da
  if (plan.description) {
    safeSetText('plan-description', plan.description);
  }

  const totalDays = plan.days.length;
  let index = getDayIndexFromDate(plan.start);

  if (index >= totalDays) {
    currentDayIndex = null;

    safeSetText('day-title', 'Plan beendet 🎉');
    safeSetText('day-info', '');
    safeSetHTML('readings', '');
    safeSetText('status-text', '');
    safeSetText(
      'progress-text',
      `Abgeschlossen: ${progress.completedDays.length} von ${totalDays} Tagen`
    );
    return;
  }

  if (index < 0) index = 0;

  currentDayIndex = index;
  const dayEntry = plan.days[index];

  const todayStr = new Date().toLocaleDateString('de-AT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  safeSetText('day-title', dayEntry.title);
  safeSetText('day-info', todayStr);

  const r = dayEntry.readings || {};
  const morning = r.morning || '–';
  const evening = r.evening || '–';

  safeSetHTML(
    'readings',
    `
      <h3>Lesung heute:</h3>
      <ul>
        <li><strong>Morgens:</strong> ${morning}</li>
        <li><strong>Abends:</strong> ${evening}</li>
      </ul>
    `
  );

  const done = progress.completedDays.includes(dayEntry.day);

  safeSetText(
    'status-text',
    done
      ? '✅ Dieser Tag ist schon als gelesen markiert.'
      : 'Noch nicht als gelesen markiert.'
  );

  safeSetText(
    'progress-text',
    `Abgeschlossen: ${progress.completedDays.length} von ${totalDays} Tagen`
  );
}

// Button-Logik: Tag als gelesen markieren
function setupButton(plan, progress) {
  // hier keine Fehlermeldung, wenn der Button eine andere ID hat
  const btn =
    document.getElementById('mark-done-btn') ||
    document.getElementById('mark-done');

  if (!btn) return;

  btn.addEventListener('click', () => {
    if (currentDayIndex === null) return;

    const dayEntry = plan.days[currentDayIndex];
    const dayNumber = dayEntry.day;

    if (!progress.completedDays.includes(dayNumber)) {
      progress.completedDays.push(dayNumber);
      saveProgress(progress);

      safeSetText('status-text', '✅ Als gelesen markiert.');
      safeSetText(
        'progress-text',
        `Abgeschlossen: ${progress.completedDays.length} von ${plan.days.length} Tagen`
      );
    }
  });
}

// Initialisierung
async function init() {
  try {
    const plan = await loadPlan();
    const progress = loadProgress();
    renderToday(plan, progress);
    setupButton(plan, progress);
  } catch (err) {
    console.error(err);
    safeSetText('day-title', 'Fehler beim Laden des Bibelleseplans 😔');
    safeSetText('day-info', '');
    safeSetHTML(
      'readings',
      '<p>Bitte prüfe die Datei <code>plans/plan-365.json</code>.</p>'
    );
  }
}

document.addEventListener('DOMContentLoaded', init);

