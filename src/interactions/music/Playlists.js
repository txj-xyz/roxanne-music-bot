const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { PagesBuilder } = require('discord.js-pages');
const { Client, ActionRowBuilder, EmbedBuilder, SelectMenuBuilder } = require('discord.js');

class PlaylistMenu extends RoxanneInteraction {
    get name() {
        return 'playlists';
    }

    get description() {
        return 'Get a list of common playlists';
    }

    get playerCheck() {
        return { voice: true, dispatcher: false, channel: false };
    }

    async run({ interaction }) {
        const client = this.client;
        async function play(interaction, playerType, link) {
            client.interactions.commands.get('play')[playerType](interaction, link);
        }

        const page = new EmbedBuilder().setDescription('Select a playlist from the drop down!');
        //prettier-ignore
        const row = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('custom')
                .setPlaceholder('Nothing selected')
                .addOptions(this.client.playlists)
        );

        const pageBuild = new PagesBuilder(interaction)
            .setColor(this.client.color)
            .setListenUsers(interaction.user.id)
            .setListenTimeout(30 * 1000)
            .setListenEndMethod('components_remove')
            .setDefaultButtons([])
            .setPaginationFormat('')
            .setPages(page)
            .addComponents([row])
            .setTriggers([
                {
                    name: 'custom',
                    async callback(menu) {
                        const selection = client.playlists.filter((_label) => _label.value === menu.values[0])?.[0];
                        await interaction.editReply({ content: client.util.loadingText, embeds: [], components: [] });
                        await play(interaction, 'contextQuery', selection.link);
                        pageBuild.stopListen();
                    },
                },
            ]);
        pageBuild.build();
    }
}
module.exports = PlaylistMenu;
