const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class Ping extends RoxanneInteraction {
    get name() {
        return 'ping';
    }

    get description() {
        return 'Basic pongy command!';
    }

    async run({ interaction }) {
        const message = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true,
        });
        await interaction.editReply(`Took \`${Math.round(message.createdTimestamp - interaction.createdTimestamp)}ms\``);
    }
}
module.exports = Ping;
