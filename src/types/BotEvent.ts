import EventEmitter = require('events');
import Bot from '../Bot';
import { Message } from 'discord.js';
export default interface BotEvent {
    client: Bot;
    get name(): string;
    get fireOnce(): boolean;
    get enabled(): boolean;
    run(args: unknown | unknown[]): Promise<Message<true> | undefined | void>;
}

export default class BotEvent extends EventEmitter {
    constructor(client: Bot) {
        super();
        this.client = client;
        this.on('error', (error) => {
            console.log(error);
            client.logger.error({ error: error, handler: this.constructor.name }, true);
        });
    }

    exec(...args: Array<unknown>) {
        const _args = args.length ? args.shift() : args;
        type EmittedError = typeof Object;
        this.run(_args).catch((error: EmittedError) => this.emit('error', error));
    }
}
