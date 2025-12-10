y
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://themecraze.net/html/Agricu/';
const TARGET_URL = 'https://themecraze.net/html/Agricu/index-2.html';
const OUTPUT_DIR = __dirname;

const DIRS = {
    css: path.join(OUTPUT_DIR, 'css'),
    js: path.join(OUTPUT_DIR, 'js'),
    images: path.join(OUTPUT_DIR, 'images'),
    fonts: path.join(OUTPUT_DIR, 'fonts'),
    webfonts: path.join(OUTPUT_DIR, 'webfonts')
};

// Ensure directories exist
Object.values(DIRS).forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function downloadFile(url, destPath) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(destPath, Buffer.from(buffer));
        console.log(`Downloaded: ${path.basename(destPath)}`);
        return true;
    } catch (e) {
        console.error(`Error downloading ${url}:`, e.message);
        return false;
    }
}

async function main() {
    console.log(`Fetching ${TARGET_URL}...`);
    const res = await fetch(TARGET_URL);
    let html = await res.text();

    // Regex patterns
    const patterns = [
        { regex: /<link[^>]+href="([^"]+)"/g, type: 'css' },
        { regex: /<script[^>]+src="([^"]+)"/g, type: 'js' },
        { regex: /<img[^>]+src="([^"]+)"/g, type: 'images' }
    ];

    const processing = [];

    for (const { regex, type } of patterns) {
        let match;
        // reset regex
        const matches = [];
        while ((match = regex.exec(html)) !== null) {
            matches.push({ full: match[0], url: match[1], index: match.index });
        }

        for (const m of matches) {
            let info = m;
            let rawUrl = info.url;
            
            // Ignore empty or special protocols
            if (!rawUrl || rawUrl.startsWith('data:') || rawUrl.startsWith('#') || rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:')) continue;

            // Resolve absolute URL
            const absoluteUrl = new URL(rawUrl, BASE_URL).href;
            const filename = path.basename(new URL(absoluteUrl).pathname);
            
            // Determine folder based on extension or type
            let folder = DIRS[type];
            // Refine folder for specific extensions if needed
            if (filename.endsWith('.css')) folder = DIRS.css;
            else if (filename.endsWith('.js')) folder = DIRS.js;
            else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].some(ext => filename.toLowerCase().endsWith(ext))) folder = DIRS.images;
            else if (['.woff', '.woff2', '.ttf', '.eot'].some(ext => filename.toLowerCase().endsWith(ext))) folder = DIRS.fonts;

            const localPath = path.join(folder, filename);
            const relativePath = path.relative(OUTPUT_DIR, localPath).split(path.sep).join('/');

            // Queue download
            processing.push((async () => {
                const success = await downloadFile(absoluteUrl, localPath);
                if (success) {
                    // Replace in HTML
                    // naive replace might break if same filename appears in diff contexts, but usually fine for flat clone
                    // safer: replace the identifying string
                    html = html.replace(rawUrl, relativePath); 
                }
            })());
        }
    }

    await Promise.all(processing);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), html);
    console.log('Done! Saved to index.html');
}

main().catch(console.error);
