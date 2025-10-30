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

// Movie background animation - TMDB API VERSION
async function loadMovieBackground() {
  console.log('Loading movie background from TMDB...');
  
  const container = document.getElementById('movieBackground');
  
  if (!container) {
    console.error('movieBackground container not found!');
    return;
  }

  try {
    // Fetch multiple pages to get enough movies
    const pagesToFetch = 3;
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
    
    // Filter movies that have posters and get 40 unique ones
    const moviesWithPosters = allMovies
      .filter(movie => movie.poster_path)
      .slice(0, 40);
    
    console.log(`Loaded ${moviesWithPosters.length} movies with posters from TMDB`);
    
    // Create 5 rows with 8 posters each
    createMovieRow(container, moviesWithPosters.slice(0, 8), 'row-1', 'left');
    createMovieRow(container, moviesWithPosters.slice(8, 16), 'row-2', 'right');
    createMovieRow(container, moviesWithPosters.slice(16, 24), 'row-3', 'left');
    createMovieRow(container, moviesWithPosters.slice(24, 32), 'row-4', 'right');
    createMovieRow(container, moviesWithPosters.slice(32, 40), 'row-5', 'left');
    
  } catch (error) {
    console.error('TMDB API failed:', error);
    useFallbackPosters(container);
  }
}

function createMovieRow(container, movies, rowClass, direction) {
  movies.forEach((movie, index) => {
    const img = new Image();
    img.src = TMDB_IMAGE_BASE + movie.poster_path;
    img.alt = movie.title + ' Poster';
    img.className = `movie-poster ${rowClass} ${direction}-move`;
    
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

function useFallbackPosters(container) {
  console.log('Using fallback posters');
  // Simple fallback with a few popular movies
  const fallbackPosters = [
    '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    '/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    '/6oomZYQh4JYLo2C47gV8auMHW42.jpg'
  ];
  
  // Create at least one row with fallback posters
  createMovieRow(container, 
    fallbackPosters.map(poster => ({ poster_path: poster, title: 'Fallback Movie' })), 
    'row-1', 
    'left'
  );
}

// Call when page loads
document.addEventListener('DOMContentLoaded', loadMovieBackground);