const KongouInteraction = require('../../abstract/KongouInteraction.js');

class Ping extends KongouInteraction {
    get name() {
        return 'ping';
    }

    get description() {
        return 'Basic pongy command!';
    }

    async run({ interaction }) {
        const message = await interaction.deferReply({ fetchReply: true, ephemeral: true });
        await interaction.editReply(`Took \`${Math.round(message.createdTimestamp - interaction.createdTimestamp)}ms\``);
    }
}
module.exports = Ping;