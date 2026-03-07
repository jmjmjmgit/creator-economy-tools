const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.js');
let rawData = fs.readFileSync(dataPath, 'utf8');

const newTools = `
  {
    "name": "Wise",
    "desc": "Receive money from anywhere in the world with low fees and real exchange rates. Essential for creators with international sponsors or global audiences.",
    "url": "https://wise.com/invite/dic/a44db57",
    "categories": [
      "Finance",
      "Monetization"
    ],
    "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Wise_logo.svg/1024px-Wise_logo.svg.png",
    "pricing": "Freemium",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "Sparkloop",
    "desc": "Grow your newsletter automatically with the best referral and cross-promotion platform for creators and media brands.",
    "url": "https://sparkloop.app/",
    "categories": [
      "Email Marketing",
      "Audience Growth"
    ],
    "img": "https://sparkloop.app/assets/images/logo-dark.svg",
    "pricing": "Paid",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "Agentio",
    "desc": "The first ad platform for creator content. Agentio connects brands directly with YouTubers to buy ad reads like they buy Facebook ads.",
    "url": "https://www.agentio.com/",
    "categories": [
      "Influencer Marketing/Brand Deals",
      "Monetization"
    ],
    "img": "https://framerusercontent.com/images/Wl6Fw4lTXY34v4D2TInMBNTqU.png",
    "pricing": "",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "V-Sub",
    "desc": "Automatically create engaging, animated captions for your short-form videos in seconds to boost retention and engagement.",
    "url": "http://vsub.io/?linkId=lp_382606&sourceId=cet&tenantId=vsub",
    "categories": [
      "Content Creation",
      "AI"
    ],
    "img": "https://vsub.io/wp-content/uploads/2023/10/v-sub-logo-1.png",
    "pricing": "Paid",
    "dead": false,
    "featuredOrder": 999
  },`;

const insertTag = 'const TOOLS = [';
rawData = rawData.replace(insertTag, insertTag + newTools);
fs.writeFileSync(dataPath, rawData);
console.log('Added 4 tools to data.js');
