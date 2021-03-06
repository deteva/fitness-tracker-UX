var express = require('express');
var path = require('path');
var logger = require('morgan');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var winston = require('winston');
var mongoose = require('./mongoose');
//var session = require('express-session');
//var compass = require('node-compass');

var config = require('./config');

// Define the Express configuration method
module.exports = function() {
	var app = express();
	// Create a new Mongoose connection instance
	var db = mongoose();

	// Use the 'NDOE_ENV' variable to activate the 'morgan' logger or 'compress' middleware
	if (process.env.NODE_ENV === 'development') {
		app.use(logger('dev'));
	} else if (process.env.NODE_ENV === 'production') {
		app.use(compress());
	}
	winston.info('process.env.NODE_ENV: ' + process.env.NODE_ENV);

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser());
	//app.use(require('node-compass')({
	//	mode: 'expanded',
	//	logging: true,
	//	project: path.join(__dirname, '../public/stylesheets/'),
	//	css: 'css',
	//	sass: 'sass'
	//}));
	//app.use(require('node-compass')({
	//	mode: 'expanded',
	//	project: path.join(__dirname, '/public/stylesheets/'),
	//}));

	//app.use(require('node-compass')({
	//	mode: 'expanded'
	//}));

	// Configure the 'session' middleware
	//app.use(session({
	//	secret: config.session.secret,
	//	saveUninitialized: true,
	//	resave: true,
	//	cookie: { maxAge: 100000 }
	//}));

	// Set the application view engine and 'views' folder
	app.set('views', path.join(__dirname, '../app/app.server/views'));
	app.set('view engine', 'hbs');

	// Load the routing files
	require('../app/routes/auth.js')(app);
	require('../app/routes/dashboard.js')(app);


	app.use(express.static(path.join(__dirname, '../public')));


	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// error handlers

	// development error handler
	// will print stacktrace
	if (app.get('env') === 'development') {
		app.use(function(err, req, res, next) {
			res.status(err.status || 500);
			res.render('error', {
				message: err.message,
				error: err
			});
		});
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	});
	return app;
};
