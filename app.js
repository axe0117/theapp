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
require('dotenv').config();
const { connectToDB } = require('./models/db');

// =====================================================================
// ROUTERS
// =====================================================================
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var charactersRouter = require('./routes/characters'); // toggle-ownership + owned-list API
var teamCompsRouter = require('./routes/team-comps'); // which comps a user can build
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

// NOTE: the /characters/:name/toggle route expects req.user to be set.
// Wire in your session/auth middleware here (e.g. express-session + passport,
// or a JWT-verification middleware) before charactersRouter is mounted below,
// so req.user is populated by the time those routes run.

// =====================================================================
// ROUTES
// =====================================================================
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(charactersRouter); // exposes GET/POST /characters/... ownership endpoints
app.use(teamCompsRouter); // exposes GET /team-comps/available

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
