import { Intents } from 'discord.js';
import { Indomitable } from 'indomitable';
import { token } from './config.json';
const colors = require('@colors/colors');

colors.setTheme({
    info: 'green',
    warn: 'yellow',
    debug: 'blue',
    error: 'red',
});

const { GUILDS, GUILD_MEMBERS, GUILD_BANS, GUILD_VOICE_STATES, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS } = Intents.FLAGS;

import RoxanneClient from './src/Roxanne.js';

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

const manager = new Indomitable({ ...sharderOptions, clusterCount: 1 })
    .on('error', console.error)
    .on('debug', (message: String) => console.log(colors.warn(`[ClusterHandler] [Main] ${message}`)));

manager.spawn();
