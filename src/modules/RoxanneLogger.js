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
        this.webhook = new WebhookClient({ url: webhookUrl });
        this.webhook.send('Health check initialized').catch((err) => {
            this.webhook = null;
            console.log(`[ERROR] [Process ${process.pid}] [Cluster ${this.id}] Failed to initialize webhook, invalid URI, ${err.toString()}`.error);
        });
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
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${handler}] ${message}`.debug);
    }

    log(message) {
        if (this.webhook) {
            this.webhook.send({ embeds: [this.logEmbed(message)] }).catch(console.error);
        }
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${message.constructor}] `.debug, colors.info(JSON.stringify(message, null, 1)));
    }

    error(error, message = 'Error detected, please check console') {
        if (this.webhook) {
            this.webhook.send({ embeds: [this.logEmbed(message)] }).catch(console.error);
        }
        console.error(`[ERROR] [Process ${process.pid}] [Cluster ${this.id}] `.error, colors.error(error));
    }
}

module.exports = RoxanneLogger;
