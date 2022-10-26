import 'dotenv/config';
import { Client, ClientOptions } from 'discord.js';
import * as Handlers from './handlers';
import { Roxanne } from './handlers/PreloadHandler';

export default interface Bot {
    color: number;
    util: Handlers.UtilityHandler;
    quitting: boolean;
    location: string;
    logger: Handlers.LoggingHandler;
    interactions: Handlers.InteractionHandler;
    events: Handlers.EventHandler;
    commandsRun: typeof Roxanne.commandsRun;
}

export default class Bot extends Client {
    constructor(options: ClientOptions) {
        super(options);
        this.color = 0x7e686c;
        this.commandsRun = 0;
        this.util = new Handlers.UtilityHandler(this);
        this.quitting = false;
        this.location = process.cwd();
        this.logger = new Handlers.LoggingHandler();
        this.interactions = new Handlers.InteractionHandler(this).build();
        this.events = new Handlers.EventHandler(this).build();

        // process.on('unhandledRejection', (err: any): void => {
        //     this.logger.error({ message: `UnhandledRejection from Process`, error: err.stack });
        // });

        // process.on('uncaughtException', (err: Error, origin: NodeJS.UncaughtExceptionOrigin): void => {
        //     this.logger.error({ message: `uncaughtException from ${origin}`, error: err.stack });
        // });

        ['beforeExit', 'SIGUSR1', 'SIGUSR2', 'SIGINT', 'SIGTERM'].map((event: string) => process.once(event, this.exit.bind(this)));
    }

    async login(): Promise<string> {
        await super.login(process.env.TOKEN);
        return this.constructor.name;
    }

    exit(): void {
        if (this.quitting) return;
        this.quitting = true;
        this.destroy();
    }
}
