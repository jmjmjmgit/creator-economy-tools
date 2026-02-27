/* ── Creator Economy Tools – App Logic ──────── */
'use strict';

// ── Category display config ──────────────────
const CAT_CONFIG = {
    'All Tools': { icon: '🌐', slug: 'all' },
    'AI': { icon: '🤖', slug: 'ai' },
    'Adult': { icon: '🔞', slug: 'adult' },
    'All-in-one': { icon: '⚡', slug: 'all-in-one' },
    'Community & Engagement': { icon: '👥', slug: 'community' },
    'Content Creation': { icon: '✍️', slug: 'content' },
    'Course Creator': { icon: '🎓', slug: 'courses' },
    'E-commerce': { icon: '🛍️', slug: 'ecommerce' },
    'Finance': { icon: '💰', slug: 'finance' },
    'Influencer Marketing/Brand Deals': { icon: '🤝', slug: 'influencer' },
    'Link in bio': { icon: '🔗', slug: 'link-bio' },
    'Livestreaming': { icon: '📡', slug: 'live' },
    'Monetization': { icon: '💸', slug: 'monetization' },
    'Other': { icon: '🔹', slug: 'other' },
    'Social Media Management': { icon: '📱', slug: 'social' },
    'Web3/NFT/Blockchain': { icon: '⛓️', slug: 'web3' },
    'Website Builder': { icon: '🏗️', slug: 'website' },
    'Graveyard': { icon: '🪦', slug: 'graveyard' },
};

// ── State ─────────────────────────────────────
let state = {
    query: '',
    selectedCats: new Set(), // empty = All Tools
    multiSelect: true,
    sort: 'name',
    viewMode: 'grid',
    page: 1,
    perPage: 48,
};

let filtered = [];

// ── DOM refs ──────────────────────────────────
const $search = document.getElementById('searchInput');
const $categoryList = document.getElementById('categoryList');
const $toolsGrid = document.getElementById('toolsGrid');
const $resultsCount = document.getElementById('resultsCount');
const $totalCount = document.getElementById('totalCount');
const $catCount = document.getElementById('categoryCount');
const $sortSelect = document.getElementById('sortSelect');
const $viewGrid = document.getElementById('viewGrid');
const $viewList = document.getElementById('viewList');
const $loadMoreBtn = document.getElementById('loadMoreBtn');
const $loadMoreWrap = document.getElementById('loadMoreWrap');
const $emptyState = document.getElementById('emptyState');
const $loadingState = document.getElementById('loadingState');
const $clearFilters = document.getElementById('clearFilters');
const $resetSearch = document.getElementById('resetSearch');
const $modalOverlay = document.getElementById('modalOverlay');
const $modalContent = document.getElementById('modalContent');
const $modalClose = document.getElementById('modalClose');
const $navbar = document.getElementById('navbar');

// ── Init ──────────────────────────────────────
function init() {
    // Stats
    $totalCount.textContent = TOOLS.length.toLocaleString() + '+';
    $catCount.textContent = ALL_CATEGORIES.length + '+';

    buildSidebar();
    buildMobileFilters();
    parseURLParams();
    renderAll();
    bindEvents();
}

// ── URL params ────────────────────────────────
function parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) state.query = params.get('q');
    const cats = params.get('category');
    if (cats) cats.split(',').forEach(c => state.selectedCats.add(c.trim()));
    if (state.query) $search.value = state.query;
}

function updateURL() {
    const params = new URLSearchParams();
    if (state.query) params.set('q', state.query);
    if (state.selectedCats.size) params.set('category', [...state.selectedCats].join(','));
    const url = params.toString() ? `?${params}` : window.location.pathname;
    history.replaceState(null, '', url);
}

// ── Sidebar ───────────────────────────────────
function buildSidebar() {
    const counts = {};
    const liveTools = TOOLS.filter(t => !t.dead);
    liveTools.forEach(t => {
        t.categories.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
    });

    const countAll = document.getElementById('count-all');
    if (countAll) countAll.textContent = liveTools.length;

    ALL_CATEGORIES.forEach(cat => {
        const cfg = CAT_CONFIG[cat] || { icon: '🔹', slug: cat.toLowerCase() };
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.dataset.category = cat;
        btn.innerHTML = `
      <span class="cat-icon">${cfg.icon}</span>
      <span class="cat-name">${cat}</span>
      <span class="cat-count">${counts[cat] || 0}</span>
    `;
        btn.addEventListener('click', () => setCategory(cat));
        $categoryList.appendChild(btn);
    });

    // Graveyard — pinned at the bottom with a divider
    const deadCount = TOOLS.filter(t => t.dead).length;
    const divider = document.createElement('div');
    divider.className = 'sidebar-divider';
    $categoryList.appendChild(divider);

    const gravBtn = document.createElement('button');
    gravBtn.className = 'category-btn graveyard-btn';
    gravBtn.dataset.category = 'Graveyard';
    gravBtn.innerHTML = `
      <span class="cat-icon">🪦</span>
      <span class="cat-name">Graveyard</span>
      <span class="cat-count graveyard-count">${deadCount}</span>
    `;
    gravBtn.addEventListener('click', () => setCategory('Graveyard'));
    $categoryList.appendChild(gravBtn);
}

