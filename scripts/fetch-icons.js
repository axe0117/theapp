const fs = require('fs');
const path = require('path');

const API_URL = 'https://zenless-zone-zero.fandom.com/api.php';
const OUTPUT_DIR = path.join(__dirname, '../public/images/characters');

// Get all pages in the "Agents" category
async function fetchAgentPages() {
    const params = new URLSearchParams({
        action: 'query',
        list: 'categorymembers',
        cmtitle: 'Category:Agents', // confirmed working from last run
        cmlimit: '500',
        format: 'json',
    });
    const res = await fetch(`${API_URL}?${params}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const data = await res.json();
    return data.query.categorymembers;
}

// Resolve the direct file URL for a known File: title
async function fetchImageUrl(fileTitle) {
    const params = new URLSearchParams({
        action: 'query',
        titles: fileTitle,
        prop: 'imageinfo',
        iiprop: 'url',
        format: 'json',
    });
    const res = await fetch(`${API_URL}?${params}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const data = await res.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];
    // A "missing" flag means the file title didn't resolve
    if (!page || page.missing !== undefined) return null;
    return page.imageinfo ? page.imageinfo[0].url : null;
}

// Scrape the wiki's "Agent" overview page, which has one big table listing
// every agent's Name, Attribute, Specialty, and Faction in one place.
// Returns a Map keyed by agent name -> { element, specialty, faction }
async function fetchRosterAttributes() {
    const cheerio = require('cheerio');

    const params = new URLSearchParams({
        action: 'parse',
        page: 'Agent',
        prop: 'text',
        format: 'json',
    });
    const res = await fetch(`${API_URL}?${params}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const data = await res.json();
    const html = data.parse.text['*'];
    const $ = cheerio.load(html);

    const attributesByName = new Map();

    $('table').each((i, table) => {
        const headerText = $(table).find('tr').first().text();
        // Identify the right table by its header row containing these column names
        if (!headerText.includes('Attribute') || !headerText.includes('Specialty')) return;

        $(table).find('tr').slice(1).each((j, row) => {
            const cells = $(row).find('td');
            if (cells.length < 7) return; // skip malformed/short rows

            // Column order per the wiki table: Icon, Name, Rank, Attribute, Specialty, Attack Type, Faction, Release Date
            const name = $(cells[1]).text().trim();
            const element = $(cells[3]).text().trim() || null;
            const specialty = $(cells[4]).text().trim() || null;
            const faction = $(cells[6]).text().trim() || null;

            if (name) attributesByName.set(name, { element, specialty, faction });
        });
    });

    return attributesByName;
}

async function downloadImage(url, filename) {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
    console.log('Saved:', filename);
}

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const agents = await fetchAgentPages();
    console.log('Found agents:', agents.length, agents.slice(0, 3).map(a => a.title));

    // Fetch the full roster attribute table ONCE, rather than one call per agent
    const rosterAttributes = await fetchRosterAttributes();
    console.log(`Parsed attributes for ${rosterAttributes.size} agents from roster table.`);

    // TEMP DEBUG: confirm the first agent's attributes look right before trusting the rest
    if (agents[0]) {
        console.log(`Sample attributes for "${agents[0].title}":`, rosterAttributes.get(agents[0].title));
    }

    const manifest = []; // will become manifest.json: [{ name, icon }, ...]

    for (const agent of agents) {
        if (agent.ns !== 0) continue;

        // Build the exact file title based on the known pattern: "Agent <name> Icon.png"
        const fileTitle = `File:Agent ${agent.title} Icon.png`;
        const imageUrl = await fetchImageUrl(fileTitle);

        if (!imageUrl) {
            console.log('No icon found for:', agent.title, `(tried "${fileTitle}")`);
            continue;
        }

        const safeName = agent.title.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        const ext = path.extname(imageUrl) || '.png';
        const filename = `${safeName}_icon${ext}`;

        try {
            await downloadImage(imageUrl, filename);

            const attrs = rosterAttributes.get(agent.title) || { element: null, specialty: null, faction: null };

            manifest.push({
                name: agent.title,
                icon: `/images/characters/${filename}`, // web-servable path (public is static root)
                element: attrs.element,
                specialty: attrs.specialty,
                faction: attrs.faction,
            });
        } catch (err) {
            console.log('Failed to download:', agent.title, err.message);
        }

        await new Promise((r) => setTimeout(r, 200));
    }

    // Sort alphabetically so the grid renders in a predictable order
    manifest.sort((a, b) => a.name.localeCompare(b.name));

    const manifestPath = path.join(__dirname, '../data/agents.json');
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`Wrote manifest with ${manifest.length} agents to ${manifestPath}`);

    console.log('Done.');
}

main().catch(console.error);