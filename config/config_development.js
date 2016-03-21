
/**
 * Created by tmin_lim on 16. 3. 22..
 */
module.exports = {
    //fitbit API specific configuration
    fitbit: {
        clientID: '',
        clientSecret: '',
        callbackURL: 'http://localhost:3000/auth/callback'
    },
    // MongoDB connection options
    mongo: {
        options: {
            db: {
                safe: true
            }
        },
        uri: 'mongodb://localhost/data-fitbit'
    }

};
