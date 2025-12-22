// Smart navbar scroll effect with customized delay times
function initializeScrollEffect() {
    const navbar = document.querySelector('.navbar');
    let scrollTimeout;
    let lastScrollTop = 0;
    let isScrolling = false;
    
    // Timing constants for different scroll behaviors
    const SCROLL_UP_DELAY = 1500;    // 往上滚动后1.5秒隐藏
    const SCROLL_DOWN_DELAY = 1500;  // 往下滚动后1.5秒隐藏
    const HOVER_LEAVE_DELAY = 1000;  // 鼠标离开后1秒隐藏
    
    // Function to check if user is at bottom of page
    function isAtBottom() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Consider "at bottom" if within 100px of the bottom
        return (scrollTop + windowHeight) >= (documentHeight - 100);
    }
    
    // Function to show navbar
    function showNavbar() {
        navbar.style.transform = 'translateY(0)';
        navbar.style.opacity = '1';
    }
    
    // Function to hide navbar
    function hideNavbar() {
        // Don't hide if at bottom of page
        if (isAtBottom()) {
            return;
        }
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
        
        // Always show navbar when at top of page (first 50px) OR at bottom
        if (scrollTop <= 50 || isAtBottom()) {
            showNavbar();
            if (scrollTop <= 50) {
                navbar.classList.remove('scrolled');
            } else {
                navbar.classList.add('scrolled');
            }
        } else {
            navbar.classList.add('scrolled');
            
            // Control navbar visibility based on scroll direction
            if (scrollingUp) {
                // Scrolling up - immediately show navbar
                showNavbar();
                
                // Set 1.5 second timer for up scroll
                scrollTimeout = setTimeout(() => {
                    if (scrollTop > 50 && !isAtBottom()) {
                        hideNavbar();
                    }
                }, SCROLL_UP_DELAY);
                
            } else if (scrollingDown) {
                // Scrolling down - keep navbar visible for longer
                showNavbar();
                
                // Set 1.5 second timer for down scroll
                scrollTimeout = setTimeout(() => {
                    if (scrollTop > 50 && !isAtBottom()) {
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
        if (scrollTop > 50 && !isAtBottom()) {
            scrollTimeout = setTimeout(() => {
                hideNavbar();
            }, HOVER_LEAVE_DELAY);
        }
    });
}

// Masonry layout function for true Pinterest-style waterfall grid
function initializeMasonryLayout() {
    const grids = document.querySelectorAll('.gallery-grid, .category-grid');
    
    grids.forEach(grid => {
        if (!grid) return;
        
        const cards = Array.from(grid.querySelectorAll('.project-card'));
        if (cards.length === 0) return;
        
        // Configuration
        let columnCount = 3;
        let gap = 24; // 1.5rem = 24px
        
        // Determine column count and gap based on viewport and grid type
        function updateConfig() {
            const isCategoryGrid = grid.classList.contains('category-grid');
            
            if (window.innerWidth <= 768) {
                columnCount = 1;
                gap = 16; // 1rem
            } else if (window.innerWidth <= 992) {
                columnCount = 2;
                gap = 16;
            } else {
                // Desktop: 3 columns for gallery-grid, 2 columns for category-grid
                if (isCategoryGrid) {
                    columnCount = 2;
                    gap = 16;
                } else {
                    columnCount = 3;
                    gap = 24;
                }
            }
        }
        
        // Calculate and apply masonry layout
        function applyMasonryLayout() {
            updateConfig();
            
            // Get container width
            const containerWidth = grid.offsetWidth;
            
            // Calculate column width
            const totalGapWidth = gap * (columnCount - 1);
            const columnWidth = (containerWidth - totalGapWidth) / columnCount;
            
            // Initialize column heights array
            const columnHeights = new Array(columnCount).fill(0);
            
            // Position each card
            cards.forEach((card, index) => {
                // Set card width
                card.style.width = `${columnWidth}px`;
                
                // Calculate which column this card should go in (left to right order)
                const columnIndex = index % columnCount;
                
                // Calculate position
                const x = columnIndex * (columnWidth + gap);
                const y = columnHeights[columnIndex];
                
                // Apply position
                card.style.transform = `translate(${x}px, ${y}px)`;
                card.style.left = '0';
                card.style.top = '0';
                
                // Update column height
                // Need to get actual height after positioning
                const cardHeight = card.offsetHeight;
                columnHeights[columnIndex] += cardHeight + gap;
            });
            
            // Set container height to the tallest column
            const maxHeight = Math.max(...columnHeights) - gap;
            grid.style.height = `${maxHeight}px`;
        }
        
        // Wait for images and videos to load
        function waitForMediaToLoad() {
            const mediaElements = grid.querySelectorAll('img, video');
            const promises = [];
            
            mediaElements.forEach(media => {
                if (media.tagName === 'IMG' && !media.complete) {
                    promises.push(
                        new Promise(resolve => {
                            media.addEventListener('load', resolve);
                            media.addEventListener('error', resolve);
                        })
                    );
                } else if (media.tagName === 'VIDEO' && media.readyState < 2) {
                    promises.push(
                        new Promise(resolve => {
                            media.addEventListener('loadeddata', resolve);
                            media.addEventListener('error', resolve);
                        })
                    );
                }
            });
            
            return Promise.all(promises);
        }
        
        // Initial layout
        waitForMediaToLoad().then(() => {
            applyMasonryLayout();
            // Apply again after a short delay to catch any layout shifts
            setTimeout(applyMasonryLayout, 100);
        });
        
        // Reapply on window resize with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                applyMasonryLayout();
            }, 150);
        });
        
        // Watch for any dynamic content changes
        const observer = new MutationObserver(() => {
            waitForMediaToLoad().then(applyMasonryLayout);
        });
        
        observer.observe(grid, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src']
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize smart scroll effect first
    initializeScrollEffect();
    
    // Initialize masonry layout for gallery
    initializeMasonryLayout();
    
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
        masonryLayout: true,
        floatingMenu: true,
        carousels: document.querySelectorAll('.carousel').length,
        lightbox: !isHomePage,
        smoothScrolling: true,
        lazyLoading: 'IntersectionObserver' in window
    });
    
    /* RETURN HOME BUTTON FUNCTIONALITY */
    initializeReturnButton();
});

