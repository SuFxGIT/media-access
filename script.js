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

// Movie background animation - PERFECT SPACING VERSION
function loadMovieBackground() {
  console.log('Loading movie background...');
  
  const container = document.getElementById('movieBackground');
  
  if (!container) {
    console.error('movieBackground container not found!');
    return;
  }

  // 40 unique movie posters
  const posters = [
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
    'https://image.tmdb.org/t/p/w780/fiVW06jE7z9YnO4trhaMEdclSiC.jpg',
    'https://image.tmdb.org/t/p/w780/5M7oN3sznp99hWYQ9sX0xheswHX.jpg',
    'https://image.tmdb.org/t/p/w780/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
    'https://image.tmdb.org/t/p/w780/zCjZfevTb85scn2vqXhR3c6olf2.jpg',
    'https://image.tmdb.org/t/p/w780/8x21f7GCA1cFCTSE6LxgRgcJNuZ.jpg',
    'https://image.tmdb.org/t/p/w780/5mzr6JZbrqnqD8rCEvPhuCE5Fw2.jpg',
    'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    'https://image.tmdb.org/t/p/w780/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    'https://image.tmdb.org/t/p/w780/tFRdoLhm7TrtG1a7cs1w1q1Q3WW.jpg',
    'https://image.tmdb.org/t/p/w780/p69QzIBbN04fx2eN2N6wKXaCewT.jpg',
    'https://image.tmdb.org/t/p/w780/8riQeSTU9V7gZKgv4yg4pV7n2h.jpg',
    'https://image.tmdb.org/t/p/w780/5M7oN3sznp99hWYQ9sX0xheswHX.jpg',
    'https://image.tmdb.org/t/p/w780/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
    'https://image.tmdb.org/t/p/w780/zCjZfevTb85scn2vqXhR3c6olf2.jpg',
    'https://image.tmdb.org/t/p/w780/8x21f7GCA1cFCTSE6LxgRgcJNuZ.jpg',
    'https://image.tmdb.org/t/p/w780/5mzr6JZbrqnqD8rCEvPhuCE5Fw2.jpg',
    'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    'https://image.tmdb.org/t/p/w780/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    'https://image.tmdb.org/t/p/w780/tFRdoLhm7TrtG1a7cs1w1q1Q3WW.jpg',
    'https://image.tmdb.org/t/p/w780/p69QzIBbN04fx2eN2N6wKXaCewT.jpg',
    'https://image.tmdb.org/t/p/w780/8riQeSTU9V7gZKgv4yg4pV7n2h.jpg',
    'https://image.tmdb.org/t/p/w780/5M7oN3sznp99hWYQ9sX0xheswHX.jpg',
    'https://image.tmdb.org/t/p/w780/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
    'https://image.tmdb.org/t/p/w780/zCjZfevTb85scn2vqXhR3c6olf2.jpg',
    'https://image.tmdb.org/t/p/w780/8x21f7GCA1cFCTSE6LxgRgcJNuZ.jpg',
    'https://image.tmdb.org/t/p/w780/5mzr6JZbrqnqD8rCEvPhuCE5Fw2.jpg'
  ];
  
  // Create 5 rows with 8 posters each (40 total)
  createRow(container, posters.slice(0, 8), 'row-1', 'left');
  createRow(container, posters.slice(8, 16), 'row-2', 'right');
  createRow(container, posters.slice(16, 24), 'row-3', 'left');
  createRow(container, posters.slice(24, 32), 'row-4', 'right');
  createRow(container, posters.slice(32, 40), 'row-5', 'left');
  
  console.log('Movie background loaded with 40 posters');
}

function createRow(container, posters, rowClass, direction) {
  posters.forEach((posterUrl, index) => {
    const img = new Image();
    img.src = posterUrl;
    img.alt = 'Movie Poster';
    img.className = `movie-poster ${rowClass} ${direction}-move`;
    
    img.onload = function() {
      console.log(`Loaded poster ${index + 1}`);
    };
    
    container.appendChild(img);
  });
}

// Call when page loads
document.addEventListener('DOMContentLoaded', loadMovieBackground);