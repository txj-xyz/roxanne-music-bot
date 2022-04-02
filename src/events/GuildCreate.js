const RoxanneEvent = require('../abstract/RoxanneEvent.js');

class GuildCreate extends RoxanneEvent {
    get name() {
        return 'guildCreate';
    }

    get once() {
        return false;
    }

    get enabled() {
        return true;
    }

    async run(guild) {
        this.client.logger.log(this.constructor.name, `Joined guild`, {
            name: guild.name,
            members: guild.memberCount
        });
    }
}
module.exports = GuildCreate;
