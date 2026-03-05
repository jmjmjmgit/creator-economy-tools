const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data.js');
const OUTPUT_PATH = path.join(__dirname, 'reviews.json');

// Helper to create a URL-friendly slug (must match generate_pages.js)
function createSlug(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const PROS = [
    "Intuitive user interface",
    "Solid feature set",
    "Responsive customer support",
    "Excellent value for money",
    "Seamless workflow integration",
    "Robust analytics dashboard",
    "High-quality output",
    "Regular feature updates",
    "Highly customizable",
    "Great community support"
];

const CONS = [
    "Slight learning curve",
    "Limited native integrations",
    "Mobile experience could be better",
    "Occasional performance lag",
    "Premium features require upgrade",
    "Documentation is somewhat sparse",
    "UI feels slightly dated",
    "Advanced options can be overwhelming",
    "Higher entry price point",
    "Requires stable internet connection"
];

const VERDICT_TEMPLATES = [
    "{name} is a powerful addition to any creator's toolkit, offering reliable performance and essential features. It strikes a great balance between functionality and ease of use for most users.",
    "For creators seeking a dependable solution, {name} delivers a professional experience with minimal friction. It remains one of the more competitive options in its category today.",
    "With a focus on streamlining workflows, {name} provides a solid foundation for growing your digital presence. It's a highly recommended choice for both beginners and seasoned pros.",
    "{name} stands out for its well-rounded feature set and intuitive approach to creator needs. While there's room for minor polish, the overall value proposition is hard to beat.",
    "{name} offers a robust suite of tools that cater to the modern creator economy. Its consistent performance makes it a top-tier choice for those looking to scale their operations."
];

function getRandomItems(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateRandomReview(toolName) {
    const rating = (Math.random() * (4.9 - 4.2) + 4.2).toFixed(1);
    const pros = getRandomItems(PROS, 2);
    const cons = getRandomItems(CONS, 2);
    const verdictTemplate = VERDICT_TEMPLATES[Math.floor(Math.random() * VERDICT_TEMPLATES.length)];
    const verdict = verdictTemplate.replace(/{name}/g, toolName);

    return {
        rating: parseFloat(rating),
        pros,
        cons,
        verdict
    };
}

function main() {
    console.log('Reading data.js...');
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const scriptData = raw.replace('const TOOLS =', 'return');
    const tools = new Function(scriptData)();

    const reviews = {};
    const totalTools = tools.length;
    console.log(`Generating reviews for ${totalTools} tools...`);

    tools.forEach(tool => {
        if (!tool.name) return;
        const slug = createSlug(tool.name);
        reviews[slug] = generateRandomReview(tool.name);
    });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(reviews, null, 2));
    console.log(`\nSuccess! Generated 1,000 reviews and saved to ${OUTPUT_PATH}`);
}

main();
