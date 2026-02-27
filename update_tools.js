const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.js');
let raw = fs.readFileSync(dataPath, 'utf8');

// Strip the const declaration so we can return it from a Function
const scriptData = raw.replace('const TOOLS =', 'return');
const tools = new Function(scriptData)();

// 1. Add new tools if not exist
const rosterExists = tools.find(t => t.name.toLowerCase() === 'roster');
if (!rosterExists) {
    tools.unshift({
        name: "Roster",
        desc: "Roster is an influencer marketing platform that helps brands recruit and manage ambassadors, creators, and affiliates.",
        url: "https://www.joinroster.co/",
        categories: ["Influencer Marketing/Brand Deals", "Community & Engagement"],
        img: "https://assets-global.website-files.com/62e2bc23aa8ca206a48fe75b/62e2bc23aa8ca24a498fe771_Roster-Logo.svg",
        pricing: "",
        dead: false
    });
}

const poppyExists = tools.find(t => t.name.toLowerCase() === 'poppy ai');
if (!poppyExists) {
    tools.unshift({
        name: "Poppy AI",
        desc: "The ultimate AI assistant for creators.",
        url: "https://cet--cleverprogrammer.thrivecart.com/poppy-ai-checkout/",
        categories: ["AI", "Content Creation"],
        img: "",
        pricing: "",
        dead: false,
        deal: "HOT 🔥"
    });
}

const scripeExists = tools.find(t => t.name.toLowerCase() === 'scripe');
if (!scripeExists) {
    tools.unshift({
        name: "Scripe",
        desc: "An AI-powered content platform that repurposes your audio and video into blogs, threads, and linkedIn posts.",
        url: "https://scripe.io/",
        categories: ["AI", "Content Creation"],
        img: "",
        pricing: "",
        dead: false,
        deal: "Exclusive: Use code CET for 1 month free"
    });
}

const clickfunnelsExists = tools.find(t => /clickfunnels/i.test(t.name));
if (!clickfunnelsExists) {
    tools.unshift({
        name: "Clickfunnels",
        desc: "Everything you need to market, sell, and deliver your products and messages online.",
        url: "https://www.clickfunnels.com/",
        categories: ["Website Builder", "E-commerce", "Sales Funnels"],
        img: "",
        pricing: "",
        dead: false
    });
}

const ghlExists = tools.find(t => /gohighlevel/i.test(t.name));
if (!ghlExists) {
    tools.unshift({
        name: "GoHighlevel",
        desc: "The #1 Marketing Platform For Agencies",
        url: "https://www.gohighlevel.com/",
        categories: ["All-in-one", "Website Builder"],
        img: "",
        pricing: "",
        dead: false
    });
}

// 2. Update existing tools with affiliate links & specific deals
function updateTool(nameRegex, updates) {
    const tool = tools.find(t => nameRegex.test(t.name));
    if (tool) {
        Object.assign(tool, updates);
    } else {
        console.warn('Could not find tool matching:', nameRegex);
    }
}

updateTool(/Skool/i, { url: "https://www.skool.com/signup?ref=7b29eefcfd4a40c4a6b5837554b10dd6" });
updateTool(/Scripe/i, { deal: "Exclusive: Use code CET for 1 month free" });
updateTool(/Crayo\.?AI/i, { url: "https://crayo.ai/?ref=janis" });
updateTool(/Circle/i, { url: "https://try.circle.so/61p65qqh3jp1" });
updateTool(/Moosend/i, { url: "https://trymoo.moosend.com/zplfmbesfwnq" });
updateTool(/^Notion$/i, { url: "https://affiliate.notion.so/fub7e8buix33" });

// 3. Setup Featured Order
const orderNames = [
    /Poppy AI/i,
    /Clickfunnels/i,
    /GoHighlevel/i,
    /Skool/i,
    /Scripe/i,
    /The Influencer Marketing Factory/i,
    /Hafi by HypeAuditor/i,
    /Crayo\.?AI/i,
    /Circle/i,
    /Moosend/i,
    /^Notion$/i
];

// Reset all featuredOrder to 999 to start fresh
tools.forEach(t => t.featuredOrder = 999);

orderNames.forEach((regex, index) => {
    const tool = tools.find(t => regex.test(t.name));
    if (tool) {
        tool.featuredOrder = index + 1;
        if (!tool.deal) {
            tool.deal = "Featured ⭐️";
        }
    } else {
        console.warn('Could not find order tool matching:', regex);
    }
});

// Write back
const output = `// Auto-generated — Creator Economy Tools by Janis Mjartans\nconst TOOLS = ${JSON.stringify(tools, null, 2)};\n`;
fs.writeFileSync(dataPath, output, 'utf8');
console.log('Successfully updated data.js');
