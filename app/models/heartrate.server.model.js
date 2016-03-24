/**
 * Created by tmin_lim on 16. 3. 23..
 */
// Load the module dependencies
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// Define a new 'HeartrateSchema'
var HeartrateSchema = new Schema({
	restingHeartRate:{type: Number}
});
// Set the 'achievementSyncHeartrate' virtual property
HeartrateSchema.virtual('achievementSyncHeartrate').get(function() {
	if((this.restingHeartRate !== 'undefined') || (this.restingHeartRate !== 0)) {
		return 100;
	} else {
		return 0;
	}
});

HeartrateSchema.set('toJSON', {
	getters: true,
	virtuals: true
});
// Create the 'Heartrate' model out of the 'HeartrateSchema'
mongoose.model('Heartrate', HeartrateSchema);