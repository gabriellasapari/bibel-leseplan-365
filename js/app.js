// ---------------------------
// Helper: Build YouVersion Link (mit Lutherbibel 2017)
// ---------------------------
function buildYouVersionLink(ref) {
  if (!ref || ref === '-' || typeof ref !== 'string') return '-';

  const cleaned = ref.trim(); // z.B. "1Mo 1-2"

  // Erstes Wort = Buch, Rest = Kapitel/Verse
  const parts = cleaned.split(/\s+/, 2);
  let book = parts[0];
  let rest = parts[1] || '';

  // Mapping unserer Abkürzungen -> YouVersion-freundliche deutsche Namen
  const bookMap = {
    // AT
    '1Mo': '1. Mose',
    '2Mo': '2. Mose',
    '3Mo': '3. Mose',
    '4Mo': '4. Mose',
    '5Mo': '5. Mose',
    'Jos': 'Josua',
    'Rich': 'Richter',
    'Rut': 'Ruth',
    '1Sam': '1. Samuel',
    '2Sam': '2. Samuel',
    '1Kön': '1. Könige',
    '2Kön': '2. Könige',
    '1Chr': '1. Chronik',
    '2Chr': '2. Chronik',
    'Esra': 'Esra',
    'Neh': 'Nehemia',
    'Est': 'Ester',
    'Hiob': 'Hiob',
    'Ps': 'Psalm',
    'Spr': 'Sprüche',
    'Pred': 'Prediger',
    'Hld': 'Hohelied',
    'Jes': 'Jesaja',
    'Jer': 'Jeremia',
    'Klgl': 'Klagelieder',
    'Hes': 'Hesekiel',
    'Dan': 'Daniel',
    'Hos': 'Hosea',
    'Joel': 'Joel',
    'Amos': 'Amos',
    'Obad': 'Obadja',

    // NT
    'Mt': 'Matthäus',
    'Mk': 'Markus',
    'Lk': 'Lukas',
    'Joh': 'Johannes',
    'Apg': 'Apostelgeschichte',
    'Röm': 'Römer',
    '1Kor': '1. Korinther',
    '2Kor': '2. Korinther',
    'Gal': 'Galater',
    'Eph': 'Epheser',
    'Phil': 'Philipper',
    'Kol': 'Kolosser',
    '1Thess': '1. Thessalonicher',
    '2Thess': '2. Thessalonicher',
    '1Tim': '1. Timotheus',
    '2Tim': '2. Timotheus',
    'Tit': 'Titus',
    'Phlm': 'Philemon',
    'Hebr': 'Hebräer',
    'Jak': 'Jakobus',
    '1Petr': '1. Petrus',
    '2Petr': '2. Petrus',
    '1Joh': '1. Johannes',
    '2Joh': '2. Johannes',
    '3Joh': '3. Johannes',
    'Jud': 'Judas',
    'Offb': 'Offenbarung'
  };

  const fullBook = bookMap[book] || book; // falls was Neues kommt

  // Query für YouVersion: voller Name + Kapitel/Verse + Lutherbibel 2017
  const query = encodeURIComponent(`${fullBook} ${rest} Lutherbibel 2017`);
  const url = `https://www.bible.com/search/bible?q=${query}`;

  return `
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="yv-link">
      <span class="yv-ref">${cleaned}</span>
      <span class="yv-pill">YouVersion</span>
    </a>
  `;
}

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

  // Tanggal rencana: start dari JSON + (dayIndex - 1)
const planStartDate = new Date(plan.start); // mis. 2026-01-01
const planDate = new Date(planStartDate);
planDate.setDate(planStartDate.getDate() + (dayEntry.day - 1));

// Format tanggal sesuai Jerman/Austria, tanpa tahun
const planDateStr = planDate.toLocaleDateString('de-AT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

// Judul & info hari
safeSetText('day-title', dayEntry.title);       // hanya "Tag 1", "Tag 2", ...
safeSetText('day-info', planDateStr);          // z.B. "Donnerstag, 1. Jänner"

  const r = dayEntry.readings || {};
  const morning = r.morning || '–';
  const evening = r.evening || '–';

  safeSetHTML(
  'readings',
  `
    <h3>Lesung heute:</h3>
    <ul>
      <li><strong>Morgens:</strong> ${buildYouVersionLink(morning)}</li>
      <li><strong>Abends:</strong> ${buildYouVersionLink(evening)}</li>
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

