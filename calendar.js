// ===== CALENDAR FUNCTIONALITY - UPCOMING RELEASES FROM RADARR/SONARR =====
const WORKER_URL = 'https://service-backend.jazeera21.workers.dev';

async function loadCalendarEvents() {
  const container = document.getElementById('calendarContainer');
  
  if (!container) {
    console.warn('Calendar container not found');
    return;
  }

  try {
    // Fetch upcoming releases from backend /calendar endpoint
    const response = await fetch(`${WORKER_URL}/calendar`);
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();

    if (result.success && result.upcoming && result.upcoming.length > 0) {
      const upcoming = result.upcoming.slice(0, 12); // Show up to 12 upcoming items
      
      let calendarHTML = '<div class="calendar-grid">';
      
      upcoming.forEach(item => {
        const date = new Date(item.releaseDate);
        const formattedDate = date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        calendarHTML += `
          <div class="calendar-item">
            <h4>${item.title || 'Untitled'}</h4>
            <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
            <p><i class="fas fa-tag"></i> ${item.type || 'Unknown'}</p>
            ${item.year ? `<p><i class="fas fa-cog"></i> ${item.year}</p>` : ''}
          </div>
        `;
      });
      
      calendarHTML += '</div>';
      container.innerHTML = calendarHTML;
    } else {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <p style="color: var(--gray); font-size: 1.1rem;">
            <i class="fas fa-inbox"></i> No upcoming releases available yet
          </p>
          <p style="color: var(--gray); font-size: 0.9rem; margin-top: 10px;">
            Check back soon for new content
          </p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading calendar:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <p style="color: var(--gray); font-size: 1.1rem;">
          <i class="fas fa-exclamation-circle"></i> Unable to load upcoming releases
        </p>
        <p style="color: var(--gray); font-size: 0.9rem; margin-top: 10px;">
          ${error.message}
        </p>
      </div>
    `;
  }
}

// Initialize calendar when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadCalendarEvents();
});
