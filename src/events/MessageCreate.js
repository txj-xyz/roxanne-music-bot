const KongouEvent = require('../abstract/KongouEvent.js');

class MessageCreate extends KongouEvent {
    get name() {
        return 'messageCreate';
    }

    get once() {
        return false;
    }

    async run(message) {
        if(message.author.id === "547905866255433758" && message.guild.id === "787755180534923284") return message.channel.send('<@!547905866255433758> fuck you bitch.')
        if(message.author.bot) return;
        // this.client.webhook.send(`[${message.guild.name}] [${message.channel.name}] [User: ${message.author.username}] [Message: ${message.content.replace(/\r?\n|\r/g, " ")}]`)
        console.log(`[${message.guild.name}] [${message.channel.name}] [User: ${message.author.username}] [Message: ${message.content.replace(/\r?\n|\r/g, " ")}]`)

    }
}
module.exports = MessageCreate;