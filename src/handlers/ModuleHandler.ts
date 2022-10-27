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
                const botModule: BotModule = new module.default(this.client);
                botModule.enabled
                    ? this.set(botModule.name.toLowerCase(), botModule)
                    : this.client.logger.error({ handler: this.constructor.name, error: `Dynamic Module '${botModule.name}' not loaded` }, true);
                this.client.logger.log({ handler: this.constructor.name, message: `Dynamic Module '${botModule.name}' loaded.` }, false);
            });
        }
        this.built = true;
        return this;
    }
}
