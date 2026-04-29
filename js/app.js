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

    // Modular Gallery Engine
    function initGallery(sectionSelector) {
        const section = document.querySelector(sectionSelector);
        if (!section) return;

        const galleryTrack = section.querySelector('.gallery-track');
        const slides = section.querySelectorAll('.gallery-slide');
        const dotsContainer = section.querySelector('.gallery-dots');

        if (galleryTrack && slides.length > 0) {
            let currentIdx = 0;
            let autoTimer;

            // Initialize Progress Indicators
            slides.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = 'g-dot';
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.onclick = () => updateGallery(i);
                dotsContainer.appendChild(dot);
            });
            const dots = dotsContainer.querySelectorAll('.g-dot');

            function updateGallery(idx) {
                currentIdx = (idx + slides.length) % slides.length;

                // Precision Alignment Math
                const slide = slides[0];
                const slideWidth = slide.offsetWidth;
                const slideMargin = parseFloat(getComputedStyle(slide).marginRight) || 0;
                
                // Calculate centering offset based on viewport and slide dimensions
                const trackOffset = -currentIdx * (slideWidth + slideMargin * 2) + (window.innerWidth - (slideWidth + slideMargin * 2)) / 2;

                galleryTrack.style.transform = `translateX(${trackOffset}px)`;

                // Update Active States
                slides.forEach((s, i) => s.classList.toggle('active', i === currentIdx));
                dots.forEach((d, i) => d.classList.toggle('active', i === currentIdx));

                restartAutoCycle();
            }

            function restartAutoCycle() {
                clearInterval(autoTimer);
                autoTimer = setInterval(() => updateGallery(currentIdx + 1), 5000);
            }

            // Gesture Detection (Touch & Swipe)
            let touchStartX = 0;
            galleryTrack.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX, { passive: true });
            galleryTrack.addEventListener('touchend', e => {
                const touchEndX = e.changedTouches[0].clientX;
                const swipeThreshold = 50;
                if (touchStartX - touchEndX > swipeThreshold) updateGallery(currentIdx + 1);
                else if (touchEndX - touchStartX > swipeThreshold) updateGallery(currentIdx - 1);
            }, { passive: true });

            // Responsive Re-alignment
            window.addEventListener('resize', () => updateGallery(currentIdx));
            
            // Start the engine
            updateGallery(0);
        }
    }

    initGallery('.sec-gallery');
    initGallery('.sec-past-work'); 
});
