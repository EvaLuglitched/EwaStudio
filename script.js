document.addEventListener('DOMContentLoaded', function() {
    // Check if this is the homepage or not
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === '/' || 
                       window.location.pathname.endsWith('/');
    
    // Carousel functionality - needed on all pages
    function initializeCarousel(carousel) {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextButton = carousel.querySelector('.carousel-button.next');
        const prevButton = carousel.querySelector('.carousel-button.prev');
        
        // Set initial state
        if (slides.length > 0) {
            slides[0].classList.add('active');
        }

        const slideWidth = slides[0]?.getBoundingClientRect().width || 0;
        
        // Position slides next to each other
        slides.forEach((slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        });

        let currentIndex = 0;

        function moveToSlide(targetIndex) {
            // Update current index
            currentIndex = targetIndex;
            
            // Move the track
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update active classes
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentIndex);
            });
        }

        nextButton.addEventListener('click', () => {
            const nextIndex = (currentIndex + 1) % slides.length;
            moveToSlide(nextIndex);
        });

        prevButton.addEventListener('click', () => {
            const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
            moveToSlide(prevIndex);
        });
    }

    // Initialize all carousels
    document.querySelectorAll('.carousel').forEach(carousel => {
        initializeCarousel(carousel);
    });
    
    // Only implement lightbox on non-homepage pages
    if (!isHomePage) {
        // Add lightbox HTML if it doesn't exist
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
        
        // Lightbox functionality
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeButton = document.querySelector('.lightbox-close');
        const prevButton = document.getElementById('prev-img');
        const nextButton = document.getElementById('next-img');
        
        let currentImageIndex = 0;
        let galleryImages = [];
        
        // Make all images clickable
        const clickableImages = document.querySelectorAll('.presentation-images img, .carousel-slide img, .project-image img');
        
        clickableImages.forEach((img) => {
            img.addEventListener('click', function(e) {
                // Prevent the click from affecting carousel navigation
                e.preventDefault();
                e.stopPropagation();
                
                // Create an array of all images in the current context
                if (this.closest('.carousel')) {
                    // If clicked image is in a carousel, use only carousel images
                    galleryImages = Array.from(this.closest('.carousel').querySelectorAll('img'));
                } else if (this.closest('.presentation-images')) {
                    // If clicked image is in presentation images, use those
                    galleryImages = Array.from(this.closest('.presentation-images').querySelectorAll('img'));
                } else {
                    // Otherwise use all images on the page
                    galleryImages = Array.from(clickableImages);
                }
                
                // Find the index of the clicked image
                currentImageIndex = galleryImages.indexOf(this);
                
                // Update the lightbox image
                lightboxImg.src = this.src;
                
                // Show the lightbox
                lightbox.style.display = 'flex';
            });
        });
        
        // Close lightbox when clicking the close button
        closeButton?.addEventListener('click', function(e) {
            e.stopPropagation();
            lightbox.style.display = 'none';
        });
        
        // Close lightbox when clicking outside the image
        lightbox?.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
        
        // Navigate through images
        prevButton?.addEventListener('click', function(e) {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            lightboxImg.src = galleryImages[currentImageIndex].src;
        });
        
        nextButton?.addEventListener('click', function(e) {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            lightboxImg.src = galleryImages[currentImageIndex].src;
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (lightbox?.style.display === 'flex') {
                if (e.key === 'Escape') {
                    lightbox.style.display = 'none';
                } else if (e.key === 'ArrowLeft') {
                    prevButton.click();
                } else if (e.key === 'ArrowRight') {
                    nextButton.click();
                }
            }
        });
    }
    
    // Directory mobile toggle (needs to work on all pages)
    const directoryToggle = document.querySelector('.directory-mobile-toggle');
    const directory = document.querySelector('.directory');
    
    if (directoryToggle && directory) {
        directoryToggle.addEventListener('click', function() {
            directory.classList.toggle('active');
            directoryToggle.classList.toggle('active');
        });
    }
});