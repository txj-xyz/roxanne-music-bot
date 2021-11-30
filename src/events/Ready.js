const KongouEvent = require('../abstract/KongouEvent.js');

class Ready extends KongouEvent {
    get name() {
        return 'ready';
    }

    get once() {
        return true;
    }

    async run() {
        this.client.logger.debug(`${this.client.user.username}`, `Ready! Serving ${this.client.guilds.cache.size} guild(s) with ${this.client.users.cache.size} user(s)`);
        await this.client.lavasfy.requestToken(); //Initialize Spotify Client
        if (!this.interval) {
            await this.client.user.setActivity('What\'s the worst that could happen?!');
            const statuses =  [
                'If you see this, dont look down. :)',
                'Always got to make time for tea-time!',
                'Burning... Love!',
                'Going crazy, too much to do, too little time.'
            ];
            this.interval = setInterval(() => {
                const current = statuses.shift();
                this.client.user.setActivity(current);
                statuses.push(current);
            }, 300000);
        }
    }
}
module.exports = Ready;
