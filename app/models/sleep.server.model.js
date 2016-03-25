/**
 * Created by tmin_lim on 16. 3. 23..
 */
// Load the module dependencies
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// Define a new 'SleepSchema'
var SleepSchema = new Schema({
	startTime: {
		today: {type: String},
		yesterday: {type: String},
		weekAgoToday: {type: String},
		lastWeek: {type: String}
	},
	timeInBed: {
		today: {type: Number},
		yesterday: {type: Number},
		weekAgoToday: {type: Number},
		lastWeek: {type: Number}
	},
	minutesAsleep: {
		today: {type: Number},
		yesterday: {type: Number},
		weekAgoToday: {type: Number},
		lastWeek: {type: Number}
	},
	efficiency: {
		today: {type: Number},
		yesterday: {type: Number},
		weekAgoToday: {type: Number},
		lastWeek: {type: Number}
	},
	goal: {type: Number}
});

//'achievementSleep' replaces 'this.efficienty'

// Create the 'Sleep' model out of the 'SleepSchema'
mongoose.model('Sleep', SleepSchema);