// Return button functionality - tracks where user came from
function initializeReturnButton() {
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === '/' || 
                       window.location.pathname.endsWith('/');
    
    const isCategoryPage = window.location.pathname.includes('/category/');
    
    // Don't add button on home page or category pages
    if (isHomePage || isCategoryPage) {
        return;
    }
    
    // Check if we're on a project page
    const projectPages = [
        'scooter.html', 'adaseco.html', 'climbingshoe.html', 'survivalguide.html',
        'birdhouse.html', 'bottle.html', 'ouijaboard.html', 'inflatablechair.html',
        'barstool.html', 'canwemeet.html', 'skeletalchair.html', 'deskorganizer.html',
        'about.html', 'contact.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    const isProjectPage = projectPages.some(page => currentPage === page);
    
    if (!isProjectPage) {
        return;
    }
    
    // Create return button
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'return-button-container';
    
    const returnButton = document.createElement('a');
    returnButton.className = 'return-home-button';
    returnButton.href = '#';
    
    // Determine return destination based on referrer
    const referrer = document.referrer;
    let returnUrl = 'index.html';
    let buttonText = '← RETURN HOME';
    
    if (referrer) {
        const referrerPath = new URL(referrer).pathname;
        
        // Check if came from a category page
        if (referrerPath.includes('/category/portfolio.html')) {
            returnUrl = 'category/portfolio.html';
            buttonText = '← RETURN TO PORTFOLIO';
        } else if (referrerPath.includes('/category/toy-game.html')) {
            returnUrl = 'category/toy-game.html';
            buttonText = '← RETURN TO TOY & GAME DESIGN';
        } else if (referrerPath.includes('/category/furniture.html')) {
            returnUrl = 'category/furniture.html';
            buttonText = '← RETURN TO FURNITURE DESIGN';
        } else if (referrerPath.includes('/category/product.html')) {
            returnUrl = 'category/product.html';
            buttonText = '← RETURN TO PRODUCT DESIGN';
        }
        
        // Store the return URL in sessionStorage for consistency
        sessionStorage.setItem('returnUrl', returnUrl);
        sessionStorage.setItem('returnText', buttonText);
    } else {
        // Check if we have stored return information
        const storedUrl = sessionStorage.getItem('returnUrl');
        const storedText = sessionStorage.getItem('returnText');
        
        if (storedUrl) {
            returnUrl = storedUrl;
            buttonText = storedText || '← RETURN HOME';
        }
    }
    
    returnButton.href = returnUrl;
    returnButton.textContent = buttonText;
    
    buttonContainer.appendChild(returnButton);
    
    // Insert button at the end of main content
    const main = document.querySelector('main');
    if (main) {
        main.appendChild(buttonContainer);
    }
}
