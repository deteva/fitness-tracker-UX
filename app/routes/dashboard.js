
 //Load the 'dashboard' controller
var dashboardCtrl = require('../../app/controllers/dashboard.server.controller');

module.exports = function(app) {
  /* GET dashboard page. */
  app.get('/', dashboardCtrl.getDataDB);

  app.get('/activity/json', dashboardCtrl.getActivityDBJson);
  app.get('/heartrate/json', dashboardCtrl.getHeartrateDBJson);
  app.get('/nutrtion/json', dashboardCtrl.getNutritionDBJson);
  app.get('/sleep/json', dashboardCtrl.getSleepDBJson);
  app.get('/social/json', dashboardCtrl.getSocialDBJson);

  app.get('/dashboard', dashboardCtrl.getTodayData);
};

