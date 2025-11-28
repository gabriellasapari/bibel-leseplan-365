const PLAN_URL = 'plans/plan-365.json';
const STORAGE_KEY = 'gideon-365-progress';
const LANG_KEY = 'bibel-plan-lang';
const THEME_KEY = 'bibel-plan-theme';

const locales = {
  de: 'de-DE',
  en: 'en-US',
  id: 'id-ID'
};

const translations = {
  de: {
    eyebrow: 'Jahresplan',
    title: 'Bibel Leseplan – 1 Jahr',
    subtitle:
      'Morgens Altes Testament, abends Neues Testament – geordnet von Januar bis Dezember.',
    language: 'Sprache',
    lightMode: 'Helles Design',
    darkMode: 'Dunkles Design',
    calendarNote: 'Datumsanzeige folgt dem echten Kalender (Februar ohne 30/31).',
    planDescription:
      'Begleitet dich durch das ganze Jahr: morgens ein Abschnitt aus dem Alten Testament, abends aus dem Neuen Testament.',
    todayLabel: 'Heute',
    todaysReading: 'Lesungen heute',
    morning: 'Morgens',
    evening: 'Abends',
    markRead: 'Als gelesen markieren',
    marked: '✅ Als gelesen markiert.',
    notMarked: 'Noch nicht als gelesen markiert.',
    finished: 'Plan beendet 🎉',
    finishedBody: 'Du hast den Jahresplan abgeschlossen.',
    progress: (done, total) => `Abgeschlossen: ${done} von ${total} Tagen`,
    ambience: 'Stimmung',
    musicTitle: 'Musik & Atmosphäre',
    musicLabel: 'Musik wählen',
    play: 'Putar',
    pause: 'Jeda',
    volume: 'Lautstärke',
    footer:
      'Für den Bibeltext benutzen wir die YouVersion Bible App (Lutherbibel 2017).'
  },
  en: {
    eyebrow: 'Year plan',
    title: 'Bible Reading Plan – 1 Year',
    subtitle:
      'Morning: Old Testament • Evening: New Testament. Ordered readings from January to December.',
    language: 'Language',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    calendarNote: 'Dates follow the real calendar (no Feb 30 or 31).',
    planDescription:
      'Walk through Scripture in one year: Old Testament passages for the morning, New Testament passages for the evening.',
    todayLabel: 'Today',
    todaysReading: "Today's readings",
    morning: 'Morning',
    evening: 'Evening',
    markRead: 'Mark as read',
    marked: '✅ Marked as read.',
    notMarked: 'Not marked as read yet.',
    finished: 'Plan completed 🎉',
    finishedBody: 'You finished this annual reading plan.',
    progress: (done, total) => `Completed: ${done} of ${total} days`,
    ambience: 'Reading ambience',
    musicTitle: 'Background music & mood',
    musicLabel: 'Choose music',
    play: 'Play',
    pause: 'Pause',
    volume: 'Volume',
    footer:
      'Bible text links use the YouVersion Bible App (Luther Bible 2017).' 
  },
  id: {
    eyebrow: 'Rencana 1 tahun',
    title: 'Bibel Leseplan – 1 Tahun',
    subtitle:
      'Pagi: Perjanjian Lama • Malam: Perjanjian Baru. Terurut dari Januari sampai Desember.',
    language: 'Bahasa',
    lightMode: 'Mode Terang',
    darkMode: 'Mode Gelap',
    calendarNote: 'Tanggal mengikuti kalender asli (Februari tidak pernah 30/31).',
    planDescription:
      'Jelajahi Alkitab selama 1 tahun: bacaan pagi dari Perjanjian Lama, bacaan malam dari Perjanjian Baru.',
    todayLabel: 'Hari ini',
    todaysReading: 'Bacaan hari ini',
    morning: 'Pagi',
    evening: 'Malam',
    markRead: 'Tandai sudah dibaca',
    marked: '✅ Sudah ditandai dibaca.',
    notMarked: 'Belum ditandai dibaca.',
    finished: 'Rencana selesai 🎉',
    finishedBody: 'Kamu sudah menuntaskan rencana 1 tahun.',
    progress: (done, total) => `Selesai: ${done} dari ${total} hari`,
    ambience: 'Suasana pendamping',
    musicTitle: 'Musik latar & suasana',
    musicLabel: 'Pilih musik',
    play: 'Putar',
    pause: 'Jeda',
    volume: 'Volume',
    footer:
      'Tautan Alkitab memakai YouVersion Bible App (Lutherbibel 2017).'
  }
};

const tracks = [
  {
    id: 'strings',
    title: 'Gentle Strings',
    artist: 'Studio Ambience',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8708b86e35.mp3?filename=inspiring-piano-ambient-112199.mp3'
  },
  {
    id: 'piano',
    title: 'Quiet Piano',
    artist: 'Calm Focus',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_3fbe2df7e5.mp3?filename=soft-piano-ambient-112192.mp3'
  },
  {
    id: 'nature',
    title: 'Evening Rain',
    artist: 'Nature Bedtime',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_b013d0d947.mp3?filename=soft-rain-ambient-6102.mp3'
  }
];

let currentDayIndex = null;
let currentLanguage = localStorage.getItem(LANG_KEY) || 'de';
let currentTheme = localStorage.getItem(THEME_KEY) || 'light';

