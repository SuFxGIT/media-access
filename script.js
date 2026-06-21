/**
 * Site Script
 * Handles smooth scrolling, header effects, background animation, and VIP access
 */

// ===== API CONFIGURATION =====
const WORKER_URL = 'https://service-backend.jazeera21.workers.dev';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w780';

// ===== SMOOTH SCROLLING FOR NAVIGATION LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ===== HEADER BACKGROUND ON SCROLL =====
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 50) {
    header.style.background = 'rgba(10, 10, 10, 0.98)';
  } else {
    header.style.background = 'rgba(10, 10, 10, 0.95)';
  }
});

// ===== BACKGROUND ANIMATION - PERFECT SMOOTH VERSION =====

/**
 * Loads visual items from backend and creates smooth scrolling background
 */
async function loadBackground() {
  console.log('Loading visual background from backend...');
  
  const container = document.getElementById('visualBackground');
  
  if (!container) {
    console.error('visualBackground container not found!');
    return;
  }

  try {
    const response = await fetch(`${WORKER_URL}/items`);
    const result = await response.json();
    
    if (result.success && result.items && result.items.length > 0) {
      console.log(`Loaded ${result.items.length} items from backend`);
      createSmoothRows(container, result.items);
    } else {
      useSmoothFallback(container);
    }
  } catch (error) {
    console.error('Backend load failed:', error);
    useSmoothFallback(container);
  }
}

/**
 * Creates smooth scrolling rows for the background
 * @param {HTMLElement} container - The container element
 * @param {Array} items - Array of item objects with poster_path
 */
function createSmoothRows(container, items) {
  // Clear container
  container.innerHTML = '';
  
  // Calculate how many posters we need for smooth looping
  const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const posterWidth = 140; // Match CSS
  const gap = 15; // Match CSS
  const postersPerScreen = Math.ceil(viewportWidth / (posterWidth + gap));
  const postersPerRow = postersPerScreen * 4; // 4 screens worth for seamless looping
  
  // Create 5 rows
  for (let row = 0; row < 5; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = `visual-row row-${row + 1}`;
    
    // Create unique sequence for this row with no adjacent duplicates
    const rowItems = [];
    let lastItemId = null;
    
    // Fill the row ensuring no two adjacent items are the same
    for (let i = 0; i < postersPerRow; i++) {
      let randomItem;
      let attempts = 0;
      
      do {
        const randomIndex = Math.floor(Math.random() * items.length);
        randomItem = items[randomIndex];
        attempts++;
        
        if (attempts > 30) break;
      } while (randomItem.id === lastItemId);
      
      rowItems.push(randomItem);
      lastItemId = randomItem.id;
    }
    
    // Add images to the row
    rowItems.forEach((item, index) => {
      const img = document.createElement('img');
      img.src = TMDB_IMAGE_BASE + item.poster_path;
      img.alt = item.title + ' Poster';
      img.className = 'visual-poster';
      img.loading = 'lazy';
      
      img.onload = function() {
        if (index < 5) {
          console.log(`Loaded: ${item.title}`);
        }
      };
      
      img.onerror = function() {
        console.error(`Failed to load: ${item.title}`);
        this.style.display = 'none';
      };
      
      rowDiv.appendChild(img);
    });
    
    container.appendChild(rowDiv);
  }
  
  console.log(`Created ${postersPerRow} items per row with no adjacent duplicates`);
}

/**
 * Fallback function if backend API fails
 * @param {HTMLElement} container - The container element
 */
function useSmoothFallback(container) {
  console.log('Using smooth fallback');
  const fallbackPosters = [
    '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    '/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    '/6oomZYQh4JYLo2C47gV8auMHW42.jpg',
    '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    '/7g7JQyZL1gJhdf1QjJzAUXiK4pS.jpg',
    '/gavyCu1UaTaTNPsVaGXT6pe5u24.jpg',
    '/t79ozwSzTn1AU8NkFpHpRPHr3ai.jpg',
    '/8GJZECZfgPlLOfG2bKkfQw6Gtqi.jpg',
    '/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg',
    '/v28T5F1IygM8vXWZIycfNEm3xcL.jpg',
    '/9dTO2RygcDT0cQkawABw4QkDegN.jpg',
    '/fiVW06jE7z9YnO4trhaMEdclSiC.jpg',
    '/5M7oN3sznp99hWYQ9sX0xheswHX.jpg'
  ];
  
  const items = fallbackPosters.map(poster => ({ 
    poster_path: poster, 
    title: 'Fallback Item' 
  }));
  
  createSmoothRows(container, items);
}

