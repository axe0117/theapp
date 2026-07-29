const { getCollection } = require('./db');
const { ObjectId } = require('mongodb');

function teamComps() {
	return getCollection('teamComps');
}

// async function createTeamComp({ core, members, label, tier, source, notes }) {
// 	return teamComps().insertOne({
// 		core: new ObjectId(core),
// 		members: members.map((id) => new ObjectId(id)),
// 		label,
// 		tier,
// 		source,
// 		notes,
// 	});
// }

async function upsertTeamComp({ core, members, label, tier, source, notes }) {
	return teamComps().updateOne(
		{ core: new ObjectId(core), label },
		{
			$set: {
				members: members.map((id) => new ObjectId(id)),
				tier,
				source,
				notes,
			},
		},
		{ upsert: true },
	);
}

async function getAllTeamComps() {
	return teamComps().find().toArray();
}

async function getTeamCompsByCoreId(coreId) {
	return teamComps()
		.find({ core: new ObjectId(coreId) })
		.toArray();
}

async function ensureIndexes() {
	return teamComps().createIndex({ core: 1, label: 1 }, { unique: true });
}

module.exports = {
	// createTeamComp,
	upsertTeamComp,
	getAllTeamComps,
	getTeamCompsByCoreId,
	ensureIndexes,
};
