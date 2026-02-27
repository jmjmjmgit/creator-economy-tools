const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.js');
let raw = fs.readFileSync(dataPath, 'utf8');

if (!raw.includes('const ALL_CATEGORIES =')) {
    const cats = [
        "AI",
        "Adult",
        "All-in-one",
        "Community & Engagement",
        "Content Creation",
        "Course Creator",
        "E-commerce",
        "Finance",
        "Influencer Marketing/Brand Deals",
        "Link in bio",
        "Livestreaming",
        "Monetization",
        "Other",
        "Social Media Management",
        "Web3/NFT/Blockchain",
        "Website Builder"
    ];

    const toAppend = `\n\nconst ALL_CATEGORIES = ${JSON.stringify(cats, null, 2)};\n`;
    fs.appendFileSync(dataPath, toAppend, 'utf8');
    console.log("Restored ALL_CATEGORIES");
} else {
    console.log("ALL_CATEGORIES already exists");
}
