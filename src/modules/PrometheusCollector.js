const APM = require('prometheus-middleware');
class PrometheusCollector extends APM {
    constructor(client) {
        super({
            METRICS_ROUTE: '/metrics',
            PORT: this.client.util.config.prometheusPort,
        });
        this.init();
        this.prom = this;
        this.roxanne = client;
        client.logger.debug(this.constructor.name, 'Loaded OK');
    }

    async start() {
        const gather = async () => {
            const [guilds, channels, players] = await Promise.all([
                this.roxanne.shard.broadcastEval('this.guilds.cache.size'),
                this.roxanne.shard.broadcastEval('this.channels.cache.size'),
                this.roxanne.shard.broadcastEval('this.queue.size'),
            ]);
            return {
                ws_ping: this.roxanne.ws.ping,
                guilds: guilds.reduce((sum, count) => sum + count),
                channels: channels.reduce((sum, count) => sum + count),
                players: players.reduce((sum, count) => sum + count),
                userCount: this.roxanne.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c),
                commandsRun: this.roxanne.commandsRun,
            };
        };
        let _;
        setInterval(async () => (_ = await gather()), 4 * 1000);
        this.roxanne.logger.debug(this.constructor.name, `Stats pulled: ${JSON.stringify(await gather(), null, null)}`);
        try {
            new this.prom.client.Gauge({
                name: 'roxanne_ws_ping',
                help: 'ping in ms to discord gateway websocket',
                async collect() {
                    this.set(_.ws_ping);
                },
            });

            new this.prom.client.Gauge({
                name: 'roxanne_guilds',
                help: 'total guilds across all shards',
                async collect() {
                    this.set(_.guilds);
                },
            });

            new this.prom.client.Gauge({
                name: 'roxanne_channels',
                help: 'total channels across all shards',
                async collect() {
                    this.set(_.channels);
                },
            });

            new this.prom.client.Gauge({
                name: 'roxanne_music_players',
                help: 'total lavalink players across all shards',
                async collect() {
                    this.set(_.players);
                },
            });
            new this.prom.client.Gauge({
                name: 'roxanne_user_count',
                help: 'total user count across all shards',
                async collect() {
                    this.set(_.userCount);
                },
            });
            new this.prom.client.Gauge({
                name: 'roxanne_commands_run',
                help: 'total commands run on the bot',
                async collect() {
                    this.set(_.commandsRun);
                },
            });
        } catch (error) {
            this.roxanne.logger.log(this.constructor.name, error);
        }
    }
}

module.exports = PrometheusCollector;
