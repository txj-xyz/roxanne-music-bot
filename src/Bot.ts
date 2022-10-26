import 'dotenv/config';
import { Client, ClientOptions } from 'discord.js';
import BotLogger from './handlers/LoggingHandler';
import InteractionHandler from './handlers/InteractionHandler';
import EventHandler from './handlers/EventHandler';
import UtilityHandler from './handlers/UtilityHandler';

export default interface Bot extends Client {
    color: number;
    commandsRun: number;
    util: UtilityHandler;
    quitting?: boolean;
    location?: string;
    logger: BotLogger;
    interactions: InteractionHandler;
    events: EventHandler;
}

export default class Bot extends Client {
    constructor(options: ClientOptions) {
        super(options);

        this.color = 0x7e686c;
        this.commandsRun = 0;
        this.util = new UtilityHandler(this);
        this.quitting = false;
        this.location = process.cwd();
        this.logger = new BotLogger();
        this.interactions = new InteractionHandler(this).build();
        this.events = new EventHandler(this).build();

        // process.on('unhandledRejection', (err: any): void => {
        //     this.logger.error({ message: `UnhandledRejection from Process`, error: err.stack });
        // });

        // process.on('uncaughtException', (err: Error, origin: NodeJS.UncaughtExceptionOrigin): void => {
        //     this.logger.error({ message: `uncaughtException from ${origin}`, error: err.stack });
        // });

        ['beforeExit', 'SIGUSR1', 'SIGUSR2', 'SIGINT', 'SIGTERM'].map((event: string) => process.once(event, this.exit.bind(this)));
    }

    async login() {
        await super.login(process.env.TOKEN);
        return this.constructor.name;
    }

    exit() {
        if (this.quitting) return;
        this.quitting = true;
        this.destroy();
    }
}
