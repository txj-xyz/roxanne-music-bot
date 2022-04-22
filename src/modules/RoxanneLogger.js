const { isMaster } = require('cluster');
const { webhookUrl } = require('../../config.json');
const { WebhookClient, MessageEmbed } = require('discord.js');

class RoxanneLogger {
    constructor() {
        this.webhook = new WebhookClient({ url: webhookUrl });
    }

    get id() {
        return isMaster ? 'Parent' : process.env.CLUSTER_ID;
    }

    logEmbed(message) {
        try {
            //prettier-ignore
            return new MessageEmbed()
            .setDescription(`\`\`\`json\n${JSON.stringify(message, null, 2)}\n\`\`\``)
            .setFooter(`PID: ${process.pid} - Cluster ID: ${this.id}`);
        } catch (error) {
            return new MessageEmbed().setDescription(`Log parsing error\n\`\`\`js\n${error.toString()}\n\`\`\``);
        }
    }

    debug(handler, message) {
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${handler}] ${message}`);
    }

    log(message) {
        this.webhook.send({ embeds: [this.logEmbed(message)] });
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${message.constructor}] `, JSON.stringify(message, null, null));
    }

    error(error, message = 'Error detected, please check console') {
        try {
            this.webhook.send({ embeds: [this.logEmbed(message)] });
        } catch (error) {
            return console.error(`[Process ${process.pid}] [Cluster ${this.id}] `, error);
        }
        console.error(`[ERROR] [Process ${process.pid}] [Cluster ${this.id}] `, error);
    }
}

module.exports = RoxanneLogger;
