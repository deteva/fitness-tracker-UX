/**
 * Created by tmin_lim on 16. 3. 23..
 */
// Load the module dependencies
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// Define a new 'ActivitySchema'
var ActivitySchema = new Schema({
			goals: {
				activeMinutes: {type: Number},
				caloriesOut: {type: Number},
				distance: {type: Number},
				floors: {type: Number},
				steps: {type: Number}
			},
			calories: {
				today: {type: Number},
				yesterday: {type: Number},
				weekAgoToday: {type: Number},
				lastWeek: {type: Number}
			},
			steps: {
				today: {type: Number},
				yesterday: {type: Number},
				weekAgoToday: {type: Number},
				lastWeek: {type: Number}
			}
			,
			distance: {
				today: {type: Number},
				yesterday: {type: Number},
				weekAgoToday: {type: Number},
				lastWeek: {type: Number}
			}
			,
			floors: {
				today: {type: Number},
				yesterday: {type: Number},
				weekAgoToday: {type: Number},
				lastWeek: {type: Number}
			}
			,
			activityCalories: {
				today: {type: Number},
				yesterday: {type: Number},
				weekAgoToday: {type: Number},
				lastWeek: {type: Number}
			}
		}
	);

// Set the 'achievement' virtual property
ActivitySchema.virtual('achievementActiveMinutes').get(function() {
	return Math.floor((this.activityCalories.today / this.goals.activeMinutes ) * 100);
});

ActivitySchema.virtual('achievementCaloriesOut').get(function() {
	return Math.floor((this.calories.today / this.goals.caloriesOut ) * 100);
});

ActivitySchema.virtual('achievementDistance').get(function() {
	return Math.floor((this.distance.today / this.goals.distance ) * 100);
});

ActivitySchema.virtual('achievementFloors').get(function() {
	return Math.floor((this.floors.today / this.goals.floors ) * 100);
});

ActivitySchema.virtual('achievementSteps').get(function() {
	return Math.floor((this.steps.today / this.goals.steps ) * 100);
});


ActivitySchema.set('toJSON', {
	getters: true,
	virtuals: true
});

// Create the 'Activity'
// model out of the 'ActivitySchema'
mongoose.model('Activity', ActivitySchema);