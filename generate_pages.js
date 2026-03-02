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
    const catTags = tool.categories.map(c => '<span class="category-tag">' + escapeHtml(c) + '</span>').join('');
    const pricingHtml = tool.pricing ? '<span class="tool-pricing ' + (tool.pricing.toLowerCase() === 'paid' ? 'paid' : '') + '">' + escapeHtml(tool.pricing) + '</span>' : '';

    const ogImg = tool.img ? escapeHtml(tool.img) : 'https://creatoreconomytools.com/og-image.png';
    const toolCat = tool.categories.length > 0 ? escapeHtml(tool.categories[0]).replace(/"/g, "\\\"") : 'Utility';
    const catSlug = tool.categories.length > 0 ? createSlug(tool.categories[0]) : 'all';

    // Find related tools (same first category, not dead, not the current tool)
    const relatedTools = tools
        .filter(t => !t.dead && t.name !== tool.name && t.categories.includes(tool.categories[0]))
        .sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999))
        .slice(0, 3);

    let relatedHtml = '';
    if (relatedTools.length > 0) {
        relatedHtml = '<div class="related-tools" style="margin-top: 80px; margin-bottom: 40px;"><h2 style="font-size: 28px; font-weight: 800; margin-bottom: 32px; display: flex; align-items: center; gap: 16px;">Related Tools <span style="font-size: 15px; font-weight: 500; color: var(--text-muted); background: var(--surface); padding: 6px 16px; border-radius: 100px; border: 1px solid var(--border);">More in ' + escapeHtml(tool.categories[0] || '') + '</span></h2><div class="tools-grid">';

        relatedTools.forEach(rt => {
            const rtSlug = createSlug(rt.name);
            const rtInitials = rt.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
            const rtCatTags = rt.categories.slice(0, 2).map(c => '<span class="category-tag">' + escapeHtml(c) + '</span>').join('');
            const rtPricingHtml = rt.pricing ? '<span class="tool-pricing ' + (rt.pricing.toLowerCase() === 'paid' ? 'paid' : '') + '">' + escapeHtml(rt.pricing) + '</span>' : '';

            let cardHtml = '<a href="/tool/' + rtSlug + '" class="tool-card ' + (rt.deal ? 'deal-card' : '') + '" style="text-decoration: none; color: inherit; display: block;">';
            if (rt.deal) cardHtml += '<div class="deal-banner">' + escapeHtml(rt.deal) + '</div>';
            cardHtml += '<div class="tool-header"><div class="tool-logo-wrap">';
            if (rt.img) {
                cardHtml += '<img src="' + escapeHtml(rt.img) + '" alt="' + escapeHtml(rt.name) + ' logo" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">';
            }
            cardHtml += '<div class="tool-logo-fallback" ' + (rt.img ? 'style="display:none"' : '') + '>' + rtInitials + '</div></div>';
            cardHtml += '<div class="tool-meta"><div class="tool-name">' + escapeHtml(rt.name) + '</div><div class="tool-categories">' + rtCatTags + '</div></div></div>';
            cardHtml += '<p class="tool-desc">' + (escapeHtml(rt.desc) || 'No description available.') + '</p>';
            cardHtml += '<div class="tool-footer">';
            if (rt.deal) cardHtml += '<span class="tool-visit deal-visit">Grab deal &rarr;</span>';
            else cardHtml += '<span class="tool-visit">Visit &rarr;</span>';
            cardHtml += rtPricingHtml;
            cardHtml += '</div></a>';

            relatedHtml += cardHtml;
        });

        relatedHtml += '</div></div>';
    }

    const escName = escapeHtml(tool.name).replace(/"/g, "\\\"");
    const escDesc = escapeHtml(tool.desc).replace(/"/g, "\\\"");

    // Deal logic
    let actionsHtml = '';
    if (tool.dead) {
        actionsHtml = '<div class="modal-dead-notice"><span>💀</span><span>This tool is no longer available — it shut down or was acquired.</span></div>';
    } else if (tool.deal) {
        actionsHtml = '<div class="modal-deal-box" style="width: auto; display: inline-flex;"><span class="modal-deal-label">' + escapeHtml(tool.deal) + '</span><a href="' + escapeHtml(tool.url) + '" target="_blank" rel="noopener noreferrer" class="modal-visit-btn deal-btn" style="text-align: center;">Grab this deal &rarr;</a></div>';
    } else {
        actionsHtml = '<a href="' + escapeHtml(tool.url) + '" target="_blank" rel="noopener noreferrer" class="modal-visit-btn" style="width: auto; display: inline-flex; text-align: center;">Visit ' + escapeHtml(tool.name) + ' &rarr;</a>';
    }

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
        '    <script>\n' +
        '        // Init theme\n' +
        '        (function () {\n' +
        '            var theme = localStorage.getItem(\'theme\');\n' +
        '            if (theme === \'light\') {\n' +
        '                document.documentElement.setAttribute(\'data-theme\', \'light\');\n' +
        '            } else {\n' +
        '                document.documentElement.setAttribute(\'data-theme\', \'dark\');\n' +
        '            }\n' +
        '        })();\n' +
        '    </script>\n' +
        '</head>\n' +
        '<body class="tool-page-body">\n' +
        ''
        + '<nav class="navbar" id="navbar" role="navigation" aria-label="Main navigation">\n'
        + '        <div class="nav-container">\n'
        + '            <a href="/" class="nav-logo" aria-label="Creator Economy Tools Home">\n'
        + '                <div class="logo-mark">\n'
        + '                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">\n'
        + '                        <circle cx="10" cy="10" r="8" stroke="url(#grad)" stroke-width="2" />\n'
        + '                        <circle cx="10" cy="10" r="4" fill="url(#grad)" />\n'
        + '                        <defs>\n'
        + '                            <linearGradient id="grad" x1="0" y1="0" x2="20" y2="20">\n'
        + '                                <stop offset="0%" stop-color="#a855f7" />\n'
        + '                                <stop offset="100%" stop-color="#ec4899" />\n'
        + '                            </linearGradient>\n'
        + '                        </defs>\n'
        + '                    </svg>\n'
        + '                </div>\n'
        + '                <span class="logo-text">Creator Economy Tools</span>\n'
        + '            </a>\n'
        + '            <div class="nav-links">\n'
        + '                <a href="/" class="nav-link active">Directory</a>\n'
        + '                <a href="/about" class="nav-link">About</a>\n'
        + '                <a href="https://creatoreconomyjobs.co/" class="nav-link" target="_blank" rel="noopener">Jobs</a>\n'
        + '                <a href="https://janismjartans.gumroad.com/l/creatoreconomytools" class="btn btn-primary btn-sm"\n'
        + '                    target="_blank" rel="noopener">\n'
        + '                    Download Database\n'
        + '                </a>\n'
        + '                <button class="theme-toggle" id="themeToggleDesk" aria-label="Toggle theme">\n'
        + '                    <svg class="theme-toggle-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"\n'
        + '                        stroke-linecap="round" stroke-linejoin="round">\n'
        + '                        <circle cx="12" cy="12" r="4" />\n'
        + '                        <path d="M12 2v2" />\n'
        + '                        <path d="M12 20v2" />\n'
        + '                        <path d="m4.93 4.93 1.41 1.41" />\n'
        + '                        <path d="m17.66 17.66 1.41 1.41" />\n'
        + '                        <path d="M2 12h2" />\n'
        + '                        <path d="M20 12h2" />\n'
        + '                        <path d="m6.34 17.66-1.41 1.41" />\n'
        + '                        <path d="m19.07 4.93-1.41 1.41" />\n'
        + '                    </svg>\n'
        + '                    <svg class="theme-toggle-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor"\n'
        + '                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n'
        + '                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />\n'
        + '                    </svg>\n'
        + '                </button>\n'
        + '            </div>\n'
        + '            <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">\n'
        + '                <span></span><span></span><span></span>\n'
        + '            </button>\n'
        + '        </div>\n'
        + '        <div class="nav-mobile" id="navMobile">\n'
        + '            <a href="/" class="nav-link">Directory</a>\n'
        + '            <a href="/about" class="nav-link">About</a>\n'
        + '            <a href="https://creatoreconomyjobs.co/" class="nav-link" target="_blank" rel="noopener">Jobs</a>\n'
        + '            <a href="https://janismjartans.gumroad.com/l/creatoreconomytools" class="btn btn-primary" target="_blank"\n'
        + '                rel="noopener">Download Database</a>\n'
        + '            <button class="theme-toggle" id="themeToggleMob" aria-label="Toggle theme"\n'
        + '                style="margin-top: 8px; justify-content: flex-start; padding-left: 12px; border: 1px solid var(--border);">\n'
        + '                <svg class="theme-toggle-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"\n'
        + '                    stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">\n'
        + '                    <circle cx="12" cy="12" r="4" />\n'
        + '                    <path d="M12 2v2" />\n'
        + '                    <path d="M12 20v2" />\n'
        + '                    <path d="m4.93 4.93 1.41 1.41" />\n'
        + '                    <path d="m17.66 17.66 1.41 1.41" />\n'
        + '                    <path d="M2 12h2" />\n'
        + '                    <path d="M20 12h2" />\n'
        + '                    <path d="m6.34 17.66-1.41 1.41" />\n'
        + '                    <path d="m19.07 4.93-1.41 1.41" />\n'
        + '                </svg>\n'
        + '                <svg class="theme-toggle-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"\n'
        + '                    stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">\n'
        + '                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />\n'
        + '                </svg>\n'
        + '                <span style="font-size: 13px; font-weight: 500;">Toggle Theme</span>\n'
        + '            </button>\n'
        + '        </div>\n'
        + '    </nav>\n'
        +
        '    <main class="main" style="padding-top: 120px; position: relative;">\n' +
        '        <div class="hero-bg" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; pointer-events: none; z-index: 0;">\n' +
        '            <div class="hero-orb hero-orb-1" style="top: 0px; left: 30%; width: 400px; height: 400px; opacity: 0.3;"></div>\n' +
        '            <div class="hero-orb hero-orb-2" style="top: 200px; right: 20%; width: 300px; height: 300px; opacity: 0.2;"></div>\n' +
        '        </div>\n' +
        '        <div style="max-width: 800px; margin: 0 auto; padding: 0 20px; position: relative; z-index: 1;">\n' +
        '            <nav aria-label="breadcrumb" style="margin-bottom: 32px;">\n' +
        '                <ol style="list-style: none; padding: 0; display: flex; align-items: center; justify-content: flex-start; gap: 8px; color: var(--text-muted); font-size: 14px; margin: 0; flex-wrap: wrap;">\n' +
        '                    <li><a href="/" style="color: inherit; text-decoration: none; transition: color 0.2s;">Directory</a></li>\n' +
        '                    <li style="opacity: 0.5;">/</li>\n' +
        '                    <li><a href="/?category=' + catSlug + '" style="color: inherit; text-decoration: none; transition: color 0.2s;">' + escapeHtml(tool.categories[0] || 'Uncategorized') + '</a></li>\n' +
        '                    <li style="opacity: 0.5;">/</li>\n' +
        '                    <li aria-current="page" style="color: var(--text-primary); font-weight: 500;">' + escapeHtml(tool.name) + '</li>\n' +
        '                </ol>\n' +
        '            </nav>\n' +
        '\n' +
        '            <article class="tool-hero" style="background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 48px; display: flex; gap: 40px; align-items: flex-start; position: relative; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.12);">\n' +
        '                <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #a855f7, #ec4899);"></div>\n' +
        '                \n' +
        '                <div class="tool-logo-large" style="flex-shrink: 0; width: 110px; height: 110px; border-radius: 28px; background: var(--bg); display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 800; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 10px 20px rgba(0,0,0,0.05); color: var(--text-muted);">\n' +
        '                    ' + (tool.img ? '<img src="' + escapeHtml(tool.img) + '" alt="' + escapeHtml(tool.name) + ' logo" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />' : '') + '\n' +
        '                    <div class="tool-logo-fallback" ' + (tool.img ? 'style="display:none"' : '') + '>' + initials + '</div>\n' +
        '                </div>\n' +
        '\n' +
        '                <div class="tool-info" style="flex: 1;">\n' +
        '                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">\n' +
        '                        <h1 style="margin: 0; font-size: 42px; font-weight: 800; letter-spacing: -1px; line-height: 1.1; word-break: break-word;">' + escapeHtml(tool.name) + '</h1>\n' +
        '                        ' + pricingHtml + '\n' +
        '                    </div>\n' +
        '                    <div style="display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;">\n' +
        '                        ' + catTags + '\n' +
        '                    </div>\n' +
        '                    <p style="font-size: 18px; line-height: 1.6; color: var(--text-muted); margin-bottom: 40px; max-width: 800px;">\n' +
        '                        ' + escapeHtml(tool.desc).replace(/\n/g, '<br />') + '\n' +
        '                    </p>\n' +
        '                    \n' +
        '                    <div class="tool-actions-wrap">\n' +
        '                        ' + actionsHtml + '\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </article>\n' +
        '            \n' +
        '            ' + relatedHtml + '\n' +
        '        </div>\n' +
        '    </main>\n' +
        '    \n' +
        ''
        + '<footer class="footer" role="contentinfo">\n'
        + '        <div class="footer-container">\n'
        + '            <div class="footer-brand">\n'
        + '                <div class="footer-logo">\n'
        + '                    <div class="logo-mark">\n'
        + '                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">\n'
        + '                            <circle cx="10" cy="10" r="8" stroke="url(#grad2)" stroke-width="2" />\n'
        + '                            <circle cx="10" cy="10" r="4" fill="url(#grad2)" />\n'
        + '                            <defs>\n'
        + '                                <linearGradient id="grad2" x1="0" y1="0" x2="20" y2="20">\n'
        + '                                    <stop offset="0%" stop-color="#a855f7" />\n'
        + '                                    <stop offset="100%" stop-color="#ec4899" />\n'
        + '                                </linearGradient>\n'
        + '                            </defs>\n'
        + '                        </svg>\n'
        + '                    </div>\n'
        + '                    <span class="logo-text">Creator Economy Tools</span>\n'
        + '                </div>\n'
        + '                <p class="footer-desc">The most comprehensive directory of creator economy tools, platforms, and\n'
        + '                    startups. Curated for creators and professionals.</p>\n'
        + '                <div class="footer-social">\n'
        + '                    <a href="https://www.linkedin.com/in/janismjartans/" target="_blank" rel="noopener"\n'
        + '                        aria-label="LinkedIn" class="social-link">\n'
        + '                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">\n'
        + '                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />\n'
        + '                            <rect x="2" y="9" width="4" height="12" />\n'
        + '                            <circle cx="4" cy="4" r="2" />\n'
        + '                        </svg>\n'
        + '                    </a>\n'
        + '                </div>\n'
        + '            </div>\n'
        + '            <div class="footer-links">\n'
        + '                <div class="footer-col">\n'
        + '                    <h3>Directory</h3>\n'
        + '                    <a href="/">All Tools</a>\n'
        + '                    <a href="/about">About</a>\n'
        + '                    <a href="https://creatoreconomyjobs.co/" target="_blank" rel="noopener">Creator Jobs</a>\n'
        + '                    <a href="https://janismjartans.gumroad.com/l/creatoreconomytools" target="_blank"\n'
        + '                        rel="noopener">Download Database</a>\n'
        + '                </div>\n'
        + '            </div>\n'
        + '        </div>\n'
        + '        <div class="footer-bottom">\n'
        + '            <p>© 2025 Creator Economy Tools. Made with ❤️ by <a href="https://www.linkedin.com/in/janismjartans/"\n'
        + '                    target="_blank" rel="noopener">Janis Mjartans</a></p>\n'
        + '            <p class="footer-note">1,000+ tools curated for creators worldwide</p>\n'
        + '        </div>\n'
        + '    </footer>\n'
        +
        '\n' +
        '    <!-- Floating ProductHunt badge -->\n' +
        '    <a class="ph-float-badge" href="https://www.producthunt.com/products/creator-economy-tools/launches/creator-economy-tools?embed=true&utm_source=badge-top-post-badge&utm_medium=badge&utm_campaign=badge-creator-economy-tools" target="_blank" rel="noopener noreferrer" aria-label="Creator Economy Tools on Product Hunt">\n' +
        '        <img alt="Creator Economy Tools | Product Hunt" width="220" height="48" src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=441646&theme=neutral&period=daily&t=1772180818550">\n' +
        '    </a>\n' +
        '\n' +
        '    <script>\n' +
        '        // Toggle mobile menu\n' +
        '        const navToggle = document.getElementById(\'navToggle\');\n' +
        '        const navMobile = document.getElementById(\'navMobile\');\n' +
        '        if (navToggle && navMobile) {\n' +
        '            navToggle.addEventListener(\'click\', () => {\n' +
        '               const expanded = navToggle.getAttribute(\'aria-expanded\') === \'true\';\n' +
        '               navToggle.setAttribute(\'aria-expanded\', !expanded);\n' +
        '               navMobile.classList.toggle(\'active\');\n' +
        '            });\n' +
        '        }\n' +
        '\n' +
        '        // Theme toggle\n' +
        '        function toggleTheme() {\n' +
        '            const currentTheme = document.documentElement.getAttribute(\'data-theme\') || \'dark\';\n' +
        '            const newTheme = currentTheme === \'dark\' ? \'light\' : \'dark\';\n' +
        '            document.documentElement.setAttribute(\'data-theme\', newTheme);\n' +
        '            localStorage.setItem(\'theme\', newTheme);\n' +
        '        }\n' +
        '        document.getElementById(\'themeToggleDesk\')?.addEventListener(\'click\', toggleTheme);\n' +
        '        document.getElementById(\'themeToggleMob\')?.addEventListener(\'click\', toggleTheme);\n' +
        '    </script>\n' +
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
