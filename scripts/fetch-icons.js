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

// Get the category tags on a page - used to derive element/specialty/faction
async function fetchPageCategories(title) {
	const params = new URLSearchParams({
		action: 'query',
		titles: title,
		prop: 'categories',
		cllimit: '50',
		format: 'json',
	});
	const res = await fetch(`${API_URL}?${params}`, {
		headers: { 'User-Agent': 'Mozilla/5.0' },
	});
	const data = await res.json();
	const pages = data.query.pages;
	const page = Object.values(pages)[0];
	if (!page || !page.categories) return [];
	return page.categories.map((c) => c.title.replace('Category:', ''));
}

// Adjust these lists to match the EXACT category names you see on the wiki (Step 1 above)
const ELEMENTS = [
	'Ice',
	'Fire',
	'Electric',
	'Ether',
	'Physical',
	'Wind',
	'Auric Ink',
];
const SPECIALTIES = [
	'Attack',
	'Stun',
	'Anomaly',
	'Support',
	'Defense',
	'Rupture',
];
// Factions vary a lot - add the real ones you see once you check a page's category list
const FACTIONS = [
	'Criminal Investigation Special Response Team',
	'Victoria Housekeeping Co.',
	'Belobog Heavy Industries',
];

function classifyCategories(categories) {
	const element = categories.find((c) => ELEMENTS.includes(c)) || null;
	const specialty = categories.find((c) => SPECIALTIES.includes(c)) || null;
	const faction = categories.find((c) => FACTIONS.includes(c)) || null;
	return { element, specialty, faction };
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
	console.log(
		'Found agents:',
		agents.length,
		agents.slice(0, 3).map((a) => a.title),
	);

	// TEMP DEBUG: log raw categories for the first agent so you can confirm
	// the real category names before trusting the ELEMENTS/SPECIALTIES/FACTIONS lists above.
	// Remove this block once you've verified/adjusted the lists.
	if (agents[0]) {
		const sampleCats = await fetchPageCategories(agents[0].title);
		console.log(`Sample categories for "${agents[0].title}":`, sampleCats);
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

			const categories = await fetchPageCategories(agent.title);
			const { element, specialty, faction } = classifyCategories(categories);

			manifest.push({
				name: agent.title,
				icon: `/images/characters/${filename}`, // web-servable path (public is static root)
				element,
				specialty,
				faction,
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
	console.log(
		`Wrote manifest with ${manifest.length} agents to ${manifestPath}`,
	);

	console.log('Done.');
}

main().catch(console.error);
