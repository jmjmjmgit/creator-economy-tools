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
    const toolCat = tool.categories.length > 0 ? tool.categories[0] : 'Utility';
    const catParam = encodeURIComponent(toolCat);
    const catSlug = createSlug(toolCat);

    // Find related tools (same first category, not dead, not the current tool)
    const relatedTools = tools
        .filter(t => !t.dead && t.name !== tool.name && t.categories.includes(tool.categories[0]))
        .sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999))
        .slice(0, 3);

    let relatedHtml = '';
    if (relatedTools.length > 0) {
        relatedHtml = '<div class="related-tools" style="margin-top: 80px; margin-bottom: 40px;"><h2 class="related-header">Related Tools <a href="/?category=' + catParam + '" style="text-decoration:none;"><span class="related-badge">More in ' + escapeHtml(toolCat) + ' &rarr;</span></a></h2><div class="tools-grid">';

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
        '    <style>\n' +
        '        /* Premium Hover Effects & Layout */\n' +
        '        .tool-hero {\n' +
        '            background: var(--surface);\n' +
        '            border: 1px solid var(--border);\n' +
        '            border-radius: 24px;\n' +
        '            padding: 48px;\n' +
        '            display: flex;\n' +
        '            gap: 40px;\n' +
        '            align-items: flex-start;\n' +
        '            position: relative;\n' +
        '            overflow: hidden;\n' +
        '            box-shadow: 0 30px 60px rgba(0,0,0,0.12);\n' +
        '            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n' +
        '        }\n' +
        '        .tool-hero-gradient {\n' +
        '            position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--purple), var(--pink));\n' +
        '        }\n' +
        '        .tool-hero:hover {\n' +
        '            transform: translateY(-4px);\n' +
        '            box-shadow: 0 40px 80px rgba(0,0,0,0.2), 0 0 40px rgba(168, 85, 247, 0.15);\n' +
        '        }\n' +
        '        .tool-logo-large {\n' +
        '            flex-shrink: 0; width: 110px; height: 110px; border-radius: 28px; background: var(--bg); display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 800; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 10px 20px rgba(0,0,0,0.05); color: var(--text-muted);\n' +
        '        }\n' +
        '        .tool-logo-large img {\n' +
        '            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);\n' +
        '            width: 100%; height: 100%; object-fit: cover;\n' +
        '        }\n' +
        '        .tool-hero:hover .tool-logo-large img {\n' +
        '            transform: scale(1.08);\n' +
        '        }\n' +
        '        .tool-info {\n' +
        '            flex: 1;\n' +
        '        }\n' +
        '        .tool-title-row {\n' +
        '            display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;\n' +
        '        }\n' +
        '        .tool-title {\n' +
        '            margin: 0; font-size: 42px; font-weight: 800; letter-spacing: -1px; line-height: 1.1; word-break: break-word;\n' +
        '        }\n' +
        '        .tool-tags-row {\n' +
        '            display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;\n' +
        '        }\n' +
        '        .tool-description {\n' +
        '            font-size: 18px; line-height: 1.6; color: var(--text-muted); margin-bottom: 40px; max-width: 800px;\n' +
        '        }\n' +
        '        .related-header {\n' +
        '            font-size: 28px; font-weight: 800; margin-bottom: 32px; display: flex; align-items: center; gap: 16px;\n' +
        '        }\n' +
        '        .related-badge {\n' +
        '            font-size: 15px; font-weight: 500; color: var(--text-muted); background: var(--surface); padding: 6px 16px; border-radius: 100px; border: 1px solid var(--border);\n' +
        '        }\n' +
        '        .related-tools .tool-card {\n' +
        '            transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;\n' +
        '            background: var(--surface);\n' +
        '            border: 1px solid var(--border);\n' +
        '            border-radius: 16px;\n' +
        '            padding: 24px;\n' +
        '            display: flex;\n' +
        '            flex-direction: column;\n' +
        '        }\n' +
        '        .related-tools .tool-card:hover {\n' +
        '            transform: translateY(-4px) scale(1.01);\n' +
        '            box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 0 20px rgba(236, 72, 153, 0.1);\n' +
        '            border-color: rgba(168, 85, 247, 0.3);\n' +
        '        }\n' +
        '        .modal-visit-btn {\n' +
        '            transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;\n' +
        '        }\n' +
        '        .modal-visit-btn:hover {\n' +
        '            transform: translateY(-2px);\n' +
        '            box-shadow: 0 8px 24px rgba(168, 85, 247, 0.25);\n' +
        '        }\n' +
        '        .deal-btn:hover {\n' +
        '            box-shadow: 0 8px 24px rgba(236, 72, 153, 0.35);\n' +
        '        }\n' +
        '        @media (max-width: 768px) {\n' +
        '            .tool-hero {\n' +
        '                flex-direction: column;\n' +
        '                align-items: center;\n' +
        '                padding: 32px 20px;\n' +
        '                gap: 24px;\n' +
        '                text-align: center;\n' +
        '            }\n' +
        '            .tool-logo-large {\n' +
        '                width: 80px;\n' +
        '                height: 80px;\n' +
        '                border-radius: 20px;\n' +
        '                font-size: 32px;\n' +
        '                margin: 0 auto;\n' +
        '            }\n' +
        '            .tool-info {\n' +
        '                display: flex;\n' +
        '                flex-direction: column;\n' +
        '                align-items: center;\n' +
        '                width: 100%;\n' +
        '            }\n' +
        '            .tool-title-row {\n' +
        '                justify-content: center;\n' +
        '            }\n' +
        '            .tool-title {\n' +
        '                font-size: 32px;\n' +
        '            }\n' +
        '            .tool-tags-row {\n' +
        '                justify-content: center;\n' +
        '            }\n' +
        '            .tool-description {\n' +
        '                font-size: 16px;\n' +
        '                margin-bottom: 28px;\n' +
        '            }\n' +
        '            .tool-actions-wrap {\n' +
        '                display: flex;\n' +
        '                justify-content: center;\n' +
        '                width: 100%;\n' +
        '            }\n' +
        '            .related-header {\n' +
        '                flex-direction: column;\n' +
        '                align-items: flex-start;\n' +
        '                gap: 12px;\n' +
        '            }\n' +
        '            .tools-grid {\n' +
        '                grid-template-columns: 1fr !important;\n' +
        '            }\n' +
        '        }\n' +
        '    </style>\n' +
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
        '                    <li><a href="/?category=' + catParam + '" style="color: inherit; text-decoration: none; transition: color 0.2s;">' + escapeHtml(toolCat) + '</a></li>\n' +
        '                    <li style="opacity: 0.5;">/</li>\n' +
        '                    <li aria-current="page" style="color: var(--text-primary); font-weight: 500;">' + escapeHtml(tool.name) + '</li>\n' +
        '                </ol>\n' +
        '            </nav>\n' +
        '\n' +
        '            <article class="tool-hero">\n' +
        '                <div class="tool-hero-gradient"></div>\n' +
        '                \n' +
        '                <div class="tool-logo-large">\n' +
        '                    ' + (tool.img ? '<img src="' + escapeHtml(tool.img) + '" alt="' + escapeHtml(tool.name) + ' logo" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />' : '') + '\n' +
        '                    <div class="tool-logo-fallback" ' + (tool.img ? 'style="display:none"' : '') + '>' + initials + '</div>\n' +
        '                </div>\n' +
        '\n' +
        '                <div class="tool-info">\n' +
        '                    <div class="tool-title-row">\n' +
        '                        <h1 class="tool-title">' + escapeHtml(tool.name) + '</h1>\n' +
        '                        ' + pricingHtml + '\n' +
        '                    </div>\n' +
        '                    <div class="tool-tags-row">\n' +
        '                        ' + catTags + '\n' +
        '                    </div>\n' +
        '                    <p class="tool-description">\n' +
        '                        ' + escapeHtml(tool.desc).replace(/\n/g, '<br />') + '\n' +
        '                    </p>\n' +
        '                    \n' +
        '                    <div class="tool-actions-wrap">\n' +
        '                        ' + actionsHtml + '\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </article>\n' +
        '            \n' +
        '            ' + (relatedTools.length > 0 ?
            '<div class="related-tools" style="margin-top: 80px; margin-bottom: 40px;">' +
            '<h2 class="related-header">Related Tools <a href="/?category=' + catParam + '" style="text-decoration:none;"><span class="related-badge">More in ' + escapeHtml(toolCat) + ' &rarr;</span></a></h2>' +
            '<div class="tools-grid">' +
            relatedTools.map(t => {
                let innerPricing = '';
                if (t.deal) {
                    innerPricing = '<div class="deal-banner">' + escapeHtml(t.deal) + '</div>';
                }
                return '<a href="/tool/' + escapeHtml(t.id) + '" class="tool-card ' + (t.deal ? 'deal-card' : '') + '" style="text-decoration: none; color: inherit; display: block;">' +
                    innerPricing +
                    '<div class="tool-header">' +
                    '<div class="tool-logo-wrap">' +
                    (t.img ? '<img src="' + escapeHtml(t.img) + '" alt="' + escapeHtml(t.name) + ' logo" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />' : '') +
                    '<div class="tool-logo-fallback" ' + (t.img ? 'style="display:none"' : '') + '>' + (t.name ? t.name.substring(0, 2).toUpperCase() : '??') + '</div>' +
                    '</div>' +
                    '<div class="tool-meta">' +
                    '<div class="tool-name">' + escapeHtml(t.name) + '</div>' +
                    '<div class="tool-categories">' +
                    (t.categories || []).slice(0, 2).map(c => '<span class="category-tag">' + escapeHtml(c) + '</span>').join('') +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<p class="tool-desc">' + escapeHtml(t.desc) + '</p>' +
                    '<div class="tool-footer">' +
                    '<span class="tool-visit' + (t.deal ? ' deal-visit' : '') + '">' + (t.deal ? 'Grab deal &rarr;' : 'Visit &rarr;') + '</span>' +
                    '</div>' +
                    '</a>';
            }).join('') +
            '</div>' +
            '</div>' : '') + '\n' +
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
