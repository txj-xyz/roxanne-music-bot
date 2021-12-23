const RoxanneContext = require('../../abstract/RoxanneContext.js');

class SkipContext extends RoxanneContext {
    get name() {
        return 'Skip!';
    }
    get type() {
        return 3;
    }

    get playerCheck() {
        return { voice: true, dispatcher: true, channel: false };
    }

    async run({ interaction, dispatcher }) {
        const fetchMesssage = await interaction.channel.messages.fetch(interaction.targetId);

        if (fetchMesssage.author.id !== this.client.user.id) {
            return await interaction.reply({
                content: 'I can only interact with my own messages!',
                ephemeral: true,
            });
        }
        await interaction.editReply({
            content: 'Skipping the currently playing track!',
            ephemeral: false,
        });
        dispatcher.player.stopTrack();
    }
}
module.exports = SkipContext;
