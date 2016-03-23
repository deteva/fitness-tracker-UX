/**
 * Created by tmin_lim on 16. 3. 23..
 */
// Load the module dependencies
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// Define a new 'HeartrateSchema'
var HeartrateSchema = new Schema({

});

// Create the 'Heartrate' model out of the 'HeartrateSchema'
mongoose.model('Heartrate', HeartrateSchema);