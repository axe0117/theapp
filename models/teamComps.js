//Has all the meta teams so you dont gotta keep going on youtube
//reddit, discord, or wherever... I hope

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

module.exports = {
	createTeamComp,
	getAllTeamComps,
};
