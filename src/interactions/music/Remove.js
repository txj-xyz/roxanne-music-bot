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
        if (!dispatcher.queue[queueID - 1]) return await interaction.editReply("The queue id you requested to remove does not exist, see `/queue` for full list of id's.");
        tempArray = dispatcher.queue;
        dispatcher.queue = this.client.util.removeArrayIndex(tempArray, queueID);
        await interaction.editReply(`Removed \`${tempArray[queueID - 1].info.author} - ${tempArray[queueID - 1].info.title}\` from the queue.`);
        tempArray = null;
        return;
    }
}
module.exports = Remove;
