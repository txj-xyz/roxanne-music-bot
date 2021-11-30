const KongouInteraction = require('../../abstract/KongouInteraction.js');
const { MessageActionRow, MessageButton } = require('discord.js');

class Invite extends KongouInteraction {
    get name() {
        return 'invite';
    }

    get description() {
        return 'Invite me to your server';
    }

    static link(id) {
        return `https://discord.com/oauth2/authorize?client_id=${id}&permissions=139623484672&scope=applications.commands%20bot`;
    }

    static support() {
        return `https://discord.gg/2EE8a3dmxU`;
    }

    async run({ interaction }) {
        await interaction.deferReply({ ephemeral: true });

        const buttons = new MessageActionRow()
        .addComponents(
            [
                new MessageButton()
                    .setEmoji('<:pogChump:837663069353410601>')
                    .setStyle('LINK')
                    .setURL(Invite.link(this.client.user.id))
                    .setLabel('Invite me here!')
            ],
            // [
            //     new MessageButton()
            //         .setEmoji('❓')
            //         .setStyle('LINK')
            //         .setURL(Invite.support())
            //         .setLabel('Support Server')
            // ],
        );
        await interaction.editReply({ content: 'Invite me to your server with this fancy button!', components: [buttons] });
    }
}
module.exports = Invite;