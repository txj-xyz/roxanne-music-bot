const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const Wait = require('util').promisify(setTimeout);
const { foreverMode } = require('../../../config.json');

class Stop extends RoxanneInteraction {
    get name() {
        return 'stop';
    }

    get description() {
        return 'Stops the current playback and leaves the voice channel!';
    }

    get playerCheck() {
        return { voice: true, dispatcher: false, channel: true };
    }

    async run({ interaction, dispatcher }) {
        // Manually handle the dispatcher checking here
        if (!dispatcher) {
            try {
                await interaction.guild.voiceStates.cache.get(this.client.user.id).disconnect();
                return await interaction.reply({
                    content: 'I have left the voice channel!',
                    ephemeral: false,
                });
            } catch (error) {
                return await interaction.reply({
                    content: 'Nothing is playing in this server!',
                    ephemeral: true,
                });
            }
        }
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
