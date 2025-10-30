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

// Movie background animation - FIXED SIZE GUARANTEED VERSION
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
    
    // Create the movie grid with fixed sizes
    createFixedSizeMovieGrid(container, moviesWithPosters);
    
  } catch (error) {
    console.error('TMDB API failed:', error);
    useFallbackFixedGrid(container);
  }
}

function createFixedSizeMovieGrid(container, movies) {
  // Clear container
  container.innerHTML = '';
  
  // Create 5 rows
  for (let row = 0; row < 5; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = `movie-row row-${row + 1}`;
    
    // Add 8 posters to this row (original set)
    for (let i = 0; i < 8; i++) {
      const movieIndex = row * 8 + i;
      if (movieIndex < movies.length) {
        addPosterToRow(rowDiv, movies[movieIndex]);
      }
    }
    
    // DUPLICATE the same 8 posters 3 more times for continuous coverage
    // This ensures wide screens are always filled
    for (let duplicateSet = 0; duplicateSet < 3; duplicateSet++) {
      for (let i = 0; i < 8; i++) {
        const movieIndex = row * 8 + i;
        if (movieIndex < movies.length) {
          addPosterToRow(rowDiv, movies[movieIndex]);
        }
      }
    }
    
    container.appendChild(rowDiv);
  }
  
  console.log('Created fixed-size movie grid with continuous coverage');
}

function addPosterToRow(rowDiv, movie) {
  const img = document.createElement('img');
  img.src = TMDB_IMAGE_BASE + movie.poster_path;
  img.alt = movie.title + ' Poster';
  img.className = 'movie-poster';
  
  img.onload = function() {
    console.log(`Loaded: ${movie.title}`);
  };
  
  img.onerror = function() {
    console.error(`Failed to load: ${movie.title}`);
    this.style.display = 'none';
  };
  
  rowDiv.appendChild(img);
}

function useFallbackFixedGrid(container) {
  console.log('Using fallback fixed grid');
  const fallbackPosters = [
    '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    '/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    '/6oomZYQh4JYLo2C47gV8auMHW42.jpg',
    '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    '/7g7JQyZL1gJhdf1QjJzAUXiK4pS.jpg'
  ];
  
  const movies = fallbackPosters.map(poster => ({ 
    poster_path: poster, 
    title: 'Fallback Movie' 
  }));
  
  createFixedSizeMovieGrid(container, movies);
}