import nunjucks from 'nunjucks';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const env = nunjucks.configure(join(rootDir, 'templates'), {
    autoescape: true,
    trimBlocks: true,
    lstripBlocks: true
});

async function generatePreviews() {
    try {
        const sampleDataPath = join(rootDir, 'templates/sample-data.json');
        const sampleDataContent = await readFile(sampleDataPath, 'utf-8');
        const sampleData = JSON.parse(sampleDataContent);

        await mkdir(join(rootDir, 'templates/preview'), { recursive: true });

        for (const [templateKey, data] of Object.entries(sampleData)) {
            const templateName = templateKey.replace('bkash_', '').replace(/_/g, '-');
            const templatePath = `receipts/${templateName}.njk`;

            console.log(`📄 Rendering ${templatePath}...`);

            const html = env.render(templatePath, data);

            const outputPath = join(rootDir, `templates/preview/${templateName}.html`);
            await writeFile(outputPath, html, 'utf-8');

            console.log(`✅ Generated templates/preview/${templateName}.html`);
        }

        console.log('\n🎉 All previews generated successfully!');
        console.log('📂 Open templates/preview/*.html in your browser to view\n');
    } catch (error) {
        console.error('❌ Error generating previews:', error.message);
        process.exit(1);
    }
}

generatePreviews();
