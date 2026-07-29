const { getCollection } = require('./db');
const { ObjectId } = require('mongodb');
const { getCharacterByName } = require('./characters');

function builds() {
	return getCollection('builds');
}

async function createBuild({
	character,
	wEngine,
	discDriveSets,
	mainStats,
	notes,
	source,
}) {
	return builds().insertOne({
		character: new ObjectId(character),
		wEngine,
		discDriveSets,
		mainStats,
		notes,
		source,
	});
}

async function upsertBuild({
	character,
	wEngine,
	discDriveSets,
	mainStats,
	notes,
	source,
}) {
	return builds().updateOne(
		{ character: new ObjectId(character) },
		{
			$set: {
				wEngine,
				discDriveSets,
				mainStats,
				notes,
				source,
			},
		},
		{ upsert: true },
	);
}

async function getBuildByCharacterId(characterId) {
	return builds().findOne({ character: new ObjectId(characterId) });
}

async function getBuildByCharacterName(name) {
	const character = await getCharacterByName(name);
	if (!character) return null;
	return getBuildByCharacterId(character._id);
}

async function ensureIndexes() {
	return builds().createIndex({ character: 1 }, { unique: true });
}

module.exports = {
	createBuild,
	upsertBuild,
	getBuildByCharacterId,
	getBuildByCharacterName,
	ensureIndexes,
};
