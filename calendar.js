// ===== CALENDAR FUNCTIONALITY - UPCOMING RELEASES FROM RADARR/SONARR =====
async function loadCalendarEvents() {
  const container = document.getElementById('calendarContainer');
  
  if (!container) {
    console.warn('Calendar container not found');
    return;
  }

  try {
    // Fetch upcoming releases from backend
    const WORKER_URL = 'https://service-backend.jazeera21.workers.dev';
    const response = await fetch(`${WORKER_URL}/calendar`);
    const result = await response.json();

    if (result.success && result.upcoming && result.upcoming.length > 0) {
      const upcoming = result.upcoming.slice(0, 6); // Show top 6 upcoming
      
      let calendarHTML = '<div class="calendar-grid">';
      
      upcoming.forEach(item => {
        calendarHTML += `
          <div class="calendar-item">
            <h4>${item.title || 'Untitled'}</h4>
            <p><strong>Date:</strong> ${new Date(item.releaseDate).toLocaleDateString()}</p>
            <p><strong>Type:</strong> ${item.type || 'Unknown'}</p>
            ${item.year ? `<p><strong>Year:</strong> ${item.year}</p>` : ''}
          </div>
        `;
      });
      
      calendarHTML += '</div>';
      container.innerHTML = calendarHTML;
    } else {
      container.innerHTML = '<p style="text-align: center; color: var(--gray);">No upcoming releases available</p>';
    }
  } catch (error) {
    console.error('Error loading calendar:', error);
    container.innerHTML = '<p style="text-align: center; color: var(--gray);">Loading calendar...</p>';
  }
}

// Initialize calendar when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadCalendarEvents();
});