function buildMobileFilters() {
    const container = document.querySelector('.mobile-filters');
    if (!container) return;

    const allBtn = document.createElement('button');
    allBtn.className = 'mobile-filter-btn active';
    allBtn.dataset.cat = 'all';
    allBtn.textContent = '🌐 All';
    allBtn.addEventListener('click', () => setCategory('all'));
    container.appendChild(allBtn);

    ALL_CATEGORIES.forEach(cat => {
        const cfg = CAT_CONFIG[cat] || { icon: '🔹' };
        const btn = document.createElement('button');
        btn.className = 'mobile-filter-btn';
        btn.dataset.cat = cat;
        btn.textContent = `${cfg.icon} ${cat}`;
        btn.addEventListener('click', () => setCategory(cat));
        container.appendChild(btn);
    });
}

function setCategory(cat) {
    state.page = 1;

    if (cat === 'all') {
        state.selectedCats.clear();
    } else if (cat === 'Graveyard') {
        state.selectedCats.clear();
        state.selectedCats.add('Graveyard');
    } else {
        state.selectedCats.delete('Graveyard');
        if (state.multiSelect) {
            // Toggle in multi-select mode
            if (state.selectedCats.has(cat)) {
                state.selectedCats.delete(cat);
            } else {
                state.selectedCats.add(cat);
            }
        } else {
            // Single-select: replace selection
            if (state.selectedCats.has(cat) && state.selectedCats.size === 1) {
                state.selectedCats.clear(); // clicking active cat deselects (back to All)
            } else {
                state.selectedCats.clear();
                state.selectedCats.add(cat);
            }
        }
    }

    updateActiveStates();
    renderAll();
    updateURL();
}

function updateActiveStates() {
    const isAll = state.selectedCats.size === 0;
    const isGraveyard = state.selectedCats.has('Graveyard') && state.selectedCats.size === 1;

    // Sidebar
    document.getElementById('cat-all')?.classList.toggle('active', isAll);
    document.querySelectorAll('.category-btn:not(#cat-all)').forEach(b => {
        b.classList.toggle('active', state.selectedCats.has(b.dataset.category));
    });

    // Mobile
    document.querySelectorAll('.mobile-filter-btn').forEach(b => {
        const cat = b.dataset.cat;
        b.classList.toggle('active',
            (cat === 'all' && isAll) ||
            (cat !== 'all' && state.selectedCats.has(cat))
        );
    });
}

// ── Filter & sort ─────────────────────────────
function getFiltered() {
    let list = TOOLS;
    const q = state.query.toLowerCase().trim();

    if (q) {
        list = list.filter(t =>
            t.name.toLowerCase().includes(q) ||
            t.desc.toLowerCase().includes(q) ||
            t.categories.some(c => c.toLowerCase().includes(q))
        );
    }

    const isGraveyard = state.selectedCats.has('Graveyard') && state.selectedCats.size === 1;
    const isAll = state.selectedCats.size === 0;

    if (isGraveyard) {
        list = list.filter(t => t.dead);
    } else if (!isAll) {
        // Show live tools matching ANY selected category
        list = list.filter(t => !t.dead && t.categories.some(c => state.selectedCats.has(c)));
    } else {
        list = list.filter(t => !t.dead);
    }

    // Sort
    list = [...list].sort((a, b) => {
        switch (state.sort) {
            case 'name-desc': return b.name.localeCompare(a.name);
            case 'category': return (a.categories[0] || '').localeCompare(b.categories[0] || '');
            default: return a.name.localeCompare(b.name);
        }
    });

    return list;
}

