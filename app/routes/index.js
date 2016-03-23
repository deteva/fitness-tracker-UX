// Load the 'index' controller
var indexCtrl = require('../../app/controllers/index.server.controller');

// Define the routes module' method
module.exports = function(app) {
    /* GET dashboard page. */
    app.get('/', indexCtrl.connectFitbit);
    app.get('/auth/callback', indexCtrl.getFitbitData);

};
//
//var express = require('express');
//var router = express.Router();

//module.exports = router;