// ---------------------------
// Helpers
// ---------------------------
function buildYouVersionLink(ref) {
  if (!ref || ref === '-' || typeof ref !== 'string') return '-';
  const cleaned = ref.trim();
  const query = encodeURIComponent(cleaned.replace(/\s+/g, ' '));
  const url = `https://www.bible.com/search/bible?q=${query}`;

  return `
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="yv-link">
      <span class="yv-ref">${cleaned}</span>
      <span class="yv-pill">YouVersion</span>
    </a>
  `;
}

function t(key, ...args) {
  const entry = translations[currentLanguage][key];
  if (typeof entry === 'function') return entry(...args);
  return entry || key;
}

function safeSetText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function safeSetHTML(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = value;
}

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

function getPlanStartDate(plan) {
  const currentYear = new Date().getFullYear();
  const start = plan.start ? new Date(plan.start) : new Date(currentYear, 0, 1);
  start.setFullYear(currentYear, 0, 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getDayIndexFromDate(startDate) {
  const today = new Date();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return diffDays < 0 ? 0 : diffDays;
}

function formatPlanDate(date) {
  const locale = locales[currentLanguage] || 'de-DE';
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  const themeLabel = document.getElementById('theme-label');
  const themeToggle = document.getElementById('theme-toggle');

  if (theme === 'dark') {
    themeToggle.querySelector('.icon').textContent = '🌙';
    if (themeLabel) themeLabel.textContent = t('darkMode');
    themeToggle.setAttribute('aria-pressed', 'true');
  } else {
    themeToggle.querySelector('.icon').textContent = '🌞';
    if (themeLabel) themeLabel.textContent = t('lightMode');
    themeToggle.setAttribute('aria-pressed', 'false');
  }

  localStorage.setItem(THEME_KEY, theme);
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    if (key in translations[currentLanguage]) {
      if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
        node.placeholder = t(key);
      } else {
        node.textContent = t(key);
      }
    }
  });

  const title = t('title');
  document.title = title;
  safeSetText('hero-title', title);
  safeSetText('plan-description', t('planDescription'));
  setTheme(currentTheme);
}

function renderToday(plan, progress, startDate) {
  const totalDays = plan.days.length;
  let index = getDayIndexFromDate(startDate);

  if (index >= totalDays) {
    currentDayIndex = null;
    safeSetText('day-title', t('finished'));
    safeSetText('day-info', '');
    safeSetHTML('readings', `<p>${t('finishedBody')}</p>`);
    safeSetText('status-text', '');
    safeSetText('progress-text', t('progress')(progress.completedDays.length, totalDays));
    return;
  }

  currentDayIndex = index;
  const dayEntry = plan.days[index];

  const planDate = new Date(startDate);
  planDate.setDate(startDate.getDate() + (dayEntry.day - 1));

  safeSetText('day-title', dayEntry.title);
  safeSetText('day-info', formatPlanDate(planDate));

  const r = dayEntry.readings || {};
  const morning = r.morning || '–';
  const evening = r.evening || '–';

  safeSetHTML(
    'readings',
    `
      <h3>${t('todaysReading')}</h3>
      <ul>
        <li><strong>${t('morning')}:</strong> ${buildYouVersionLink(morning)}</li>
        <li><strong>${t('evening')}:</strong> ${buildYouVersionLink(evening)}</li>
      </ul>
    `
  );

  const done = progress.completedDays.includes(dayEntry.day);
  safeSetText('status-text', done ? t('marked') : t('notMarked'));
  safeSetText('progress-text', t('progress')(progress.completedDays.length, totalDays));
}

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
      safeSetText('status-text', t('marked'));
      safeSetText(
        'progress-text',
        t('progress')(progress.completedDays.length, plan.days.length)
      );
    }
  });
}

function setupLanguage(plan, progress, startDate) {
  const select = document.getElementById('language-select');
  if (!select) return;

  select.value = currentLanguage;
  select.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    localStorage.setItem(LANG_KEY, currentLanguage);
    applyTranslations();
    renderToday(plan, progress, startDate);
  });
}

function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  });
}

function setupAudio() {
  const select = document.getElementById('track-select');
  const playBtn = document.getElementById('play-toggle');
  const playLabel = document.getElementById('play-label');
  const nowPlaying = document.getElementById('now-playing');
  const audio = document.getElementById('bg-audio');
  const volume = document.getElementById('volume');

  if (!select || !playBtn || !audio) return;

  tracks.forEach((track) => {
    const opt = document.createElement('option');
    opt.value = track.id;
    opt.textContent = `${track.title} – ${track.artist}`;
    select.appendChild(opt);
  });

  function loadTrack(id) {
    const track = tracks.find((t) => t.id === id) || tracks[0];
    audio.src = track.url;
    nowPlaying.textContent = `${track.title} · ${track.artist}`;
  }

  loadTrack(select.value || tracks[0].id);
  audio.volume = Number(volume?.value || 0.4);

  select.addEventListener('change', (e) => {
    const wasPlaying = !audio.paused;
    loadTrack(e.target.value);
    if (wasPlaying) {
      audio.play();
      playLabel.textContent = t('pause');
    }
  });

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playLabel.textContent = t('pause');
    } else {
      audio.pause();
      playLabel.textContent = t('play');
    }
  });

  volume?.addEventListener('input', (e) => {
    audio.volume = Number(e.target.value);
  });
}

async function init() {
  try {
    const plan = await loadPlan();
    const progress = loadProgress();
    const startDate = getPlanStartDate(plan);

    safeSetText('year-indicator', startDate.getFullYear());

    applyTranslations();
    renderToday(plan, progress, startDate);
    setupButton(plan, progress);
    setupLanguage(plan, progress, startDate);
    setupThemeToggle();
    setupAudio();
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
