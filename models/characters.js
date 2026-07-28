//Holds the helper functions for the characters collection
//boy am I glad theres only 56 playable characters as of 7/28/26
//stores character name, icon, element, etc
//inserts and updates characters

const { getCollection } = require('./db');

function characters() {
	return getCollection('characters');
}

async function upsertCharacter({ name, icon, element, specialty, faction }) {
	return characters().updateOne(
		{ name },
		{ $set: { name, icon, element, specialty, faction } },
		{ upsert: true },
	);
}

async function getAllCharacters() {
	return characters().find().sort({ name: 1 }).toArray();
}

async function getCharacterByName(name) {
	return characters().findOne({ name });
}

async function getCharacterById(id) {
	const { ObjectId } = require('mongodb');
	return characters().findOne({ _id: new ObjectId(id) });
}

module.exports = {
	upsertCharacter,
	getAllCharacters,
	getCharacterByName,
	getCharacterById,
};
