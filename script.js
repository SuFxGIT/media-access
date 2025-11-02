/**
 * Media Access Website Script
 * Handles smooth scrolling, header effects, movie background animation, and VIP access
 */

// ===== VIP API CONFIGURATION =====
// Replace with your actual Cloudflare Worker URL
const VIP_API_URL = 'https://plex-vip-backend.jazeera21.workers.dev';

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

// ===== MOVIE BACKGROUND ANIMATION - PERFECT SMOOTH VERSION =====

/**
 * Loads movie posters from TMDB API and creates smooth scrolling background
 */
async function loadMovieBackground() {
  console.log('Loading movie background from TMDB...');
  
  const container = document.getElementById('movieBackground');
  
  if (!container) {
    console.error('movieBackground container not found!');
    return;
  }

  try {
    // Fetch multiple pages to get enough movies
    const pagesToFetch = 4; // Get more movies for variety
    const fetchPromises = [];
    
    for (let i = 1; i <= pagesToFetch; i++) {
      fetchPromises.push(
        fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${i}`)
          .then(response => response.json())
          .then(data => data.results)
      );
    }
    
    const allResults = await Promise.all(fetchPromises);
    const allMovies = allResults.flat();
    
    // Filter movies that have posters
    const moviesWithPosters = allMovies
      .filter(movie => movie.poster_path)
      .slice(0, 100); // Get more movies to avoid duplicates
    
    console.log(`Loaded ${moviesWithPosters.length} movies with posters from TMDB`);
    
    // Create perfect smooth rows
    createSmoothMovieRows(container, moviesWithPosters);
    
  } catch (error) {
    console.error('TMDB API failed:', error);
    useSmoothFallback(container);
  }
}

/**
 * Creates smooth scrolling movie poster rows for the background
 * @param {HTMLElement} container - The container element
 * @param {Array} movies - Array of movie objects with poster_path
 */
function createSmoothMovieRows(container, movies) {
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
    rowDiv.className = `movie-row row-${row + 1}`;
    
    // Create unique sequence for this row to avoid same movies next to each other
    const rowMovies = [];
    let usedIndices = new Set();
    
    // Fill the row with unique movies in random order
    for (let i = 0; i < postersPerRow; i++) {
      let randomIndex;
      let attempts = 0;
      
      // Ensure no duplicate movies next to each other
      do {
        randomIndex = Math.floor(Math.random() * movies.length);
        attempts++;
        
        // If we can't find a unique movie after many attempts, just use any
        if (attempts > 50) break;
      } while (usedIndices.has(randomIndex));
      
      usedIndices.add(randomIndex);
      rowMovies.push(movies[randomIndex]);
      
      // Reset used indices occasionally to allow repeats (but not adjacent)
      if (usedIndices.size > 20) {
        usedIndices = new Set();
      }
    }
    
    // Add posters to the row
    rowMovies.forEach((movie, index) => {
      const img = document.createElement('img');
      img.src = TMDB_IMAGE_BASE + movie.poster_path;
      img.alt = movie.title + ' Poster';
      img.className = 'movie-poster';
      
      img.onload = function() {
        if (index < 5) { // Only log first few to avoid console spam
          console.log(`Loaded: ${movie.title}`);
        }
      };
      
      img.onerror = function() {
        console.error(`Failed to load: ${movie.title}`);
        this.style.display = 'none';
      };
      
      rowDiv.appendChild(img);
    });
    
    container.appendChild(rowDiv);
  }
  
  console.log(`Created smooth rows with ${postersPerRow} posters each`);
}

/**
 * Fallback function if TMDB API fails
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
  
  const movies = fallbackPosters.map(poster => ({ 
    poster_path: poster, 
    title: 'Fallback Movie' 
  }));
  
  createSmoothMovieRows(container, movies);
}

// ===== VIP ACCESS FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
  const vipCheckBtn = document.getElementById('checkVipBtn');
  const vipCodeInput = document.getElementById('vipCodeInput');
  const vipMessage = document.getElementById('vipMessage');
  const vipPlans = document.getElementById('vipPlans');
  const regularPlans = document.getElementById('regularPlans');

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

    // Show loading state
    vipCheckBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    vipCheckBtn.disabled = true;

    try {
      const response = await fetch(VIP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vipCode })
      });

      const result = await response.json();

      if (result.success) {
        showVipMessage('🎉 VIP Access granted! Special pricing unlocked.', 'success');
        // Show VIP plans, hide regular plans
        vipPlans.style.display = 'grid';
        regularPlans.style.display = 'none';
        
        // Scroll to VIP plans
        vipPlans.scrollIntoView({ behavior: 'smooth' });
        
        // Store in session storage so VIP access persists during session
        sessionStorage.setItem('vipAccess', 'true');
      } else {
        showVipMessage(result.message, 'error');
      }
    } catch (error) {
      console.error('VIP check error:', error);
      showVipMessage('Error checking VIP code. Please try again.', 'error');
    } finally {
      // Reset button
      vipCheckBtn.innerHTML = '<i class="fas fa-star"></i> Check VIP Access';
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

  // Check if user already has VIP access in this session
  if (sessionStorage.getItem('vipAccess') === 'true') {
    if (vipPlans && regularPlans) {
      vipPlans.style.display = 'grid';
      regularPlans.style.display = 'none';
    }
  }
});

// ===== INITIALIZE WHEN PAGE LOADS =====
document.addEventListener('DOMContentLoaded', function() {
  loadMovieBackground();
  
  // Additional initialization can go here
  console.log('Media Access website initialized');
});