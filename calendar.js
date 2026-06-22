// ===== MONTHLY CALENDAR — UPCOMING RELEASES FROM RADARR/SONARR =====
const CAL_API = 'https://plex-vip-backend.jazeera21.workers.dev';

let calCurrentYear = new Date().getFullYear();
let calCurrentMonth = new Date().getMonth(); // 0-indexed
let calAllEvents = [];
let calView = localStorage.getItem('calView') || 'grid'; // 'grid' | 'agenda'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// ─── PIN GATE & LOADING ────────────────────────────────────────────

async function loadCalendarEvents() {
  const container = document.getElementById('calendarContainer');
  if (!container) return;

  const storedPin = sessionStorage.getItem('calendarPin');
  if (!storedPin) { showPinGate(container); return; }

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

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

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

  renderView(container);
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

// ─── VIEW ROUTER ───────────────────────────────────────────────────

function renderView(container) {
  if (calView === 'agenda') renderAgenda(container);
  else renderCalendar(container);
}

// ─── HELPERS ───────────────────────────────────────────────────────

function buildEventMap(events) {
  const map = {};
  events.forEach(event => {
    if (!event.releaseDate) return;
    const dateStr = event.releaseDate.substring(0, 10);
    if (!map[dateStr]) map[dateStr] = [];
    map[dateStr].push(event);
  });
  return map;
}

function viewToggleHtml() {
  return `
    <div class="cal-view-toggle">
      <button class="cal-view-btn ${calView === 'grid' ? 'active' : ''}" data-view="grid">
        <i class="fas fa-calendar-alt"></i> Grid
      </button>
      <button class="cal-view-btn ${calView === 'agenda' ? 'active' : ''}" data-view="agenda">
        <i class="fas fa-list"></i> Agenda
      </button>
    </div>`;
}

function setupViewToggle(container) {
  container.querySelectorAll('.cal-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      calView = btn.dataset.view;
      localStorage.setItem('calView', calView);
      renderView(container);
    });
  });
}

function setupNavButtons(container) {
  document.getElementById('calPrev')?.addEventListener('click', () => {
    calCurrentMonth--;
    if (calCurrentMonth < 0) { calCurrentMonth = 11; calCurrentYear--; }
    renderView(container);
  });
  document.getElementById('calNext')?.addEventListener('click', () => {
    calCurrentMonth++;
    if (calCurrentMonth > 11) { calCurrentMonth = 0; calCurrentYear++; }
    renderView(container);
  });
}

// ─── GRID VIEW ─────────────────────────────────────────────────────

function renderCalendar(container) {
  const today = new Date();
  const firstDay = new Date(calCurrentYear, calCurrentMonth, 1);
  const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
  const startDow = firstDay.getDay();
  const eventMap = buildEventMap(calAllEvents);

  let html = `
    <div class="calendar-wrapper">
      <div class="calendar-header">
        <button class="cal-nav-btn" id="calPrev"><i class="fas fa-chevron-left"></i></button>
        <h3 class="cal-month-title">${MONTH_NAMES[calCurrentMonth]} ${calCurrentYear}</h3>
        <button class="cal-nav-btn" id="calNext"><i class="fas fa-chevron-right"></i></button>
      </div>
      ${viewToggleHtml()}
      <div class="cal-grid">
        <div class="cal-day-header">Sun</div>
        <div class="cal-day-header">Mon</div>
        <div class="cal-day-header">Tue</div>
        <div class="cal-day-header">Wed</div>
        <div class="cal-day-header">Thu</div>
        <div class="cal-day-header">Fri</div>
        <div class="cal-day-header">Sat</div>`;

  for (let i = 0; i < startDow; i++) {
    html += '<div class="cal-cell empty"></div>';
  }

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
      const type = e.type === 'movie' ? 'movie' : 'show';
      const label = e.title && e.title.length > 15 ? e.title.substring(0, 14) + '…' : (e.title || 'Untitled');
      const thumb = e.poster
        ? `<img class="pill-thumb" src="${e.poster}" alt="" loading="lazy">`
        : `<span class="pill-dot ${type}"></span>`;
      return `<div class="cal-event-pill ${type}" title="${e.title || ''}">${thumb}<span>${label}</span></div>`;
    }).join('');

    const moreLabel = events.length > 2
      ? `<div class="cal-event-more" data-date="${dateStr}">+${events.length - 2} more</div>`
      : '';

    const eventsAttr = events.length > 0
      ? ` data-date="${dateStr}" data-events='${JSON.stringify(events).replace(/'/g, '&#39;')}'`
      : '';

    html += `
      <div class="${cls}"${eventsAttr}>
        <span class="cal-day-num">${day}</span>
        ${events.length > 0 ? `<div class="cal-events">${pills}${moreLabel}</div>` : ''}
      </div>`;
  }

  html += `</div></div>`;

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
  setupNavButtons(container);
  setupViewToggle(container);

  container.addEventListener('click', (e) => {
    // Open popup on click of any pill, +more, or anywhere on a has-events cell
    const cell = e.target.closest('.cal-cell.has-events');
    if (!cell) return;
    const todayStr = new Date().toISOString().split('T')[0];

    const dateStr = cell.dataset.date;
    const events = JSON.parse(cell.dataset.events || '[]');
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateLabel = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    document.getElementById('calPopupDate').textContent = dateLabel;
    document.getElementById('calPopupList').innerHTML = events.map(ev => {
      const type = ev.type === 'movie' ? 'movie' : 'show';
      const posterHtml = ev.poster
        ? `<img class="popup-poster" src="${ev.poster}" alt="" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="popup-poster-placeholder"><i class="fas fa-${type === 'movie' ? 'film' : 'tv'}"></i></div>`;
      const isDateReleased = dateStr <= todayStr;
      const relIcon = isDateReleased ? '<span class="popup-released"><i class="fas fa-check-circle"></i> Released</span>' : '';
      return `<div class="cal-day-popup-item ${type}${isDateReleased ? ' released' : ''}">
        ${posterHtml}
        <div class="popup-info">
          <span class="popup-title">${ev.title || 'Untitled'}</span>
          <span class="popup-sub">${[ev.year, ev.episode].filter(Boolean).join(' · ')}</span>
          ${relIcon}
        </div>
      </div>`;
    }).join('');

    document.getElementById('calPopupOverlay').classList.add('active');
  });

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

