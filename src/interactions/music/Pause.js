
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class Pause extends RoxanneInteraction {
    get name() {
        return 'pause';
    }

    get description() {
        return 'Pauses the current playback!';
    }

    get playerCheck() {
        return { voice: true, dispatcher: true, channel: true };
    }

    async run({ interaction, dispatcher }) {
        dispatcher.player.connection.setMute(true);
        dispatcher.player.setPaused(true);
        await interaction.reply('I paused the playback in this guild!');
    }
}
module.exports = Pause;