// ── Render ────────────────────────────────────
function renderAll() {
    filtered = getFiltered();
    $resultsCount.textContent = filtered.length.toLocaleString();

    $loadingState.classList.add('hidden');

    // Graveyard header
    const existing = document.getElementById('graveyardHeader');
    if (existing) existing.remove();
    const isGraveyard = state.selectedCats.has('Graveyard') && state.selectedCats.size === 1;
    if (isGraveyard) {
        const hdr = document.createElement('div');
        hdr.id = 'graveyardHeader';
        hdr.className = 'graveyard-header';
        hdr.innerHTML = `
          <div class="graveyard-header-inner">
            <span class="graveyard-emoji">🪦</span>
            <div>
              <h2>The Graveyard</h2>
              <p>These tools &amp; startups shut down, got acquired, or faded away. A reminder of how fast the creator economy moves.</p>
            </div>
          </div>
        `;
        $toolsGrid.parentElement.insertBefore(hdr, $toolsGrid);
    }

    const visible = filtered.slice(0, state.page * state.perPage);
    const hasMore = visible.length < filtered.length;

    if (filtered.length === 0) {
        $toolsGrid.innerHTML = '';
        $emptyState.classList.remove('hidden');
        $loadMoreWrap.classList.add('hidden');
        return;
    }

    $emptyState.classList.add('hidden');
    renderCards(visible);
    $loadMoreWrap.classList.toggle('hidden', !hasMore);
}

function renderCards(list) {
    const isListView = state.viewMode === 'list';
    $toolsGrid.className = 'tools-grid' + (isListView ? ' list-view' : '');

    const frag = document.createDocumentFragment();
    list.forEach(tool => {
        const card = buildCard(tool, isListView);
        frag.appendChild(card);
    });

    $toolsGrid.innerHTML = '';
    $toolsGrid.appendChild(frag);
}

function buildCard(tool, isListView) {
    const div = document.createElement('div');
    div.className = 'tool-card' + (tool.dead ? ' dead-card' : '') + (tool.deal ? ' deal-card' : '');
    div.setAttribute('role', 'listitem');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `${tool.name} – ${tool.categories.join(', ')}`);

    const catTags = tool.categories.slice(0, 2).map(c =>
        `<span class="category-tag">${c}</span>`
    ).join('');

    const pricingHtml = tool.pricing
        ? `<span class="tool-pricing ${tool.pricing.toLowerCase() === 'paid' ? 'paid' : ''}">${tool.pricing}</span>`
        : '';

    const initials = tool.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    div.innerHTML = `
    ${tool.deal ? `<div class="deal-banner">${escHtml(tool.deal)}</div>` : ''}
    <div class="tool-header">
      <div class="tool-logo-wrap">
        ${tool.img
            ? `<img src="${escHtml(tool.img)}" alt="${escHtml(tool.name)} logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : ''
        }
        <div class="tool-logo-fallback" ${tool.img ? 'style="display:none"' : ''}>${initials}</div>
      </div>
      <div class="tool-meta">
        <div class="tool-name">${escHtml(tool.name)}</div>
        <div class="tool-categories">${catTags}</div>
      </div>
    </div>
    <p class="tool-desc">${escHtml(tool.desc) || 'No description available.'}</p>
    <div class="tool-footer">
      ${tool.dead
            ? `<span class="dead-badge">💀 Shut down</span>`
            : tool.deal
                ? `<span class="tool-visit deal-visit">Grab deal →</span>`
                : `<span class="tool-visit">Visit →</span>`
        }
      ${pricingHtml}
    </div>
  `;

    div.addEventListener('click', () => openModal(tool));
    div.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(tool); } });
    return div;
}

// ── Modal ─────────────────────────────────────
function openModal(tool) {
    const initials = tool.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const catTags = tool.categories.map(c =>
        `<span class="modal-cat-tag">${c}</span>`
    ).join('');
    const pricingHtml = tool.pricing ? `<span class="tool-pricing ${tool.pricing.toLowerCase() === 'paid' ? 'paid' : ''}">${tool.pricing}</span>` : '';

    $modalContent.innerHTML = `
    <div class="modal-logo-wrap">
      ${tool.img
            ? `<img src="${escHtml(tool.img)}" alt="${escHtml(tool.name)} logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : ''
        }
      <div class="tool-logo-fallback" ${tool.img ? 'style="display:none"' : ''}>${initials}</div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <h2 class="modal-title">${escHtml(tool.name)}</h2>
      ${pricingHtml}
    </div>
    <div class="modal-cats">${catTags}</div>
    <p class="modal-desc">${escHtml(tool.desc) || 'No description available.'}</p>
    <div class="modal-actions">
      ${tool.dead
            ? `<div class="modal-dead-notice">
             <span>💀</span>
             <span>This tool is no longer available — it shut down or was acquired.</span>
           </div>`
            : tool.deal
                ? `<div class="modal-deal-box">
                     <span class="modal-deal-label">${escHtml(tool.deal)}</span>
                     <a href="${escHtml(tool.url)}" target="_blank" rel="noopener noreferrer" class="modal-visit-btn deal-btn">
                       Grab this deal →
                     </a>
                   </div>`
                : `<a href="${escHtml(tool.url)}" target="_blank" rel="noopener noreferrer" class="modal-visit-btn">
             Visit ${escHtml(tool.name)} →
           </a>`
        }
    </div>
  `;

    $modalOverlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    $modalClose.focus();
}

