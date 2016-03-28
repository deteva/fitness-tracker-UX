/**
 * Created by tmin_lim on 16.
 * 3. 28..
 */
module.exports = {
	//fitbit API specific configuration
	fitbit: {
		clientID: process.env.NODE_ENV.clientID,
		clientSecret: process.env.NODE_ENV.clientSecret,
		callbackURL: process.env.NODE_ENV.callbackURL
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
