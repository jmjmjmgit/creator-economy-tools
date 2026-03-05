const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.js');
let rawData = fs.readFileSync(dataPath, 'utf8');

const blortObj = {
    name: "Blort AI",
    desc: "Blort is your own creative strategist. Helps you find your competitor's best content, break it down frame by frame and adapt it for your product instead.",
    url: "https://getblort.com/?via=cet",
    categories: ["AI", "Content Creation"],
    img: "https://framerusercontent.com/images/21WhF0iinsryymNF145NSV4IVYI.png?width=375&height=375",
    pricing: "Paid",
    dead: false,
    deal: "Featured ⭐️",
    featuredOrder: 0
};

// Check if Blort already exists
if (!rawData.includes('"name": "Blort AI"')) {
    // Insert after Poppy AI
    const insertTag = '"name": "Poppy AI",';
    const lines = rawData.split('\n');
    let insertIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(insertTag)) {
            // Find the end of Poppy AI object
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].trim() === '},') {
                    insertIndex = j + 1;
                    break;
                }
            }
            break;
        }
    }

    if (insertIndex !== -1) {
        const blortString = '  {\n    "name": "Blort AI",\n    "desc": "Blort is your own creative strategist. Helps you find your competitor\'s best content, break it down frame by frame and adapt it for your product instead.",\n    "url": "https://getblort.com/?via=cet",\n    "categories": [\n      "AI",\n      "Content Creation"\n    ],\n    "img": "https://framerusercontent.com/images/21WhF0iinsryymNF145NSV4IVYI.png?width=375&height=375",\n    "pricing": "Paid",\n    "dead": false,\n    "deal": "Featured ⭐️",\n    "featuredOrder": 0\n  },';
        lines.splice(insertIndex, 0, blortString);
        fs.writeFileSync(dataPath, lines.join('\n'));
        console.log('Added Blort AI to data.js');
    }
} else {
    console.log('Blort AI already in data.js');
}

// Add to reviews.json
const reviewsPath = path.join(__dirname, 'reviews.json');
const reviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));

