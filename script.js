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

// Movie background animation
async function loadMovieBackground() {
  // Fallback posters if TMDB API fails
  const fallbackPosters = [
    'https://image.tmdb.org/t/p/w780/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    'https://image.tmdb.org/t/p/w780/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    'https://image.tmdb.org/t/p/w780/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    'https://image.tmdb.org/t/p/w780/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg'
  ];
  
  const container = document.getElementById('movieBackground');
  
  try {
    // TMDB API call to get popular movies
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    const posters = data.results.slice(0, 5).map(movie => TMDB_IMAGE_BASE + movie.poster_path);
    
    posters.forEach((posterUrl, index) => {
      const img = document.createElement('img');
      img.src = posterUrl;
      img.alt = 'Movie Poster';
      img.className = 'movie-poster';
      img.style.animationDelay = `${index * 3}s`;
      container.appendChild(img);
    });
    
  } catch (error) {
    console.log('TMDB API failed, using fallback posters');
    fallbackPosters.forEach((posterUrl, index) => {
      const img = document.createElement('img');
      img.src = posterUrl;
      img.alt = 'Movie Poster';
      img.className = 'movie-poster';
      img.style.animationDelay = `${index * 3}s`;
      container.appendChild(img);
    });
  }
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', loadMovieBackground);