const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

class Invite extends RoxanneInteraction {
    get name() {
        return 'invite';
    }

    get description() {
        return 'Invite me to your server';
    }

    async run({ interaction }) {
        await interaction.deferReply({ ephemeral: false });

        const buttons = new ActionRowBuilder().addComponents(
            [new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(this.client.util.config.inviteURL).setLabel('Invite me here!')],
            [new ButtonBuilder().setEmoji('❓').setStyle(ButtonStyle.Link).setURL(this.client.util.supportServer).setLabel('Support Server')]
        );
        await interaction.editReply({
            content: 'Invite me to your server with this fancy button below!',
            components: [buttons],
        });
    }
}
module.exports = Invite;
