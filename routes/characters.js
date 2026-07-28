//POST (add/remove characters from logged in user's list)
//GET (fetch what they own)

const express = require('express');
const router = express.Router();
const {
	getCharacterByName,
	getCharacterById,
} = require('../models/characters');
const {
	getUserById,
	isCharacterOwned,
	addOwnedCharacter,
	removeOwnedCharacter,
} = require('../models/userCharacters');

router.post('/characters/:name/toggle', async (req, res) => {
	if (!req.user) return res.status(401).json({ error: 'Not logged in' });

	const character = await getCharacterByName(req.params.name);
	if (!character) return res.status(404).json({ error: 'Character not found' });

	const alreadyOwned = await isCharacterOwned(req.user._id, character._id);

	if (alreadyOwned) {
		await removeOwnedCharacter(req.user._id, character._id);
	} else {
		await addOwnedCharacter(req.user._id, character._id);
	}

	res.json({ owned: !alreadyOwned });
});

// Get the current user's full owned-character list (with character details resolved)
router.get('/characters/owned', async (req, res) => {
	if (!req.user) return res.status(401).json({ error: 'Not logged in' });

	const user = await getUserById(req.user._id);
	const ownedIds = user.ownedCharacterIds || [];

	const owned = await Promise.all(ownedIds.map((id) => getCharacterById(id)));
	res.json(owned.filter(Boolean));
});

module.exports = router;
