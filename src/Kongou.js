const { Client, LimitedCollection, MessageEmbed, WebhookClient } = require('discord.js');
const { LavasfyClient } = require('lavasfy');
const servers = require('../lavasfy-servers.json');
const { Cheshire } = require('cheshire');
const { Collection } = require('@discordjs/collection');
const { token, webhookUrl, spotifyClientID, spotifySecret } = require('../config.json');
const KongouLogger = require('./modules/KongouLogger.js');
const ShoukakuHandler = require('./modules/ShoukakuHandler.js');
// const LavasfyHandler = require('./modules/LavasfyHandler.js');
const Queue = require('./modules/Queue.js');
const InteractionHandler = require('./modules/InteractionHandler.js');
const EventHandler = require('./modules/EventHandler.js');

class Kongou extends Client {
    constructor(options) {
        // create cache
        options.makeCache = manager => {
            switch(manager.name) {
                // Disable Cache
                case 'GuildEmojiManager': 
                case 'GuildBanManager': 
                case 'GuildInviteManager':
                case 'GuildStickerManager':
                case 'StageInstanceManager':
                case 'PresenceManager':
                case 'ThreadManager': return new LimitedCollection({ maxSize: 0 });
                // TLRU cache, Lifetime 30 minutes
                case 'MessageManager': return new Cheshire({ lifetime: 1e+6, lru: false });
                // Default cache
                default: return new Collection();
            }
        };
        // pass options
        super(options);
        this.color = 0x7E686C;
        this.quitting = false;
        this.location = process.cwd();
        
        this.logger = new KongouLogger();
        this.shoukaku = new ShoukakuHandler(this);
        this.queue = new Queue(this);
        this.webhook = new WebhookClient({ url: webhookUrl });
        this.commandsRun = 0;
        this.interactions = new InteractionHandler(this).build();
        this.events = new EventHandler(this).build();
        this.servers = servers;
        
        // Spotify Support
        this.lavasfy = new LavasfyClient({
            clientID: spotifyClientID,
            clientSecret: spotifySecret,
            filterAudioOnlyResult: true,
            autoResolve: true,
            useSpotifyMetadata: true,
        }, this.servers);

        ['beforeExit', 'SIGUSR1', 'SIGUSR2', 'SIGINT', 'SIGTERM'].map(event => process.once(event, this.exit.bind(this)));
    }

    async login() {
        await super.login(token);
        return this.constructor.name;
    }

    exit() {
        if (this.quitting) return;
        this.quitting = true;
        this.destroy();
    }
}

module.exports = Kongou;