// ===== VIP ACCESS FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
  const vipCheckBtn = document.getElementById('checkVipBtn');
  const vipCodeInput = document.getElementById('vipCodeInput');
  const vipMessage = document.getElementById('vipMessage');

  // Initialize VIP functionality if elements exist
  if (vipCheckBtn && vipCodeInput) {
    vipCheckBtn.addEventListener('click', checkVipAccess);
    
    // Also allow Enter key to submit
    vipCodeInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        checkVipAccess();
      }
    });
  }

  async function checkVipAccess() {
    const vipCode = vipCodeInput.value.trim();
    
    if (!vipCode) {
      showVipMessage('Please enter a VIP code', 'error');
      return;
    }

    vipCheckBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    vipCheckBtn.disabled = true;

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({vipCode})
      });

      const result = await response.json();

      if (result.success) {
        showVipMessage('✅ VIP access verified! Redirecting...', 'success');
        
        // Set session storage and redirect
        sessionStorage.setItem('vipAccess', 'true');
        setTimeout(() => {
          window.location.href = 'vip-offers.html';
        }, 1500);
        
      } else {
        showVipMessage('Invalid VIP code', 'error');
      }
    } catch (error) {
      showVipMessage('Error verifying code', 'error');
    } finally {
      vipCheckBtn.innerHTML = '<i class="fas fa-unlock"></i> Verify Access';
      vipCheckBtn.disabled = false;
    }
  }

  function showVipMessage(message, type) {
    if (vipMessage) {
      vipMessage.textContent = message;
      vipMessage.className = `vip-message ${type}`;
      vipMessage.style.display = 'block';
    }
  }
});

// ===== INITIALIZE WHEN PAGE LOADS =====
document.addEventListener('DOMContentLoaded', function() {
  // loadBackground(); // TMDB poster background disabled
  fetchServiceStats(); // ← ADD THIS LINE
  
  // Additional initialization can go here
  console.log('Site initialized');
});

// ===== COMPACT BENEFITS TOGGLE FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
  const benefitsToggle = document.querySelector('.benefits-toggle-btn');
  const dropdownContent = document.querySelector('.dropdown-content');
  
  if (benefitsToggle && dropdownContent) {
    benefitsToggle.addEventListener('click', function() {
      const isActive = dropdownContent.classList.contains('show');
      
      if (isActive) {
        dropdownContent.classList.remove('show');
        benefitsToggle.classList.remove('active');
        benefitsToggle.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
        benefitsToggle.innerHTML = '<i class="fas fa-info-circle"></i> View Subscription Benefits <i class="fas fa-chevron-down"></i>';
      } else {
        dropdownContent.classList.add('show');
        benefitsToggle.classList.add('active');
        benefitsToggle.querySelector('.fa-chevron-down').style.transform = 'rotate(180deg)';
        benefitsToggle.innerHTML = '<i class="fas fa-info-circle"></i> Hide Benefits <i class="fas fa-chevron-down"></i>';
      }
    });
    
    // Add chevron transition
    const chevron = benefitsToggle.querySelector('.fa-chevron-down');
    if (chevron) {
      chevron.style.transition = 'transform 0.3s ease';
    }
  }
});

// Mobile menu toggle - simple and functional
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  const mobileBackdrop = document.querySelector('.mobile-backdrop');
  
  function openMenu() {
    mobileMenu.classList.add('active');
    if (mobileBackdrop) mobileBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('active');
    if (mobileBackdrop) mobileBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn && mobileMenu) {
    // Click hamburger to open
    mobileMenuBtn.addEventListener('click', openMenu);
    
    // Click X to close
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', closeMenu);
    }
    
    // Click backdrop to close
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', closeMenu);
    }
    
    // Close menu when clicking on links
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMenu();
      }
    });
  }
});

async function fetchServiceStats() {
  try {
    console.log('Fetching service stats from:', `${WORKER_URL}/service-stats`);
    
    const response = await fetch(`${WORKER_URL}/service-stats`);
    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('Full API Response:', result);
    
    if (result.success) {
      const stats = result.stats || result.libraries || {};
      console.log('Stats received:', stats);
      
      // Only animate if we have real numbers
      if ((stats.items && stats.items > 0) || (stats.series && stats.series > 0) || (stats.totalItems && stats.totalItems > 0)) {
        animateCounter('movieCount', stats.items || 0);
        animateCounter('showCount', stats.series || 0);
        animateCounter('animeCount', stats.anime || 0);
        animateCounter('animatedCount', stats.animated || 0);
        animateCounter('episodeCount', stats.totalItems || stats.totalEpisodes || 0);
      } else {
        console.log('No real data received, showing zeros');
      }
    } else {
      console.log('API returned success: false with error:', result.error);
    }
  } catch (error) {
    console.error('Error fetching service stats:', error);
  }
}

function animateCounter(elementId, target) {
  const element = document.getElementById(elementId);
  let current = 0;
  const increment = target / 30; // Faster animation
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 20);
}