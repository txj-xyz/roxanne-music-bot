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

    async spotifyRetry(lavasfyClient, query, interaction) {
        return new Promise(async (resolve, reject) => {
            const node = await lavasfyClient.getNode();
            await node.load(query).then(async (r) => {
                if (r.loadType === 'LOAD_FAILED') {
                    await interaction.editReply({
                        content: 'Please wait while I grab songs from Spotify',
                        components: [],
                    });
                    reject('LOAD_FAILED');
                } else if (r.loadType.includes('LOADED')) {
                    resolve(r);
                } else if (r.loadType === 'NO_MATCHES') {
                    resolve(r);
                }
            });
        });
    }
}

module.exports = UtilityFunctions;
