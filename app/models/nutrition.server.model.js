/**
 * Created by tmin_lim on 16. 3. 23..
 */
// Load the module dependencies
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// Define a new 'NutritionSchema'
var NutritionSchema = new Schema({

});

// Create the 'Nutrition' model out of the 'NutritionSchema'
mongoose.model('Nutrition', NutritionSchema);