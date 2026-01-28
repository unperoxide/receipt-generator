import nunjucks from 'nunjucks';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatesDir = join(__dirname, '../../templates');

class TemplateRenderer {
    constructor() {
        this.env = nunjucks.configure(templatesDir, {
            autoescape: true,
            trimBlocks: true,
            lstripBlocks: true,
            noCache: process.env.NODE_ENV === 'development',
        });
    }

    render(templateName, data) {
        try {
            const templatePath = `receipts/${templateName}.njk`;
            return this.env.render(templatePath, data);
        } catch (error) {
            throw new Error(`Template rendering failed: ${error.message}`);
        }
    }

    async renderAsync(templateName, data) {
        return new Promise((resolve, reject) => {
            try {
                const html = this.render(templateName, data);
                resolve(html);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default new TemplateRenderer();
