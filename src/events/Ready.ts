// import Bot from '../Bot';
import Bot from '../Bot';
import BotEvent from '../types/BotEvent';
export default class Ready extends BotEvent {
    get name(): string {
        return 'ready';
    }

    get fireOnce(): boolean {
        return true;
    }

    get enabled(): boolean {
        return true;
    }

    private get statuses(): string[] {
        return ['wow!'];
    }

    //test comment
    async run(client: Bot) {
        this.client.logger.log({ message: `[${this.client.user?.username}] Ready! Serving ${this.client.guilds.cache.size} guild(s) with ${this.client.users.cache.size} user(s)` }, true);
        setInterval((): void => {
            const current = this.statuses.shift() ?? '';
            this.client.user?.setActivity(current);
            this.statuses.push(current);
        }, 300000);
    }
}
