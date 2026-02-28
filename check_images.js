const fs = require('fs');
const https = require('https');
const http = require('http');

let content = fs.readFileSync('data.js', 'utf-8');
content = content.replace('const TOOLS = ', 'module.exports = ');
fs.writeFileSync('temp_data.js', content);

const tools = require('./temp_data.js');

async function checkImage(url) {
  if (!url || url.trim() === '') return 'MISSING';
  
  return new Promise((resolve) => {
    const reqLib = url.startsWith('https') ? https : http;
    const req = reqLib.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      if (res.statusCode >= 400 && res.statusCode !== 403) { // 403 might just be anti-bot
        resolve(`BROKEN (${res.statusCode})`);
      } else {
        resolve('OK');
      }
    });
    
    req.on('error', (e) => {
      resolve(`ERROR (${e.message})`);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve('TIMEOUT');
    });
    
    req.end();
  });
}

async function main() {
  console.log(`Checking ${tools.length} tools...`);
  const results = [];
  
  // check in batches of 10
  for (let i = 0; i < tools.length; i += 10) {
    const batch = tools.slice(i, i + 10);
    const promises = batch.map(async (tool) => {
      const status = await checkImage(tool.img);
      if (status !== 'OK') {
        return { name: tool.name, url: tool.url, img: tool.img, status };
      }
      return null;
    });
    
    const batchResults = await Promise.all(promises);
    results.push(...batchResults.filter(r => r !== null));
    process.stdout.write('.');
  }
  
  console.log('\n\nBroken or missing images:');
  console.log(JSON.stringify(results, null, 2));
}

main();
