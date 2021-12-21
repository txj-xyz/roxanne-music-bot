const { createClient } = require('redis');
const { dbUrl } = require('../../config.json');

class DatabaseHandler {
    constructor(client) {
        this.redis = null;
        this.redis = createClient({ url: dbUrl });
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
