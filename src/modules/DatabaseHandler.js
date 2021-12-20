const { createClient } = require('redis');

class DatabaseHandler {
    constructor(client) {
        this.redis = null;
        this.redis = createClient({ url: 'redis://192.168.1.20:31181' });
        this.redis
            .connect()
            .then(() => {
                client.logger.debug(
                    this.constructor.name,
                    'Loaded Database Handler without Error.'
                );
            })
            .catch((err) => {
                this.redis = 'Not Connected';
                client.logger.debug(
                    this.constructor.name,
                    `Failed to Connect to Database: ${err}`
                );
                return this.redis;
            });

        return this;
    }
}

module.exports = DatabaseHandler;
