import { webhookUrl } from '../../config.json';
import { WebhookClient } from 'discord.js';

export default interface BotLogger {
    webhookUrl: string;
    webhook: WebhookClient | null;
}

export type BotLog = {
    args?: unknown;
    handler: string;
    user?: string;
    message: string;
    error?: unknown;
};

export type BotError = {
    handler?: string;
    message?: string;
    debug?: unknown;
    error: unknown;
};

export default class BotLogger implements BotLogger {
    constructor() {
        this.webhookUrl = webhookUrl ?? null;
        if (!this.webhookUrl) this.log({ handler: this.constructor.name, message: 'Webhook URL is missing in config file.' }, false);
        this.webhook = webhookUrl ? new WebhookClient({ url: webhookUrl }) : null;
        this.webhook?.send(this.webhook_formatter({ handler: this.constructor.name, message: 'Webhook Initialized.' })).catch((reason) => this.error({ error: reason }, false));
    }

    private webhook_formatter(incoming: BotLog | BotError): string {
        return `\`\`\`json\n${JSON.stringify(incoming, null, 2)}\n\`\`\``;
    }

    public log(incoming: BotLog, webhook_enabled: boolean, name?: string): void {
        const _format: string = JSON.stringify(incoming, null, 2);
        webhook_enabled && this.webhook ? this.webhook.send(this.webhook_formatter(incoming)) : void 0;
        return console.log(name ?? '[INFO]', _format);
    }

    public error(incoming: BotError, webhook_enabled: boolean, name?: string): void {
        const _format: string = JSON.stringify(incoming, null, 2);
        webhook_enabled && this.webhook ? this.webhook.send(this.webhook_formatter(incoming)) : void 0;
        return console.log(name ?? '[ERROR]', _format);
    }
}
