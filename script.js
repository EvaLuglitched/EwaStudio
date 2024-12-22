document.addEventListener('DOMContentLoaded', function() {
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
});