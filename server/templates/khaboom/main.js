// Kha-Boom! Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    if (categoryTabs.length) {
      categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
          categoryTabs.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          // In a real implementation, this would filter courses by category
        });
      });
    }
  
    // Animate elements on scroll
    const animateOnScroll = function() {
      const elements = document.querySelectorAll('.feature-card, .testimonial-card, .course-card');
      
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    };
  
    // Set initial styles for animation
    const elementsToAnimate = document.querySelectorAll('.feature-card, .testimonial-card, .course-card');
    elementsToAnimate.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
  
    // Run animation on load and scroll
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on initial load
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        this.classList.toggle('active');
      });
    }
  });
  