const { isMaster } = require('cluster');
const { webhookUrl } = require('../../config.json');
const { WebhookClient, MessageEmbed } = require('discord.js');
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
            return new MessageEmbed()
            .setDescription(`\`\`\`json\n${JSON.stringify(message, null, 2)}\n\`\`\``)
            .setFooter({text: `PID: ${process.pid} - Cluster ID: ${this.id}`});
        } catch (error) {
            return new MessageEmbed().setDescription(`Log parsing error\n\`\`\`js\n${error.toString()}\n\`\`\``);
        }
    }

    debug(handler, message) {
        console.log(`[Cluster ${this.id}] [${handler}]`.debug, colors.info(message));
    }

    warn(handler, message) {
        this.webhook ? this.webhook.send({ embeds: [this.logEmbed(message)] }) : void 0;
        console.log(`[Cluster ${this.id}] [${handler}] ${typeof message === 'object' ? JSON.stringify(message) : message}`.warn);
    }

    log(message) {
        this.webhook ? this.webhook.send({ embeds: [this.logEmbed(message)] }) : void 0;
        console.log(`[Cluster ${this.id}] [${message.constructor}]`.debug, colors.info(typeof message === 'object' ? JSON.stringify(message) : message));
    }

    error(error, webHookMessage = error) {
        this.webhook ? this.webhook.send({ embeds: [this.logEmbed(webHookMessage)] }) : void 0;
        console.error(`[ERROR] [Cluster ${this.id}] ${typeof error === 'object' ? JSON.stringify(error) : error}`.error);
    }

    playerError(error) {
        this.webhook ? this.webhook.send({ embeds: [this.logEmbed({ reason: error })] }) : void 0;
        console.error(`[ERROR] [Cluster ${this.id}] `.error, colors.error(error));
    }
}

module.exports = RoxanneLogger;
