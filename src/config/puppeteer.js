export const PUPPETEER_CONFIG = {
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
    ],
};

export const VIEWPORT_CONFIG = {
    width: 420,
    height: 900,
    deviceScaleFactor: 2,
};

export const SCREENSHOT_CONFIG = {
    type: 'png',
    fullPage: false,
    encoding: 'base64',
};
