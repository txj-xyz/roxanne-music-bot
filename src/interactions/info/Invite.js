const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { MessageActionRow, MessageButton } = require('discord.js');

class Invite extends RoxanneInteraction {
    get name() {
        return 'invite';
    }

    get description() {
        return 'Invite me to your server';
    }

    async run({ interaction }) {
        await interaction.deferReply({ ephemeral: false });

        const buttons = new MessageActionRow().addComponents(
            [new MessageButton().setStyle('LINK').setURL(this.client.util.invite).setLabel('Invite me here!')],
            [new MessageButton().setEmoji('❓').setStyle('LINK').setURL(this.client.util.supportServer).setLabel('Support Server')]
        );
        await interaction.editReply({
            content: 'Invite me to your server with this fancy button below!',
            components: [buttons],
        });
    }
}
module.exports = Invite;
