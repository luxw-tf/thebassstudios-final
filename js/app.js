document.addEventListener("DOMContentLoaded", () => {
    console.log("The Bass Studios loaded. 🎧");

    // Dynamic Stacking & Parallax Logic
    const heroSec = document.querySelector('.sec-hero');
    const heroWrapper = document.querySelector('.huge-text-wrapper');

    window.addEventListener('scroll', () => {
        let scrollY = window.scrollY;

        // Drive the horizontal-to-vertical stacking CSS logic via --p
        if (heroSec) {
            let progress = Math.min(1, Math.max(0, scrollY / 350));
            // Mathematical ease-out so it decelerates heavily as it locks into a vertical stack
            let easeProgress = 1 - Math.pow(1 - progress, 4);
            heroSec.style.setProperty('--p', easeProgress);

            // Trigger the color fade from red to white exclusively after the stack locks into physical position
            let colorProgress = Math.min(1, Math.max(0, (scrollY - 250) / 250));
            heroSec.style.setProperty('--color-p', colorProgress);
        }

        // Apply native page parallax pushing the stacked asset upwards
        if (heroWrapper && scrollY < window.innerHeight) {
            heroWrapper.style.transform = `translateY(${scrollY * 0.3}px)`;
        }

        // Manifesto Parallax Scrub
        const manifestoSec = document.querySelector('.sec-manifesto');
        const manifestoText = document.querySelector('.manifesto-text');
        
        if (manifestoSec && manifestoText) {
            const rect = manifestoSec.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                // Number of pixels the top of the section has scrolled into the viewport
                let visiblePixels = window.innerHeight - rect.top;
                
                // Fade in smoothly over the first 60% of the screen height
                let opacityProgress = Math.min(1, visiblePixels / (window.innerHeight * 0.6));
                
                // Map the movement so it is guaranteed to reach 0px when the section fills the screen (rect.top == 0)
                let moveProgress = Math.min(1, visiblePixels / window.innerHeight);
                
                // Apply a premium ease-out curve so it decelerates into the center
                let easeOut = moveProgress * (2 - moveProgress);
                let translateY = 200 * (1 - easeOut);
                
                manifestoText.style.opacity = opacityProgress;
                manifestoText.style.transform = `translateY(${translateY}px)`;
            }
        }
    });

    // We can expand this later with custom cursors or page transition animations
});
