/**
 * Falling Flowers Animation Module
 * Based on exact CodePen implementation
 */

export const fallingFlowers = (() => {
    let isInitialized = false;
    let container = null;

    /**
     * Random number generator function from CodePen
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    const R = (min, max) => min + Math.random() * (max - min);

    /**
     * Animation function for dot class
     * @param {HTMLElement} elm 
     */
    const animm = (elm) => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        TweenMax.to(elm, R(6, 15), {
            y: h + 100,
            ease: Linear.easeNone,
            repeat: -1,
            delay: -15
        });
        TweenMax.to(elm, R(4, 8), {
            x: '+=100',
            rotationZ: R(0, 180),
            repeat: -1,
            yoyo: true,
            ease: Sine.easeInOut
        });
        TweenMax.to(elm, R(2, 8), {
            repeat: -1,
            yoyo: true,
            ease: Sine.easeInOut,
            delay: -5
        });
    };

    /**
     * Animation function for dot2 class
     * @param {HTMLElement} elm 
     */
    const animm2 = (elm) => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        TweenMax.to(elm, R(6, 15), {
            y: h + 100,
            ease: Linear.easeNone,
            repeat: -1,
            delay: -25
        });
        TweenMax.to(elm, R(4, 8), {
            x: '+=100',
            rotationZ: R(0, 180),
            repeat: -1,
            yoyo: true,
            ease: Sine.easeInOut
        });
        TweenMax.to(elm, R(2, 8), {
            repeat: -1,
            yoyo: true,
            ease: Sine.easeInOut,
            delay: -5
        });
    };

    /**
     * Animation function for dot3 class
     * @param {HTMLElement} elm 
     */
    const animm3 = (elm) => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        TweenMax.to(elm, R(6, 15), {
            y: h + 100,
            ease: Linear.easeNone,
            repeat: -1,
            delay: -5
        });
        TweenMax.to(elm, R(4, 8), {
            x: '+=100',
            rotationZ: R(0, 180),
            repeat: -1,
            yoyo: true,
            ease: Sine.easeInOut
        });
        TweenMax.to(elm, R(2, 8), {
            repeat: -1,
            yoyo: true,
            ease: Sine.easeInOut,
            delay: -5
        });
    };

    /**
     * Initialize the falling flowers animation
     * @returns {void}
     */
    const init = () => {
        if (isInitialized || typeof window.TweenMax === 'undefined') {
            return;
        }

        container = document.getElementById('container');
        if (!container) {
            return;
        }

        // Set perspective for 3D effect
        TweenLite.set('#container', { perspective: 600 });

        const total = 10;
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Create flower elements
        for (let i = 0; i < total; i++) {
            const Div = document.createElement('div');
            const Div2 = document.createElement('div');
            const Div3 = document.createElement('div');

            // Set initial positions and properties
            TweenLite.set(Div, {
                attr: { class: 'dot' },
                x: R(0, w),
                y: R(-200, -150),
                z: R(-200, 200),
                xPercent: '-50%',
                yPercent: '-50%'
            });

            TweenLite.set(Div2, {
                attr: { class: 'dot2' },
                x: R(0, w),
                y: R(-200, -150),
                z: R(-200, 200),
                xPercent: '-50%',
                yPercent: '-50%'
            });

            TweenLite.set(Div3, {
                attr: { class: 'dot3' },
                x: R(0, w),
                y: R(-200, -150),
                z: R(-200, 200),
                xPercent: '-50%',
                yPercent: '-50%'
            });

            // Append to container
            container.appendChild(Div);
            container.appendChild(Div2);
            container.appendChild(Div3);

            // Start animations
            animm(Div);
            animm2(Div2);
            animm3(Div3);
        }

        isInitialized = true;
    };

    /**
     * Stop the falling flowers animation
     * @returns {void}
     */
    const stop = () => {
        if (!isInitialized || !container) {
            return;
        }

        // Kill all TweenMax animations on the container
        TweenMax.killTweensOf(container.querySelectorAll('.dot, .dot2, .dot3'));
        
        // Clear the container
        container.innerHTML = '';
        
        isInitialized = false;
    };

    /**
     * Restart the falling flowers animation
     * @returns {void}
     */
    const restart = () => {
        stop();
        init();
    };

    return {
        init,
        stop,
        restart,
    };
})();
