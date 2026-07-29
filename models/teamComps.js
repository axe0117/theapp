const { getCollection } = require('./db');
const { ObjectId } = require('mongodb');

function teamComps() {
	return getCollection('teamComps');
}

async function createTeamComp({ core, members, label, tier, source, notes }) {
	return teamComps().insertOne({
		core: new ObjectId(core),
		members: members.map((id) => new ObjectId(id)),
		label,
		tier,
		source,
		notes,
	});
}

async function getAllTeamComps() {
	return teamComps().find().toArray();
}

async function getTeamCompsByCoreId(coreId) {
	return teamComps()
		.find({ core: new ObjectId(coreId) })
		.toArray();
}

module.exports = {
	createTeamComp,
	getAllTeamComps,
	getTeamCompsByCoreId,
};
