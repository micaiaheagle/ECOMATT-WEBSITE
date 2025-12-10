
const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, 'css');
const REMOTE_CSS_BASE = 'https://themecraze.net/html/Agricu/assets/css/';

// Re-using folders from before
const DIRS = {
    css: CSS_DIR,
    fonts: path.join(__dirname, 'fonts'),
    webfonts: path.join(__dirname, 'webfonts'),
    images: path.join(__dirname, 'images')
};

Object.values(DIRS).forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function downloadFile(url, destPath) {
    if (fs.existsSync(destPath)) return true; // Skip if exists
    try {
        console.log(`Downloading ${url}...`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed: ${res.status} ${url}`);
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(destPath, Buffer.from(buffer));
        return true;
    } catch (e) {
        console.error(`Error ${url}: ${e.message}`);
        return false;
    }
}

async function processCssFile(filename) {
    const filePath = path.join(CSS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        // If local file doesn't exist, try to download it first (it might be an import)
        const remoteUrl = new URL(filename, REMOTE_CSS_BASE).href;
        const success = await downloadFile(remoteUrl, filePath);
        if (!success) return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Handle @import
    // Regex for: @import url('...'); or @import "...";
    const importRegex = /@import\s+(?:url\(['"]?([^'")]+)['"]?\)|['"]([^'"]+)['"])/g;
    let match;
    const importsToProcess = [];

    while ((match = importRegex.exec(content)) !== null) {
        const importUrl = match[1] || match[2];
        if (!importUrl || importUrl.startsWith('http') || importUrl.startsWith('//')) continue;

        // Recursively process this file
        importsToProcess.push(importUrl);
    }

    for (const imp of importsToProcess) {
        await processCssFile(imp);
    }

    // 2. Handle url(...) for assets
    const urlRegex = /url\(\s*(?:(["'])(.*?)\1|([^)"']+))\s*\)/g;
    const replacements = [];

    // We need to reset regex index or use matchAll, but exec loop is fine if we don't modify valid content length aggressively mid-loop matching? 
    // Actually, capturing all matches first is safer.
    const urlMatches = [];
    while ((match = urlRegex.exec(content)) !== null) {
        urlMatches.push({
            full: match[0],
            url: match[2] || match[3],
            index: match.index
        });
    }

    for (const m of urlMatches) {
        const url = m.url;
        if (!url || url.startsWith('data:') || url.startsWith('http') || url.startsWith('//')) continue;

        // Clean url
        const cleanUrl = url.split('?')[0].split('#')[0];
        const ext = path.extname(cleanUrl).toLowerCase();
        const basename = path.basename(cleanUrl);

        let targetDir = null;
        if (['.woff', '.woff2', '.ttf', '.eot', '.svg'].includes(ext)) {
            // Check if it's in a webfonts subfolder context
            if (url.includes('webfonts')) targetDir = DIRS.webfonts;
            else targetDir = DIRS.fonts;
        } else if (['.jpg', '.png', '.gif', '.webp'].includes(ext)) {
            targetDir = DIRS.images;
        }

        if (targetDir) {
            // Resolve remote absolute
            // Here we assume CSS files are all in same remote dir?
            // If main CSS imports 'subdir/foo.css', then foo.css relative urls are relative to subdir...
            // But usually template css structure is flat or handled. 
            // The template uses @import url('global.css'), so flat.

            const absoluteRemote = new URL(url, REMOTE_CSS_BASE).href;
            const linkName = cleanUrl.includes('/') ? basename : cleanUrl; // Flatten assets too? or keep relative structure?
            // "Standard" templates usually put fonts in ../fonts/ or similar.
            // If we flatten assets into DIRS.fonts, we must rewrite CSS to ../fonts/basename

            const localDest = path.join(targetDir, basename);
            await downloadFile(absoluteRemote, localDest);

            // Compute new relative path for CSS
            // CSS is in CSS_DIR
            const newRelPath = path.relative(CSS_DIR, localDest).split(path.sep).join('/');

            // We only want to replace this specific instance? 
            // Or all instances of this URL?
            replacements.push({ original: url, new: newRelPath });
        }
    }

    if (replacements.length > 0) {
        for (const rep of replacements) {
            content = content.split(rep.original).join(rep.new);
        }
        fs.writeFileSync(filePath, content);
    }
}

async function main() {
    // Start with known entry points or just scan directory?
    // Scanning directory is safer to catch everything we already have + process imports
    const files = fs.readdirSync(CSS_DIR).filter(f => f.endsWith('.css'));
    for (const f of files) {
        await processCssFile(f);
    }
    console.log('Done fixing styles.');
}

main().catch(console.error);
