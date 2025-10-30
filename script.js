// Mobile menu toggle
document.querySelector('.mobile-menu').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('active');
});

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
      
      // Close mobile menu if open
      document.querySelector('.nav-links').classList.remove('active');
    }
  });
});

// Header background on scroll
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 100) {
    header.style.background = 'rgba(10, 10, 10, 0.95)';
  } else {
    header.style.background = 'rgba(10, 10, 10, 0.9)';
  }
});