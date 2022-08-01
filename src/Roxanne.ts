import { Client, LimitedCollection } from 'discord.js';
import { Cheshire } from 'cheshire';
import { Collection } from '@discordjs/collection';
import { token } from '../config.json';
import RoxanneLogger from './modules/RoxanneLogger.js';
import ShoukakuHandler from './modules/ShoukakuHandler.js';
import Queue from './modules/Queue.js';
import InteractionHandler from './modules/InteractionHandler.js';
import EventHandler from './modules/EventHandler.js';
import UtilityHandler from './modules/UtilityHandler.js';
import StatsUpdater from './modules/StatsUpdater';

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
        this.util = new UtilityHandler(this);
        this.quitting = false;
        this.location = process.cwd();

        this.logger = new RoxanneLogger();
        this.shoukaku = new ShoukakuHandler(this);
        this.queue = new Queue(this);
        this.interactions = new InteractionHandler(this).build();
        this.events = new EventHandler(this).build();

        process.on('unhandledRejection', (err) => {
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
