const KongouEvent = require('../abstract/KongouEvent.js');

class MessageCreate extends KongouEvent {
    get name() {
        return 'messageCreate';
    }

    get once() {
        return false;
    }

    async run(message) {
        if(message.author.bot) return;
        console.log(`[${message.guild.name}] [${message.channel.name}] [User: ${message.author.username}] [Message: ${message.content ?? "Embed Sent"}]`)

    }
}
module.exports = MessageCreate;