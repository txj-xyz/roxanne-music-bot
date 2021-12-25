const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { PagesBuilder } = require('discord.js-pages');
const { Client, MessageActionRow, MessageEmbed, MessageSelectMenu } = require('discord.js');

class RadioMenu extends RoxanneInteraction {
    get name() {
        return 'radio';
    }

    get description() {
        return 'Stream live the radio!';
    }

    get playerCheck() {
        return { voice: true, dispatcher: false, channel: false };
    }

    static menuOptions = [
        {
            label: 'Lofi hip-hop',
            description: 'Beats to relax/study to',
            value: 'lofi_radio',
            type: 'buttonYoutubePlaylist',
            radio: true,
            link: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
        },
        {
            label: 'Coffee Shop lofi beats',
            description: 'lofi hip-hop beats',
            value: 'coffee_lofi_radio',
            type: 'buttonYoutubePlaylist',
            radio: true,
            link: 'https://www.youtube.com/watch?v=-5KAN9_CzSA',
        },
        {
            label: 'The Good Life Radio',
            description: 'House, Chillout, Study, Gym, Happy Music',
            value: 'good_life_radio',
            type: 'buttonYoutubePlaylist',
            radio: true,
            link: 'https://www.youtube.com/watch?v=36YnV9STBqc',
        },
        {
            label: 'Drum & Bass Liquid / Chill',
            description: 'Non-Stop Liquid - To Chill / Relax Too',
            value: 'dnb_radio',
            type: 'buttonYoutubePlaylist',
            radio: true,
            link: 'https://youtu.be/Rf4jJzziJko',
        },
    ];

    async run({ interaction }) {
        const client = this.client;
        async function play(interaction, playerType, link, radioMode) {
            client.interactions.commands.get('play')[playerType](interaction, link, radioMode);
        }

        if (this.client.queue.get(interaction.guild.id)) {
            return await interaction.reply({ content: '**Human, Please stop the player or wait for the queue to finish before using this command.**', ephemeral: true });
        }

        const page = new MessageEmbed().setAuthor('Live Radio Stations!').setDescription('Select a stream from the drop down!');
        //prettier-ignore
        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('custom')
                .setPlaceholder('Nothing selected')
                .addOptions(RadioMenu.menuOptions)
        );

        const pageBuild = new PagesBuilder(interaction)
            .setColor(this.client.color)
            .setListenUsers(interaction.user.id)
            .setListenTimeout(10000)
            .setListenEndMethod('none')
            .setDefaultButtons([])
            .setPaginationFormat('')
            .setPages(page)
            .addComponents([row])
            .setTriggers([
                {
                    name: 'custom',
                    async callback(menu) {
                        const selection = RadioMenu.menuOptions.filter((_label) => _label.value === menu.values[0])?.[0];
                        console.log(selection);
                        await play(interaction, selection.type, selection.link, selection.radio);
                        pageBuild.stopListen();
                    },
                },
            ]);
        pageBuild.build();
    }
}
module.exports = RadioMenu;
