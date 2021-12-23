const { createClient } = require('redis');
const { dbUrl } = require('../../config.json');

class DatabaseHandler {
    constructor(client) {
        this.redis = createClient({ url: dbUrl });
        this.redis
            .connect()
            .then(() => {
                client.logger.debug(this.constructor.name, 'Loaded Database Handler without Error.');
            })
            .catch((err) => {
                client.logger.debug(this.constructor.name, `Failed to Connect to Database: ${err}`);
                this.redis = null;
            });
    }
}

module.exports = DatabaseHandler;
