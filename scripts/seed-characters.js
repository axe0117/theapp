//RUN ONLY ONCE reads the character list created by the
//wiki scraper (because legit every single API or online database
//got NUKED or is outdated with no more support, this was the only way)

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { connectToDB } = require('../models/db');
const { upsertCharacter } = require('../models/characters');

const MANIFEST_PATH = path.join(__dirname, '../data/agents.json');

async function seed() {
	await connectToDB();

	const agents = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

	for (const agent of agents) {
		await upsertCharacter({
			name: agent.name,
			icon: agent.icon,
			element: agent.element || null, // fill in from icy-veins data later
			specialty: agent.specialty || null,
			faction: agent.faction || null,
		});
		console.log('Upserted:', agent.name);
	}

	console.log('Seed complete.');
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
