// ===== MONTHLY CALENDAR — UPCOMING RELEASES FROM RADARR/SONARR =====
const CAL_API = 'https://plex-vip-backend.jazeera21.workers.dev';

let calCurrentYear = new Date().getFullYear();
let calCurrentMonth = new Date().getMonth(); // 0-indexed
let calAllEvents = [];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

async function loadCalendarEvents() {
  const container = document.getElementById('calendarContainer');
  if (!container) return;

  // PIN gate — ask every session
  const storedPin = sessionStorage.getItem('calendarPin');
  if (!storedPin) {
    showPinGate(container);
    return;
  }

  container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--gray);"><i class="fas fa-spinner fa-spin"></i> Loading calendar...</p>';

  try {
    const response = await fetch(`${CAL_API}/calendar`, {
      headers: { 'X-Calendar-Pin': storedPin }
    });

    if (response.status === 401) {
      sessionStorage.removeItem('calendarPin');
      showPinGate(container, true);
      return;
    }

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();

    calAllEvents = (result.success && Array.isArray(result.upcoming)) ? result.upcoming : [];

  } catch (error) {
    console.error('Calendar load failed:', error);
    calAllEvents = [];
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <p style="color:var(--gray);font-size:1rem;">
          <i class="fas fa-exclamation-circle"></i> Unable to load releases
        </p>
        <p style="color:var(--gray);font-size:0.85rem;margin-top:8px;">${error.message}</p>
      </div>`;
    return;
  }

  renderCalendar(container);
}

function showPinGate(container, wrongPin = false) {
  container.innerHTML = `
    <div class="pin-gate">
      <div class="pin-gate-icon"><i class="fas fa-lock"></i></div>
      <h3 class="pin-gate-title">Calendar Access</h3>
      <p class="pin-gate-sub">Enter your PIN to view the release calendar</p>
      ${wrongPin ? '<p class="pin-gate-error"><i class="fas fa-times-circle"></i> Incorrect PIN — try again</p>' : ''}
      <div class="pin-gate-form">
        <input type="password" id="calPinInput" class="pin-gate-input" placeholder="PIN" maxlength="20" autocomplete="off">
        <button id="calPinSubmit" class="pin-gate-btn"><i class="fas fa-unlock"></i> Unlock</button>
      </div>
    </div>`;

  const input = document.getElementById('calPinInput');
  const btn   = document.getElementById('calPinSubmit');

  function submit() {
    const pin = input.value.trim();
    if (!pin) return;
    sessionStorage.setItem('calendarPin', pin);
    loadCalendarEvents();
  }

  btn.addEventListener('click', submit);
  input.addEventListener('keypress', (e) => { if (e.key === 'Enter') submit(); });
  input.focus();
}

function buildEventMap(events) {
  const map = {};
  events.forEach(event => {
    if (!event.releaseDate) return;
    // Normalize to YYYY-MM-DD (strip time component if present)
    const dateStr = event.releaseDate.substring(0, 10);
    if (!map[dateStr]) map[dateStr] = [];
    map[dateStr].push(event);
  });
  return map;
}

function renderCalendar(container) {
  const today = new Date();
  const firstDay = new Date(calCurrentYear, calCurrentMonth, 1);
  const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
  const startDow = firstDay.getDay(); // 0 = Sunday

  const eventMap = buildEventMap(calAllEvents);

  let html = `
    <div class="calendar-wrapper">
      <div class="calendar-header">
        <button class="cal-nav-btn" id="calPrev"><i class="fas fa-chevron-left"></i></button>
        <h3 class="cal-month-title">${MONTH_NAMES[calCurrentMonth]} ${calCurrentYear}</h3>
        <button class="cal-nav-btn" id="calNext"><i class="fas fa-chevron-right"></i></button>
      </div>
      <div class="cal-grid">
        <div class="cal-day-header">Sun</div>
        <div class="cal-day-header">Mon</div>
        <div class="cal-day-header">Tue</div>
        <div class="cal-day-header">Wed</div>
        <div class="cal-day-header">Thu</div>
        <div class="cal-day-header">Fri</div>
        <div class="cal-day-header">Sat</div>
  `;

  // Leading empty cells
  for (let i = 0; i < startDow; i++) {
    html += '<div class="cal-cell empty"></div>';
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const mm = String(calCurrentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${calCurrentYear}-${mm}-${dd}`;

    const events = eventMap[dateStr] || [];
    const isToday = (
      today.getFullYear() === calCurrentYear &&
      today.getMonth() === calCurrentMonth &&
      today.getDate() === day
    );

    let cls = 'cal-cell';
    if (isToday) cls += ' today';
    if (events.length > 0) cls += ' has-events';

    const pills = events.slice(0, 2).map(e => {
      const type = (e.type === 'movie') ? 'movie' : 'show';
      const label = e.title && e.title.length > 18 ? e.title.substring(0, 17) + '…' : (e.title || 'Untitled');
      return `<div class="cal-event-pill ${type}" title="${e.title || ''}">${label}</div>`;
    }).join('');

    const moreLabel = events.length > 2
      ? `<div class="cal-event-more" data-date="${dateStr}">+${events.length - 2} more</div>`
      : '';

    // Store events as JSON on the cell for the popup
    const eventsAttr = events.length > 0
      ? ` data-events='${JSON.stringify(events).replace(/'/g, '&#39;')}'`
      : '';

    html += `
      <div class="${cls}"${eventsAttr}>
        <span class="cal-day-num">${day}</span>
        ${events.length > 0 ? `<div class="cal-events">${pills}${moreLabel}</div>` : ''}
      </div>`;
  }

  html += '</div></div>'; // close cal-grid + calendar-wrapper

  // Popup overlay (appended once, reused)
  html += `
    <div class="cal-day-popup-overlay" id="calPopupOverlay">
      <div class="cal-day-popup">
        <div class="cal-day-popup-header">
          <span class="cal-day-popup-date" id="calPopupDate"></span>
          <button class="cal-day-popup-close" id="calPopupClose">&#x2715;</button>
        </div>
        <div class="cal-day-popup-list" id="calPopupList"></div>
      </div>
    </div>`;

  container.innerHTML = html;

  // Month navigation
  document.getElementById('calPrev').addEventListener('click', () => {
    calCurrentMonth--;
    if (calCurrentMonth < 0) { calCurrentMonth = 11; calCurrentYear--; }
    renderCalendar(container);
  });

  document.getElementById('calNext').addEventListener('click', () => {
    calCurrentMonth++;
    if (calCurrentMonth > 11) { calCurrentMonth = 0; calCurrentYear++; }
    renderCalendar(container);
  });

  // Popup: open on "+N more" click
  container.addEventListener('click', (e) => {
    const moreBtn = e.target.closest('.cal-event-more');
    if (!moreBtn) return;

    const cell = moreBtn.closest('.cal-cell');
    const dateStr = moreBtn.dataset.date;
    const events = JSON.parse(cell.dataset.events || '[]');

    // Format date label
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateLabel = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    document.getElementById('calPopupDate').textContent = dateLabel;
    document.getElementById('calPopupList').innerHTML = events.map(ev => {
      const type = ev.type === 'movie' ? 'movie' : 'show';
      const episode = ev.episode ? `<span class="popup-episode">${ev.episode}</span>` : '';
      return `<div class="cal-day-popup-item ${type}">
        <span class="popup-type-dot"></span>
        <span class="popup-title">${ev.title || 'Untitled'}</span>
        ${episode}
      </div>`;
    }).join('');

    document.getElementById('calPopupOverlay').classList.add('active');
  });

  // Popup: close
  document.getElementById('calPopupClose').addEventListener('click', closePopup);
  document.getElementById('calPopupOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('calPopupOverlay')) closePopup();
  });
  document.addEventListener('keydown', function escClose(e) {
    if (e.key === 'Escape') { closePopup(); document.removeEventListener('keydown', escClose); }
  });

  function closePopup() {
    const overlay = document.getElementById('calPopupOverlay');
    if (overlay) overlay.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', loadCalendarEvents);

