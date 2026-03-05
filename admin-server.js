const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 8080;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const DATA_PATH = path.join(__dirname, 'data.js');

// Redirect /admin to /admin.html
app.get('/admin', (req, res) => {
    res.redirect('/admin.html');
});

// Get all tools
app.get('/api/tools', (req, res) => {
    try {
        const raw = fs.readFileSync(DATA_PATH, 'utf8');
        const scriptData = raw.replace('const TOOLS =', 'return');
        const tools = new Function(scriptData)();
        res.json(tools);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read tools data' });
    }
});

// Save all tools
app.post('/api/tools', (req, res) => {
    try {
        const tools = req.body;
        if (!Array.isArray(tools)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        const output = `// Auto-generated \u2014 Creator Economy Tools by Janis Mjartans\nconst TOOLS = ${JSON.stringify(tools, null, 2)};\nif (typeof module !== 'undefined' && module.exports) { module.exports = TOOLS; }\nconst ALL_CATEGORIES = [...new Set(TOOLS.flatMap(t => t.categories || []))].sort();\n`;

        fs.writeFileSync(DATA_PATH, output, 'utf8');
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save tools data' });
    }
});

// Run generation
app.post('/api/generate', (req, res) => {
    exec('node generate_pages.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: 'Generation failed', details: stderr });
        }
        res.json({ success: true, output: stdout });
    });
});

app.listen(PORT, () => {
    console.log(`Admin server running at http://localhost:${PORT}`);
    console.log(`Access the dashboard at http://localhost:${PORT}/admin.html`);
});
