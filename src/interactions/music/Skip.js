const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
let tempQueue;

class Skip extends RoxanneInteraction {
    get name() {
        return 'skip';
    }

    get description() {
        return 'Skips the currently playing song';
    }

    get playerCheck() {
        return { voice: true, dispatcher: true, channel: true };
    }

    get options() {
        return [
            {
                name: 'to',
                type: ApplicationCommandOptionType.Integer,
                description: 'Queue number to skip player ahead to.',
                required: false,
            },
        ];
    }

    async run({ interaction, dispatcher }) {
        await interaction.deferReply();
        tempQueue = dispatcher.queue;
        const skipVariable = interaction.options.getInteger('to', false);

        if (skipVariable) {
            dispatcher.queue = dispatcher.queue.splice(
                Number(skipVariable) - 1,
                tempQueue.length
            );
            tempQueue = null;
            await interaction.editReply(
                `Skipping ${skipVariable} songs in the queue!`
            );
            return dispatcher.player.stopTrack();
        } else {
            await interaction.editReply(
                'Skipping the currently playing track!'
            );
            dispatcher.player.stopTrack();
        }
    }
}
module.exports = Skip;
