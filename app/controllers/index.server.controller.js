/**
 * Created by tmin_lim on 16. 3. 23..
 */
// Invoke 'strict' JavaScript mode
'use strict';

var mongoose = require('mongoose'),
	Activity = mongoose.model('Activity'),
	Heartrate = mongoose.model('Heartrate'),
	Nutrition = mongoose.model('Nutrition'),
	Sleep = mongoose.model('Sleep'),
	Social = mongoose.model('Social');

var config = require('../../config/config');
var winston = require('winston');
var async = require('async');
var moment = require('moment');

var fitbitApi = require('fitbit-node');
var client = new fitbitApi(config.fitbit.clientID, config.fitbit.clientSecret );

//get a average value from last week
var averageLastWeek = function (weeksArray, nDigit) {
	var averageWeek = 0;
	var totalWeek = 0;
	weeksArray.forEach(function (eachDay) {
		totalWeek += eachDay["value"]*1;
		return averageWeek = totalWeek / weeksArray.length;
	});
	if(nDigit !== undefined) {
		return averageWeek.toFixed(nDigit) * 1;
	}
	return parseInt(averageWeek);
};

exports.connectFitbit = function(req, res, next) {
	res.redirect(client.getAuthorizeUrl('activity heartrate nutrition sleep social', config.fitbit.callbackURL));
};

exports.getFitbitData = function(req, res) {
	client.getAccessToken(req.query.code, config.fitbit.callbackURL).then(function (result) {
		var activity = {goals:{}, calories:{}, steps:{}, distance:{}, floors:{}, activityCalories:{}};
		var nToday = moment().format('YYYY-MM-DD');
		var baseDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
		winston.info('today' +
			' is ' + nToday+ ' baseDate is ' + baseDate);

		var getDailyActivity = function(callback) {
			client.get('/activities/date/'+ nToday + '.json', result.access_token).then(function (res) {
				activity.goals = res[0].goals;
				//winston.info(activity.goals);
				callback();
			});
		};

		var getCaloriesSeries = function(callback) {
			client.get('/activities/calories/date/'+ nToday + '/' + baseDate + '.json', result.access_token).then(function (res) {
				var responseObj = res[0]["activities-calories"];
				var nLen = responseObj.length;
				//winston.info(responseObj);
				activity.calories.weekAgoToday = parseInt(responseObj[0].value);
				activity.calories.yesterday = parseInt(responseObj[nLen - 2].value);
				activity.calories.today = parseInt(responseObj[nLen - 1].value);
				activity.calories.lastWeek = averageLastWeek(responseObj);
				callback();
			});
		};

		var getStepsSeries = function(callback) {
			client.get('/activities/steps/date/'+ nToday + '/' + baseDate + '.json', result.access_token).then(function (res) {
				var responseObj = res[0]["activities-steps"];
				var nLen = responseObj.length;
				//winston.info(responseObj);
				activity.steps.weekAgoToday = parseInt(responseObj[0].value);
				activity.steps.yesterday = parseInt(responseObj[nLen - 2].value);
				activity.steps.today = parseInt(responseObj[nLen - 1].value);
				activity.steps.lastWeek = averageLastWeek(responseObj);
				callback();
			});
		};

		var getDistanceSeries = function(callback) {
			client.get('/activities/distance/date/'+ nToday + '/' + baseDate + '.json', result.access_token).then(function (res) {
				var responseObj = res[0]["activities-distance"];
				var nLen = responseObj.length;
				var sWeekAgoToday = parseFloat(responseObj[0].value).toFixed(2);
				var sYesterday = parseFloat(responseObj[nLen - 2].value).toFixed(2);
				var sToday = parseFloat(responseObj[nLen - 1].value).toFixed(2);
				var sLastWeek = averageLastWeek(responseObj, 2);

				//winston.info(sLastWeek);
				activity.distance.weekAgoToday = sWeekAgoToday * 1;
				activity.distance.yesterday = sYesterday * 1;
				activity.distance.today = sToday * 1;
				activity.distance.lastWeek = sLastWeek;
				callback();
			});
		};

		var getFloorsSeries = function(callback) {
			client.get('/activities/floors/date/'+ nToday + '/' + baseDate + '.json', result.access_token).then(function (res) {
				var responseObj = res[0]["activities-floors"];
				var nLen = responseObj.length;
				winston.info(responseObj);
				activity.floors.weekAgoToday = parseInt(responseObj[0].value);
				activity.floors.yesterday = parseInt(responseObj[nLen - 2].value);
				activity.floors.today = parseInt(responseObj[nLen - 1].value);
				activity.floors.lastWeek = averageLastWeek(responseObj);
				callback();
			});
		};

		var getActivityCaloriesSeries = function(callback) {
			client.get('/activities/activityCalories/date/'+ nToday + '/' + baseDate + '.json', result.access_token).then(function (res) {
				var responseObj = res[0]["activities-activityCalories"];
				var nLen = responseObj.length;
				winston.info(res[0]);
				activity.activityCalories.weekAgoToday = parseInt(responseObj[0].value);
				activity.activityCalories.yesterday = parseInt(responseObj[nLen - 2].value);
				activity.activityCalories.today = parseInt(responseObj[nLen - 1].value);
				activity.activityCalories.lastWeek = averageLastWeek(responseObj);
				callback();
			});
		};

		async.series([
			//activity model
			getDailyActivity,
			getCaloriesSeries,
			getStepsSeries,
			getDistanceSeries,
			getFloorsSeries,
			getActivityCaloriesSeries



		], function(err, results){
			if(err) {
				console.log('error'+ err);
			}
			res.send(activity);
			//res.render('index', { title: activity });
		})

	}).catch(function (error) {
		res.send(error);
	});
};