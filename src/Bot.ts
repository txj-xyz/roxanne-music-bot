import 'dotenv/config';
import { Client, ClientOptions } from 'discord.js';
import * as Handlers from './handlers';
export default interface Bot extends Client {
    constructor(options: ClientOptions): Bot;
    color: number;
    util: Handlers.UtilityHandler;
    quitting: boolean;
    location: string;
    logger: Handlers.LoggingHandler;
    interactions: Handlers.InteractionHandler;
    events: Handlers.EventHandler;
    modules: Handlers.ModuleHandler;
    commandsRun: number;
    login(): Promise<string>;
    exit(): void;
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
        this.modules = new Handlers.ModuleHandler(this).build();
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
