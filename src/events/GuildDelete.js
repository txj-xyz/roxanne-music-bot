const RoxanneEvent = require('../abstract/RoxanneEvent.js');

class GuildDelete extends RoxanneEvent {
    get name() {
        return 'guildDelete';
    }

    get once() {
        return false;
    }

    async run(guild) {
        if (!guild.available) return;
        this.client.webhook.send(`${this.constructor.name} Removed guild => ${guild.name} with ${guild.memberCount} members`);
        this.client.logger.log(this.constructor.name, `Removed guild => ${guild.name} with ${guild.memberCount} members`);
    }
}
module.exports = GuildDelete;
