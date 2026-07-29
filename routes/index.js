var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	res.redirect('/signup');
});
// browser is asking for the root resource, in this case it's '/'

router.get('/signin', function (req, res, next) {
	res.render('signin');
});

router.get('/signup', function (req, res, next) {
	res.render('signup');
});

router.get('/index', function (req, res, next) {
	if (!req.user) return res.redirect('/signin');
	res.render('index', { name: req.user.name });
});

module.exports = router;