// ─── AGENDA VIEW ───────────────────────────────────────────────────

function renderAgenda(container) {
  const mm = String(calCurrentMonth + 1).padStart(2, '0');
  const monthPrefix = `${calCurrentYear}-${mm}-`;
  const monthEvents = calAllEvents.filter(e => e.releaseDate && e.releaseDate.startsWith(monthPrefix));

  const eventMap = buildEventMap(monthEvents);
  const sortedDates = Object.keys(eventMap).sort();
  const todayStr = new Date().toISOString().split('T')[0];

  let agendaContent = '';

  if (sortedDates.length === 0) {
    agendaContent = `
      <div class="cal-agenda-empty">
        <i class="fas fa-calendar-check"></i>
        <p>No releases this month</p>
      </div>`;
  } else {
    agendaContent = sortedDates.map(dateStr => {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateLabel = new Date(y, m - 1, d).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      });
      const isToday = dateStr === todayStr;
      const isPast  = dateStr < todayStr;

      const isReleased = dateStr <= todayStr;

      const cards = eventMap[dateStr].map(ev => {
        const type = ev.type === 'movie' ? 'movie' : 'show';
        const safeTitle = (ev.title || '').replace(/"/g, '&quot;');
        const posterHtml = ev.poster
          ? `<img class="agenda-poster" src="${ev.poster}" alt="${safeTitle}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="agenda-poster-placeholder" style="display:none"><i class="fas fa-${type === 'movie' ? 'film' : 'tv'}"></i></div>`
          : `<div class="agenda-poster-placeholder"><i class="fas fa-${type === 'movie' ? 'film' : 'tv'}"></i></div>`;

        const metaParts = [ev.year || null, ev.episode || null].filter(Boolean);
        const epTitleHtml = ev.episodeTitle && ev.type === 'show'
          ? `<div class="agenda-ep-title">"${ev.episodeTitle}"</div>`
          : '';
        const releasedHtml = isReleased
          ? `<div class="agenda-released"><i class="fas fa-check-circle"></i> Released</div>`
          : '';

        return `
          <div class="agenda-card ${type}${isReleased ? ' released' : ''}">
            <div class="agenda-poster-wrap">${posterHtml}</div>
            <div class="agenda-card-info">
              <div class="agenda-card-title">${ev.title || 'Untitled'}</div>
              <div class="agenda-card-row">
                <span class="agenda-type-badge ${type}">
                  <i class="fas fa-${type === 'movie' ? 'film' : 'tv'}"></i> ${type === 'movie' ? 'Movie' : 'Episode'}
                </span>
                ${metaParts.length ? `<span class="agenda-meta-text">${metaParts.join(' · ')}</span>` : ''}
              </div>
              ${epTitleHtml}
              ${releasedHtml}
            </div>
          </div>`;
      }).join('');

      return `
        <div class="cal-agenda-group${isToday ? ' today' : ''}${isPast ? ' past' : ''}">
          <div class="cal-agenda-date-header">
            ${isToday ? '<span class="today-dot"></span>' : ''}
            ${dateLabel}
          </div>
          <div class="cal-agenda-cards">${cards}</div>
        </div>`;
    }).join('');
  }

  container.innerHTML = `
    <div class="calendar-wrapper">
      <div class="calendar-header">
        <button class="cal-nav-btn" id="calPrev"><i class="fas fa-chevron-left"></i></button>
        <h3 class="cal-month-title">${MONTH_NAMES[calCurrentMonth]} ${calCurrentYear}</h3>
        <button class="cal-nav-btn" id="calNext"><i class="fas fa-chevron-right"></i></button>
      </div>
      ${viewToggleHtml()}
      <div class="cal-agenda">${agendaContent}</div>
    </div>`;

  setupNavButtons(container);
  setupViewToggle(container);
}

document.addEventListener('DOMContentLoaded', loadCalendarEvents);
