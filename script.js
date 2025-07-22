// Smart navbar scroll effect with customized delay times
function initializeScrollEffect() {
    const navbar = document.querySelector('.navbar');
    let scrollTimeout;
    let lastScrollTop = 0;
    let isScrolling = false;
    
    // Timing constants for different scroll behaviors
    const SCROLL_UP_DELAY = 1500;    // 往上滚动后1.5秒隐藏
    const SCROLL_DOWN_DELAY = 1500;  // 往下滚动后3秒隐藏
    const HOVER_LEAVE_DELAY = 1000;  // 鼠标离开后1秒隐藏
    
    // Function to show navbar
    function showNavbar() {
        navbar.style.transform = 'translateY(0)';
        navbar.style.opacity = '1';
    }
    
    // Function to hide navbar
    function hideNavbar() {
        navbar.style.transform = 'translateY(-100%)';
        navbar.style.opacity = '0';
    }
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Clear previous timeout
        clearTimeout(scrollTimeout);
        
        // Calculate scroll direction
        const scrollingDown = scrollTop > lastScrollTop;
        const scrollingUp = scrollTop < lastScrollTop;
        
        // Always show navbar when at top of page (first 50px)
        if (scrollTop <= 50) {
            showNavbar();
            navbar.classList.remove('scrolled');
        } else {
            navbar.classList.add('scrolled');
            
            // Control navbar visibility based on scroll direction
            if (scrollingUp) {
                // Scrolling up - immediately show navbar
                showNavbar();
                
                // Set 1.5 second timer for up scroll
                scrollTimeout = setTimeout(() => {
                    if (scrollTop > 50) {
                        hideNavbar();
                    }
                }, SCROLL_UP_DELAY);
                
            } else if (scrollingDown) {
                // Scrolling down - keep navbar visible for longer
                showNavbar();
                
                // Set 3 second timer for down scroll
                scrollTimeout = setTimeout(() => {
                    if (scrollTop > 50) {
                        hideNavbar();
                    }
                }, SCROLL_DOWN_DELAY);
            }
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Show navbar when mouse hovers over it and cancel hide timer
    navbar.addEventListener('mouseenter', function() {
        clearTimeout(scrollTimeout);
        showNavbar();
    });
    
    // Reset hide timer when mouse leaves navbar
    navbar.addEventListener('mouseleave', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 50) {
            scrollTimeout = setTimeout(() => {
                hideNavbar();
            }, HOVER_LEAVE_DELAY);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize smart scroll effect first
    initializeScrollEffect();
    
    // Check if this is the homepage or not
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === '/' || 
                       window.location.pathname.endsWith('/');
    
    /* FLOATING MENU FUNCTIONALITY - Hover and click support */
    function initializeFloatingMenu() {
        const menuContainer = document.querySelector('.floating-menu-container');
        const menuTrigger = document.querySelector('.floating-menu-trigger');
        const menuDropdown = document.querySelector('.floating-menu-dropdown');
        
        if (menuContainer && menuTrigger && menuDropdown) {
            let isMenuOpen = false;
            let hoverTimeout;
            
            // Hover enter - auto show
            menuContainer.addEventListener('mouseenter', function() {
                clearTimeout(hoverTimeout);
                isMenuOpen = true;
                menuContainer.classList.add('active');
                menuTrigger.classList.add('active');
            });
            
            // Hover leave - delayed hide
            menuContainer.addEventListener('mouseleave', function() {
                isMenuOpen = false;
                // Add small delay to avoid flickering when mouse moves quickly
                hoverTimeout = setTimeout(() => {
                    if (!isMenuOpen) {
                        menuContainer.classList.remove('active');
                        menuTrigger.classList.remove('active');
                    }
                }, 200); // 200ms delay
            });
            
            // Keep click functionality as backup (especially for mobile)
            menuTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // If mobile or user prefers clicking
                if (window.innerWidth <= 768) {
                    isMenuOpen = !isMenuOpen;
                    
                    if (isMenuOpen) {
                        menuContainer.classList.add('active');
                        menuTrigger.classList.add('active');
                    } else {
                        menuContainer.classList.remove('active');
                        menuTrigger.classList.remove('active');
                    }
                }
            });
            
            // Click outside to close (mobile)
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.floating-menu-container') && window.innerWidth <= 768) {
                    isMenuOpen = false;
                    menuContainer.classList.remove('active');
                    menuTrigger.classList.remove('active');
                }
            });
            
            // Close menu when clicking on menu links
            menuDropdown.addEventListener('click', function(e) {
                if (e.target.tagName === 'A') {
                    isMenuOpen = false;
                    menuContainer.classList.remove('active');
                    menuTrigger.classList.remove('active');
                }
            });
            
            // Keyboard support
            menuTrigger.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    menuTrigger.click();
                }
            });
            
            // Close with Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && isMenuOpen) {
                    isMenuOpen = false;
                    menuContainer.classList.remove('active');
                    menuTrigger.classList.remove('active');
                }
            });
            
            console.log('Floating menu with hover initialized successfully');
        } else {
            console.log('Floating menu elements not found:', {
                container: !!menuContainer,
                trigger: !!menuTrigger,
                dropdown: !!menuDropdown
            });
        }
    }
    
    // Initialize the floating menu system
    initializeFloatingMenu();
    
    /* CAROUSEL FUNCTIONALITY - Preserved from your original code */
    function initializeCarousel(carousel) {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextButton = carousel.querySelector('.carousel-button.next');
        const prevButton = carousel.querySelector('.carousel-button.prev');
        
        // Set initial state - first slide is active
        if (slides.length > 0) {
            slides[0].classList.add('active');
        }

        const slideWidth = slides[0]?.getBoundingClientRect().width || 0;
        
        // Position slides next to each other horizontally
        slides.forEach((slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        });

        let currentIndex = 0;

        // Function to smoothly transition between slides
        function moveToSlide(targetIndex) {
            // Update current index for tracking
            currentIndex = targetIndex;
            
            // Move the entire track to show the target slide
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update which slide appears "active" (fully visible and scaled)
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentIndex);
            });
        }

        // Navigation button event listeners
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const nextIndex = (currentIndex + 1) % slides.length;
                moveToSlide(nextIndex);
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
                moveToSlide(prevIndex);
            });
        }
    }

    // Initialize all carousels on the page
    document.querySelectorAll('.carousel').forEach(carousel => {
        initializeCarousel(carousel);
    });
    
    /* LIGHTBOX FUNCTIONALITY - Preserved from your original code */
    if (!isHomePage) {
        // Add lightbox HTML structure if it doesn't exist
        if (!document.getElementById('lightbox')) {
            const lightboxHTML = `
                <div class="lightbox-overlay" id="lightbox">
                    <div class="lightbox-content">
                        <button class="lightbox-close">&times;</button>
                        <img src="" alt="Enlarged image" class="lightbox-image" id="lightbox-img">
                        <div class="lightbox-navigation">
                            <button class="lightbox-nav-button" id="prev-img">Previous</button>
                            <button class="lightbox-nav-button" id="next-img">Next</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        }
        
        // Initialize lightbox functionality
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeButton = document.querySelector('.lightbox-close');
        const prevButton = document.getElementById('prev-img');
        const nextButton = document.getElementById('next-img');
        
        let currentImageIndex = 0;
        let galleryImages = [];
        
        // Make all images clickable for lightbox viewing
        const clickableImages = document.querySelectorAll('.presentation-images img, .carousel-slide img, .project-image img');
        
        clickableImages.forEach((img) => {
            img.addEventListener('click', function(e) {
                // Prevent click from interfering with other page functionality
                e.preventDefault();
                e.stopPropagation();
                
                // Determine which set of images to navigate through based on context
                if (this.closest('.carousel')) {
                    // If image is in a carousel, use only carousel images
                    galleryImages = Array.from(this.closest('.carousel').querySelectorAll('img'));
                } else if (this.closest('.presentation-images')) {
                    // If image is in presentation section, use those images
                    galleryImages = Array.from(this.closest('.presentation-images').querySelectorAll('img'));
                } else {
                    // Otherwise use all clickable images on the page
                    galleryImages = Array.from(clickableImages);
                }
                
                // Find which image was clicked to set starting position
                currentImageIndex = galleryImages.indexOf(this);
                
                // Display the clicked image in the lightbox
                lightboxImg.src = this.src;
                
                // Show the lightbox overlay
                lightbox.style.display = 'flex';
            });
        });
        
        // Lightbox interaction handlers
        closeButton?.addEventListener('click', function(e) {
            e.stopPropagation();
            lightbox.style.display = 'none';
        });
        
        // Close lightbox when clicking on the dark background
        lightbox?.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
        
        // Navigate to previous image in lightbox
        prevButton?.addEventListener('click', function(e) {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            lightboxImg.src = galleryImages[currentImageIndex].src;
        });
        
        // Navigate to next image in lightbox
        nextButton?.addEventListener('click', function(e) {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            lightboxImg.src = galleryImages[currentImageIndex].src;
        });
        
        // Keyboard navigation for lightbox
        document.addEventListener('keydown', function(e) {
            if (lightbox?.style.display === 'flex') {
                if (e.key === 'Escape') {
                    lightbox.style.display = 'none';
                } else if (e.key === 'ArrowLeft') {
                    prevButton?.click();
                } else if (e.key === 'ArrowRight') {
                    nextButton?.click();
                }
            }
        });
    }
    
    /* SMOOTH SCROLLING ENHANCEMENT */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
    
    /* PERFORMANCE OPTIMIZATION - Lazy loading */
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        // Apply lazy loading to images that have data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Debug logging
    console.log('All website functionality initialized:', {
        smartNavbar: true,
        scrollEffect: true,
        floatingMenu: true,
        carousels: document.querySelectorAll('.carousel').length,
        lightbox: !isHomePage,
        smoothScrolling: true,
        lazyLoading: 'IntersectionObserver' in window
    });
});