/**
 * Created by tmin_lim on 16. 3. 23..
 */
// Load the module dependencies
var	config = require('./config');
var mongoose = require('mongoose');

// Define the Mongoose configuration method
module.exports = function() {
    // Use Mongoose to connect to MongoDB
    var db = mongoose.connect(config.mongo.uri);

    // Load the application models
    require('../app/models/activity.server.model');
    require('../app/models/heartrate.server.model');
    require('../app/models/nutrition.server.model');
    require('../app/models/sleep.server.model');
    require('../app/models/social.server.model');

    // Return the Mongoose connection instance
    return db;
};