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

    static logFormat(constructor, message, stdin) {
        return {
            processID: process.pid,
            clusterID: this.id,
            handlerID: constructor,
            commandMessage: message.toString(),
            childProcess: stdin,
        };
    }

    debug(handlerName, message) {
        if (!message?.includes('loaded')) {
            this.webhook.send(`\`\`\`json\n${JSON.stringify(RoxanneLogger.logFormat(handlerName, message), null, 2)}\n\`\`\``);
        }
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${handlerName}] ${message}`);
    }

    log(handlerName, message, _cxt) {
        _cxt ? _cxt : (_cxt = null);
        this.webhook.send(`\`\`\`json\n${JSON.stringify(RoxanneLogger.logFormat(handlerName, message, _cxt), null, 2)}\n\`\`\``);
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${handlerName}] ${message}`);
    }

    error(error) {
        this.webhook.send(`\`\`\`json\n${JSON.stringify(RoxanneLogger.logFormat(handlerName, message), null, 2)}\n\`\`\``);
        console.error(`[Process ${process.pid}] [Cluster ${this.id}] `, error);
    }
}

module.exports = RoxanneLogger;
