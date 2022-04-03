const { isMaster } = require('cluster');
const { webhookUrl } = require('../../config.json');
const { WebhookClient, MessageEmbed, Message } = require('discord.js');

class RoxanneLogger {
    constructor() {
        this.webhook = new WebhookClient({ url: webhookUrl });
    }

    get id() {
        return isMaster ? 'Parent' : process.env.CLUSTER_ID;
    }

    logEmbed(message, type = 'json') {
        const _parsed = {
            processID: process.pid,
            clusterID: this.id,
            msg: message,
        };

        try {
            //prettier-ignore
            return new MessageEmbed()
            .setDescription(`\`\`\`${type}\n${JSON.stringify(_parsed.msg, null, 2)}\n\`\`\``)
            .setFooter(`PID: ${_parsed.processID} - Cluster ID: ${_parsed.clusterID}`);
        } catch (error) {
            return new MessageEmbed().setDescription(`Log parsing error\n\`\`\`js\n${error.toString()}\n\`\`\``);
        }
    }

    debug(handler, message) {
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${handler}] ${message}`);
    }

    log(message) {
        this.webhook.send({ embeds: [this.logEmbed(message)] });
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${message.constructor}] `, message);
    }

    error(error, message) {
        message ? message : (message = null);
        try {
            this.webhook.send({ embeds: [this.logEmbed(message)] });
        } catch (error) {
            return console.error(`[Process ${process.pid}] [Cluster ${this.id}] `, error);
        }
        console.error(`[Process ${process.pid}] [Cluster ${this.id}] `, error);
    }
}

module.exports = RoxanneLogger;
