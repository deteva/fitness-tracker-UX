var express = require('express');
var path = require('path');
var logger = require('morgan');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var winston = require('winston');

// Define the Express configuration method
module.exports = function() {
	var app = express();

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
	app.use(require('node-compass')({mode: 'expanded'}));
	app.use(express.static(path.join(__dirname, 'public')));

	// Set the application view engine and 'views' folder
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'hbs');

	// Load the routing files
	require('../app/routes/index.js')(app);

	// Configure static file serving
	//app.use(express.static('./public'));

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
