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

    // dispatcher is custom here, we are manually handling the 24/7 mode ourselves
    get playerCheck() {
        return { voice: true, dispatcher: true, channel: true };
    }

    async run({ interaction, dispatcher }) {
        const botVoice = await interaction.guild.voiceStates.cache.get(this.client.user.id)?.channelId;
        // Catch not same channel as curently playing
        if (botVoice && foreverMode && botVoice !== interaction.member.voice.channelId) {
            return interaction.reply({
                content: "You are not in the same voice channel I'm currently connected to!",
                ephemeral: true,
            });
        }
        // Manually handle the dispatcher checking here
        if (!dispatcher && this.client.queue.has(interaction.guild.id) && foreverMode) {
            await interaction.deferReply();
            const dispatcherManual = this.client.queue.get(interaction.guild.id);
            try {
                dispatcherManual.queue.length = 0;
                dispatcherManual.repeat = 'off';
                dispatcherManual.stopped = true;
                if (foreverMode) {
                    dispatcherManual.player.stopTrack();
                    dispatcherManual.player.connection.disconnect();
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
        // Catch if the bot is still in a voice channel
        if (!dispatcher && !this.client.queue.has(interaction.guild.id) && foreverMode) {
            if ((await interaction.guild.voiceStates.cache.get(this.client.user.id)?.channelId) ? true : false) {
                try {
                    await interaction.guild.voiceStates.cache.get(this.client.user.id).disconnect();
                    return await interaction.reply({
                        content: 'Disconnecting!',
                        ephemeral: true,
                    });
                } catch (error) {
                    this.client.logger.debug(this.constructor.name, 'Caught error on Disconnect');
                    return await interaction.reply({
                        content: 'Nothing is playing in this server! (Try again)',
                        ephemeral: true,
                    });
                }
            }
            return await interaction.reply({
                content: 'Nothing is playing in this server!',
                ephemeral: true,
            });
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
