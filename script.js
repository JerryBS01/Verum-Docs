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
let scrollThreshold = 250; // Adjust this value to control sensitivity
let scrollDelta = 0; // Track accumulated scroll distance

function handleScroll(event) {
    if (isTransitioning) return; // Ignore scroll events during transition

    scrollDelta += event.deltaY; // Accumulate scroll movement

    if (Math.abs(scrollDelta) >= scrollThreshold) { 
        if (scrollDelta > 0 && currentSlide < totalSlides - 1) {
            showSlide(currentSlide + 1);
        } else if (scrollDelta < 0 && currentSlide > 0) {
            showSlide(currentSlide - 1);
        }
        scrollDelta = 0; // Reset scroll accumulation after switching slides
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

document.querySelectorAll(".nav-links a").forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default anchor behavior

        const targetId = this.getAttribute("href").substring(1); // Get section ID
        const targetIndex = [...slides].findIndex(slide => slide.id === targetId); // Find index

        if (targetIndex !== -1) {
            showSlide(targetIndex); // Switch to the correct slide
        }
    });
});

  

observer.observe(slidesContainer);

// Only prevent scrolling inside slides
window.addEventListener('wheel', (event) => {
    if (isSlidesLocked && currentSlide < totalSlides - 1) {
        event.preventDefault(); // Prevent default scrolling ONLY inside slides
    }
}, { passive: false });


// Initialize the first slide
showSlide(currentSlide);