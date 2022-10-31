import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import Bot from '../Bot';

export interface BotModule {}

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
    }

    build() {
        if (this.built) return this;
        const modules: string[] = readdirSync(this.client.location + '/src/modules');
        for (const module of modules) {
            if (!module.endsWith('.ts')) continue;
            import(`${this.client.location}/src/modules/${module}`).then((module) => {
                if (module.enabled) {
                    const botModule: BotModule = new module.default(this.client);
                    this.set(module.default.name.toLowerCase(), botModule);
                    this.client.logger.log({ handler: this.constructor.name, message: `Module '${module.default.name}' loaded.` }, true, '[MODULE LOADER]');
                } else {
                    this.client.logger.log({ handler: this.constructor.name, message: `Module '${module.default.name}' not loaded` }, true, '[MODULE LOADER]');
                }
            });
        }
        this.built = true;
        return this;
    }
}
