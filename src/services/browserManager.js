import puppeteer from 'puppeteer';
import { PUPPETEER_CONFIG } from '../config/puppeteer.js';

class BrowserManager {
    constructor() {
        this.browser = null;
        this.isInitializing = false;
    }

    async initialize() {
        if (this.browser) {
            return this.browser;
        }

        if (this.isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return this.initialize();
        }

        this.isInitializing = true;

        try {
            console.log('🚀 Launching Puppeteer browser...');
            this.browser = await puppeteer.launch(PUPPETEER_CONFIG);
            console.log('✅ Browser launched successfully');

            this.browser.on('disconnected', () => {
                console.warn('⚠️  Browser disconnected');
                this.browser = null;
            });

            return this.browser;
        } catch (error) {
            console.error('❌ Failed to launch browser:', error);
            throw error;
        } finally {
            this.isInitializing = false;
        }
    }

    async getBrowser() {
        if (!this.browser) {
            await this.initialize();
        }
        return this.browser;
    }

    async close() {
        if (this.browser) {
            console.log('🔒 Closing browser...');
            await this.browser.close();
            this.browser = null;
            console.log('✅ Browser closed');
        }
    }
}

export default new BrowserManager();
