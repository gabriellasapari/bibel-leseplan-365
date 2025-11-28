const PLAN_URL = 'plans/plan-365.json';
const STORAGE_KEY = 'bibel-leseplan-365-progress';

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

  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diff = today - start;
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Vor dem Startdatum immer Tag 0 anzeigen
  return diffDays < 0 ? 0 : diffDays;
}

// Automatisch Lesungen für einen Tag erzeugen
function getReadingsForDay(dayNumber) {
  // Später kannst du hier echte Bibelstellen eintragen.
  // Jetzt Platzhalter + echter Psalm-Zyklus (1–150, dann wieder 1).
  const psalm = ((dayNumber - 1) % 150) + 1;

  return {
    ot: [`Altes Testament – Tag ${dayNumber}`],
    nt: [`Neues Testament – Tag ${dayNumber}`],
    ps: [`Psalm ${psalm}`]
  };
}

// Heutigen Tag darstellen
function renderToday(plan, progress) {
  document.getElementById('plan-description').textContent =
    plan.description || '';

  const index = getDayIndexFromDate(plan.start);
  currentDayIndex = index;

  const totalDays = plan.totalDays || 365;
  const dayNumber = index + 1;

  // Wenn der Tag ausserhalb des Plans liegt → Plan beendet
  if (dayNumber < 1 || dayNumber > totalDays) {
    document.getElementById('day-title').textContent = 'Plan beendet 🎉';
    document.getElementById('day-info').textContent = '';
    document.getElementById('readings').innerHTML = '';
    document.getElementById('status-text').textContent = '';
    document.getElementById('progress-text').textContent = `
      Abgeschlossen: ${progress.completedDays.length} von ${totalDays} Tagen
    `;
    return;
  }

  // Tag-Daten automatisch erzeugen
  const dayEntry = {
    day: dayNumber,
    title: `Tag ${dayNumber}`,
    readings: getReadingsForDay(dayNumber)
  };

  const today = new Date().toLocaleDateString('de-AT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  document.getElementById('day-title').textContent =
    `Tag ${dayEntry.day}: ${dayEntry.title}`;
  document.getElementById('day-info').textContent = today;

  const r = dayEntry.readings;

  document.getElementById('readings').innerHTML = `
    <h3>Lesung heute:</h3>
    <ul>
      <li><strong>AT:</strong> ${r.ot.join(', ')}</li>
      <li><strong>NT:</strong> ${r.nt.join(', ')}</li>
      <li><strong>Psalmen:</strong> ${r.ps.join(', ')}</li>
    </ul>
  `;

  const done = progress.completedDays.includes(dayEntry.day);

  document.getElementById('status-text').textContent =
    done
      ? '✅ Dieser Tag ist schon als gelesen markiert.'
      : 'Noch nicht als gelesen markiert.';

  document.getElementById('progress-text').textContent = `
    Abgeschlossen: ${progress.completedDays.length} von ${totalDays} Tagen
  `;
}

// Button-Logik
function setupButton(plan, progress) {
  const btn = document.getElementById('mark-done-btn');

  btn.addEventListener('click', () => {
    const dayNumber = currentDayIndex + 1;
    const totalDays = plan.totalDays || 365;

    if (dayNumber < 1 || dayNumber > totalDays) {
      return;
    }

    if (!progress.completedDays.includes(dayNumber)) {
      progress.completedDays.push(dayNumber);
      saveProgress(progress);

      document.getElementById('status-text').textContent =
        '✅ Als gelesen markiert.';

      document.getElementById('progress-text').textContent = `
        Abgeschlossen: ${progress.completedDays.length} von ${totalDays} Tagen
      `;
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


