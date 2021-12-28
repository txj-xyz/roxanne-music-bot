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
        if (!dispatcher && this.client.queue.has(interaction.guild.id) && foreverMode) {
            await interaction.deferReply();
            const dispatcher2 = this.client.queue.get(interaction.guild.id);
            try {
                dispatcher2.queue.length = 0;
                dispatcher2.repeat = 'off';
                dispatcher2.stopped = true;
                if (foreverMode) {
                    dispatcher2.player.stopTrack();
                    dispatcher2.player.connection.disconnect();
                    this.client.queue.delete(interaction.guild.id);
                    this.client.logger.debug(this.name, `Destroyed the existing player & connection @ guild "${interaction.guild.id}"\nReason: No Reason Provided'`);
                }
                Wait(500);
                return await interaction.editReply({
                    content: 'I stopped and destroyed the player in this guild!',
                    ephemeral: false,
                });
            } catch (error) {
                this.client.logger.error(error);
                return await interaction.reply({
                    content: 'Nothing is playing in this server!',
                    ephemeral: true,
                });
            }
        }
        // Catch additional non queue issues and force stop
        if (!dispatcher) {
            try {
                await interaction.guild.voiceStates.cache.get(this.client.user.id).disconnect();
                return await interaction.reply({
                    content: 'I have left the voice channel!',
                    ephemeral: false,
                });
            } catch (error) {
                this.client.logger.error(error);
                return await interaction.reply({
                    content: 'Nothing is playing in this server!',
                    ephemeral: true,
                });
            }
        }
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
            await interaction.editReply('I stopped and destroyed the player in this guild!');
        }
    }
}
module.exports = Stop;
