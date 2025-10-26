/**
 * Text scrambling effect for section headers.
 * Desktop: Triggers on mouse enter of the section, re-triggers on subsequent mouse entries.
 * Mobile: Triggers once when the section first comes into view.
 * All Devices: Triggers on sidebar navigation clicks.
 * Animation speed/hit-rate adjusts for longer titles.
 */

document.addEventListener('DOMContentLoaded', function() {
    const isTouchDevice = () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    };

    function isElementInViewport(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return (
            rect.top < window.innerHeight && rect.bottom >= 0 &&
            rect.left < window.innerWidth && rect.right >= 0
        );
    }
    
    function scrambleText(element, trueOriginalText, requestedSpeed = 30) {
        if (element.scrambleTimeoutId) {
            clearTimeout(element.scrambleTimeoutId);
        }
        
        element.isScrambling = true;
        element.classList.remove('scramble-complete');

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let currentText = Array(trueOriginalText.length).fill('_'); 
        let lockedPositions = Array(trueOriginalText.length).fill(false);
        
        let actualSpeed = requestedSpeed;
        let lockingChance = 0.08; // Base locking chance

        if (trueOriginalText.length > 10) { // Adjust for longer texts
            actualSpeed = Math.max(15, requestedSpeed * 0.65); // Faster speed, but not less than 15ms
            lockingChance = 0.15; // Higher chance to lock characters
        }

        let tempElement = element.querySelector('.scrambling-span');
        if (!tempElement) {
            element.innerHTML = ''; 
            tempElement = document.createElement('span');
            tempElement.classList.add('scrambling-span');
            element.appendChild(tempElement);
        } else {
            tempElement.textContent = ''; 
        }
        
        const scramble = () => {
            if (!element.isScrambling) { 
                 if(element.scrambleTimeoutId === currentTimeoutId) delete element.scrambleTimeoutId;
                 return;
            }

            let allLocked = true;
            for (let i = 0; i < trueOriginalText.length; i++) {
                if (!lockedPositions[i]) {
                    allLocked = false;
                    currentText[i] = characters.charAt(Math.floor(Math.random() * characters.length));
                    if (Math.random() < lockingChance) { 
                        currentText[i] = trueOriginalText[i];
                        lockedPositions[i] = true;
                    }
                }
            }

            tempElement.textContent = currentText.join('');

            if (allLocked) {
                element.innerHTML = trueOriginalText; 
                element.classList.add('scramble-complete');
                element.isScrambling = false;
                if(element.scrambleTimeoutId === currentTimeoutId) delete element.scrambleTimeoutId;
                return;
            } else {
                element.scrambleTimeoutId = setTimeout(scramble, actualSpeed); 
            }
        };
        const currentTimeoutId = setTimeout(scramble, 0); 
        element.scrambleTimeoutId = currentTimeoutId; 
    }
    
    const sectionHeaders = document.querySelectorAll('.section-title h2');
    const navLinks = document.querySelectorAll('.nav-menu a');

    sectionHeaders.forEach(header => {
        if (!header.dataset.originalText) {
            header.dataset.originalText = header.textContent.trim();
        }
    });

    if (isTouchDevice()) {
        const animatedOnMobileScroll = new Set();
        
        function handleMobileScroll() {
            sectionHeaders.forEach(header => {
                if (isElementInViewport(header) && !animatedOnMobileScroll.has(header)) {
                    if (header.dataset.originalText) {
                        scrambleText(header, header.dataset.originalText, 25); 
                        animatedOnMobileScroll.add(header);
                    }
                }
            });
        }
        
        window.addEventListener('scroll', handleMobileScroll, { passive: true });
        window.addEventListener('resize', handleMobileScroll, { passive: true });
        handleMobileScroll(); 
    } else {
        // Desktop: Animate on section mouseenter
        sectionHeaders.forEach(header => {
            const parentSection = header.closest('section');
            if (parentSection && header.dataset.originalText) {
                parentSection.addEventListener('mouseenter', function() {
                    if (!header.isScrambling || header.classList.contains('scramble-complete')) {
                        scrambleText(header, header.dataset.originalText, 20);
                    }
                });
                // Optional: Mouseleave logic (currently enabled as per previous update)
                parentSection.addEventListener('mouseleave', function() {
                     if (header.isScrambling && !header.classList.contains('scramble-complete')) {
                         clearTimeout(header.scrambleTimeoutId);
                         delete header.scrambleTimeoutId;
                         header.isScrambling = false;
                         header.innerHTML = header.dataset.originalText; // Restore original text
                         header.classList.remove('scramble-complete');
                     }
                 });
            }
        });
    }

    // Sidebar navigation click listener (for all devices)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    const targetH2 = targetSection.querySelector('.section-title h2');
                    if (targetH2 && targetH2.dataset.originalText) {
                        // Allow a brief moment for smooth scroll to potentially start
                        setTimeout(() => {
                            if (!targetH2.isScrambling || targetH2.classList.contains('scramble-complete')) {
                                scrambleText(targetH2, targetH2.dataset.originalText, 20);
                            }
                        }, 50); // Small delay, adjust if needed
                    }
                }
            }
        });
    });
});
