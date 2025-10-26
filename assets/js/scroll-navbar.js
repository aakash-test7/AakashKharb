/**
 * Scroll Navbar - Appears when scrolling down
 * Shows translucent navbar with smooth transitions
 */

document.addEventListener('DOMContentLoaded', function() {
    const scrollNavbar = document.querySelector('.scroll-navbar');
    let lastScrollTop = 0;
    const scrollThreshold = 300; // Show navbar after scrolling 300px

    if (!scrollNavbar) {
        console.warn('Scroll navbar element not found');
        return;
    }

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Show navbar when scrolled past threshold
        if (scrollTop > scrollThreshold) {
            scrollNavbar.classList.add('visible');
        } else {
            scrollNavbar.classList.remove('visible');
        }

        lastScrollTop = scrollTop;
    }, { passive: true });

    // Smooth scroll behavior for new content (excluding hero section)
    const sections = document.querySelectorAll('#main section');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.15
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        // Skip tech-showcase as it has its own animation
        if (!section.classList.contains('tech-showcase-section')) {
            section.classList.add('section-fade-in');
            sectionObserver.observe(section);
        }
    });
});
