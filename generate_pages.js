const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.js');
const raw = fs.readFileSync(dataPath, 'utf8');

// Strip the const declaration so we can get the array
const scriptData = raw.replace('const TOOLS =', 'return');
const tools = new Function(scriptData)();

const toolDir = path.join(__dirname, 'tool');

// Ensure 'tool' directory exists
if (!fs.existsSync(toolDir)) {
    fs.mkdirSync(toolDir, { recursive: true });
}

// Helper to create a URL-friendly slug
function createSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

let sitemapUrls = [
    'https://creatoreconomytools.com/',
    'https://creatoreconomytools.com/about'
];

console.log('Generating pages for ' + tools.length + ' tools...');

let successCount = 0;

tools.forEach(tool => {
    if (!tool.name) return;

    const slug = createSlug(tool.name);
    const fileName = slug + '.html';
    const filePath = path.join(toolDir, fileName);

    // Add to sitemap
    sitemapUrls.push('https://creatoreconomytools.com/tool/' + slug);

    const initials = tool.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const catTags = tool.categories.map(c => '<span class="modal-cat-tag">' + escapeHtml(c) + '</span>').join('');
    const pricingHtml = tool.pricing ? '<span class="tool-pricing ' + (tool.pricing.toLowerCase() === 'paid' ? 'paid' : '') + '">' + escapeHtml(tool.pricing) + '</span>' : '';

    const ogImg = tool.img ? escapeHtml(tool.img) : 'https://creatoreconomytools.com/og-image.png';
    const toolCat = tool.categories.length > 0 ? escapeHtml(tool.categories[0]).replace(/"/g, '\\"') : 'Utility';
    const escName = escapeHtml(tool.name).replace(/"/g, '\\"');
    const escDesc = escapeHtml(tool.desc).replace(/"/g, '\\"');

    const htmlContent = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'    <meta charset="UTF-8" />\n' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
'    <title>' + escapeHtml(tool.name) + ' - Creator Economy Tools</title>\n' +
'    <meta name="description" content="Discover ' + escapeHtml(tool.name) + ' on Creator Economy Tools. ' + escapeHtml(tool.desc) + '" />\n' +
'    <meta property="og:title" content="' + escapeHtml(tool.name) + ' - Creator Economy Tools" />\n' +
'    <meta property="og:description" content="' + escapeHtml(tool.desc) + '" />\n' +
'    <meta property="og:image" content="' + ogImg + '" />\n' +
'    <meta property="og:type" content="website" />\n' +
'    <meta property="og:url" content="https://creatoreconomytools.com/tool/' + slug + '" />\n' +
'    <meta name="twitter:card" content="summary_large_image" />\n' +
'    <meta name="twitter:title" content="' + escapeHtml(tool.name) + ' - Creator Economy Tools" />\n' +
'    <meta name="twitter:description" content="' + escapeHtml(tool.desc) + '" />\n' +
'    <meta name="twitter:image" content="' + ogImg + '" />\n' +
'    <link rel="canonical" href="https://creatoreconomytools.com/tool/' + slug + '" />\n' +
'    <link rel="preconnect" href="https://fonts.googleapis.com" />\n' +
'    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n' +
'    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />\n' +
'    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><defs><linearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%2220%22 y2=%2220%22><stop offset=%220%25%22 stop-color=%22%23a855f7%22/><stop offset=%22100%25%22 stop-color=%22%23ec4899%22/></linearGradient></defs><circle cx=%2210%22 cy=%2210%22 r=%228%22 stroke=%22url(%23g)%22 stroke-width=%222%22 fill=%22none%22/><circle cx=%2210%22 cy=%2210%22 r=%224%22 fill=%22url(%23g)%22/></svg>">\n' +
'    <link rel="stylesheet" href="../styles.css" />\n' +
'\n' +
'    <!-- Structured Data -->\n' +
'    <script type="application/ld+json">\n' +
'    {\n' +
'      "@context": "https://schema.org",\n' +
'      "@type": "SoftwareApplication",\n' +
'      "name": "' + escName + '",\n' +
'      "applicationCategory": "' + toolCat + '",\n' +
'      "description": "' + escDesc + '",\n' +
'      "url": "https://creatoreconomytools.com/tool/' + slug + '"\n' +
'    }\n' +
'    </script>\n' +
'</head>\n' +
'<body style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: var(--bg); color: var(--text); padding: 20px;">\n' +
'    \n' +
'    <a href="/" style="position: absolute; top: 20px; left: 20px; color: var(--text-muted); text-decoration: none; font-weight: 500;">\n' +
'        &larr; Back to Directory\n' +
'    </a>\n' +
'\n' +
'    <div class="modal-content" style="background: var(--surface); padding: 40px; border-radius: 24px; max-width: 600px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid var(--border);">\n' +
'        <div class="modal-logo-wrap" style="margin-bottom: 24px;">\n' +
'            ' + (tool.img ? '<img src="' + escapeHtml(tool.img) + '" alt="' + escapeHtml(tool.name) + ' logo" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' : '') + '\n' +
'            <div class="tool-logo-fallback" ' + (tool.img ? 'style="display:none"' : '') + '>' + initials + '</div>\n' +
'        </div>\n' +
'        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">\n' +
'            <h1 class="modal-title" style="margin: 0; font-size: 28px;">' + escapeHtml(tool.name) + '</h1>\n' +
'            ' + pricingHtml + '\n' +
'        </div>\n' +
'        <div class="modal-cats" style="margin-bottom: 24px;">' + catTags + '</div>\n' +
'        <p class="modal-desc" style="font-size: 16px; line-height: 1.6; color: var(--text-muted); margin-bottom: 32px;">' + (escapeHtml(tool.desc) || 'No description available.') + '</p>\n' +
'        <div class="modal-actions">\n' +
'          ' + (tool.dead ? '<div class="modal-dead-notice"><span>💀</span><span>This tool is no longer available — it shut down or was acquired.</span></div>' : (tool.deal ? '<div class="modal-deal-box" style="width: 100%;"><span class="modal-deal-label">' + escapeHtml(tool.deal) + '</span><a href="' + escapeHtml(tool.url) + '" target="_blank" rel="noopener noreferrer" class="modal-visit-btn deal-btn" style="width: 100%; text-align: center;">Grab this deal &rarr;</a></div>' : '<a href="' + escapeHtml(tool.url) + '" target="_blank" rel="noopener noreferrer" class="modal-visit-btn" style="width: 100%; text-align: center;">Visit ' + escapeHtml(tool.name) + ' &rarr;</a>')) + '\n' +
'        </div>\n' +
'    </div>\n' +
'    \n' +
'</body>\n' +
'</html>';

    try {
        fs.writeFileSync(filePath, htmlContent, 'utf8');
        successCount++;
    } catch (e) {
        console.error('Failed to write ' + fileName + ': ', e);
    }
});

console.log('Successfully generated ' + successCount + ' individual tool pages.');

// Generate sitemap.xml
const sitemapPath = path.join(__dirname, 'sitemap.xml');
let sitemapUrlsXml = '';
for (let i = 0; i < sitemapUrls.length; i++) {
    sitemapUrlsXml += '  <url>\n    <loc>' + escapeHtml(sitemapUrls[i]) + '</loc>\n    <changefreq>weekly</changefreq>\n  </url>\n';
}

const sitemapContent = '<?xml version="1.0" encoding="UTF-8"?>\n' +
'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
sitemapUrlsXml +
'</urlset>';

fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
console.log('Successfully generated sitemap.xml');
