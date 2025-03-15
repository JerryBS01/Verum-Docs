let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
let isTransitioning = false; // Flag to track if a transition is in progress
let isSlidesLocked = false; // Flag to track if the slides section is locked

const spacerSection = document.querySelector('.spacer'); // Get the spacer section
const scrollIconTop = document.querySelector('.scroll-icon.top'); // Get the top scroll icon

function showSlide(index) {
    if (isTransitioning) return; // Exit if a transition is already happening

    isTransitioning = true; // Set transitioning flag to true

    // Hide the current slide
    slides[currentSlide].classList.remove('active');

    // Show the new slide
    slides[index].classList.add('active');

    // Update the current slide index
    currentSlide = index;

    if (currentSlide === totalSlides - 1) {
        spacerSection.style.display = 'block'; // Show the spacer section
    } else {
        spacerSection.style.display = 'none'; // Hide the spacer section
    }

    if (currentSlide === 0) {
        scrollIconTop.style.display = 'none'; // Hide the top scroll icon
    } else {
        scrollIconTop.style.display = 'block'; // Show the top scroll icon
    }

    // Reset the transitioning flag after the transition is complete
    setTimeout(() => {
        isTransitioning = false;
    }, 500); // Match this duration with the CSS transition duration
}

function handleScroll(event) {
    if (isTransitioning) return; // Ignore scroll events during transition

    if (event.deltaY > 0) {
        // Scroll down
        if (currentSlide < totalSlides - 1) {
            showSlide(currentSlide + 1);
        } else if (currentSlide === totalSlides - 1) {
            // Allow exiting the slides section from the last slide
            isSlidesLocked = false;
        }
    } else if (event.deltaY < 0) {
        // Scroll up
        if (currentSlide > 0) {
            showSlide(currentSlide - 1);
        } else if (currentSlide === 0) {
            // Allow exiting the slides section from the first slide
            isSlidesLocked = false;
        }
    }
}

// Use IntersectionObserver to detect when the slides section is in view
const slidesContainer = document.querySelector('.slides-container');
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Lock the slides section when it enters the viewport
                isSlidesLocked = true;
                window.addEventListener('wheel', handleScroll, { passive: false });
            } else {
                // Unlock the slides section when it exits the viewport
                isSlidesLocked = false;
                window.removeEventListener('wheel', handleScroll);
            }
        });
    },
    { threshold: 1.0 } // Trigger when 100% of the slides container is visible
);

observer.observe(slidesContainer);

// Prevent default scrolling behavior when the slides section is locked
window.addEventListener('wheel', (event) => {
    if (isSlidesLocked) {
        event.preventDefault(); // Prevent default scrolling
    }
}, { passive: false });

// Initialize the first slide
showSlide(currentSlide);