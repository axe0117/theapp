//RUN ONLY ONCE
//inserts team comps into the "teamComps" looking up the characters'
//IDs by name from the collection of (static) characters
//The update is tomorrow so I WILL NOT BE ADDING THE NEW ONE

require('dotenv').config();
const { connectToDB } = require('../models/db');
const { getCharacterByName } = require('../models/characters');
const { createTeamComp } = require('../models/teamComps');

async function findCharacterId(name) {
	const character = await getCharacterByName(name);
	if (!character) {
		throw new Error(
			`Character not found in DB: "${name}" - check spelling matches your seeded roster`,
		);
	}
	return character._id;
}

async function buildComp({ core, members, label, tier, source, notes }) {
	const coreId = await findCharacterId(core);
	const memberIds = await Promise.all(members.map(findCharacterId));
	return { core: coreId, members: memberIds, label, tier, source, notes };
}

async function seed() {
	await connectToDB();

	const compsData = [
		// --- Miyabi teams ---
		{
			core: 'Miyabi',
			members: ['Miyabi', 'Nangong Yu', 'Yuzuha'],
			label: 'Premiere DPS team',
			tier: 'premium',
			source: 'Icy Veins',
			notes:
				'Nangong Yu grants Disorder triggers and Fallen Frost charges without consuming Anomaly.',
		},
		{
			core: 'Miyabi',
			members: ['Miyabi', 'Yuzuha', 'Vivian'],
			label: 'Anomaly Disorder team',
			tier: 'standard',
			source: 'Icy Veins',
			notes:
				'Full Anomaly comp built around triggering Disorders for extra Fallen Frost charges.',
		},
		{
			core: 'Miyabi',
			members: ['Miyabi', 'Astra Yao', 'Yanagi'],
			label: 'Yanagi Disorder loop',
			tier: 'standard',
			source: 'Icy Veins',
			notes: "Yanagi's EX Special provides frequent Disorder triggers.",
		},
		{
			core: 'Miyabi',
			members: ['Miyabi', 'Von Lycaon', 'Soukaku'],
			label: 'F2P Mono Ice',
			tier: 'f2p',
			source: 'Icy Veins',
			notes: 'Low-spender team; both teammates buff Ice DMG/ATK reliably.',
		},

		// --- Zhu Yuan teams ---
		{
			core: 'Zhu Yuan',
			members: ['Zhu Yuan', 'Dialyn', 'Nicole Demara'],
			label: 'Top DPS team',
			tier: 'premium',
			source: 'Icy Veins',
			notes:
				"Dialyn's high Ultimate multiplier value pairs well with Zhu Yuan's burst window.",
		},
		{
			core: 'Zhu Yuan',
			members: ['Zhu Yuan', 'Qingyi', 'Nicole Demara'],
			label: 'Stun-focused team',
			tier: 'standard',
			source: 'Icy Veins',
			notes:
				"Qingyi boosts stun damage multiplier for Zhu Yuan's stunned-enemy bonus.",
		},
		{
			core: 'Zhu Yuan',
			members: ['Zhu Yuan', 'Anby Demara', 'Nicole Demara'],
			label: 'F2P option',
			tier: 'f2p',
			source: 'Mobalytics',
			notes: 'Built entirely from free-to-play characters.',
		},
	];

	for (const data of compsData) {
		try {
			const comp = await buildComp(data);
			await createTeamComp(comp);
			console.log('Created comp:', data.label, 'for', data.core);
		} catch (err) {
			console.warn(
				'Skipped comp (missing character):',
				data.label,
				'-',
				err.message,
			);
		}
	}

	console.log('Team comp seeding complete.');
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
