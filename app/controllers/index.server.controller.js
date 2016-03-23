/**
 * Created by tmin_lim on 16. 3. 23..
 */
var config = require('../../config/config');
var async = require('async');

var fitbitApi = require('fitbit-node');
var client = new fitbitApi(config.fitbit.clientID, config.fitbit.clientSecret );

exports.connectFitbit = function(req, res, next) {
	res.redirect(client.getAuthorizeUrl('activity heartrate nutrition sleep social', config.fitbit.callbackURL));
};

exports.getFitbitData = function(req, res) {
	client.getAccessToken(req.query.code, config.fitbit.callbackURL).then(function (result) {

		var get1 = function(cb) {
			client.get("/activities/steps/date/today/7d.json", result.access_token).then(function (res) {
				//res.send(results[0]);
				console.log(res[0]);
				cb(null, res[0]);
			});
		};

		var get2 = function(cb) {
			client.get("/activities/date/today.json", result.access_token).then(function (res) {
				//res.send(results[0]);
				console.log(res[0]);
				cb(null, res[0]);
			});
		};

		async.series([
			get1,
			get2
		], function(err, results){
			if(err) {
				console.log('error'+ err);
			}
			console.log(typeof results);
			res.send(results);
		})

	}).catch(function (error) {
		res.send(error);
	});
};