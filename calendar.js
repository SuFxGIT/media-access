// ===== MONTHLY CALENDAR — UPCOMING RELEASES FROM RADARR/SONARR =====
const CAL_API = 'https://service-backend.jazeera21.workers.dev';

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

  container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--gray);"><i class="fas fa-spinner fa-spin"></i> Loading calendar...</p>';

  try {
    const response = await fetch(`${CAL_API}/calendar`);

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
      ? `<div class="cal-event-more">+${events.length - 2} more</div>`
      : '';

    html += `
      <div class="${cls}">
        <span class="cal-day-num">${day}</span>
        ${events.length > 0 ? `<div class="cal-events">${pills}${moreLabel}</div>` : ''}
      </div>`;
  }

  html += '</div></div>'; // close cal-grid + calendar-wrapper

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
}

document.addEventListener('DOMContentLoaded', loadCalendarEvents);

