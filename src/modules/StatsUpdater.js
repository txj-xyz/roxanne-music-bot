class StatsUpdater {
    constructor(client) {
        this.client = client;
        this.statsSettings = this.client.util.config.statsUpdater;
        //prettier-ignore
        setTimeout(async () => { this.set(this.statsSettings, await this.gather()); }, 5000);
        setInterval(async () => {
            const stats = await this.gather();
            this.set(this.statsSettings, stats);
        }, 600000); // 10 minutes
    }

    async gather() {
        //prettier-ignore
        const [guilds, players] = await Promise.all([
            this.client.shard.broadcastEval('this.guilds.cache.size'),
            this.client.shard.broadcastEval('this.queue.size'),
        ]);

        // guild.channels.cache.get(usersChannel).edit({ name: 'Users: 420' });
        const results = {
            guilds: guilds.reduce((sum, count) => sum + count),
            users: this.client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c),
            players: players.reduce((sum, count) => sum + count),
        };
        // console.log(results);
        return results;
    }

    async set(settings, stats) {
        const guild = await this.client.guilds.fetch(settings.guildID);
        const { usersChannel, guildsChannel, playersChannel } = settings;
        const userChannel = await guild.channels.cache.get(usersChannel);
        const guildChannel = await guild.channels.cache.get(guildsChannel);
        const playerChannel = await guild.channels.cache.get(playersChannel);
        await userChannel.edit({ name: `Users: ${stats.users}` });
        await guildChannel.edit({ name: `Guilds: ${stats.guilds}` });
        await playerChannel.edit({ name: `Players: ${stats.players}` });
    }
}

module.exports = StatsUpdater;
