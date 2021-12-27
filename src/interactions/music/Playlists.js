const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { PagesBuilder } = require('discord.js-pages');
const { Client, MessageActionRow, MessageEmbed, MessageSelectMenu } = require('discord.js');

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

    static menuOptions = [
        {
            label: 'TXB Official Playlist',
            description: 'Spotify playlist for TXB Tunes!',
            value: 'txb_playlist',
            type: 'buttonSpotifyPlaylist',
            link: 'https://open.spotify.com/playlist/1Ac9XPXCQaTUjTNbnNwYhV',
        },
        {
            label: "TXJ's Rap Spotify Playlist",
            description: 'All heat bangers.',
            value: 'txj_playlist',
            type: 'buttonSpotifyPlaylist',
            link: 'https://open.spotify.com/playlist/4YLTXRl623J8WXYyZse3rk',
        },
        {
            label: 'Drum and Bass Monstercat Playlist',
            description: 'Built for gamers, by gamers.',
            value: 'dnb_playlist',
            type: 'buttonYoutubePlaylist',
            link: 'https://www.youtube.com/watch?v=RKSr5ovamds&list=PL9BCA60EEB1C8893D',
        },
        {
            label: 'Rocking out w/ Alda',
            description: 'The perfect playlist for rockers alike.',
            value: 'alda_playlist',
            type: 'buttonSpotifyPlaylist',
            link: 'https://open.spotify.com/playlist/6CtQMssfXfWwUnAwZclC6b',
        },
    ];

    async run({ interaction }) {
        const client = this.client;
        async function play(interaction, playerType, link) {
            client.interactions.commands.get('play')[playerType](interaction, link);
        }

        const page = new MessageEmbed().setAuthor('Select a playlist from the drop down!');
        //prettier-ignore
        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('custom')
                .setPlaceholder('Nothing selected')
                .addOptions(PlaylistMenu.menuOptions)
        );

        const pageBuild = new PagesBuilder(interaction)
            .setColor(this.client.color)
            .setListenUsers(interaction.user.id)
            .setListenTimeout(10000)
            .setListenEndMethod('components_remove')
            .setDefaultButtons([])
            .setPaginationFormat('')
            .setPages(page)
            .addComponents([row])
            .setTriggers([
                {
                    name: 'custom',
                    async callback(menu) {
                        const selection = PlaylistMenu.menuOptions.filter((_label) => _label.value === menu.values[0])?.[0];
                        await interaction.editReply({ content: null, embeds: [client.util.loadingEmbed] });
                        await play(interaction, selection.type, selection.link);
                        pageBuild.stopListen();
                    },
                },
            ]);
        pageBuild.build();
    }
}
module.exports = PlaylistMenu;
