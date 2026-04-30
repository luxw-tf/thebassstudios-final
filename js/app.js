// Force scroll to top on reload
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    window.scrollTo(0, 0);
});

document.addEventListener("DOMContentLoaded", () => {
    const heroSec = document.querySelector('.sec-hero');
    const heroWrapper = document.querySelector('.huge-text-wrapper');
    const manifestoSec = document.querySelector('.sec-manifesto');
    const manifestoText = document.querySelector('.manifesto-text');
    const manifestoSubtext = document.querySelector('.manifesto-subtext');
    const parallaxSections = document.querySelectorAll('.sec-hero, .sec-manifesto, .sec-gallery, .sec-past-work, .sec-services, .sec-footer');

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

    let vh = window.innerHeight;

    function update() {
        const scrollY = window.scrollY;
        const writes = [];

        // 1. Hero Logic
        if (heroSec && visibleSections.has(heroSec)) {
            let progress = Math.min(1, Math.max(0, scrollY / 350));
            let easeProgress = 1 - Math.pow(1 - progress, 4);
            let colorProgress = Math.min(1, Math.max(0, (scrollY - 250) / 250));

            writes.push(() => {
                heroSec.style.setProperty('--p', easeProgress);
                heroSec.style.setProperty('--color-p', colorProgress);
                if (heroWrapper && isDesktop) {
                    heroWrapper.style.transform = `translateY(${scrollY * 0.3}px)`;
                }
            });
        }

        // 2. Manifesto Logic
        if (manifestoSec && manifestoText && visibleSections.has(manifestoSec)) {
            const rectTop = manifestoSec.getBoundingClientRect().top; // READ
            let visiblePixels = Math.max(0, vh - rectTop);

            // H2 Reveal (happens earlier)
            let h2Opacity = Math.min(1, visiblePixels / (vh * 0.5));

            // Paragraph Reveal (happens slightly later, delayed)
            let pOpacity = Math.min(1, Math.max(0, (visiblePixels - vh * 0.3) / (vh * 0.4)));

            let h2Tf = 'translateY(0)';
            let pTf = 'translateY(0)';
            let blurAmt = 0;

            if (!prefersReducedMotion) {
                // h2 starts at 200, ends at -100
                let h2MoveProgress = Math.min(1, visiblePixels / (vh * 1.2));
                let h2Y = 200 - (h2MoveProgress * 300);
                h2Tf = `translateY(${h2Y}px)`;

                // p starts lower, ends at 0
                let pMoveProgress = Math.min(1, Math.max(0, (visiblePixels - vh * 0.2) / (vh * 0.8)));
                let pEaseOut = pMoveProgress * (2 - pMoveProgress);
                let pY = 150 * (1 - pEaseOut);
                pTf = `translateY(${pY}px)`;

                blurAmt = Math.max(0, 10 - (pOpacity * 10));
            }

            writes.push(() => {
                manifestoText.style.opacity = h2Opacity;
                manifestoText.style.transform = h2Tf;

                if (manifestoSubtext) {
                    manifestoSubtext.style.opacity = pOpacity;
                    manifestoSubtext.style.transform = pTf;
                    if (!prefersReducedMotion) {
                        manifestoSubtext.style.filter = `blur(${blurAmt}px)`;
                    } else {
                        manifestoSubtext.style.filter = 'none';
                    }
                }
            });
        }

        // 3. Generic Parallax & Fade
        const parallaxData = [];
        visibleSections.forEach(section => {
            const rect = section.getBoundingClientRect(); // READ
            const scrollRange = vh + rect.height;
            const scrollProgress = (vh - rect.top) / scrollRange;

            let translateY = 0;
            if (shouldRunParallax) {
                translateY = (scrollProgress - 0.5) * 150;
            }

            // Cinematic fade in/out (Runs on all devices)
            let opacity = 1;
            if (!section.classList.contains('sec-hero') && !section.classList.contains('sec-manifesto')) {
                // Keep fully opaque for the middle 70% of scroll. Only fade at the very edges.
                if (scrollProgress < 0.15) {
                    opacity = scrollProgress / 0.15;
                } else if (scrollProgress > 0.85) {
                    opacity = (1 - scrollProgress) / 0.15;
                }
                // Smoothstep curve for buttery visuals
                opacity = opacity * opacity * (3 - 2 * opacity);
            }

            parallaxData.push({ section, translateY, opacity });
        });

        writes.push(() => {
            parallaxData.forEach(item => {
                if (shouldRunParallax) {
                    item.section.style.setProperty('--parallax-y', `${item.translateY}px`);
                }
                if (!item.section.classList.contains('sec-hero') && !item.section.classList.contains('sec-manifesto')) {
                    item.section.style.opacity = item.opacity;
                }
            });
        });

        // --- BATCH ALL WRITES ---
        writes.forEach(w => w());

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
        vh = window.innerHeight;
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
                autoTimer = setInterval(() => {
                    if (!section.querySelector('.interact-enabled')) {
                        updateGallery(currentIdx + 1);
                    }
                }, 4000);
            }

            let startX = 0;
            galleryTrack.addEventListener('touchstart', e => {
                startX = e.touches[0].clientX;
                clearInterval(autoTimer);
            }, { passive: true });
            galleryTrack.addEventListener('touchend', e => {
                const endX = e.changedTouches[0].clientX;
                if (startX - endX > 50) updateGallery(currentIdx + 1);
                else if (endX - startX > 50) updateGallery(currentIdx - 1);
                resetTimer();
            }, { passive: true });

            let wheelTimeout1;
            galleryTrack.addEventListener('wheel', (e) => {
                e.preventDefault(); // Stop all scrolling (vertical/horizontal) from affecting the page

                if (wheelTimeout1) return;

                const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
                const delta = isHorizontal ? e.deltaX : e.deltaY;
                if (Math.abs(delta) > 10) {
                    if (delta > 0) updateGallery(currentIdx + 1);
                    else updateGallery(currentIdx - 1);

                    wheelTimeout1 = setTimeout(() => { wheelTimeout1 = null; }, 500);
                }
            }, { passive: false });

            window.addEventListener('resize', () => updateGallery(currentIdx));
            updateGallery(currentIdx);
        }
    }

    // initGallery('.sec-gallery'); // Replaced with accordion logic below
    initGallery('.sec-past-work');

    // "Click to Interact" logic for Spotify embeds
    const pastWorkSlides = document.querySelectorAll('.sec-past-work .gallery-slide');
    pastWorkSlides.forEach(slide => {
        slide.addEventListener('click', () => {
            if (slide.classList.contains('active')) {
                slide.classList.add('interact-enabled');
            }
        });
        slide.addEventListener('mouseleave', () => {
            slide.classList.remove('interact-enabled');
        });
    });

    const secGallerySlides = document.querySelectorAll('.sec-gallery .gallery-slide');
    if (secGallerySlides.length > 0) {
        let currentCoverIdx = Math.floor(secGallerySlides.length / 2);
        let coverTimer;

        function updateCoverFlow() {
            secGallerySlides.forEach((slide, i) => {
                const offset = i - currentCoverIdx;
                const absOffset = Math.abs(offset);
                const sign = Math.sign(offset);

                let rotateY = sign * -55;
                let translateZ = absOffset === 0 ? 150 : -absOffset * 100;
                let translateX = sign * (absOffset * 45);

                if (absOffset === 0) {
                    rotateY = 0;
                    translateX = 0;
                    slide.classList.add('active-cover');
                } else {
                    slide.classList.remove('active-cover');
                }

                let opacity = absOffset > 4 ? 0 : 1;
                let zIndex = 100 - absOffset;

                slide.style.transform = `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
                slide.style.zIndex = zIndex;
                slide.style.opacity = opacity;
                slide.style.pointerEvents = opacity === 0 ? 'none' : 'auto';
            });
        }

        function resetCoverTimer() {
            clearInterval(coverTimer);
            coverTimer = setInterval(() => {
                currentCoverIdx = (currentCoverIdx + 1) % secGallerySlides.length;
                updateCoverFlow();
            }, 3000);
        }

        updateCoverFlow();
        resetCoverTimer();

        secGallerySlides.forEach((slide, i) => {
            ['click', 'mouseenter'].forEach(evt => {
                slide.addEventListener(evt, () => {
                    currentCoverIdx = i;
                    updateCoverFlow();
                    resetCoverTimer();
                });
            });
        });

        const track = document.querySelector('.sec-gallery .gallery-track');
        let startX = 0;
        track.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
        track.addEventListener('touchend', e => {
            const endX = e.changedTouches[0].clientX;
            if (startX - endX > 50) {
                currentCoverIdx = Math.min(secGallerySlides.length - 1, currentCoverIdx + 1);
                updateCoverFlow(); resetCoverTimer();
            } else if (endX - startX > 50) {
                currentCoverIdx = Math.max(0, currentCoverIdx - 1);
                updateCoverFlow(); resetCoverTimer();
            }
        }, { passive: true });

        let wheelTimeout2;
        track.addEventListener('wheel', (e) => {
            e.preventDefault(); // Stop all scrolling (vertical/horizontal) from affecting the page

            if (wheelTimeout2) return;

            const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
            const delta = isHorizontal ? e.deltaX : e.deltaY;
            if (Math.abs(delta) > 10) {
                if (delta > 0) {
                    currentCoverIdx = Math.min(secGallerySlides.length - 1, currentCoverIdx + 1);
                } else {
                    currentCoverIdx = Math.max(0, currentCoverIdx - 1);
                }
                updateCoverFlow(); resetCoverTimer();
                wheelTimeout2 = setTimeout(() => { wheelTimeout2 = null; }, 500);
            }
        }, { passive: false });
    }
});

// Spotify IFrame API to pause other players when one starts
window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const iframes = document.querySelectorAll('.sec-past-work iframe');
    const controllers = [];

    iframes.forEach((iframe) => {
        // Parse the existing src to get the URI
        const src = iframe.src || '';
        const match = src.match(/embed\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
        const options = {
            width: '100%',
            height: '352'
        };
        if (match) {
            options.uri = `spotify:${match[1]}:${match[2]}`;
        }

        const callback = (EmbedController) => {
            controllers.push(EmbedController);
            
            EmbedController.addListener('playback_update', e => {
                if (e.data && !e.data.isPaused) {
                    controllers.forEach(c => {
                        if (c !== EmbedController) {
                            c.pause();
                        }
                    });
                }
            });
        };
        
        // Only initialize if we found a valid Spotify URI
        if (options.uri) {
            IFrameAPI.createController(iframe, options, callback);
        }
    });
};
