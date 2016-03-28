/**
 * Created by tmin_lim on 16.
 * 3. 28..
 */
module.exports = {
	//fitbit API specific configuration
	fitbit: {
		clientID: 'clientID',
		clientSecret: 'clientSecret',
		callbackURL: 'callbackURL'
	},
	// MongoDB connection options
	mongo: {
		options: {
			db: {
				safe: true
			}
		},
		uri: 'MONGOLAB_URI'
	}

};
