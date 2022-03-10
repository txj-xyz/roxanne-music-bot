const RoxanneEvent = require('../abstract/RoxanneEvent.js');
const PrometheusCollector = require('../modules/PrometheusCollector.js');
class Ready extends RoxanneEvent {
    get name() {
        return 'ready';
    }

    get once() {
        return true;
    }

    get enabled() {
        return true;
    }

    async run() {
        this.client.logger.debug(`${this.client.user.username}`, `Ready! Serving ${this.client.guilds.cache.size} guild(s) with ${this.client.users.cache.size} user(s)`);

        if (this.client.util.config.prometheusEnabled) new PrometheusCollector(this.client).start();

        if (!this.interval) {
            await this.client.user.setActivity("What's the worst that could happen?!");
            //prettier-ignore
            const statuses = [
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
