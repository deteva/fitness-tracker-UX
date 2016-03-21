var express = require('express');
var router = express.Router();

var config = require('../../config/config')
/* An API client library written for
 Fitbit */
var fitbitApi = require('fitbit-node');
var client = new fitbitApi(config.fitbit.clientID, config.fitbit.clientSecret );


/* GET dashboard page. */
router.get('/', function(req, res, next) {
    res.redirect(client.getAuthorizeUrl('activity heartrate location nutrition profile settings sleep social weight', config.fitbit.callbackURL));
});

router.get("/auth/callback", function (req, res) {
    client.getAccessToken(req.query.code, config.fitbit.callbackURL).then(function (result) {
        client.get("/profile.json", result.access_token).then(function (results) {
            res.send(results[0]);
        });
    }).catch(function (error) {
        res.send(error);
    });
});

module.exports = router;
