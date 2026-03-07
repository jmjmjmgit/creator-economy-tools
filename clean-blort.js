const path = require('path');
const fs = require('fs');

const reviewsPath = path.join(__dirname, 'reviews.json');
let reviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));

let reviewHtml = reviews['blort-ai'].longReviewHtml;

// Strip out linkedin and youtube links
reviewHtml = reviewHtml.replace(/ <a href="[^"]*"[^>]*>linkedin<\/a>/gi, '');
reviewHtml = reviewHtml.replace(/ <a href="[^"]*"[^>]*>youtube<\/a>/gi, '');
reviewHtml = reviewHtml.replace(/ \[youtube\]\([^)]+\)/gi, '');
reviewHtml = reviewHtml.replace(/ \[linkedin\]\([^)]+\)/gi, '');

// Strip out the ending question
reviewHtml = reviewHtml.replace(/\n<p style="margin-top: 24px; font-style: italic; color: var\(--text-muted\); font-weight: 500; text-align: center;">Are you mainly considering Blort for your own creator brand, or for a client\/agency workflow\?<\/p>\n/gi, '\n');

reviews['blort-ai'].longReviewHtml = reviewHtml;

fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
console.log('Cleaned Blort AI review');
