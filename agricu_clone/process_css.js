
const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, 'css');
const OUTPUT_DIR = __dirname;
// Assumption: CSS files were in assets/css/ relative to root
const REMOTE_CSS_BASE = 'https://themecraze.net/html/Agricu/assets/css/';

const DIRS = {
    fonts: path.join(OUTPUT_DIR, 'fonts'),
    webfonts: path.join(OUTPUT_DIR, 'webfonts'),
    images: path.join(OUTPUT_DIR, 'images')
};

Object.values(DIRS).forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function downloadFile(url, destPath) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed: ${res.status} ${url}`);
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(destPath, Buffer.from(buffer));
        console.log(`Downloaded: ${path.basename(destPath)}`);
        return true;
    } catch (e) {
        console.error(`Error ${url}: ${e.message}`);
        return false;
    }
}

async function processCss() {
    if (!fs.existsSync(CSS_DIR)) {
        console.log('No css dir found.');
        return;
    }
    const files = fs.readdirSync(CSS_DIR).filter(f => f.endsWith('.css'));

    for (const file of files) {
        console.log(`Processing ${file}...`);
        const filePath = path.join(CSS_DIR, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Regex for url(...)
        // recursive match? regex loop
        const regex = /url\(\s*(?:(["'])(.*?)\1|([^)"']+))\s*\)/g;
        let match;
        const replacements = [];
        const processing = [];

        while ((match = regex.exec(content)) !== null) {
            const quote = match[1] || '';
            const url = match[2] || match[3];

            if (!url || url.startsWith('data:') || url.startsWith('http') || url.startsWith('//')) {
                // Skip absolute or data, though we might want to download absolute ones too?
                // The prompt says "download all". If it's a google font, maybe keep it? 
                // Let's try to download relative ones primarily (fonts/bg images).
                continue;
            }

            // Clean query params
            const cleanUrl = url.split('?')[0].split('#')[0];
            const ext = path.extname(cleanUrl).toLowerCase();

            let type = 'other';
            let targetDir = DIRS.images;
            if (['.woff', '.woff2', '.ttf', '.eot', '.svg'].includes(ext)) {
                type = 'font';
                // FontAwesome usually uses webfonts dir
                if (url.includes('webfonts')) targetDir = DIRS.webfonts;
                else targetDir = DIRS.fonts;
            } else if (['.jpg', '.png', '.gif', '.webp'].includes(ext)) {
                type = 'image';
                targetDir = DIRS.images;
            } else {
                continue;
            }

            // Resolve remote URL
            // relative to css file
            const absoluteRemote = new URL(url, REMOTE_CSS_BASE).href;
            const filename = path.basename(cleanUrl);
            const localPath = path.join(targetDir, filename);

            processing.push(async () => {
                await downloadFile(absoluteRemote, localPath);
            });

            // Calculate new relative path from CSS file to target
            // CSS is in /css/, asset is in /fonts/ or /images/
            // relative path: ../fonts/filename
            const relPath = path.relative(CSS_DIR, localPath).split(path.sep).join('/');

            // Queue replacement
            // We need to be careful with exact string replacement if multiple same strings
            replacements.push({ original: url, new: relPath });
        }

        await Promise.all(processing);

        // Apply replacements
        // simple replace all occurrences
        for (const rep of replacements) {
            // escape regex? content.replace(rep.original, rep.new)
            // Global replace
            content = content.split(rep.original).join(rep.new);
        }

        fs.writeFileSync(filePath, content);
    }
    console.log('CSS Processing Done.');
}

processCss();
