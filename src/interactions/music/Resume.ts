const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class Pause extends RoxanneInteraction {
    get name() {
        return 'resume';
    }

    get description() {
        return 'Resumes the current playback!';
    }

    get playerCheck() {
        return { voice: true, dispatcher: true, channel: true };
    }

    async run({ interaction, dispatcher }) {
        dispatcher.player.connection.setMute(false);
        dispatcher.player.setPaused(false);
        await interaction.reply('I resumed the playback in this guild!');
    }
}
module.exports = Pause;
