document.addEventListener("DOMContentLoaded", () => {
    console.log("The Bass Studios optimized. 🚀");

    const heroSec = document.querySelector('.sec-hero');
    const heroWrapper = document.querySelector('.huge-text-wrapper');
    const manifestoSec = document.querySelector('.sec-manifesto');
    const manifestoText = document.querySelector('.manifesto-text');

    // Select all sections that have a background image via ::before
    const parallaxSections = document.querySelectorAll('.sec-hero, .sec-manifesto, .sec-gallery, .sec-past-work, .sec-services, .sec-footer');

    let lastScrollY = window.scrollY;
    let ticking = false;

    function update() {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        // 1. Hero Logic
        if (heroSec) {
            let progress = Math.min(1, Math.max(0, scrollY / 350));
            let easeProgress = 1 - Math.pow(1 - progress, 4);
            heroSec.style.setProperty('--p', easeProgress);

            let colorProgress = Math.min(1, Math.max(0, (scrollY - 250) / 250));
            heroSec.style.setProperty('--color-p', colorProgress);
        }

        if (heroWrapper && scrollY < vh) {
            heroWrapper.style.transform = `translateY(${scrollY * 0.3}px)`;
        }

        // 2. Manifesto Logic
        if (manifestoSec && manifestoText) {
            const rect = manifestoSec.getBoundingClientRect();
            if (rect.top < vh && rect.bottom > 0) {
                let visiblePixels = vh - rect.top;
                let opacityProgress = Math.min(1, visiblePixels / (vh * 0.6));
                let moveProgress = Math.min(1, visiblePixels / vh);
                let easeOut = moveProgress * (2 - moveProgress);
                let translateY = 200 * (1 - easeOut);

                manifestoText.style.opacity = opacityProgress;
                manifestoText.style.transform = `translateY(${translateY}px)`;
            }
        }

        // 3. Generic Parallax Logic for Section Backgrounds
        parallaxSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < vh && rect.bottom > 0) {
                // Calculate how far through the section we are
                // 0 when section top enters bottom of screen, 1 when section bottom leaves top of screen
                const scrollRange = vh + rect.height;
                const scrollProgress = (vh - rect.top) / scrollRange;

                // Map progress to transform (-10% to 10% movement)
                const translateY = (scrollProgress - 0.5) * 150; // Moves up to 150px
                section.style.setProperty('--parallax-y', `${translateY}px`);
            }
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    // Initial call
    update();
});
