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

// Movie background animation - PERFECT LOOPING VERSION
async function loadMovieBackground() {
  console.log('Loading movie background from TMDB...');
  
  const container = document.getElementById('movieBackground');
  
  if (!container) {
    console.error('movieBackground container not found!');
    return;
  }

  try {
    // Fetch multiple pages to get enough movies
    const pagesToFetch = 4; // Get more pages for variety
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
    
    // Filter movies that have posters and get 50 unique ones
    const moviesWithPosters = allMovies
      .filter(movie => movie.poster_path)
      .slice(0, 50);
    
    console.log(`Loaded ${moviesWithPosters.length} movies with posters from TMDB`);
    
    // Create 5 rows with 10 posters each for denser coverage
    createMovieRow(container, moviesWithPosters.slice(0, 10), 'row-1', 'left');
    createMovieRow(container, moviesWithPosters.slice(10, 20), 'row-2', 'right');
    createMovieRow(container, moviesWithPosters.slice(20, 30), 'row-3', 'left');
    createMovieRow(container, moviesWithPosters.slice(30, 40), 'row-4', 'right');
    createMovieRow(container, moviesWithPosters.slice(40, 50), 'row-5', 'left');
    
    // Create duplicates for seamless looping
    createDuplicatePosters(container);
    
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

function createDuplicatePosters(container) {
  // Get all existing posters
  const posters = container.querySelectorAll('.movie-poster');
  
  // Create duplicates for seamless looping
  posters.forEach((poster, index) => {
    const duplicate = poster.cloneNode(true);
    duplicate.className += ' duplicate';
    
    // Position duplicates exactly one screen width ahead
    const currentLeft = poster.style.left;
    const currentRight = poster.style.right;
    
    if (currentLeft) {
      duplicate.style.left = `calc(${currentLeft} - 100vw)`;
    }
    if (currentRight) {
      duplicate.style.right = `calc(${currentRight} - 100vw)`;
    }
    
    duplicate.style.display = 'block';
    container.appendChild(duplicate);
  });
  
  console.log('Created duplicate posters for seamless looping');
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
    '/6oomZYQh4JYLo2C47gV8auMHW42.jpg',
    '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    '/7g7JQyZL1gJhdf1QjJzAUXiK4pS.jpg',
    '/gavyCu1UaTaTNPsVaGXT6pe5u24.jpg',
    '/t79ozwSzTn1AU8NkFpHpRPHr3ai.jpg'
  ];
  
  // Create rows with fallback posters
  createMovieRow(container, 
    fallbackPosters.slice(0, 10).map(poster => ({ poster_path: poster, title: 'Fallback Movie' })), 
    'row-1', 
    'left'
  );
  createMovieRow(container, 
    fallbackPosters.slice(0, 10).map(poster => ({ poster_path: poster, title: 'Fallback Movie' })), 
    'row-2', 
    'right'
  );
  
  // Create duplicates for fallback too
  createDuplicatePosters(container);
}

// Call when page loads
document.addEventListener('DOMContentLoaded', loadMovieBackground);