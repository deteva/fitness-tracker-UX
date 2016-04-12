// Load the 'index' controller
var authCtrl = require('../controllers/auth.server.controller.js');

module.exports = function(app) {
    /* GET dashboard page. */
    app.get('/auth', authCtrl.connectFitbit);
    app.get('/auth/callback', authCtrl.getFitbitData);

};
