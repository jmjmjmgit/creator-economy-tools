const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

dom.window.document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded. Tools length:", dom.window.TOOLS ? dom.window.TOOLS.length : 'undefined');
  setTimeout(() => {
     console.log("Grid HTML:", dom.window.document.getElementById('toolsGrid').innerHTML.substring(0, 200));
  }, 1000);
});

dom.window.addEventListener("error", (event) => {
  console.error("Script error:", event.error);
});
