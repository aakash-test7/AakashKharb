/**
 * Hero Name Font Cycling Effect
 * - Default font: Orbitron
 * - On hover: Applies current global font index and starts cycling through fonts
 * - Font cycling accelerates the longer the mouse stays on a character
 * - On mouse leave: Starts 1-second timer to revert to Orbitron
 * - If re-entered before 1 second: Continues cycling from current font
 */

document.addEventListener('DOMContentLoaded', function() {
    const heroNameElement = document.getElementById('heroNameScramble');
    
    if (!heroNameElement) {
        console.warn('Hero name element not found');
        return;
    }

    /**
     * Create per-character spans for hover interaction
     */
    function createCharSpans(element, targetText) {
        element.innerHTML = '';
        const spans = [];
        
        for (let i = 0; i < targetText.length; i++) {
            const span = document.createElement('span');
            span.className = 'hero-char';
            
            // Handle spaces with non-breaking space for layout consistency
            if (targetText[i] === ' ') {
                span.textContent = '\u00A0';
                span.classList.add('space');
            } else {
                span.textContent = targetText[i];
            }
            
            span.dataset.index = i;
            element.appendChild(span);
            spans.push(span);
        }
        
        return spans;
    }

    /**
     * Attach hover handlers for font cycling behavior
     */
    function attachHoverFontHandlers(spans) {
        const fontClasses = ['hero-font1', 'hero-font2', 'hero-font3', 'hero-font4', 'hero-font5', 'hero-font6'];

        // Global index representing the latest font style reached anywhere in the name
        let latestFontIndex = 0; // 0..fontClasses.length-1

        spans.forEach(span => {
            // Skip spaces
            if (span.classList.contains('space')) {
                return;
            }

            // Per-span state
            span._currentIndex = -1; // -1 means default (Orbitron)
            span._revertTimer = null;
            span._cycleTimer = null;
            span._cycleStartTs = null;

            /**
             * Apply font class to character
             */
            const applyFont = (idx) => {
                fontClasses.forEach(c => span.classList.remove(c));
                
                if (idx >= 0 && idx < fontClasses.length) {
                    span.classList.add(fontClasses[idx]);
                    span._currentIndex = idx;
                } else {
                    // Revert to default (Orbitron)
                    span._currentIndex = -1;
                }
            };

            /**
             * Start cycling through fonts with acceleration
             */
            const startCycling = () => {
                // Prevent multiple concurrent cycles
                if (span._cycleTimer) return;
                
                span._cycleStartTs = Date.now();

                const step = () => {
                    const elapsed = Date.now() - span._cycleStartTs; // milliseconds

                    // Acceleration: base interval 700ms, decreases to minimum 120ms
                    // Formula: interval = max(120, 700 - elapsed * 0.5)
                    const interval = Math.max(120, 700 - elapsed * 0.5);

                    // Advance global font index and apply to this character
                    latestFontIndex = (latestFontIndex + 1) % fontClasses.length;
                    applyFont(latestFontIndex);

                    // Schedule next step with accelerated interval
                    span._cycleTimer = setTimeout(step, interval);
                };

                // Start first step after initial interval
                const initialInterval = Math.max(120, 700);
                span._cycleTimer = setTimeout(step, initialInterval);
            };

            /**
             * Stop cycling animation
             */
            const stopCycling = () => {
                if (span._cycleTimer) {
                    clearTimeout(span._cycleTimer);
                    span._cycleTimer = null;
                    span._cycleStartTs = null;
                }
            };

            /**
             * Mouse enter handler
             */
            span.addEventListener('mouseenter', (e) => {
                // Cancel revert timer if user re-entered quickly
                if (span._revertTimer) {
                    clearTimeout(span._revertTimer);
                    span._revertTimer = null;
                }

                // Immediately apply current global font
                applyFont(latestFontIndex);

                // Start accelerated cycling while pointer stays
                startCycling();
            });

            /**
             * Mouse leave handler
             */
            span.addEventListener('mouseleave', () => {
                // Stop cycling
                stopCycling();

                // Start 1-second revert timer
                if (span._revertTimer) {
                    clearTimeout(span._revertTimer);
                }
                
                span._revertTimer = setTimeout(() => {
                    applyFont(-1); // Revert to Orbitron
                    span._revertTimer = null;
                }, 1000);
            });
        });
    }

    // Initialize the effect
    const targetText = heroNameElement.textContent.trim();
    const spans = createCharSpans(heroNameElement, targetText);
    attachHoverFontHandlers(spans);
    
    // Add loaded class for optional initial animation
    setTimeout(() => {
        heroNameElement.classList.add('loaded');
    }, 100);
});
