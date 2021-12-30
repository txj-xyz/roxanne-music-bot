// const { token, webhookUrl, inviteURL, youtube_key, spotifyClientID, spotifySecret } = require('../../config.json');

class PrometheusCollector {
    constructor(client) {
        this.client = client;
        this._roxanne_ws_ping = new client.prom.client.Gauge({
            name: 'roxanne_ws_ping',
            help: 'ping in ms to discord gateway websocket',
        });
        this._roxanne_guilds = new client.prom.client.Gauge({
            name: 'roxanne_guilds',
            help: 'total guilds across all shards',
        });
        this._roxanne_channels = new client.prom.client.Gauge({
            name: 'roxanne_channels',
            help: 'total channels across all shards',
        });
        this._roxanne_music_players = new client.prom.client.Gauge({
            name: 'roxanne_music_players',
            help: 'total lavalink players across all shards',
        });
        this._roxanne_user_count = new client.prom.client.Gauge({
            name: 'roxanne_user_count',
            help: 'total user count across all shards',
        });
        this._roxanne_commands_run = new client.prom.client.Gauge({
            name: 'roxanne_commands_run',
            help: 'total commands run on the bot',
        });

        this.client.logger.debug(this.constructor.name, 'Loaded OK');
    }

    async gather() {
        const [guilds, channels, players] = await Promise.all([
            this.client.shard.broadcastEval('this.guilds.cache.size'),
            this.client.shard.broadcastEval('this.channels.cache.size'),
            this.client.shard.broadcastEval('this.queue.size'),
        ]);
        return {
            ws_ping: this.client.ws.ping,
            guilds: guilds.reduce((sum, count) => sum + count),
            channels: channels.reduce((sum, count) => sum + count),
            players: players.reduce((sum, count) => sum + count),
            userCount: this.client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c),
            commandsRun: this.client.commandsRun,
        };
    }

    async start() {
        // Set initial values from the first gather.
        let i = await this.gather();
        this.client.logger.debug(this.constructor.name, `Stats pulled: ${JSON.stringify(i, null, null)}`);
        this._roxanne_ws_ping.set(i.ws_ping);
        this._roxanne_guilds.set(i.guilds);
        this._roxanne_channels.set(i.channels);
        this._roxanne_music_players.set(i.players);
        this._roxanne_user_count.set(i.userCount);
        this._roxanne_commands_run.set(i.commandsRun);

        setInterval(async () => {
            i = await this.gather();
            this._roxanne_ws_ping.set(i.ws_ping);
            this._roxanne_guilds.set(i.guilds);
            this._roxanne_channels.set(i.channels);
            this._roxanne_music_players.set(i.players);
            this._roxanne_user_count.set(i.userCount);
            this._roxanne_commands_run.set(i.commandsRun);
        }, 10 * 1000);
    }
}

module.exports = PrometheusCollector;
