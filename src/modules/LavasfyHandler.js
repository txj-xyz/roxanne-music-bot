const { Shoukaku, Libraries } = require('shoukaku');
const servers = require('../../lavalink-server.json');
const options = require('../../shoukaku-options.js');

class LavasfyHandler extends Shoukaku {
    constructor(client) {
        super(new Libraries.DiscordJS(client), servers, options);
        console.log('lavasfy loaded');
    }
}

module.exports = LavasfyHandler;
