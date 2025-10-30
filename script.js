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

// Movie background animation with TMDB API - FIXED VERSION
async function loadMovieBackground() {
  console.log('Loading movie background from TMDB...');
  
  const container = document.getElementById('movieBackground');
  
  if (!container) {
    console.error('movieBackground container not found!');
    return;
  }

  try {
    // Get multiple pages to get enough movies
    const [page1, page2, page3] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`),
      fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=2`),
      fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=3`)
    ]);
    
    const data1 = await page1.json();
    const data2 = await page2.json();
    const data3 = await page3.json();
    
    // Combine movies from all pages and filter out ones without posters
    const allMovies = [...data1.results, ...data2.results, ...data3.results];
    const moviesWithPosters = allMovies.filter(movie => movie.poster_path).slice(0, 32);
    
    console.log(`Loaded ${moviesWithPosters.length} movies with posters`);
    
    // Create 4 rows with 8 posters each
    createMovieRow(container, moviesWithPosters.slice(0, 8), 'row-1', 'left');
    createMovieRow(container, moviesWithPosters.slice(8, 16), 'row-2', 'right');
    createMovieRow(container, moviesWithPosters.slice(16, 24), 'row-3', 'left');
    createMovieRow(container, moviesWithPosters.slice(24, 32), 'row-4', 'right');
    
  } catch (error) {
    console.error('TMDB API failed:', error);
    useFallbackPosters(container);
  }
}

function createMovieRow(container, movies, rowPosition, direction) {
  movies.forEach((movie, index) => {
    const img = new Image();
    img.src = TMDB_IMAGE_BASE + movie.poster_path;
    img.alt = movie.title + ' Poster';
    img.className = `movie-poster ${rowPosition} ${direction}-move`;
    
    img.onload = function() {
      console.log(`Loaded: ${movie.title}`);
    };
    
    container.appendChild(img);
  });
}

function useFallbackPosters(container) {
  console.log('Using fallback posters');
  // Fallback implementation here...
}

