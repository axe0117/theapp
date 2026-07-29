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
			core: 'Hoshimi Miyabi',
			members: ['Hoshimi Miyabi', 'Nangong Yu', 'Ukinami Yuzuha'],
			label: 'Premiere DPS team',
			tier: 'premium',
			source: 'Icy Veins',
			notes:
				'Nangong Yu grants Disorder triggers and Fallen Frost charges without consuming Anomaly.',
		},
		{
			core: 'Hoshimi Miyabi',
			members: ['Hoshimi Miyabi', 'Ukinami Yuzuha', 'Vivian Banshee'],
			label: 'Anomaly Disorder team',
			tier: 'standard',
			source: 'Icy Veins',
			notes:
				'Full Anomaly comp built around triggering Disorders for extra Fallen Frost charges.',
		},
		{
			core: 'Hoshimi Miyabi',
			members: ['Hoshimi Miyabi', 'Astra Yao', 'Tsukishiro Yanagi'],
			label: 'Yanagi Disorder loop',
			tier: 'standard',
			source: 'Icy Veins',
			notes: "Yanagi's EX Special provides frequent Disorder triggers.",
		},
		{
			core: 'Hoshimi Miyabi',
			members: ['Hoshimi Miyabi', 'Von Lycaon', 'Soukaku'],
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

		// --- Ye Shunguang ---
		{
			core: 'Ye Shunguang',
			members: ['Ye Shunguang', 'Dialyn', 'Zhao'],
			label: 'Ultimate-spam Physical DPS',
			tier: 'premium',
			source: 'Icy Veins',
			notes:
				'Dialyn grants a free Ultimate to fuel her burst; Zhao (F2P) buffs ATK and DMG for any DPS.',
		},
		{
			core: 'Ye Shunguang',
			members: ['Ye Shunguang', 'Corin Wickes', 'Nicole Demara'],
			label: 'Budget alt (general recommendation)',
			tier: 'f2p',
			source: 'General synergy estimate - not guide-verified',
			notes:
				'A lower-cost Physical/generalist ATK support pairing; less thoroughly vetted than her premium team above.',
		},

		// --- Yixuan (Rupture) ---
		{
			core: 'Yixuan',
			members: ['Yixuan', 'Lucia Elowen', 'Pan Yinhu'],
			label: 'Premiere Rupture team',
			tier: 'premium',
			source: 'Icy Veins',
			notes:
				'Lucia is the top Rupture support; Pan Yinhu adds a secondary layer of Rupture support.',
		},
		{
			core: 'Yixuan',
			members: ['Yixuan', 'Komano Manato', 'Pan Yinhu'],
			label: 'A-Rank Rupture alt',
			tier: 'f2p',
			source: 'Icy Veins',
			notes:
				'Both Komano Manato and Pan Yinhu are A-Rank Rupture-focused agents, making this a cheaper all-A-Rank support core.',
		},

		// --- Jane Doe (Anomaly) ---
		{
			core: 'Jane Doe',
			members: ['Jane Doe', 'Ukinami Yuzuha', 'Vivian Banshee'],
			label: 'Premiere Anomaly DPS team',
			tier: 'premium',
			source: 'Icy Veins',
			notes:
				'Yuzuha and Vivian form the go-to Anomaly Support/sub-DPS core for most Anomaly main DPS.',
		},
		{
			core: 'Jane Doe',
			members: ['Jane Doe', 'Alice Thymefield', 'Ukinami Yuzuha'],
			label: 'Alt team (Jane as sub-DPS)',
			tier: 'standard',
			source: 'Icy Veins',
			notes:
				'Alice Thymefield can take over as main DPS while Jane shifts into a sub-DPS role; still a strong pairing.',
		},

		// --- Tsukishiro Yanagi (Anomaly, Disorder-focused) ---
		{
			core: 'Tsukishiro Yanagi',
			members: ['Tsukishiro Yanagi', 'Ukinami Yuzuha', 'Seth Lowell'],
			label: 'Disorder-focused Anomaly team',
			tier: 'premium',
			source: 'Icy Veins',
			notes:
				'Wants high field uptime and pairs best with other Anomaly elements (Ether/Fire) to maximize Disorder procs.',
		},

		// --- Ellen Joe ---
		{
			core: 'Ellen Joe',
			members: ['Ellen Joe', 'Lighter', 'Astra Yao'],
			label: 'Sustained Ice/Fire DPS team',
			tier: 'premium',
			source: 'Icy Veins',
			notes:
				"Lighter's stun multiplier and Ice/Fire DMG buffs pair especially well with Ellen Joe.",
		},

		// --- Evelyn Chevalier (Chain Attack focused) ---
		{
			core: 'Evelyn Chevalier',
			members: ['Evelyn Chevalier', 'Lighter', 'Astra Yao'],
			label: 'Chain Attack burst team',
			tier: 'premium',
			source: 'Icy Veins',
			notes:
				'Built around massive Chain Attack damage; Lighter and Astra Yao are her two best partners.',
		},
		{
			core: 'Evelyn Chevalier',
			members: ['Evelyn Chevalier', 'Lighter', 'Nicole Demara'],
			label: 'A-Rank support alt',
			tier: 'f2p',
			source: 'Icy Veins',
			notes:
				'Nicole Demara can substitute for Astra Yao for a moderate DPS loss, keeping the team much cheaper to build.',
		},

		// --- Hugo Vlad ---
		{
			core: 'Hugo Vlad',
			members: ['Hugo Vlad', 'Lighter', 'Von Lycaon'],
			label: 'Double-Stun Ice DPS team',
			tier: 'premium',
			source: 'Icy Veins',
			notes:
				'Relies heavily on enemies being stunned, so running two stun agents maximizes his burst windows.',
		},
		{
			core: 'Hugo Vlad',
			members: ['Hugo Vlad', 'Von Lycaon', 'Qingyi'],
			label: 'A-Rank/alt stun pairing',
			tier: 'standard',
			source: 'Icy Veins',
			notes:
				'Von Lycaon works in a pinch (lower Daze buildup than Lighter); Qingyi is also a valid Stun option here.',
		},

		// --- Soldier 0 - Anby ---
		{
			core: 'Soldier 0 - Anby',
			members: ['Soldier 0 - Anby', 'Trigger', 'Astra Yao'],
			label: 'Electric Attack team',
			tier: 'premium',
			source: 'Icy Veins',
			notes:
				'Strong standalone DPS with high field uptime; pairs well with off-field Stun and generalist Support.',
		},
		{
			core: 'Soldier 0 - Anby',
			members: ['Soldier 0 - Anby', 'Von Lycaon', 'Nicole Demara'],
			label: 'Budget alt (general recommendation)',
			tier: 'f2p',
			source: 'General synergy estimate - not guide-verified',
			notes:
				'A more affordable Stun + Support pairing; less thoroughly vetted than her premium team above.',
		},

		// --- Aria (Ether Anomaly) ---
		{
			core: 'Aria',
			members: ['Aria', 'Sunna', 'Ukinami Yuzuha'],
			label: 'Ether Anomaly team',
			tier: 'standard',
			source: 'Icy Veins',
			notes: 'Sunna and Yuzuha together form her core Anomaly Support duo.',
		},
		{
			core: 'Aria',
			members: ['Aria', 'Nicole Demara', 'Ukinami Yuzuha'],
			label: 'A-Rank support alt',
			tier: 'f2p',
			source: 'General synergy estimate - not guide-verified',
			notes:
				"Nicole Demara's Ether DMG buff and DEF shred can substitute for Sunna at lower investment.",
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
