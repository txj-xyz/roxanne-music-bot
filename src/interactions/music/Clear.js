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
        if (dispatcher.queue.length > 0) {
            dispatcher.queue.length = 0;
            dispatcher.repeat = 'off';
            dispatcher.stopped = false;
            return await interaction.editReply(
                "Human, There is nothing to clear, you're good to go!"
            );
        }
        return await interaction.editReply(
            "I've cleared the queue in this guild."
        );
    }
}
module.exports = Clear;
