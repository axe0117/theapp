//the oh so tainted project root
//thank goodness for claude..for now

// =====================================================================
// CORE DEPENDENCIES
// =====================================================================
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
require('dotenv').config();
const { connectToDB } = require('./models/db');

// =====================================================================
// ROUTERS
// =====================================================================
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var charactersRouter = require('./routes/characters'); // toggle-ownership + owned-list API
var teamCompsRouter = require('./routes/team-comps'); // which comps a user can build
var geminiRouter = require('./routes/gemini'); // Gemini AI question endpoint
const { getAllCharacters } = require('./models/characters');
const { getUserById } = require('./models/userCharacters');

var app = express();

// =====================================================================
// DATABASE CONNECTION
// =====================================================================
(async () => {
	try {
		await connectToDB();
		console.log('Database initialized');
	} catch (error) {
		console.error('Failed to start database:', error);
	}
})();

// =====================================================================
// VIEW ENGINE SETUP
// =====================================================================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// =====================================================================
// MIDDLEWARE
// =====================================================================
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware - THIS WAS MISSING, causing req.session to be undefined.
// Must come before any route that reads/writes req.session (e.g. routes/users.js).
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'dev-only-fallback-secret-change-me',
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // 1 day
		},
	}),
);

// Populate req.user from the session, so downstream routes (characters, team-comps)
// can rely on req.user being set whenever someone is logged in.
app.use(async (req, res, next) => {
	if (req.session && req.session.userId) {
		try {
			req.user = await getUserById(req.session.userId);
		} catch (err) {
			console.error('Failed to load user from session:', err);
		}
	}
	next();
});

// =====================================================================
// ROUTES
// =====================================================================
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(charactersRouter); // exposes GET/POST /characters/... ownership endpoints
app.use(teamCompsRouter); // exposes GET /team-comps/available
app.use(geminiRouter); // exposes POST /ask
app.get('/characters', async (req, res) => {
	const agents = await getAllCharacters();

	let ownedNames = [];
	if (req.user) {
		const user = await getUserById(req.user._id);
		const ownedIds = new Set(
			(user.ownedCharacterIds || []).map((id) => id.toString()),
		);
		ownedNames = agents
			.filter((a) => ownedIds.has(a._id.toString()))
			.map((a) => a.name);
	}

	res.render('characters', { agents, ownedNames });
});

app.get('/team-comps', (req, res) => {
	res.render('team-comps');
});

app.get('/team-comps/carousel/:name', (req, res) => {
	res.render('team-comp-carousel', { characterName: req.params.name });
});

// =====================================================================
// ERROR HANDLING
// =====================================================================

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
