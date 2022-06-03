const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class Ping extends RoxanneInteraction {
    get name() {
        return 'ping';
    }

    get description() {
        return 'Basic pongy command!';
    }

    async run({ interaction }) {
        const pingTime = Date.now();
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply(`Took \`${Date.now() - pingTime}ms\``);
    }
}
module.exports = Ping;
