const { Intents } = require('discord.js');
const { Indomitable } = require('indomitable');
const { join } = require('path');
const { token } = require('./config.json');
const colors = require('@colors/colors');

colors.setTheme({
    info: 'green',
    warn: 'yellow',
    debug: 'blue',
    error: 'red',
});

const { GUILDS, GUILD_MEMBERS, GUILD_BANS, GUILD_VOICE_STATES, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS } = Intents.FLAGS;

const RoxanneClient = require('./src/Roxanne.js');

// cache settings on client file
const customClientOptions = {
    disableMentions: 'everyone',
    restRequestTimeout: 30000,
    intents: [GUILDS, GUILD_MEMBERS, GUILD_BANS, GUILD_VOICE_STATES, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS],
};

const sharderOptions = {
    clientOptions: { ...customClientOptions },
    client: RoxanneClient,
    autoRestart: true,
    token,
};

console.log(Constants.DefaultOptions);

const manager = new Indomitable({ ...sharderOptions, clusterCount: 1 }).on('error', console.error).on('debug', (message) => console.log(colors.warn(`[ClusterHandler] [Main] ${message}`)));

manager.spawn();
