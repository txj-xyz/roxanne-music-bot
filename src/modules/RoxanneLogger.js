const { isMaster } = require('cluster');
const { webhookUrl } = require('../../config.json');
const { WebhookClient, EmbedBuilder } = require('discord.js');
const colors = require('@colors/colors');

colors.setTheme({
    info: 'green',
    warn: 'yellow',
    debug: 'blue',
    error: 'red',
});

class RoxanneLogger {
    constructor() {
        if (!webhookUrl) {
            this.webhook = null;
            this.error(`[RoxanneLogger] Failed to initialize WebhookClient, no URL set in config`.error);
            return;
        }
        this.webhook = new WebhookClient({ url: webhookUrl });
        this.webhook.send('Health check initialized').catch(console.error);
    }

    get id() {
        return isMaster ? 'Parent' : process.env.CLUSTER_ID;
    }

    logEmbed(message) {
        try {
            //prettier-ignore
            return new EmbedBuilder()
            .setDescription(`\`\`\`json\n${JSON.stringify(message, null, 2)}\n\`\`\``)
            .setFooter({text: `PID: ${process.pid}`});
        } catch (error) {
            return new EmbedBuilder().setDescription(`Log parsing error\n\`\`\`js\n${error.toString()}\n\`\`\``);
        }
    }

    debug(handler, message) {
        console.log(handler ?? null, message);
    }

    warn(handler, message) {
        this.webhook ? this.webhook.send({ embeds: [this.logEmbed(message)] }) : void 0;
        console.log(handler ?? null, message);
    }

    log(message) {
        this.webhook ? this.webhook.send({ embeds: [this.logEmbed(message)] }) : void 0;
        console.log(message);
    }

    error(error, webHookMessage = error) {
        this.webhook ? this.webhook.send({ embeds: [this.logEmbed(webHookMessage)] }) : void 0;
        console.log(error);
    }

    playerError(error) {
        this.webhook ? this.webhook.send({ embeds: [this.logEmbed({ reason: error })] }) : void 0;
        console.log(error);
    }
}

module.exports = RoxanneLogger;
