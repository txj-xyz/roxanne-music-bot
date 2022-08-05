class StatsUpdater {
    constructor(client) {
        this.client = client;
        this.statsSettings = this.client.util.config.statsUpdater;
        if (!this.statsSettings.enabled) return this.client.logger.warn(this.constructor.name, 'disabled');

        this.client.logger.debug(this.constructor.name, `Loaded StatsUpdater Successfully`);
        // Initial set
        setTimeout(async () => {
            this.set(this.statsSettings, await this.gather());
        }, 5000);

        // Set every 10m
        setInterval(async () => {
            const stats = await this.gather();
            this.set(this.statsSettings, stats);
        }, 600000); // 10 minutes
    }

    async gather() {
        //prettier-ignore
        const [players] = await Promise.all([
            this.client.shard.broadcastEval('this.queue.size'),
        ]);

        // guild.channels.cache.get(usersChannel).edit({ name: 'Users: 420' });
        const results = {
            guilds: this.client.guilds.cache.reduce((sum, count) => sum + count),
            users: this.client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c),
            players: players.reduce((sum, count) => sum + count),
        };
        // console.log(results);
        this.client.logger.debug(this.constructor.name, `Gathered '${JSON.stringify(results)}' Successfully`);
        return results;
    }

    async set(settings, stats) {
        const guild = await this.client.guilds.fetch(settings.guildID);
        const { usersChannel, guildsChannel, playersChannel } = settings;
        const userChannel = await guild.channels.cache.get(usersChannel);
        const guildChannel = await guild.channels.cache.get(guildsChannel);
        const playerChannel = await guild.channels.cache.get(playersChannel);
        try {
            await userChannel.edit({ name: `Users: ${stats.users.toLocaleString()}` });
            await guildChannel.edit({ name: `Guilds: ${stats.guilds.toLocaleString()}` });
            await playerChannel.edit({ name: `Players: ${stats.players.toLocaleString()}` });
            this.client.logger.debug(this.constructor.name, `Set '${JSON.stringify(stats)}' Successfully`);
        } catch (error) {
            this.client.logger.error('Failed updating stats channels, please check config and code.');
        }
    }
}

module.exports = StatsUpdater;
