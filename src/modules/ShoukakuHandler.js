const { Shoukaku, Libraries } = require('shoukaku');
// const servers = require('../../lavalink-server.json');
// const options = require('../../shoukaku-options.js');

class ShoukakuHandler extends Shoukaku {
    constructor(client) {
        super(new Libraries.DiscordJS(client), client.util.config.lavalinkOptions, client.util.config.shoukakuOptions);
        this.on('ready', (name, resumed) => {
            client.logger.log({
                constructor: this.constructor.name,
                message: `Lavalink Node: ${name} is now connected`,
                resumed: resumed,
            });
        });
        this.on('error', (name, error) => {
            client.logger.error(error, {
                constructor: this.constructor.name,
                message: `Something went wrong ${error.toString()}`,
            });
        });
        // this.on('close', (name, code, reason) => {
        //     client.logger.log(`Lavalink Node: ${name} closed with code ${code}`, reason || 'No reason');
        // });
        // this.on('disconnect', (name, players, moved) => {
        //     client.logger.log({
        //         message: 'New player connection',
        //         guild: guild.name,
        //         guildID: guild.id,
        //     })
        //     client.logger.log(`Lavalink Node: ${name} disconnected`, moved ? 'players have been moved' : 'players have been disconnected');
        // });
        // this.on('debug', (name, reason) => client.logger.log(`Lavalink Node: ${name}`, reason || 'No reason'));
    }
}

module.exports = ShoukakuHandler;
