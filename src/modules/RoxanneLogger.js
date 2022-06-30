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
            console.log(`[ERROR] [Cluster ${this.id}] [RoxanneLogger] Failed to initialize WebhookClient, no URL set in config`.error);
            return;
        }
        this.webhook = new WebhookClient({ url: webhookUrl });
        this.webhook.send('Health check initialized');
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
        console.log(`[Cluster ${this.id}] [${handler}] ${message}`.debug);
    }

    warn(handler, message) {
        console.log(`[Cluster ${this.id}] [${handler}] ${message}`.warn);
    }

    log(message) {
        if (this.webhook) {
            this.webhook.send({ embeds: [this.logEmbed(message)] }).catch(console.error);
        }
        console.log(`[Cluster ${this.id}] [${message.constructor}] `.debug, colors.info(JSON.stringify(message, null, 1)));
    }

    error(error, message = 'Error detected, please check console') {
        if (this.webhook) {
            this.webhook.send({ embeds: [this.logEmbed(message)] }).catch(console.error);
        }
        console.error(`[ERROR] [Cluster ${this.id}] `.error, colors.error(error));
    }

    playerError(error) {
        if (this.webhook) {
            this.webhook.send({ embeds: [this.logEmbed({ reason: error })] }).catch(console.error);
        }
        console.error(`[ERROR] [Cluster ${this.id}] `.error, colors.error(error));
    }
}

module.exports = RoxanneLogger;
