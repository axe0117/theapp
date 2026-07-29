require('dotenv').config();
const { connectToDB } = require('../models/db');
const { getCharacterByName } = require('../models/characters');
const { upsertBuild, ensureIndexes } = require('../models/builds');

async function findCharacterId(name) {
	const character = await getCharacterByName(name);
	if (!character) {
		throw new Error(
			`Character not found in DB: "${name}" - check spelling matches your seeded roster`,
		);
	}
	return character._id;
}

async function seed() {
	await connectToDB();
	await ensureIndexes();

	const buildsData = [
		{
			name: 'Hoshimi Miyabi',
			wEngine: 'Hailstorm Shrine (signature)',
			discDriveSets: ['Branch & Blade Song (4pc) + Woodpecker Electro (2pc)'],
			mainStats: {
				disc4: 'CRIT Rate',
				disc5: 'Ice DMG',
				disc6: 'Anomaly Mastery',
			},
			notes:
				'Hailstorm Shrine is far ahead of any alternative for her. Prioritize CRIT Rate, CRIT DMG, and ATK% on substats over Anomaly stats.',
			source: 'Icy Veins',
		},
		{
			name: 'Zhu Yuan',
			wEngine: 'Riot Suppressor Mark VI (signature)',
			discDriveSets: ['Chaotic Metal (4pc) + Woodpecker Electro (2pc)'],
			mainStats: { disc4: 'CRIT DMG', disc5: 'Ether DMG', disc6: 'ATK' },
			notes:
				'The Sky Ablaze is also a strong 4pc option for Zhu Yuan since she is often built without ATK/CRIT DMG buffing supports. Puffer Electro is good if paired with Dialyn.',
			source: 'Icy Veins',
		},
		{
			name: 'Ye Shunguang',
			wEngine: 'Cloudcleave Radiance (signature)',
			discDriveSets: [
				'White Water Ballad (4pc) + Branch & Blade Song (2pc)',
				'White Water Ballad (4pc) + Woodpecker Electro (2pc)',
			],
			mainStats: {
				disc4: 'CRIT Rate or CRIT DMG',
				disc5: 'Physical DMG',
				disc6: 'ATK',
			},
			notes:
				'White Water Ballad was added specifically for her. Because she gains a lot of innate CRIT Rate, CRIT Rate main-stat W-Engines can slightly overcap - prioritizing CRIT DMG can be stronger.',
			source: 'Icy Veins',
		},
		{
			name: 'Yixuan',
			wEngine: 'Qingming Birdcage (signature)',
			discDriveSets: ['Yunkui Tales (4pc)'],
			mainStats: {
				disc4: 'CRIT Rate',
				disc5: 'HP% or PEN Ratio',
				disc6: 'CRIT DMG',
			},
			notes:
				'Yunkui Tales is the only recommended 4pc set for her, built specifically for Rupture agents. She scales Sheer DMG off HP, so stack HP% alongside CRIT stats. Recommended around 18,000-20,000 HP.',
			source: 'Icy Veins',
		},
		{
			name: 'Jane Doe',
			wEngine: 'Sharpened Stinger (signature)',
			discDriveSets: ['Fanged Metal (4pc) + Freedom Blues (2pc)'],
			mainStats: {
				disc4: 'Anomaly Proficiency',
				disc5: 'Physical DMG',
				disc6: 'Anomaly Mastery',
			},
			notes:
				'Fanged Metal is her best Drive Disc by a wide margin. Freedom Blues 2pc adds Anomaly Proficiency to help trigger Assault Anomaly damage faster.',
			source: 'Icy Veins',
		},
		{
			name: 'Tsukishiro Yanagi',
			wEngine: 'Timeweaver (signature)',
			discDriveSets: ['Chaos Jazz (4pc) + Freedom Blues (2pc)'],
			mainStats: {
				disc4: 'Anomaly Proficiency',
				disc5: 'Electric DMG',
				disc6: 'Anomaly Mastery',
			},
			notes:
				'Timeweaver boosts Electric Anomaly Buildup Rate and grants a Disorder DMG bonus once Anomaly Proficiency hits 375+. Chaos Jazz is the safest 4pc set, especially in dual-element/Disorder teams.',
			source: 'Icy Veins',
		},
		{
			name: 'Ellen Joe',
			wEngine: 'Deep Sea Visitor (signature)',
			discDriveSets: [
				'Woodpecker Electro (4pc) + Puffer Electro (2pc)',
				'Polar Metal (4pc) + Woodpecker Electro (2pc)',
			],
			mainStats: { disc4: 'CRIT Rate', disc5: 'Ice DMG', disc6: 'ATK' },
			notes:
				'Deep Sea Visitor gives CRIT Rate from three separate sources. Aim to get as close to 100% CRIT Rate as possible; PEN is a good Disc 5 alt when paired with Astra Yao/Lighter.',
			source: 'Icy Veins',
		},
		{
			name: 'Evelyn Chevalier',
			wEngine: 'String & Melody (signature, also called Heartstring Nocturne)',
			discDriveSets: ['Inferno Metal (4pc) + Puffer Electro (2pc)'],
			mainStats: { disc4: 'CRIT Rate', disc5: 'Fire DMG', disc6: 'ATK' },
			notes:
				'No single 4pc set is perfectly tailored to her yet; Inferno Metal is currently considered best-in-slot for Burn synergy. Her signature W-Engine gives 50% CRIT DMG and Fire RES shred stacks via Chain Attack/Ultimate.',
			source: 'Icy Veins',
		},
		{
			name: 'Hugo Vlad',
			wEngine: 'Myriad Eclipse (signature)',
			discDriveSets: ['Woodpecker Electro (4pc) + Branch & Blade Song (2pc)'],
			mainStats: {
				disc4: 'CRIT Rate or CRIT DMG',
				disc5: 'Ice DMG',
				disc6: 'ATK',
			},
			notes:
				'Needs 80-100% CRIT Rate to maximize damage. No Drive Disc set is purpose-built for him, so Woodpecker Electro is used for the CRIT Rate/ATK combo. Wants at least one Stun agent on the team.',
			source: 'Icy Veins',
		},
		{
			name: 'Soldier 0 - Anby',
			wEngine: 'Severed Innocence (signature)',
			discDriveSets: ['Shadow Harmony (4pc)'],
			mainStats: {
				disc4: 'CRIT Rate or CRIT DMG',
				disc5: 'Electric DMG',
				disc6: 'ATK',
			},
			notes:
				'Shadow Harmony is purpose-built for her, boosting Dash Attack/Aftershock DMG plus ATK% and CRIT Rate% at 4pc. Severed Innocence gives stacking CRIT DMG that also grants Electric DMG at max stacks.',
			source: 'Icy Veins',
		},
		{
			name: 'Aria',
			wEngine: 'Angel in the Shell (signature)',
			discDriveSets: ["Shining Aria (4pc) + Phaethon's Melody (2pc)"],
			mainStats: {
				disc4: 'Anomaly Proficiency',
				disc5: 'Ether DMG or PEN Ratio',
				disc6: 'Anomaly Mastery',
			},
			notes:
				"Shining Aria boosts Anomaly Proficiency on Basic Attack hits and deals bonus DMG to stunned targets. Phaethon's Melody 2pc is used for its rare Anomaly Mastery stat. Chaos Jazz or Freedom Blues are alt 2pc options.",
			source: 'Icy Veins',
		},
	];

	for (const data of buildsData) {
		try {
			const characterId = await findCharacterId(data.name);
			await upsertBuild({
				character: characterId,
				wEngine: data.wEngine,
				discDriveSets: data.discDriveSets,
				mainStats: data.mainStats,
				notes: data.notes,
				source: data.source,
			});
			console.log('Upserted build for', data.name);
		} catch (err) {
			console.warn(
				'Skipped build (missing character):',
				data.name,
				'-',
				err.message,
			);
		}
	}

	console.log('Build seeding complete.');
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
