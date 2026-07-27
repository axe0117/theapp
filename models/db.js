const { MongoClient } = require('mongodb');

// Match your exact .env variable name
const dbURL = process.env.MONGO_URI;
let db;

async function connectToDB() {
	try {
		if (!dbURL) {
			throw new Error('MONGO_URI is missing from your .env file');
		}
		const client = new MongoClient(dbURL);
		await client.connect();
		console.log('Connected to MongoDB successfully!');

		// This automatically grabs 'travelaroundtheworld' right out of your URL string
		db = client.db();
	} catch (error) {
		console.error('Error connecting to MongoDB:', error.message || error);
		throw error;
	}
}

function getCollection(collectionName) {
	if (!db) {
		throw new Error(
			'Database connection not established. Call connectToDB first.',
		);
	}
	return db.collection(collectionName);
}

module.exports = {
	connectToDB,
	getCollection,
};
