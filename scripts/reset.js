// one-off, run from a node REPL or a tiny script
// require('dotenv').config();
// const { connectToDB } = require('../models/db');
// const { getCollection } = require('../models/db');

// async function reset() {
// 	await connectToDB();
// 	const result = await getCollection('teamComps').deleteMany({});
// 	console.log(`Deleted ${result.deletedCount} team comps.`);
// 	process.exit(0);
// }

// reset().catch((err) => {
// 	console.error(err);
// 	process.exit(1);
// });
