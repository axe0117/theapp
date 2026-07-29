const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { getBuildByCharacterName } = require('../models/builds');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

console.log('Gemini key loaded:', !!process.env.GEMINI_API_KEY);

function buildContext(characterName, build) {
	if (build) {
		const sets = (build.discDriveSets || []).join(' or ');
		return (
			`The character "${characterName}" is a playable agent in Zenless Zone Zero. ` +
			`Recommended W-Engine: ${build.wEngine}. ` +
			(sets ? `Recommended Disc Drive sets: ${sets}. ` : '') +
			(build.mainStats
				? `Recommended main stats: ${JSON.stringify(build.mainStats)}. `
				: '') +
			(build.notes ? `Notes: ${build.notes}. ` : '') +
			`Use this information to answer the question. Do not contradict it.`
		);
	}

	return (
		`The character "${characterName}" is a confirmed playable agent in Zenless Zone Zero. ` +
		`No specific build data is available for this character yet. Your training data may ` +
		`predate this character's release, so do not claim they don't exist. Instead, say you ` +
		`don't have confirmed build data for them yet, and offer general guidance based on their ` +
		`likely role if you can infer anything from the name or context, without inventing specific ` +
		`item names.`
	);
}

router.post('/ask', async (req, res) => {
	const { question, characterName } = req.body;

	try {
		let prompt = question;

		if (characterName) {
			const build = await getBuildByCharacterName(characterName);
			const context = buildContext(characterName, build);
			prompt = `Context: ${context}\n\nQuestion: ${question}`;
		}

		const response = await ai.models.generateContent({
			model: 'gemini-3.5-flash-lite',
			contents: prompt,
			config: {
				thinkingConfig: {
					thinkingLevel: 'low',
				},
			},
		});
		res.json({ answer: response.text });
	} catch (err) {
		console.error('Gemini error:', err);
		res.status(500).json({ error: 'Something went wrong' });
	}
});

module.exports = router;
