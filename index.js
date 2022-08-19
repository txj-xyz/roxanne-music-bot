const { GatewayIntentBits } = require('discord.js');
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

const { Guilds, GuildMembers, GuildBans, GuildVoiceStates, GuildMessages, GuildMessageReactions } = GatewayIntentBits;

const RoxanneClient = require('./src/Roxanne.js');

// cache settings on client file
const customClientOptions = {
    disableMentions: 'everyone',
    restRequestTimeout: 30000,
    intents: [Guilds, GuildMembers, GuildBans, GuildVoiceStates, GuildMessages, GuildMessageReactions],
};

const sharderOptions = {
    clientOptions: { ...customClientOptions },
    client: RoxanneClient,
    autoRestart: true,
    token,
};

const manager = new Indomitable({ ...sharderOptions, clusterCount: 1 }).on('error', console.error).on('debug', (message) => console.log(colors.warn(`[ClusterHandler] [Main] ${message}`)));

manager.spawn();
