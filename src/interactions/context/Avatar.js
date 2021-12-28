const RoxanneContext = require('../../abstract/RoxanneContext.js');
const { MessageAttachment, MessageEmbed } = require('discord.js');
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
<<<<<<< HEAD
        const avatarEmbed = new MessageEmbed().setDescription(`Avatar of ${targetID.user.toString()}`);
=======
        const avatarEmbed = new MessageEmbed().setTitle(`Avatar of ${targetID.user.username}`);
>>>>>>> cc028cd5a7350e1fcbdffa40afb06f76bb4eb233
        await interaction.editReply({ embeds: [avatarEmbed], files: [new MessageAttachment(`${avatar}?size=4096`)] });
    }
}
module.exports = AvatarContext;
