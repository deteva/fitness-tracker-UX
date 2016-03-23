/**
 * Created by tmin_lim on 16. 3. 23..
 */
// Load the module dependencies
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// Define a new 'SleepSchema'
var SleepSchema = new Schema({

});

// Create the 'Sleep' model out of the 'SleepSchema'
mongoose.model('Sleep', SleepSchema);