const RoxanneEvent = require('../abstract/RoxanneEvent.js');


class GuildCreate extends RoxanneEvent {
    get name() {
        return 'guildCreate';
    }

    get once() {
        return false;
    }

    async run(guild) {
        this.client.webhook.send(`${this.constructor.name} New guild => ${guild.name} with ${guild.memberCount} members`)
        this.client.logger.log(this.constructor.name, `New guild => ${guild.name} with ${guild.memberCount} members`);
    }
}
module.exports = GuildCreate;
