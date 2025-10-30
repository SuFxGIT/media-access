// Smooth scrolling for navigation links
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

// Header background on scroll
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 50) {
    header.style.background = 'rgba(10, 10, 10, 0.98)';
  } else {
    header.style.background = 'rgba(10, 10, 10, 0.95)';
  }
});

// Movie background animation with TMDB API and alternating rows
async function loadMovieBackground() {
  console.log('Loading movie background from TMDB...');
  
  const container = document.getElementById('movieBackground');
  
  if (!container) {
    console.error('movieBackground container not found!');
    return;
  }

  try {
    // TMDB API call to get popular movies
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    
    // Get 15 movies for 3 rows of 5 posters each
    const movies = data.results.slice(0, 15);
    
    // Create 3 rows with alternating directions
    createMovieRow(container, movies.slice(0, 5), 'top', 'left', 0);
    createMovieRow(container, movies.slice(5, 10), 'middle', 'right', 2);
    createMovieRow(container, movies.slice(10, 15), 'bottom', 'left', 4);
    
    console.log('Movie background loaded successfully with TMDB data');
    
  } catch (error) {
    console.error('TMDB API failed:', error);
    // Fallback to fixed images
    useFallbackPosters(container);
  }
}

function createMovieRow(container, movies, rowPosition, direction, delayMultiplier) {
  movies.forEach((movie, index) => {
    const img = new Image();
    img.src = TMDB_IMAGE_BASE + movie.poster_path;
    img.alt = movie.title + ' Poster';
    img.className = `movie-poster ${rowPosition}-row ${direction}-move`;
    img.style.animationDelay = `${(index + delayMultiplier) * 2}s`;
    
    img.onload = function() {
      console.log(`Loaded: ${movie.title}`);
    };
    
    img.onerror = function() {
      console.error(`Failed to load: ${movie.title}`);
      // If image fails, use a placeholder or skip
      this.style.display = 'none';
    };
    
    container.appendChild(img);
  });
}

function useFallbackPosters(container) {
  console.log('Using fallback posters');
  const fallbackPosters = [
    'https://image.tmdb.org/t/p/w780/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    'https://image.tmdb.org/t/p/w780/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    'https://image.tmdb.org/t/p/w780/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    'https://image.tmdb.org/t/p/w780/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    'https://image.tmdb.org/t/p/w780/6oomZYQh4JYLo2C47gV8auMHW42.jpg',
    'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    'https://image.tmdb.org/t/p/w780/7g7JQyZL1gJhdf1QjJzAUXiK4pS.jpg',
    'https://image.tmdb.org/t/p/w780/gavyCu1UaTaTNPsVaGXT6pe5u24.jpg',
    'https://image.tmdb.org/t/p/w780/t79ozwSzTn1AU8NkFpHpRPHr3ai.jpg',
    'https://image.tmdb.org/t/p/w780/8GJZECZfgPlLOfG2bKkfQw6Gtqi.jpg',
    'https://image.tmdb.org/t/p/w780/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg',
    'https://image.tmdb.org/t/p/w780/v28T5F1IygM8vXWZIycfNEm3xcL.jpg',
    'https://image.tmdb.org/t/p/w780/9dTO2RygcDT0cQkawABw4QkDegN.jpg',
    'https://image.tmdb.org/t/p/w780/fiVW06jE7z9YnO4trhaMEdclSiC.jpg'
  ];
  
  // Create 3 rows with alternating directions using fallback
  createFallbackRow(container, fallbackPosters.slice(0, 5), 'top', 'left', 0);
  createFallbackRow(container, fallbackPosters.slice(5, 10), 'middle', 'right', 2);
  createFallbackRow(container, fallbackPosters.slice(10, 15), 'bottom', 'left', 4);
}

function createFallbackRow(container, posters, rowPosition, direction, delayMultiplier) {
  posters.forEach((posterUrl, index) => {
    const img = new Image();
    img.src = posterUrl;
    img.alt = 'Movie Poster';
    img.className = `movie-poster ${rowPosition}-row ${direction}-move`;
    img.style.animationDelay = `${(index + delayMultiplier) * 2}s`;
    container.appendChild(img);
  });
}

// Call when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadMovieBackground();
});