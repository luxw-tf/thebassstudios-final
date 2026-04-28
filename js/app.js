document.addEventListener("DOMContentLoaded", () => {
    console.log("The Bass Studios optimized. 🚀");

    const heroSec = document.querySelector('.sec-hero');
    const heroWrapper = document.querySelector('.huge-text-wrapper');
    const manifestoSec = document.querySelector('.sec-manifesto');
    const manifestoText = document.querySelector('.manifesto-text');

    // Select all sections that have a background image via ::before
    const parallaxSections = document.querySelectorAll('.sec-hero, .sec-manifesto, .sec-past-work, .sec-services, .sec-footer');

    // Performance & Device Detection
    let isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let shouldRunParallax = isDesktop && !prefersReducedMotion;

    let ticking = false;

    function update() {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        // 1. Hero Logic (Keep simple even on mobile as it's the landing vibe)
        if (heroSec) {
            let progress = Math.min(1, Math.max(0, scrollY / 350));
            let easeProgress = 1 - Math.pow(1 - progress, 4);
            heroSec.style.setProperty('--p', easeProgress);

            let colorProgress = Math.min(1, Math.max(0, (scrollY - 250) / 250));
            heroSec.style.setProperty('--color-p', colorProgress);
        }

        if (heroWrapper && scrollY < vh && isDesktop) {
            heroWrapper.style.transform = `translateY(${scrollY * 0.3}px)`;
        }

        // 2. Manifesto Logic
        if (manifestoSec && manifestoText) {
            const rect = manifestoSec.getBoundingClientRect();
            if (rect.top < vh && rect.bottom > 0) {
                let visiblePixels = vh - rect.top;
                let opacityProgress = Math.min(1, visiblePixels / (vh * 0.6));
                
                manifestoText.style.opacity = opacityProgress;
                
                if (shouldRunParallax) {
                    let moveProgress = Math.min(1, visiblePixels / vh);
                    let easeOut = moveProgress * (2 - moveProgress);
                    let translateY = 200 * (1 - easeOut);
                    manifestoText.style.transform = `translateY(${translateY}px)`;
                } else {
                    manifestoText.style.transform = 'translateY(0)';
                }
            }
        }

        // 3. Generic Parallax Logic for Section Backgrounds
        if (shouldRunParallax) {
            parallaxSections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top < vh && rect.bottom > 0) {
                    const scrollRange = vh + rect.height;
                    const scrollProgress = (vh - rect.top) / scrollRange;
                    const translateY = (scrollProgress - 0.5) * 150; 
                    section.style.setProperty('--parallax-y', `${translateY}px`);
                }
            });
        } else {
            // Reset parallax for mobile/low-motion
            parallaxSections.forEach(section => {
                section.style.setProperty('--parallax-y', '0px');
            });
        }

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

    // Re-check on resize for better experience
    window.addEventListener('resize', () => {
        isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        shouldRunParallax = isDesktop && !prefersReducedMotion;
    }, { passive: true });
});
