// Load the 'index' controller
var indexCtrl = require('../../app/controllers/index.server.controller');

module.exports = function(app) {
    /* GET dashboard page. */
    app.get('/', indexCtrl.connectFitbit);
    app.get('/auth/callback', indexCtrl.getFitbitData);

};