function closeModal() {
    $modalOverlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
}

// ── Events ────────────────────────────────────
function bindEvents() {
    // Search
    let searchTimer;
    $search.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.query = $search.value;
            state.page = 1;
            renderAll();
            updateURL();
        }, 200);
    });

    // Cmd+K
    document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            $search.focus();
        }
        if (e.key === 'Escape') closeModal();
    });

    // Sort
    $sortSelect.addEventListener('change', () => {
        state.sort = $sortSelect.value;
        state.page = 1;
        renderAll();
    });

    // View toggle
    $viewGrid.addEventListener('click', () => {
        state.viewMode = 'grid';
        $viewGrid.classList.add('active'); $viewGrid.setAttribute('aria-pressed', 'true');
        $viewList.classList.remove('active'); $viewList.setAttribute('aria-pressed', 'false');
        renderAll();
    });
    $viewList.addEventListener('click', () => {
        state.viewMode = 'list';
        $viewList.classList.add('active'); $viewList.setAttribute('aria-pressed', 'true');
        $viewGrid.classList.remove('active'); $viewGrid.setAttribute('aria-pressed', 'false');
        renderAll();
    });

    // All tools button
    const $catAll = document.getElementById('cat-all');
    if ($catAll) $catAll.addEventListener('click', () => setCategory('all'));

    // Load more
    $loadMoreBtn.addEventListener('click', () => {
        state.page++;
        renderAll();
        const cards = $toolsGrid.querySelectorAll('.tool-card');
        const firstNew = cards[(state.page - 1) * state.perPage];
        if (firstNew) firstNew.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    // Clear / reset
    $clearFilters.addEventListener('click', () => {
        state.selectedCats.clear();
        state.query = '';
        state.page = 1;
        $search.value = '';
        updateActiveStates();
        renderAll();
        updateURL();
    });

    $resetSearch?.addEventListener('click', () => {
        state.query = '';
        $search.value = '';
        state.page = 1;
        renderAll();
        updateURL();
    });

    // Modal
    $modalClose.addEventListener('click', closeModal);
    $modalOverlay.addEventListener('click', e => { if (e.target === $modalOverlay) closeModal(); });

    // Navbar scroll
    window.addEventListener('scroll', () => {
        $navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // Multi-select toggle

    // Load more
    $loadMoreBtn.addEventListener('click', () => {
        state.page++;
        renderAll();
        // Scroll to newly added content
        const cards = $toolsGrid.querySelectorAll('.tool-card');
        const firstNew = cards[(state.page - 1) * state.perPage];
        if (firstNew) firstNew.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    // Clear / reset
    $clearFilters.addEventListener('click', () => {
        state.selectedCats.clear();
        state.query = '';
        state.page = 1;
        $search.value = '';
        updateActiveStates();
        renderAll();
        updateURL();
    });

    $resetSearch?.addEventListener('click', () => {
        state.query = '';
        $search.value = '';
        state.page = 1;
        renderAll();
        updateURL();
    });

    // Modal
    $modalClose.addEventListener('click', closeModal);
    $modalOverlay.addEventListener('click', e => { if (e.target === $modalOverlay) closeModal(); });

    // Navbar scroll
    window.addEventListener('scroll', () => {
        $navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // Multi-select toggle
    const $multiToggle = document.getElementById('multiSelectToggle');
    $multiToggle?.addEventListener('click', () => {
        state.multiSelect = !state.multiSelect;
        $multiToggle.classList.toggle('active', state.multiSelect);
        $multiToggle.setAttribute('aria-checked', state.multiSelect);
        // Reset to All when switching to single-select if multiple cats selected
        if (!state.multiSelect && state.selectedCats.size > 1) {
            state.selectedCats.clear();
            updateActiveStates();
            renderAll();
            updateURL();
        }
    });

    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navMobile = document.getElementById('navMobile');
    navToggle?.addEventListener('click', () => {
        const isOpen = navMobile.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen);
    });
}

// ── Helpers ───────────────────────────────────
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ── Boot ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
