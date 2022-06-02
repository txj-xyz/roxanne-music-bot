const { Constants, Intents, Util } = require('discord.js');
const { ShardingManager } = require('kurasuta');
const { join } = require('path');
const { token } = require('./config.json');

const { GUILDS, GUILD_MEMBERS, GUILD_BANS, GUILD_VOICE_STATES, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS } = Intents.FLAGS;

const RoxanneClient = require('./src/Roxanne.js');

// cache settings on client file
const customClientOptions = {
    disableMentions: 'everyone',
    restRequestTimeout: 30000,
    intents: [GUILDS, GUILD_MEMBERS, GUILD_BANS, GUILD_VOICE_STATES, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS],
};

const sharderOptions = {
    clientOptions: Util.mergeDefault(Constants.DefaultOptions, customClientOptions),
    client: RoxanneClient,
    timeout: 90000,
    token,
};

new ShardingManager(join(__dirname, '/src/RoxanneBaseCluster.js'), sharderOptions).spawn();
