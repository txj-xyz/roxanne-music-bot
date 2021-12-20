const { createClient } = require('redis');

class DatabaseHandler {
    constructor(client) {
        this.redis = null;
        this.redis = createClient({ url: 'redis://192.168.1.20:31181' });
        this.redis.connect().catch((err) => {
            this.redis = 'Not Connected';
            client.logger.debug(this.constructor.name, err);
            return this.redis;
        });
        client.logger.debug(
            this.constructor.name,
            'Loaded Database Handler without Error.'
        );
        return this;
    }
}

module.exports = DatabaseHandler;
