import browserManager from './browserManager.js';
import { VIEWPORT_CONFIG, SCREENSHOT_CONFIG } from '../config/puppeteer.js';

class ScreenshotService {
    async generateScreenshot(html, port = 3000) {
        const browser = await browserManager.getBrowser();
        const page = await browser.newPage();

        try {
            await page.setViewport(VIEWPORT_CONFIG);

            await page.setRequestInterception(true);

            const baseUrl = `http://localhost:${port}`;

            page.on('request', (request) => {
                const url = request.url();
                const resourceType = request.resourceType();

                // Allow localhost resources
                if (url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
                    request.continue();
                }
                // Allow data URLs
                else if (url.startsWith('data:')) {
                    request.continue();
                }
                // Allow CDN resources for CSS/fonts/scripts
                else if (resourceType === 'stylesheet' || resourceType === 'font' || resourceType === 'script') {
                    request.continue();
                }
                // Block everything else (analytics, ads, etc)
                else {
                    request.abort();
                }
            });

            await page.setContent(html, {
                waitUntil: ['load', 'networkidle0'],
                timeout: 15000,
            });

            await page.evaluateHandle(`
                (() => {
                    const links = document.querySelectorAll('img, link[rel="stylesheet"], script[src]');
                    links.forEach(el => {
                        const attr = el.tagName === 'IMG' ? 'src' : (el.tagName === 'LINK' ? 'href' : 'src');
                        const path = el.getAttribute(attr);
                        if (path && path.startsWith('/')) {
                            el.setAttribute(attr, '${baseUrl}' + path);
                        }
                    });
                })();
            `);

            await new Promise(resolve => setTimeout(resolve, 1000));

            const screenshot = await page.screenshot(SCREENSHOT_CONFIG);

            return screenshot;
        } catch (error) {
            throw new Error(`Screenshot generation failed: ${error.message}`);
        } finally {
            await page.close();
        }
    }

    convertToBase64(base64String) {
        return `data:image/png;base64,${base64String}`;
    }

    async generateBase64Screenshot(html) {
        const screenshot = await this.generateScreenshot(html);
        return this.convertToBase64(screenshot);
    }
}

export default new ScreenshotService();
