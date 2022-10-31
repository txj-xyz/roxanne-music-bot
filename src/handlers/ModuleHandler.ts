import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import Bot from '../Bot';

export interface BotModule {
    get name(): string;
    get enabled(): boolean;
}

export default interface ModuleHandler {
    client: Bot;
    built: boolean;
    modules: Collection<string, BotModule>;
}

export default class ModuleHandler extends Collection<string, BotModule> implements ModuleHandler {
    constructor(client: Bot) {
        super();
        this.client = client;
        this.built = false;
        this.modules = new Collection<string, BotModule>();
    }

    build() {
        if (this.built) return this;
        const modules: string[] = readdirSync(this.client.location + '/src/modules');
        for (const module of modules) {
            if (!module.endsWith('.ts')) continue;
            import(`${this.client.location}/src/modules/${module}`).then((module) => {
                if (module.default.enabled) {
                    const botModule: BotModule = new module.default(this.client);
                    this.set(botModule.name.toLowerCase(), botModule);
                    this.client.logger.log({ handler: this.constructor.name, message: `Module '${module.default.name}' loaded.` }, false, '[MODULE LOADER]');
                } else {
                    this.client.logger.log({ handler: this.constructor.name, message: `Module '${module.default.name}' not loaded` }, false, '[MODULE LOADER]');
                }
            });
        }
        this.built = true;
        return this;
    }
}
