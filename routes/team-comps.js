//I can't believe I almost scrapped this idea 4 different times
//in the same week
//all this does is crossreference users owned character ID list
//(from MongoDB) against the current meta team comps listed
//to figure out which teams they can use and teams they still
//need one more for

const express = require('express');
const router = express.Router();
const { getUserById } = require('../models/userCharacters');
const {
	getAllTeamComps,
	getTeamCompsByCoreId,
} = require('../models/teamComps');
const {
	getCharacterById,
	getCharacterByName,
} = require('../models/characters');

router.get('/team-comps/available', async (req, res) => {
	res.set('Cache-Control', 'no-store');
	if (!req.user) return res.status(401).json({ error: 'Not logged in' });

	const user = await getUserById(req.user._id);
	const ownedIds = new Set(
		(user.ownedCharacterIds || []).map((id) => id.toString()),
	);

	const allComps = await getAllTeamComps();

	// Resolve member IDs to full character docs for display purposes
	async function resolveMembers(memberIds) {
		return Promise.all(memberIds.map((id) => getCharacterById(id)));
	}

	const buildable = [];
	const almostThere = []; // missing exactly 1 member

	for (const comp of allComps) {
		const missingIds = comp.members.filter(
			(id) => !ownedIds.has(id.toString()),
		);

		if (missingIds.length === 0) {
			const members = await resolveMembers(comp.members);
			buildable.push({ ...comp, members });
		} else if (missingIds.length === 1) {
			const members = await resolveMembers(comp.members);
			const missing = await getCharacterById(missingIds[0]);
			almostThere.push({ comp: { ...comp, members }, missing });
		}
	}

	res.json({ buildable, almostThere });
});

// GET /team-comps/for/:name - all recommended comps for a given main DPS agent
// No login required - this is reference data, not tied to ownership
router.get('/team-comps/for/:name', async (req, res) => {
	const character = await getCharacterByName(req.params.name);
	if (!character) return res.status(404).json({ error: 'Character not found' });

	const comps = await getTeamCompsByCoreId(character._id);

	const resolved = await Promise.all(
		comps.map(async (comp) => ({
			...comp,
			members: await Promise.all(
				comp.members.map((id) => getCharacterById(id)),
			),
		})),
	);

	res.json({ character, comps: resolved });
});

module.exports = router;
