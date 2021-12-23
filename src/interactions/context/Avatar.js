const RoxanneContext = require('../../abstract/RoxanneContext.js');

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
        await interaction.editReply(`${avatar}?size=4096`);
    }
}
module.exports = AvatarContext;
