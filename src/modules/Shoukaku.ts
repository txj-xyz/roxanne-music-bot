import { Shoukaku, Connectors } from 'shoukaku';
import Bot from '../Bot';
import { BotModule } from '../handlers/ModuleHandler';

export default class Music extends Shoukaku implements BotModule {
    get enabled() {
        return true;
    }
    get name() {
        return this.constructor.name;
    }
    constructor(client: Bot) {
        super(new Connectors.DiscordJS(client), client.util.config.lavalinkOptions, client.util.config.shoukakuOptions);
        this.on('ready', (name, resumed) => {
            client.logger.log({ handler: this.constructor.name, message: `Lavalink Node: ${name} is now ${resumed ? 'resumed' : 'connected'}` }, true);
        });
        this.on('error', (name, error) => {
            client.logger.error({ handler: this.constructor.name, error: `Lavalink Node: ${name} had an error ${error.toString()}` }, true);
        });
        this.on('close', (name, code, reason) => {
            client.logger.log({ handler: this.constructor.name, message: `Lavalink Node: ${name} closed with code ${code} ${reason ? `with reason: ${reason}` : ''}` }, true);
        });
        this.on('disconnect', (name, players, moved) => {
            client.logger.log(
                {
                    handler: this.constructor.name,
                    message: `Lavalink Node: ${name} disconnected ${
                        moved ? `${players ? players.length : ''} players have been moved` : `${players ? players.length : ''} players have been disconnected`
                    }`,
                },
                true
            );
        });
    }
}