reviews['blort-ai'] = {
    rating: 4.5,
    pros: [
        "Turns proven viral content into reusable frameworks",
        "Centralizes research with multi-model shared boards"
    ],
    cons: [
        "Credit-based pricing can run out mid-session",
        "Learning curve and UX can feel confusing initially"
    ],
    verdict: "Blort AI is an ambitious visual workspace that shines when you treat content like an experiment lab, realistically saving serious time for active creators.",
    longReviewHtml: `
<div style="color: var(--text-secondary); line-height: 1.7; font-size: 16px;">
<p>Blort AI is a specialized content research and creation tool aimed at short‑form video creators and performance marketers; it’s powerful if you live on TikTok/Reels/Shorts, but its credit system, learning curve, and price mean it can feel overkill or clunky for lighter users. <a href="https://app.getblort.com" style="color:var(--purple); text-decoration: none;">app.getblort</a></p>

<h3 style="margin-top: 32px; font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">What Blort AI actually does</h3>
<p>Blort positions itself as a “creative strategist,” not just a text generator: you feed it social posts or files and it breaks them down so you can replicate what works for your brand. It can ingest TikTok, Instagram, Facebook, YouTube Shorts, X posts, Loom and Google Drive videos, plus PDFs, images, CSVs, and even whole websites onto a visual whiteboard. You then attach an AI chat to these boards so the models can see transcripts and visual context, and ask it to analyze, summarize, or rescript content into new hooks, scripts, and captions. It runs multiple frontier models (OpenAI, Claude, Gemini, etc.) in one place and lets you switch models inside the same thread to refine outputs. <a href="https://www.linkedin.com/company/blort-ai" style="color:var(--purple); text-decoration: none;">linkedin</a></p>

<h3 style="margin-top: 32px; font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">Standout strengths</h3>
<p>Blort’s core strength is turning proven viral content into reusable frameworks: it helps you see why a competitor’s video worked and adapt that structure instead of guessing from scratch. The built‑in “viral library” and profile extraction features surface top‑performing videos and group a creator’s strongest formats, which is excellent for research at scale. Power users and agencies in case‑study style content report big gains in speed and results, claiming major time savings on ideation and examples of campaigns driving millions of combined views or meaningful revenue. <a href="https://www.youtube.com/watch?v=b6OqxWTQinc" style="color:var(--purple); text-decoration: none;">youtube</a></p>

<h3 style="margin-top: 32px; font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">Weaknesses and drawbacks</h3>
<p>The biggest friction point is its credit‑based pricing: reviewers have run out of credits mid‑session and felt constrained, especially given subscription costs around 39–59 USD monthly on monthly plans. Several independent reviewers describe the current UX and workflow as confusing or not yet “worth it” relative to cheaper or free tools like NotebookLM or more generic chatbots, particularly if you’re not using it heavily every week. Blort also does not offer refunds (only a 7‑day trial), which may worry buyers of a relatively young product that still has limited third‑party reviews and traffic. <a href="https://www.youtube.com/watch?v=IJLkRgyo5U0" style="color:var(--purple); text-decoration: none;">youtube</a></p>

<h3 style="margin-top: 32px; font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">Pricing and who it’s for</h3>
<p>Blort offers two tiers: Basic and Pro, with roughly 4,000 vs 8,000 credits per month on monthly billing or much higher annual credit pools at discounted per‑month rates. Both tiers include the whiteboard interface, viral library, templates, and access to multiple top‑tier models, with Pro adding priority support that may matter to agencies or teams. This tool makes the most sense for creators, media teams, and agencies actively producing large volumes of short‑form content, where shaving hours off research and scripting each week easily justifies the subscription. <a href="https://www.linkedin.com/company/blort-ai" style="color:var(--purple); text-decoration: none;">linkedin</a></p>

<h3 style="margin-top: 32px; font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">Fit overview</h3>
<div style="overflow-x: auto;">
<table style="width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px;">
    <thead>
        <tr style="border-bottom: 2px solid var(--border);">
            <th style="text-align: left; padding: 12px; color: var(--text-primary);">User type</th>
            <th style="text-align: left; padding: 12px; color: var(--text-primary);">Why Blort fits</th>
            <th style="text-align: left; padding: 12px; color: var(--text-primary);">Why it might not</th>
        </tr>
    </thead>
    <tbody>
        <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 12px; color: var(--text-secondary); font-weight: 500;">Solo short‑form creator</td>
            <td style="padding: 12px; color: var(--text-secondary);">Strong for research and hook testing if posting daily.</td>
            <td style="padding: 12px; color: var(--text-secondary);">Overpriced if you post occasionally or mainly need simple copy.</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 12px; color: var(--text-secondary); font-weight: 500;">Small agency / editor team</td>
            <td style="padding: 12px; color: var(--text-secondary);">Centralizes research, client examples, and scripts on shared boards.</td>
            <td style="padding: 12px; color: var(--text-secondary);">Credit limits and per‑seat cost may add up if adoption is patchy.</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 12px; color: var(--text-secondary); font-weight: 500;">General marketer / blogger</td>
            <td style="padding: 12px; color: var(--text-secondary);">Multimodel chat and file analysis are nice‑to‑have.</td>
            <td style="padding: 12px; color: var(--text-secondary);">Niche toward video virality; generic AI tools may be enough.</td>
        </tr>
    </tbody>
</table>
</div>

<h3 style="margin-top: 32px; font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">Overall verdict</h3>
<p>Blort AI is an ambitious “visual AI” workspace that shines when you treat content like an experiment lab—constantly dissecting, modeling, and iterating on what already works in your niche. If you are an active content operator with a clear production pipeline, the viral library, whiteboards, and multi‑model setup can realistically save serious time and help generate more consistent winners; if you’re more casual or budget‑sensitive, the credit system, non‑refundable plans, and still‑evolving UX may not feel like a net win yet. <a href="https://www.youtube.com/watch?v=yO7Sojodjoo" style="color:var(--purple); text-decoration: none;">youtube</a></p>

<p style="margin-top: 24px; font-style: italic; color: var(--text-muted); font-weight: 500; text-align: center;">Are you mainly considering Blort for your own creator brand, or for a client/agency workflow?</p>
</div>`
};

fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
console.log('Added custom review for Blort AI to reviews.json');
