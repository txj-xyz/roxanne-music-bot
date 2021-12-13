const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class Clear extends RoxanneInteraction {
    get name() {
        return 'clear';
    }

    get description() {
        return 'Clears the current music queue.';
    }

    get playerCheck() {
        return { voice: true, dispatcher: true, channel: true };
    }

    async run({ interaction, dispatcher }) {
        await interaction.deferReply();
        dispatcher.queue.length = 0;
        dispatcher.repeat = 'off';
        dispatcher.stopped = false;
        await interaction.editReply(`I've cleared the queue in this guild.`);
    }
}
module.exports = Clear;