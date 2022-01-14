const RoxanneContext = require('../../abstract/RoxanneContext.js');
const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
class AvatarContext extends RoxanneContext {
    get name() {
        return 'Avatar';
    }

    get type() {
        return 2;
    }

    async run({ interaction }) {
        await interaction.deferReply({
            ephemeral: false,
        });
        const targetID = await interaction.guild.members.fetch(interaction.targetId);
        const avatar = targetID.user.displayAvatarURL({ dynamic: true });
        const avatarLinkButton = new MessageActionRow().addComponents([new MessageButton().setEmoji('🧍‍♂️').setStyle('LINK').setURL(`${avatar}?size=2048`).setLabel('Full Size')]);
        const avatarEmbed = new MessageEmbed().setDescription(`Avatar of ${targetID.user.toString()}`);
        await interaction.editReply({ embeds: [avatarEmbed], files: [new MessageAttachment(`${avatar}?size=4096`)], components: [avatarLinkButton] });
    }
}
module.exports = AvatarContext;
