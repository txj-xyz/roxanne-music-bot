const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const Wait = require('util').promisify(setTimeout);
const { foreverMode } = require('../config.json');

class Stop extends RoxanneInteraction {
    get name() {
        return 'stop';
    }

    get description() {
        return 'Stops the current playback!';
    }

    get playerCheck() {
        return { voice: true, dispatcher: true, channel: true };
    }

    async run({ interaction, dispatcher }) {
        await interaction.deferReply();
        dispatcher.queue.length = 0;
        dispatcher.repeat = 'off';
        dispatcher.stopped = true;
        if (foreverMode) {
            this.client.queue.delete(interaction.guild.id);
            dispatcher.player.connection.disconnect();
        }
        dispatcher.player.stopTrack();
        Wait(500);
        await interaction.editReply('I stopped and destroyed the player in this guild!');
    }
}
module.exports = Stop;
