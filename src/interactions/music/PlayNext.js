const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { ShoukakuTrack } = require('shoukaku');
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const retry = require('async-await-retry');
let tempBumpArray;

class PlayNext extends RoxanneInteraction {
    get name() {
        return 'playnext';
    }

    get description() {
        return 'Automatically fetches the video(s) and places it at the top of the queue!';
    }

    static moveToFront(index, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (i === index) {
                var a = arr.splice(i, 1); // removes the item from array
                arr.unshift(a[0]); // adds it back to the beginning
                return arr;
            }
        }
    }

    get options() {
        return [
            {
                name: 'query',
                type: ApplicationCommandOptionType.String,
                description: 'The song you want to play',
                required: false,
            },
            {
                name: 'id',
                type: ApplicationCommandOptionType.Integer,
                description: 'Queue number to play next.',
                required: false,
            },
        ];
    }

    get playerCheck() {
        return { voice: true, dispatcher: false, channel: false };
    }

    async run({ interaction, dispatcher }) {
        await interaction.deferReply();
        if (!interaction.options.data.length) {
            return await interaction.editReply('Sorry human, You must provide an option for me! **See: `/help`**.');
        }

        // Optional ID to play next from the queue
        const queueBumpID = interaction.options.getInteger('id', false);
        if (!dispatcher.queue[queueBumpID]) return await interaction.editReply("The queue id you requested to play next does not exist, see `/queue` for full list of id's.");
        if (queueBumpID) {
            //Move Queue ID to top of queue and rebuild array
            tempBumpArray = dispatcher.queue;
            dispatcher.queue = PlayNext.moveToFront(queueBumpID - 1, tempBumpArray);
            let songInfo = dispatcher.queue[0].info;
            return await interaction.editReply(`Moved \`${songInfo.author} - ${songInfo.title}\` to the top of the Queue!`);
        }

        const query = interaction.options.getString('query', false);
        if (query) {
            await interaction.editReply('PlayNext Query is disabled.');
        }
    }
}
module.exports = PlayNext;
