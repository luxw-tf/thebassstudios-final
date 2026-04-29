document.addEventListener("DOMContentLoaded", () => {
    const heroSec = document.querySelector('.sec-hero');
    const heroWrapper = document.querySelector('.huge-text-wrapper');
    const manifestoSec = document.querySelector('.sec-manifesto');
    const manifestoText = document.querySelector('.manifesto-text');
    const parallaxSections = document.querySelectorAll('.sec-hero, .sec-manifesto, .sec-past-work, .sec-services, .sec-footer');

    let isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let shouldRunParallax = isDesktop && !prefersReducedMotion;

    // Track which sections are in viewport
    const visibleSections = new Set();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) visibleSections.add(entry.target);
            else visibleSections.delete(entry.target);
        });
    }, { threshold: 0 });

    parallaxSections.forEach(s => observer.observe(s));

    let ticking = false;

    function update() {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        // 1. Hero Logic
        if (heroSec && visibleSections.has(heroSec)) {
            let progress = Math.min(1, Math.max(0, scrollY / 350));
            let easeProgress = 1 - Math.pow(1 - progress, 4);
            heroSec.style.setProperty('--p', easeProgress);

            let colorProgress = Math.min(1, Math.max(0, (scrollY - 250) / 250));
            heroSec.style.setProperty('--color-p', colorProgress);
            
            if (heroWrapper && isDesktop) {
                heroWrapper.style.transform = `translateY(${scrollY * 0.3}px)`;
            }
        }

        // 2. Manifesto Logic
        if (manifestoSec && manifestoText && visibleSections.has(manifestoSec)) {
            const rect = manifestoSec.getBoundingClientRect();
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

        // 3. Generic Parallax
        if (shouldRunParallax) {
            visibleSections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const scrollRange = vh + rect.height;
                const scrollProgress = (vh - rect.top) / scrollRange;
                const translateY = (scrollProgress - 0.5) * 150;
                section.style.setProperty('--parallax-y', `${translateY}px`);
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

    update();

    window.addEventListener('resize', () => {
        isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        shouldRunParallax = isDesktop && !prefersReducedMotion;
        if (!shouldRunParallax) {
            parallaxSections.forEach(s => s.style.setProperty('--parallax-y', '0px'));
        }
    }, { passive: true });

    // Modular Gallery Controller
    function initGallery(sectionSelector) {
        const section = document.querySelector(sectionSelector);
        if (!section) return;

        const galleryTrack = section.querySelector('.gallery-track');
        const slides = section.querySelectorAll('.gallery-slide');
        const dotsContainer = section.querySelector('.gallery-dots');

        if (galleryTrack && slides.length > 0) {
            let currentIdx = 0;
            let autoTimer;

            if (dotsContainer) {
                dotsContainer.innerHTML = '';
                slides.forEach((_, i) => {
                    const dot = document.createElement('div');
                    dot.className = 'g-dot';
                    dot.onclick = () => updateGallery(i);
                    dotsContainer.appendChild(dot);
                });
            }
            
            const dots = dotsContainer ? dotsContainer.querySelectorAll('.g-dot') : [];

            function updateGallery(idx) {
                currentIdx = (idx + slides.length) % slides.length;
                const slideWidth = slides[0].offsetWidth + (parseFloat(getComputedStyle(slides[0]).marginLeft) * 2);
                const offset = -currentIdx * slideWidth + (window.innerWidth - slideWidth) / 2;

                galleryTrack.style.transform = `translateX(${offset}px)`;
                slides.forEach((s, i) => s.classList.toggle('active', i === currentIdx));
                if (dots.length) dots.forEach((d, i) => d.classList.toggle('active', i === currentIdx));

                resetTimer();
            }

            function resetTimer() {
                clearInterval(autoTimer);
                autoTimer = setInterval(() => updateGallery(currentIdx + 1), 4000);
            }

            let startX = 0;
            galleryTrack.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
            galleryTrack.addEventListener('touchend', e => {
                const endX = e.changedTouches[0].clientX;
                if (startX - endX > 50) updateGallery(currentIdx + 1);
                else if (endX - startX > 50) updateGallery(currentIdx - 1);
            }, { passive: true });

            window.addEventListener('resize', () => updateGallery(currentIdx));
            updateGallery(currentIdx);
        }
    }

    // initGallery('.sec-gallery'); // Replaced with accordion logic below
    initGallery('.sec-past-work');

    const secGallerySlides = document.querySelectorAll('.sec-gallery .gallery-slide');
    if (secGallerySlides.length > 0) {
        let currentAccordionIdx = 0;
        let accordionTimer;

        function expandSlide(idx) {
            secGallerySlides.forEach(s => s.classList.remove('expanded'));
            secGallerySlides[idx].classList.add('expanded');
            currentAccordionIdx = idx;
        }

        function resetAccordionTimer() {
            clearInterval(accordionTimer);
            accordionTimer = setInterval(() => {
                let nextIdx = (currentAccordionIdx + 1) % secGallerySlides.length;
                expandSlide(nextIdx);
            }, 3000);
        }

        expandSlide(0);
        resetAccordionTimer();

        secGallerySlides.forEach((slide, idx) => {
            ['mouseenter', 'click'].forEach(evt => {
                slide.addEventListener(evt, () => {
                    expandSlide(idx);
                    resetAccordionTimer();
                });
            });
        });
    }
});
