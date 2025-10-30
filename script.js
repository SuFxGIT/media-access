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

// Movie background animation - PERFECT SMOOTH VERSION
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

function createSmoothMovieRows(container, movies) {
  // Clear container
  container.innerHTML = '';
  
  // Calculate how many posters we need for smooth looping
  const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const posterWidth = 140; // Match CSS
  const gap = 15; // Match CSS
  const postersPerScreen = Math.ceil(viewportWidth / (posterWidth + gap));
  const postersPerRow = postersPerScreen * 4; // 4 screens worth for seamless looping
  
  // Create 5 rows with alternating directions
  for (let row = 0; row < 5; row++) {
    const rowDiv = document.createElement('div');
    
    // Set direction class based on row number (1,3,5 = left, 2,4 = right)
    const directionClass = (row + 1) % 2 === 0 ? 'right-move' : 'left-move';
    rowDiv.className = `movie-row row-${row + 1} ${directionClass}`;
    
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
  
  console.log(`Created smooth rows with ${postersPerRow} posters each, alternating directions`);
}

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

// Call when page loads
document.addEventListener('DOMContentLoaded', loadMovieBackground);