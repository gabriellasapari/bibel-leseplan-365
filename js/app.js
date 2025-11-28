const PLAN_URL = 'plans/plan-365.json';
const STORAGE_KEY = 'bibel-leseplan-365-progress';

let currentDayIndex = null;

async function loadPlan() {
  const res = await fetch(PLAN_URL);
  return res.json();
}

function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { completedDays: [] };
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getDayIndexFromDate(startDateString) {
  const start = new Date(startDateString);
  const today = new Date();

  start.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  const diff = today - start;
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  return diffDays < 0 ? 0 : diffDays;
}

function renderToday(plan, progress) {
  document.getElementById('plan-description').textContent = plan.description;

  const index = getDayIndexFromDate(plan.start);
  currentDayIndex = index;

  const dayEntry = plan.days[index];

  if (!dayEntry) {
    document.getElementById('day-title').textContent = 'Plan beendet 🎉';
    document.getElementById('day-info').textContent = '';
    document.getElementById('readings').innerHTML = '';
    document.getElementById('status-text').textContent = '';
    return;
  }

  const dayNumber = dayEntry.day;
  const today = new Date().toLocaleDateString('de-AT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  document.getElementById('day-title').textContent =
    `Tag ${dayNumber}: ${dayEntry.title}`;

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

  const done = progress.completedDays.includes(dayNumber);

  document.getElementById('status-text').textContent = 
    done ? '✅ Dieser Tag ist schon als gelesen markiert.'
         : 'Noch nicht als gelesen markiert.';

  document.getElementById('progress-text').textContent = `
    Abgeschlossen: ${progress.completedDays.length} von ${plan.days.length} Tagen
  `;
}

function setupButton(plan, progress) {
  document.getElementById('mark-done-btn').addEventListener('click', () => {
    const dayEntry = plan.days[currentDayIndex];
    if (!dayEntry) return;

    const num = dayEntry.day;

    if (!progress.completedDays.includes(num)) {
      progress.completedDays.push(num);
      saveProgress(progress);

      document.getElementById('status-text').textContent =
        '✅ Als gelesen markiert.';

      document.getElementById('progress-text').textContent = `
        Abgeschlossen: ${progress.completedDays.length} von ${plan.days.length} Tagen
      `;
    }
  });
}

async function init() {
  const plan = await loadPlan();
  const progress = loadProgress();
  renderToday(plan, progress);
  setupButton(plan, progress);
}

document.addEventListener('DOMContentLoaded', init);

