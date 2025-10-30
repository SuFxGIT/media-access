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

// Movie background animation with TMDB API - PROFESSIONAL VERSION
async function loadMovieBackground() {
  console.log('Loading movie background from TMDB...');
  
  const container = document.getElementById('movieBackground');
  
  if (!container) {
    console.error('movieBackground container not found!');
    return;
  }

  try {
    // TMDB API call to get popular movies - get 60 movies
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    
    // Get 60 movies for 6 rows of 10 posters each
    const movies = data.results.slice(0, 60);
    
    // Create 6 dense rows with alternating directions
    createMovieRow(container, movies.slice(0, 10), 'row-1', 'left');
    createMovieRow(container, movies.slice(10, 20), 'row-2', 'right');
    createMovieRow(container, movies.slice(20, 30), 'row-3', 'left');
    createMovieRow(container, movies.slice(30, 40), 'row-4', 'right');
    createMovieRow(container, movies.slice(40, 50), 'row-5', 'left');
    createMovieRow(container, movies.slice(50, 60), 'row-6', 'right');
    
    console.log('Movie background loaded successfully with 60 TMDB movies');
    
  } catch (error) {
    console.error('TMDB API failed:', error);
    // Fallback to fixed images
    useFallbackPosters(container);
  }
}

function createMovieRow(container, movies, rowPosition, direction) {
  movies.forEach((movie, index) => {
    // Skip if no poster path
    if (!movie.poster_path) return;
    
    const img = new Image();
    img.src = TMDB_IMAGE_BASE + movie.poster_path;
    img.alt = movie.title + ' Poster';
    img.className = `movie-poster ${rowPosition} ${direction}-move`;
    
    img.onload = function() {
      console.log(`Loaded: ${movie.title}`);
    };
    
    img.onerror = function() {
      console.error(`Failed to load: ${movie.title}`);
      this.style.display = 'none';
    };
    
    container.appendChild(img);
  });
}

// Call when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadMovieBackground();
});