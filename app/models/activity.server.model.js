/**
 * Created by tmin_lim on 16. 3. 23..
 */
// Load the module dependencies
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Define a new 'ActivitySchema'
var ActivitySchema = new Schema({
    name: String
});

// Create the 'Activity'
// model out of the 'ActivitySchema'
 mongoose.model('Activity', ActivitySchema);