const { Client, LimitedCollection } = require('discord.js');
const { Cheshire } = require('cheshire');
const { Collection } = require('@discordjs/collection');
const { token } = require('../config.json');
const playlists = require('../playlists.json');
const RoxanneLogger = require('./modules/RoxanneLogger.js');
const ShoukakuHandler = require('./modules/ShoukakuHandler.js');
const Queue = require('./modules/Queue.js');
const InteractionHandler = require('./modules/InteractionHandler.js');
const EventHandler = require('./modules/EventHandler.js');
const UtilityHandler = require('./modules/UtilityHandler.js');
const StatsUpdater = require('./modules/StatsUpdater');

class Roxanne extends Client {
    constructor(options) {
        // create cache
        options.makeCache = (manager) => {
            switch (manager.name) {
                case 'GuildEmojiManager':
                case 'GuildBanManager':
                case 'GuildInviteManager':
                case 'GuildStickerManager':
                case 'StageInstanceManager':
                case 'PresenceManager':
                case 'ThreadManager':
                    return new LimitedCollection({ maxSize: 0 });
                case 'MessageManager':
                    return new Cheshire({ lifetime: 1e6, lru: false });
                default:
                    return new Collection();
            }
        };
        super(options);

        this.color = 0x7e686c;
        this.commandsRun = 0;
        this.playlists = playlists ?? null;
        this.util = new UtilityHandler(this);
        this.quitting = false;
        this.location = process.cwd();
        this.logger = new RoxanneLogger();
        this.shoukaku = new ShoukakuHandler(this);
        this.queue = new Queue(this);
        this.interactions = new InteractionHandler(this).build();
        this.events = new EventHandler(this).build();

        process.on('unhandledRejection', (err) => {
            console.log('unhandledRejection', err);
            this.logger.error(err, `${err.toString()} CHECK CONSOLE.`);
        });

        new StatsUpdater(this);
        ['beforeExit', 'SIGUSR1', 'SIGUSR2', 'SIGINT', 'SIGTERM'].map((event) => process.once(event, this.exit.bind(this)));
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

module.exports = Roxanne;
