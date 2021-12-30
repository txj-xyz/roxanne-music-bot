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

    debug(title, message) {
        if (!message?.includes('loaded')) this.webhook.send(`[Process ${process.pid}] [Cluster ${this.id}] [${title}] ${message}`);
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${title}] ${message}`);
    }

    log(title, message) {
        this.webhook.send(`[Process ${process.pid}] [Cluster ${this.id}] [${title}] ${message}`);
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${title}] ${message}`);
    }

    error(error) {
        this.webhook.send(`[Process ${process.pid}] [Cluster ${this.id}] ${error}`);
        console.error(`[Process ${process.pid}] [Cluster ${this.id}] `, error);
    }
}

module.exports = RoxanneLogger;
