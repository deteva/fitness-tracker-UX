/**
 * Created by tmin_lim on 16.
 * 4. 9..
 */
var winston = require('winston');
var mongoose = require('mongoose'),
	 Activity = mongoose.model('Activity'),
	 Heartrate = mongoose.model('Heartrate'),
	 Nutrition = mongoose.model('Nutrition'),
	 Sleep = mongoose.model('Sleep'),
	 Social = mongoose.model('Social');

exports.getTodayData = function(req, res) {
	winston.info('dashboard in');
	console.log(req.session.dataFitbit);

	var todayData = req.session.dataFitbit;
	req.session.dataFitbit = null;
	//res.status(200).json(todayData);
	res.render('index', {data: todayData});
};

exports.getActivityDBJson = function(req,res) {
	Activity.find({})
		.exec(function(err, activity) {
			if(err) {
				return getErrorMessage(err);
			}
			if(!activity) {
				return res.send(404);
			}
			winston.info('dashboard.server.controller: getActivityDBJson');
			var data = JSON.parse(JSON.stringify(activity[0]._doc));

			//winston.log(data);
			res.status(200).json(data);
		});
};

exports.getHeartrateDBJson = function(req,res) {
	Heartrate.find({})
		.exec(function(err, heartrate) {
			if(err) {
				return getErrorMessage(err);
			}
			if(!heartrate) {
				return res.send(404);
			}
			winston.info('dashboard.server.controller: getHeartrateDBJson');
			var data = JSON.parse(JSON.stringify(heartrate[0]._doc));

			//winston.log(data);
			res.status(200).json(data);
		});
};


exports.getNutritionDBJson = function(req,res) {
	Nutrition.find({})
		.exec(function(err, nutrition) {
			if(err) {
				return getErrorMessage(err);
			}
			if(!nutrition) {
				return res.send(404);
			}
			winston.info('dashboard.server.controller: getNutritionDBJson');
			var data = JSON.parse(JSON.stringify(nutrition[0]._doc));

			//winston.log(data);
			res.status(200).json(data);
		});
};

exports.getSleepDBJson = function(req,res) {
	Sleep.find({})
		.exec(function(err, sleep) {
			if(err) {
				return getErrorMessage(err);
			}
			if(!sleep) {
				return res.send(404);
			}
			winston.info('dashboard.server.controller: getSleepDBJson');
			var data = JSON.parse(JSON.stringify(sleep[0]._doc));

			//winston.log(data);
			res.status(200).json(data);
		});
};

exports.getSocialDBJson = function(req,res) {
	Social.find({})
		.exec(function(err, social) {
			if(err) {
				return getErrorMessage(err);
			}
			if(!social) {
				return res.send(404);
			}
			winston.info('dashboard.server.controller: getSocialDBJson');
			var data = JSON.parse(JSON.stringify(social[0]._doc));
			//winston.log(data);
			res.status(200).json(data);
		});
};

exports.getDataDB = function(req,res) {
	res.render('index', {
		title: 'dashboard'
	});
};

var getErrorMessage = function(err) {
	if (err.errors) {
		for (var errName in err.errors) {
			if (err.errors[errName].message) return err.errors[errName].message;
		}
	} else {
		return 'Unknown server error';
	}
};