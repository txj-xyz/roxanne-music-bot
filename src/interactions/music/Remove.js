const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
let tempArray;

class Remove extends RoxanneInteraction {
    get name() {
        return 'remove';
    }

    get description() {
        return 'Removes a song from the queue';
    }

    get playerCheck() {
        return { voice: true, dispatcher: true, channel: true };
    }

    static removeIndex(array, queueIndexID) {
        return array.filter((_, index) => index != queueIndexID - 1);
    }

    get options() {
        return [
            {
                name: 'id',
                type: ApplicationCommandOptionType.Integer,
                description: 'Queue number to remove.',
                required: true,
            },
        ];
    }

    async run({ interaction, dispatcher }) {
        await interaction.deferReply();
        const queueID = interaction.options.getInteger('id', false);
        tempArray = dispatcher.queue;
        dispatcher.queue = Remove.removeIndex(tempArray, queueID);
        await interaction.editReply(
            `Removed \`${tempArray[queueID - 1].info.author} - ${
                tempArray[queueID - 1].info.title
            }\` from the queue.`
        );
        tempArray = null;
        return;
    }
}
module.exports = Remove;
