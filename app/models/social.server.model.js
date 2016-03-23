/**
 * Created by tmin_lim on 16. 3. 23..
 */
// Load the module dependencies
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// Define a new 'SocialSchema'
var SocialSchema = new Schema({

});

// Create the 'Social' model out of the 'SocialSchema'
mongoose.model('Social', SocialSchema);