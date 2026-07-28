var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	res.redirect('/signup');
});

router.get('/signin', function (req, res, next) {
	res.render('signin');
});

router.get('/signup', function (req, res, next) {
	res.render('signup');
});

router.get('/', async (req, res) => {
	try {
		const response = await fetch(
			'https://api.hakush.in/zzz/data/character/1201.json',
		);
		const character = await response.json();
		console.log(character);
		console.log(character);
		console.log(character);
		console.log(character);
		res.render('index', { character });
	} catch (err) {
		console.error(err);
		res.status(500).send('Failed to load character.');
	}
});

module.exports = router;
