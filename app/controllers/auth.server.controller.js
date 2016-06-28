/**
 * Created by tmin_lim on 16.
 * 3. 23..
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
var session = require('express-session');

var fitbitApi = require('fitbit-node');
var client = new fitbitApi(config.fitbit.clientID, config.fitbit.clientSecret );

var dataByfitbit= {};

//get a average value from last week
var averageLastWeek = function (weeksArray, nDigit) {
	var averageWeek = 0;
	var totalWeek = 0;
	var nLen = weeksArray.length;

	//average measurement 'nLen', not counting unmeasured day
	weeksArray.forEach(function (eachDay) {
		if(eachDay["value"] === "" || eachDay["value"] === "0" ||eachDay["value"] === 0){
			--nLen;
		}
		totalWeek += eachDay["value"]*1;
		averageWeek = totalWeek / nLen;
		return averageWeek;
	});

	if(nDigit !== undefined) {
		return averageWeek.toFixed(nDigit) * 1;
	}
	if(nLen <= 0 ) {
		return 0;
	} else return parseInt(averageWeek);
};

//extract the '_id' value of
// last document
var removeExceptLastDocument = function (model) {
	//Check if a model collection does not exists, just  return
	mongoose.connection.db.listCollections({name: model})
		.toArray(function (error, items) {
			if (error) {
				getErrorMessage(error);
			} else {
				//winston.info(items);
				//winston.info(items.length);

				if (items.length >= 1) {
					winston.log(items);
					model.find()
						.sort({_id: -1})
						.limit(1)
						.exec(function (error, recentDoc) {
							if (error) {
								return getErrorMessage(error);
							}
							//oh! retrieve the
							// virtual field
							// 'achievemen~'
							var lastDoc = JSON.parse(JSON.stringify(recentDoc[0]));
							var sObjectId = lastDoc._id;
							var lastObjectId = new mongoose.Types.ObjectId(sObjectId);
							winston.info(lastObjectId);

							//to remove all
							// document except
							// last one
							model.remove({_id: {$ne: lastObjectId}}, function (err, results) {
								winston.info(results.result);
								if (err) {
									getErrorMessage(err);
								}
							});
						});
				} else
					return;
			}
		});
};

// Create a new error
// handling controller method
// dsfsdkjfl
var getErrorMessage = function(err) {
	if (err.errors) {
		for (var errName in err.errors) {
			if (err.errors[errName].message) return err.errors[errName].message;
		}
	} else {
		return 'Unknown server error';
	}
};

exports.connectFitbit = function(req, res) {
	res.redirect(client.getAuthorizeUrl('activity heartrate nutrition sleep social', config.fitbit.callbackURL));
};

exports.getFitbitData = function(req, res) {
	client.getAccessToken(req.query.code, config.fitbit.callbackURL).then(function (result) {

		var activity = {goals:{}, calories:{}, steps:{}, distance:{}, floors:{}, activityCalories:{}};
		var heartrate = {},
			 nutrition = {},
			 sleep = {startTime:{}, timeInBed:{},minutesAsleep: {},efficiency:{}},
			 social = {};

		var nToday = moment().format('YYYY-MM-DD');
		var baseDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
		winston.info('today is ' + nToday+ ' baseDate is ' + baseDate);

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
				//winston.info(responseObj);
				activity.floors.weekAgoToday = parseInt(responseObj[0].value);
				activity.floors.yesterday = parseInt(responseObj[nLen - 2].value);
				activity.floors.today = parseInt(responseObj[nLen - 1].value);
				activity.floors.lastWeek = averageLastWeek(responseObj);
				callback();
			});
		};

		//https://dev.fitbit.com/docs/activity/
		//activities/activityCalories
		// - The number of calories burned during the day for periods of time when the user was active above sedentary level. This value is calculated minute by minute for minutes that fall under this criteria. This includes BMR for those minutes as well as activity burned calories.

		//GET https://api.fitbit.com/1/user/[user-id]/activities/date/[date].json
		//res[summary].veryActiveMinutes

			var getActivityCaloriesSeries = function(callback) {
			client.get('/activities/activityCalories/date/'+ nToday + '/' + baseDate + '.json', result.access_token).then(function (res) {
				var responseObj = res[0]["activities-activityCalories"];
				var nLen = responseObj.length;
				//winston.info(res[0]);
				activity.activityCalories.weekAgoToday = parseInt(responseObj[0].value);
				activity.activityCalories.yesterday = parseInt(responseObj[nLen - 2].value);
				activity.activityCalories.today = parseInt(responseObj[nLen - 1].value);
				activity.activityCalories.lastWeek = averageLastWeek(responseObj);

				removeExceptLastDocument(Activity);
				// Try saving the
				// Activity
				var newActivity = new Activity(activity);
				newActivity.save(function(err) {
					if(err) {
						return callback(getErrorMessage(err));
					} else
						callback();
				});
			});
		};




		var getHeartRate = function(callback) {
			client.get('/activities/heart/date/today/1d.json', result.access_token).then(function (res) {
				//winston.info(res[0]["activities-heart"][0].value.restingHeartRate);
				heartrate.restingHeartRate = parseInt(res[0]["activities-heart"][0].value.restingHeartRate);

				removeExceptLastDocument(Heartrate);
				// Try saving the
				// Heartrate
				var newHeartrate = new Heartrate(heartrate);
				newHeartrate.save(function(err) {
					if(err) {
						return callback(getErrorMessage(err));
					} else
						callback();
				});
			});
		};

		var getWaterSeries = function(callback) {
			client.get('/foods/log/water/date/'+ nToday + '/' + baseDate + '.json', result.access_token).then(function (res) {
				var responseObj = res[0]["foods-log-water"];
				var nLen = responseObj.length;
				//winston.info(res[0]);
				nutrition.weekAgoToday = parseInt(responseObj[0].value);
				nutrition.yesterday = parseInt(responseObj[nLen - 2].value);
				nutrition.today = parseInt(responseObj[nLen - 1].value);
				nutrition.lastWeek = averageLastWeek(responseObj);

				callback();
			});
		};

		var getGoalWater = function(callback) {
			client.get('/foods/log/water/goal.json', result.access_token).then(function (res) {
				//winston.info(res[0].goal.goal);
				nutrition.goal = res[0].goal.goal;

				removeExceptLastDocument(Nutrition);
				 //Try saving the
				 // Water
				var newNutrition = new Nutrition(nutrition);
				newNutrition.save(function(err) {
					if(err) {
						return callback(getErrorMessage(err));
					} else
						callback();
				});
			});
		};

//timeInBed
// =minutesToFallAsleep +
// minutesAsleep +
// minutesAwake +
// minutesAfterWakeup
		var getStartTimeSeries = function(callback) {
			client.get('/sleep/startTime/date/' +nToday + '/' + baseDate + '.json', result.access_token).then(function (res) {
				var responseObj = res[0]["sleep-startTime"];
				var nLen = responseObj.length;
				//winston.info(res[0]);
				sleep.startTime.weekAgoToday = responseObj[0].value;
				sleep.startTime.yesterday = responseObj[nLen - 2].value;
				sleep.startTime.today = responseObj[nLen - 1].value;
				//Instead of a
				// 'sleep.lastWeek',
				// there will be
				// a
				// 'sleep.weekAgoToday'.
				sleep.startTime.lastWeek = sleep.startTime.weekAgoToday;
				callback();
			});
		};

		var getTimeInBedSeries = function(callback) {
			client.get('/sleep/timeInBed/date/' +nToday + '/' + baseDate + '.json', result.access_token).then(function (res) {
				var responseObj = res[0]["sleep-timeInBed"];
				var nLen = responseObj.length;
				//winston.info(res[0]);
				sleep.timeInBed.weekAgoToday = parseInt(responseObj[0].value);
				sleep.timeInBed.yesterday = parseInt(responseObj[nLen - 2].value);
				sleep.timeInBed.today = parseInt(responseObj[nLen - 1].value);
				sleep.timeInBed.lastWeek = averageLastWeek(responseObj);
				callback();
			});
		};

		var getMinutesAsleepSeries = function(callback) {
			client.get('/sleep/minutesAsleep/date/' +nToday + '/' + baseDate + '.json', result.access_token).then(function (res) {
				var responseObj = res[0]["sleep-minutesAsleep"];
				var nLen = responseObj.length;
				//winston.info(res[0]);
				sleep.minutesAsleep.weekAgoToday = parseInt(responseObj[0].value);
				sleep.minutesAsleep.yesterday = parseInt(responseObj[nLen - 2].value);
				sleep.minutesAsleep.today = parseInt(responseObj[nLen - 1].value);
				sleep.minutesAsleep.lastWeek = averageLastWeek(responseObj);
				callback();
			});
		};


		var getEfficiencySeries = function(callback) {
			client.get('/sleep/efficiency/date/' +nToday + '/' + baseDate + '.json', result.access_token).then(function (res) {
				var responseObj = res[0]["sleep-efficiency"];
				var nLen = responseObj.length;

				winston.info(res[0]);

				sleep.efficiency.weekAgoToday = parseInt(responseObj[0].value);
				sleep.efficiency.yesterday = parseInt(responseObj[nLen - 2].value);
				sleep.efficiency.today = parseInt(responseObj[nLen - 1].value);
				sleep.efficiency.lastWeek = averageLastWeek(responseObj);
				callback();
			});
		};

		var getGoalSleep = function(callback) {
			client.get('/sleep/goal.json', result.access_token).then(function (res) {
				//winston.info(res[0].goal.goal);
				sleep.goal = res[0].goal.minDuration;

				removeExceptLastDocument(Sleep);
				// Try saving the
				// Sleep
				var newSleep = new Sleep(sleep);
				newSleep.save(function(err) {
					if(err) {
						return callback(getErrorMessage(err));
					} else
						callback();
				});
			});
		};


		var getFriends = function(callback) {
			client.get('/friends/leaderboard.json', result.access_token).then(function (res) {
				//winston.info(res[0]);
				var responseObj = res[0]["friends"];
				var medalRankingFriends = {};

				function createHonorableFriend(eachFriend, ranking) {
					var myHeathyFriend = {};
					var noRank = ranking + 1;
					myHeathyFriend.rank = eachFriend.rank.steps;
					myHeathyFriend.displayName = eachFriend.user.displayName;
					myHeathyFriend.avatar = eachFriend.user.avatar;
					myHeathyFriend.summary = eachFriend.summary.steps;
					myHeathyFriend.average = eachFriend.average.steps;

					medalRankingFriends['no' + noRank] = myHeathyFriend;
				}
				responseObj.forEach(createHonorableFriend);
				social = medalRankingFriends;

				removeExceptLastDocument(Social);
				// Try saving the
				// Social
				var newSocial = new Social(social);
				newSocial.save(function(err) {
					if(err) {
						return callback(getErrorMessage(err));
					} else
						callback();
				});
			})
		};

		async.series([
			//activity model
			getDailyActivity,
			getCaloriesSeries,
			getStepsSeries,
			getDistanceSeries,
			getFloorsSeries,
			getActivityCaloriesSeries,

			//heartrate model
			getHeartRate,

			//nutrition namely,
			// water model
			getWaterSeries,
			getGoalWater,

			//sleep model
			getStartTimeSeries,
			getTimeInBedSeries,
			getMinutesAsleepSeries,
			getEfficiencySeries,
			getGoalSleep,

			//friend model
			getFriends
		], function(err, results){
			if(err) {
				console.log('error'+ err);
			}
			dataByfitbit.activity = activity;
			dataByfitbit.heartrate = heartrate;
			dataByfitbit.water = nutrition;
			dataByfitbit.sleep = sleep;
			dataByfitbit.friends = social;

			//req.session.dataFitbit = dataByfitbit;
			console.log('index in');
			//console.log(req.session.dataFitbit);
			res.redirect('/');
			//res.status(200).json(dataByfitbit);

		});

	}).catch(function (error) {
		res.send(error);
	});
};