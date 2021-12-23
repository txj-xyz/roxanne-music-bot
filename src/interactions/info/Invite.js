const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { MessageActionRow, MessageButton } = require('discord.js');

class Invite extends RoxanneInteraction {
    get name() {
        return 'invite';
    }

    get description() {
        return 'Invite me to your server';
    }

    static support() {
        return 'https://discord.gg/2EE8a3dmxU';
    }

    async run({ interaction }) {
        await interaction.deferReply({ ephemeral: true });

        const buttons = new MessageActionRow().addComponents(
            [new MessageButton().setStyle('LINK').setURL(this.client.util.invite).setLabel('Invite me here!')]
            // [
            //     new MessageButton()
            //         .setEmoji('❓')
            //         .setStyle('LINK')
            //         .setURL(Invite.support())
            //         .setLabel('Support Server')
            // ],
        );
        await interaction.editReply({
            content: 'Invite me to your server with this fancy button!',
            components: [buttons],
        });
    }
}
module.exports = Invite;
