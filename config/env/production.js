/**
 * Created by tmin_lim on 16.
 * 3. 28..
 */
module.exports = {
	//fitbit API specific configuration
	fitbit: {
		clientID: process.env.clientID,
		clientSecret: process.env.clientSecret,
		callbackURL: process.env.callbackURL
	},
	// MongoDB connection options
	mongo: {
		options: {
			db: {
				safe: true
			}
		},
		uri: process.env.MONGOLAB_URI
	}

};
