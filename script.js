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

// Movie background animation - SIMPLIFIED VERSION
function loadMovieBackground() {
  console.log('Loading movie background...');
  
  const container = document.getElementById('movieBackground');
  
  if (!container) {
    console.error('movieBackground container not found!');
    return;
  }

  // Use direct image URLs (no API)
  const posters = [
    'https://image.tmdb.org/t/p/w780/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', // Avengers
    'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', // Batman
    'https://image.tmdb.org/t/p/w780/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', // Titanic
    'https://image.tmdb.org/t/p/w780/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg', // Avatar
    'https://image.tmdb.org/t/p/w780/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg'   // Matrix
  ];
  
  posters.forEach((posterUrl, index) => {
    const img = document.createElement('img');
    img.src = posterUrl;
    img.alt = 'Movie Poster';
    img.className = 'movie-poster';
    img.style.animationDelay = `${index * 3}s`;
    container.appendChild(img);
    console.log(`Added poster ${index + 1}`);
  });
  
  console.log('All posters added');
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', loadMovieBackground);