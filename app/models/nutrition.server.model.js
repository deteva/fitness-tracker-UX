/**
 * Created by tmin_lim on 16. 3. 23..
 */
// Load the module dependencies
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// Define a new 'NutritionSchema'
var NutritionSchema = new Schema({
	weekAgoToday:{type: Number},
	yesterday: {type: Number},
	today:{type: Number},
	lastWeek: {type: Number},
	goal:{type: Number},
});
// Set the 'achievementSyncHeartrate' virtual property
NutritionSchema.virtual('achievementSyncWater').get(function() {
	return Math.floor((this.today / this.goal ) * 100);
});

NutritionSchema.set('toJSON', {
	getters: true,
	virtuals: true
});
// Create the 'Nutrition' model out of the 'NutritionSchema'
mongoose.model('Nutrition', NutritionSchema);