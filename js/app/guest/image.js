import { progress } from './progress.js';
import { cache } from '../../connection/cache.js';

export const image = (() => {

    /**
     * @type {NodeListOf<HTMLImageElement>|null}
     */
    let images = null;

    /**
     * @type {ReturnType<typeof cache>|null}
     */
    let c = null;

    /**
     * @type {object[]}
     */
    const urlCache = [];

    /**
     * @param {string} src 
     * @returns {Promise<HTMLImageElement>}
     */
    const loadedImage = (src) => new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = src;
    });

    /**
     * @param {HTMLImageElement} el 
     * @param {string} src 
     * @returns {Promise<void>}
     */
    const appendImage = (el, src) => loadedImage(src).then((img) => {
        el.width = img.naturalWidth;
        el.height = img.naturalHeight;
        el.classList.remove('opacity-0');
        el.src = img.src;
        img.remove();

        progress.complete('image');
    });

    /**
     * @param {HTMLImageElement} el 
     * @returns {void}
     */
    const getByFetch = (el) => {
        urlCache.push({
            url: el.getAttribute('data-src'),
            res: (url) => appendImage(el, url),
            rej: (err) => {
                console.error(err);
                progress.invalid('image');
            },
        });
    };

    /**
     * @param {HTMLImageElement} el 
     * @returns {void}
     */
    const getByDefault = (el) => {
        el.onerror = () => progress.invalid('image');
        el.onload = () => {
            el.width = el.naturalWidth;
            el.height = el.naturalHeight;
            progress.complete('image');
        };

        if (el.complete && el.naturalWidth !== 0 && el.naturalHeight !== 0) {
            progress.complete('image');
        } else if (el.complete) {
            progress.invalid('image');
        }
    };

    /**
     * @returns {boolean}
     */
    const hasDataSrc = () => Array.from(images).some((i) => i.hasAttribute('data-src'));

    /**
     * @returns {Promise<void>}
     */
    const load = async () => {
        const imgs = Array.from(images);

        /**
         * @param {function} filter 
         * @returns {Promise<void>}
         */
        const runGroup = async (filter) => {
            urlCache.length = 0;
            imgs.filter(filter).forEach((el) => el.hasAttribute('data-src') ? getByFetch(el) : getByDefault(el));
            await c.run(urlCache, progress.getAbort());
        };

        // Load placeholder.jpg first (highest priority)
        await runGroup((el) => {
            const src = el.getAttribute('src') || el.getAttribute('data-src') || '';
            return src.includes('placeholder.jpg');
        });
        
        // Load other high priority images
        await runGroup((el) => el.hasAttribute('fetchpriority') && !(el.getAttribute('src') || el.getAttribute('data-src') || '').includes('placeholder.jpg'));
        
        // Complete progress after critical images are loaded
        progress.complete('image');
        
        // Load remaining images in background (don't block progress)
        const remainingImages = imgs.filter((el) => {
            const src = el.getAttribute('src') || el.getAttribute('data-src') || '';
            return !el.hasAttribute('fetchpriority') && !src.includes('placeholder.jpg');
        });
        
        // Sort by file size (smallest first) for better performance
        const sortedImages = remainingImages.sort((a, b) => {
            const aSize = parseInt(a.dataset.size || '1000000');
            const bSize = parseInt(b.dataset.size || '1000000');
            return aSize - bSize;
        });
        
        // Load in background with delay between batches
        setTimeout(async () => {
            for (let i = 0; i < sortedImages.length; i += 3) {
                const batch = sortedImages.slice(i, i + 3);
                urlCache.length = 0;
                batch.forEach((el) => el.hasAttribute('data-src') ? getByFetch(el) : getByDefault(el));
                await c.run(urlCache, progress.getAbort());
                
                // Add delay between batches to prevent overwhelming the browser
                if (i + 3 < sortedImages.length) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
        }, 500); // Start background loading after 500ms
    };

    /**
     * @param {string} blobUrl 
     * @returns {void}
     */
    const download = (blobUrl) => {
        c.download(blobUrl, `${window.location.hostname}_image_${Date.now()}`);
    };

    /**
     * @returns {object}
     */
    const init = () => {
        c = cache('image').withForceCache();
        images = document.querySelectorAll('img');
        
        // Only track critical images for progress (placeholder.jpg + high priority + first 2 others)
        const criticalImages = Array.from(images).filter((img, index) => {
            const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
            return src.includes('placeholder.jpg') || 
                   img.hasAttribute('fetchpriority') || 
                   index < 2;
        });
        criticalImages.forEach(progress.add);

        return {
            load,
            download,
            hasDataSrc,
        };
    };

    return {
        init,
    };
})();