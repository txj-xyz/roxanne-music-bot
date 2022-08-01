const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const Wait = require('util').promisify(setTimeout);

class Leave extends RoxanneInteraction {
    get name() {
        return 'leave';
    }

    get description() {
        return 'Stops the current playback and leaves the voice channel!';
    }

    // dispatcher is custom here, we are manually handling the 24/7 mode ourselves
    get playerCheck() {
        return { voice: true, dispatcher: true, channel: true };
    }

    async run({ interaction, dispatcher }) {
        const botVoice = await interaction.guild.voiceStates.cache.get(this.client.user.id)?.channelId;
        // Handle stop normally.
        if (dispatcher) {
            await interaction.deferReply();
            dispatcher.queue.length = 0;
            dispatcher.repeat = 'off';
            dispatcher.stopped = true;
            this.client.queue.delete(interaction.guild.id);
            dispatcher.player.connection.disconnect();
            dispatcher.player.stopTrack();
            Wait(500);
            await interaction.editReply('I stopped the music and left voice chat!');
        }
    }
}
module.exports = Leave;
