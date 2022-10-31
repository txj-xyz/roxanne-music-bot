import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { Indomitable, IndomitableOptions } from 'indomitable';
import Bot from './src/Bot';

if (!process.env.TOKEN) throw new Error('Token Missing');

const { Guilds, GuildMembers, GuildBans, GuildVoiceStates, GuildMessages, GuildMessageReactions, MessageContent } = GatewayIntentBits;

const sharderOptions: IndomitableOptions = {
    clientOptions: {
        intents: [Guilds, GuildMembers, GuildBans, GuildVoiceStates, GuildMessages, GuildMessageReactions, MessageContent],
    },
    client: Bot as typeof Client,
    autoRestart: true,
    token: process.env.TOKEN ?? '',
    clusterCount: 1,
};

const manager = new Indomitable(sharderOptions).on('error', console.error).on('debug', (message) => {
    console.log(`[ClusterHandler] [Main] ${message}`);
});

manager.spawn();