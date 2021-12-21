const { LavasfyClient } = require('lavasfy');
const {
    token,
    webhookUrl,
    spotifyClientID,
    spotifySecret,
} = require('../../config.json');
const servers = require('../../lavasfy-servers.json');
class UtilityFunctions {
    constructor() {
        this.lavaConnect(spotifyClientID, spotifySecret, servers);
    }

    async lavaConnect(clientID, clientSecret, servers) {
        try {
            let c = new LavasfyClient(
                {
                    clientID: clientID,
                    clientSecret: clientSecret,
                    filterAudioOnlyResult: true,
                    autoResolve: true,
                    useSpotifyMetadata: true,
                },
                servers
            );
            await c.requestToken();
            this.lava = c;
        } catch (error) {
            this.lava = null;
        }
    }
}

module.exports = UtilityFunctions;
