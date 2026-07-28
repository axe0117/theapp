//Holds the helper functions for user character collection
//reads/writes the ownedCharacterIds array in the user document
//found in the MongoDB
//thankfully does not touch user info

const { getCollection } = require('./db');
const { ObjectId } = require('mongodb');

function users() {
	// NOTE: change 'users' below to match whatever collection name
	// your existing routes/users.js already uses
	return getCollection('users');
}

async function getUserById(userId) {
	return users().findOne({ _id: new ObjectId(userId) });
}

async function isCharacterOwned(userId, characterId) {
	const user = await getUserById(userId);
	if (!user || !user.ownedCharacterIds) return false;
	return user.ownedCharacterIds.some(
		(id) => id.toString() === characterId.toString(),
	);
}

async function addOwnedCharacter(userId, characterId) {
	return users().updateOne(
		{ _id: new ObjectId(userId) },
		{ $addToSet: { ownedCharacterIds: new ObjectId(characterId) } },
	);
}

async function removeOwnedCharacter(userId, characterId) {
	return users().updateOne(
		{ _id: new ObjectId(userId) },
		{ $pull: { ownedCharacterIds: new ObjectId(characterId) } },
	);
}

module.exports = {
	getUserById,
	isCharacterOwned,
	addOwnedCharacter,
	removeOwnedCharacter,
};
