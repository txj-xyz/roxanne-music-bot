const { isMaster } = require('cluster');
const { webhookUrl } = require('../../config.json');
const { WebhookClient } = require('discord.js');

class RoxanneLogger {
    constructor() {
        this.webhook = new WebhookClient({ url: webhookUrl });
    }

    get id() {
        return isMaster ? 'Parent' : process.env.CLUSTER_ID;
    }

    get logFormat(constructor, message) {
        return {
            processID: process.pid,
            clusterID: this.id,
            handlerID: constructor,
            commandMessage: message.toString()
        };
    }

    debug(handlerName, message) {

        if (!message?.includes('loaded')) {

            this.webhook.send(`\`\`\`js\n${JSON.stringify(this.logFormat(handlerName, message), null, 2)}\n\`\`\``);

        }
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${handlerName}] ${message}`);
    }

    log(handlerName, message) {
        this.webhook.send(`[Process ${process.pid}] [Cluster ${this.id}] [${handlerName}] ${message}`);
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${handlerName}] ${message}`);
    }

    error(error) {
        this.webhook.send(`[Process ${process.pid}] [Cluster ${this.id}] ${error}`);
        console.error(`[Process ${process.pid}] [Cluster ${this.id}] `, error);
    }
}

module.exports = RoxanneLogger;
