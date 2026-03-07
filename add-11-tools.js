const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.js');
let rawData = fs.readFileSync(dataPath, 'utf8');

const newTools = `
  {
    "name": "Thumio",
    "desc": "Generate high-converting YouTube thumbnails in seconds using AI. Perfect for creators looking to boost their CTR without spending hours in Photoshop.",
    "url": "https://thumio.com/",
    "categories": [
      "Content Creation",
      "AI"
    ],
    "img": "https://via.placeholder.com/300x300.png?text=Thumio",
    "pricing": "Paid",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "OutlierKit",
    "desc": "Discover outlier videos in your niche to inspire your next viral hit. Analyze what works on YouTube and craft data-driven content strategies.",
    "url": "https://outlierkit.com/",
    "categories": [
      "Analytics"
    ],
    "img": "https://via.placeholder.com/300x300.png?text=OutlierKit",
    "pricing": "Paid",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "TubeBuddy",
    "desc": "The premier YouTube channel management and video optimization toolkit. Includes bulk processing, SEO tools, and A/B testing.",
    "url": "https://www.tubebuddy.com/",
    "categories": [
      "Analytics",
      "SEO"
    ],
    "img": "https://tubebuddy.com/wp-content/uploads/2022/10/TB_Logo_White.png",
    "pricing": "Freemium",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "Sandcastles",
    "desc": "Automated YouTube thumbnail and title A/B testing to maximize your click-through rates and views.",
    "url": "https://sandcastles.ai/",
    "categories": [
      "Analytics",
      "AI"
    ],
    "img": "https://via.placeholder.com/300x300.png?text=Sandcastles",
    "pricing": "Paid",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "TubeLab",
    "desc": "Advanced analytics and SEO tools for YouTube creators. Track rankings, analyze competitors, and optimize metadata.",
    "url": "https://tubelab.net/",
    "categories": [
      "Analytics",
      "SEO"
    ],
    "img": "https://via.placeholder.com/300x300.png?text=TubeLab",
    "pricing": "Freemium",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "Viewstats",
    "desc": "Deep dive into YouTube statistics. Uncover trends, track channel growth, and analyze video performance metrics.",
    "url": "https://viewstats.com/",
    "categories": [
      "Analytics"
    ],
    "img": "https://via.placeholder.com/300x300.png?text=Viewstats",
    "pricing": "Paid",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "VidIQ",
    "desc": "AI-driven YouTube SEO and growth tools. Provides keyword scores, competitor analysis, and daily video ideas to help you rank higher.",
    "url": "https://vidiq.com/",
    "categories": [
      "Analytics",
      "SEO",
      "AI"
    ],
    "img": "https://vidiq.com/static/images/vidiq-logo.svg",
    "pricing": "Freemium",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "MorningFame",
    "desc": "Smarter YouTube analytics designed for actionable insights. Simplifies keyword research and shows you exactly how to grow your channel.",
    "url": "https://morningfa.me/",
    "categories": [
      "Analytics",
      "SEO"
    ],
    "img": "https://via.placeholder.com/300x300.png?text=MorningFame",
    "pricing": "Paid",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "Thumblytics",
    "desc": "Get feedback on your YouTube thumbnails from real people before publishing. Optimize for clicks using real human data.",
    "url": "https://thumblytics.com/",
    "categories": [
      "Analytics"
    ],
    "img": "https://via.placeholder.com/300x300.png?text=Thumblytics",
    "pricing": "Paid",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "ThumbnailTest",
    "desc": "A/B test your YouTube thumbnails automatically. Set up tests to swap thumbnails based on performance and boost your CTR.",
    "url": "https://thumbnailtest.com/",
    "categories": [
      "Analytics"
    ],
    "img": "https://via.placeholder.com/300x300.png?text=ThumbnailTest",
    "pricing": "Paid",
    "dead": false,
    "featuredOrder": 999
  },
  {
    "name": "TubeSpanner",
    "desc": "The ultimate workflow tool for YouTubers. Manage your content calendar, write scripts, and streamline your entire production process.",
    "url": "https://tubespanner.com/",
    "categories": [
      "Workflows & Automation"
    ],
    "img": "https://via.placeholder.com/300x300.png?text=TubeSpanner",
    "pricing": "Paid",
    "dead": false,
    "featuredOrder": 999
  },`;

const insertTag = 'const TOOLS = [';
rawData = rawData.replace(insertTag, insertTag + newTools);
fs.writeFileSync(dataPath, rawData);
console.log('Added 11 tools to data.js');
