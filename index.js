const { Constants, Intents, Util } = require('discord.js');
const { Azuma } = require('azuma');
const { join } = require('path');
const { token } = require('./config.json');
const { GUILDS, GUILD_MEMBERS, GUILD_BANS, GUILD_VOICE_STATES, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS } = Intents.FLAGS;

const RoxanneClient = require('./src/Roxanne.js');

// cache settings on client file
const customClientOptions = {
    disableMentions: 'everyone',
    restRequestTimeout: 30000,
    intents: [ GUILDS, GUILD_MEMBERS, GUILD_BANS, GUILD_VOICE_STATES, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS ]
};

const sharderOptions = {
    clientOptions: Util.mergeDefault(Constants.DefaultOptions, customClientOptions),
    // clusterCount: 4,
    // shardCount: 4,
    // guildsPerShard: 4,
    client: RoxanneClient,
    timeout: 90000,
    token
};

const ratelimitOptions = {
    handlerSweepInterval: 2 * 6000,
    hashInactiveTimeout: 4 * 6000,
    requestOffset: 500
};

const azuma = new Azuma(join(__dirname, '/src/RoxanneBaseCluster.js'), sharderOptions, ratelimitOptions);

azuma
    .spawn()
    .catch(console.error);