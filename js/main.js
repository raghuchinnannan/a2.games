// Initialize Lenis smooth scrolling
const lenis = new Lenis({
    duration: 1.9,
    smooth: true,
    smoothTouch: false, // Disable smooth scrolling on touch devices for better performance
    touchMultiplier: 2,
});

// Create animation loop
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

// Start the animation loop
requestAnimationFrame(raf);

// Theme Toggle Functionality
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.mobileThemeToggle = document.getElementById('mobileThemeToggle');
        this.currentTheme = this.getStoredTheme() || 'dark';
        
        this.init();
    }
    
    init() {
        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Add event listeners
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        if (this.mobileThemeToggle) {
            this.mobileThemeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // console.log('Theme manager initialized with theme:', this.currentTheme);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.storeTheme(theme);
        
        // console.log('Theme changed to:', theme);
    }
    
    applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
    
    storeTheme(theme) {
        try {
            localStorage.setItem('a2games-theme', theme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }
    }
    
    getStoredTheme() {
        try {
            return localStorage.getItem('a2games-theme');
        } catch (e) {
            console.warn('Could not load theme preference:', e);
            return null;
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});

// Mobile menu functionality - Right side sliding drawer
document.addEventListener('DOMContentLoaded', function () {
    // console.log('DOM loaded, initializing mobile menu...');

    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');

    // Check if elements exist
    if (!mobileMenuToggle) {
        console.error('mobileMenuToggle not found!');
        return;
    }

    if (!mobileNav) {
        console.error('mobileNav not found!');
        return;
    }

    if (!mobileNavOverlay) {
        console.error('mobileNavOverlay not found!');
        return;
    }

    // console.log('Mobile menu elements found successfully');

    // Function to open menu
    function openMenu() {
        // console.log('Opening mobile menu...');
        mobileMenuToggle.classList.add('active');
        mobileNav.classList.add('active');
        mobileNavOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Function to close menu
    function closeMenu() {
        // console.log('Closing mobile menu...');
        mobileMenuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Add click event to hamburger button
    mobileMenuToggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        // console.log('Hamburger clicked!');

        const isActive = mobileNav.classList.contains('active');

        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when clicking overlay
    mobileNavOverlay.addEventListener('click', function () {
        // console.log('Overlay clicked, closing menu...');
        closeMenu();
    });

    // Close menu when clicking nav links
    const navLinks = document.querySelectorAll('.mobile-nav-link');
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            // console.log('Nav link clicked, closing menu...');
            closeMenu();
        });
    });

    // console.log('Mobile menu initialized successfully!');
});

// Smooth scroll for navigation links
document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#') && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                lenis.scrollTo(target, { offset: -80 });
            }
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    
    if (window.scrollY > 50) {
        if (isLightTheme) {
            header.style.background = 'rgba(248, 250, 252, 0.98)';
            header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(10, 11, 15, 0.95)';
            header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
        }
    } else {
        if (isLightTheme) {
            header.style.background = 'rgba(248, 250, 252, 0.9)';
        } else {
            header.style.background = 'rgba(10, 11, 15, 0.9)';
        }
        header.style.boxShadow = 'none';
    }
});

// Active nav link highlighting
function updateActiveNavLink() {
    const sections = ['games', 'about', 'contact'];
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    let currentSection = '';

    // Check if we're at the top of the page (home section)
    if (window.scrollY < window.innerHeight * 0.3) {
        currentSection = 'home';
    } else {
        // Find which section is currently in view
        let sectionFound = false;
        sections.forEach(sectionId => {
            if (sectionFound) return; // Skip if we already found an active section
            
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                // Improved detection with offset for games section
                const offset = sectionId === 'games' ? 200 : 150;
                if (rect.top <= offset && rect.bottom >= offset) {
                    currentSection = sectionId;
                    sectionFound = true;
                }
            }
        });
        
        // If no specific section found but we're past home, default to games
        if (!sectionFound && window.scrollY >= window.innerHeight * 0.3) {
            const gamesSection = document.getElementById('games');
            if (gamesSection) {
                currentSection = 'games';
            }
        }
    }

    // Update active states
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('active');

        if ((currentSection === 'home' && href === '#') ||
            href === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Smooth scroll for CTA button
document.querySelector('.btn-primary').addEventListener('click', (e) => {
    e.preventDefault();
    const gamesSection = document.querySelector('#games');
    lenis.scrollTo(gamesSection, { offset: -80 });
});

// Update active nav link on scroll
window.addEventListener('scroll', updateActiveNavLink);

// Hero entrance animations
document.addEventListener('DOMContentLoaded', () => {
    const heroElements = [
        '.hero-badge',
        '.hero h1',
        '.hero-subtitle',
        '.hero-cta',
        '.hero-stats'
    ];

    heroElements.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200 + 500);
        }
    });

    // Animate stats numbers
    setTimeout(() => {
        animateStats();
    }, 2000);
});

// Stats counter animation
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const text = stat.textContent;
        if (text === '∞') return; // Skip infinity symbol

        const finalNumber = parseInt(text.replace('+', '').replace('%', ''));
        if (isNaN(finalNumber)) return;

        let current = 0;
        const increment = finalNumber / 50;
        const suffix = text.includes('+') ? '+' : text.includes('%') ? '%' : '';

        const counter = setInterval(() => {
            current += increment;
            if (current >= finalNumber) {
                stat.textContent = finalNumber + suffix;
                clearInterval(counter);
            } else {
                stat.textContent = Math.floor(current) + suffix;
            }
        }, 30);
    });
}

// Intersection Observer for card animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, observerOptions);

// Initial setup for cards
document.addEventListener('DOMContentLoaded', () => {
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        // Set up card animations
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);

        // Set up background image
        const imageContainer = card.querySelector('.game-card-image-container');
        const img = imageContainer.querySelector('img');
        if (img) {
            imageContainer.style.setProperty('--bg-image', `url(${img.src})`);
        }

        // Make entire card clickable
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on an interactive element
            if (!e.target.closest('a, button')) {
                const playNowLink = card.querySelector('.play-now');
                if (playNowLink) {
                    playNowLink.click();
                }
            }
        });
    });
});

// Enhanced hover effects for individual cards
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        // Add subtle vibration effect
        card.style.animation = 'subtle-shake 0.1s ease-in-out';
    });

    card.addEventListener('mouseleave', () => {
        card.style.animation = '';
    });
});

// Add CSS for the subtle shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes subtle-shake {
        0%, 100% { transform: translateY(-12px) scale(1.02); }
        50% { transform: translateY(-12px) scale(1.02) translateX(1px); }
    }
`;
document.head.appendChild(style);
