const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

class PlaylistMenu extends RoxanneInteraction {
    get name() {
        return 'playlists';
    }

    get description() {
        return 'Get a list of common playlists';
    }

    get playerCheck() {
        return { voice: true, dispatcher: false, channel: true };
    }

    async run({ interaction }) {
        const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('playlist_menu')
                .setPlaceholder('Nothing selected')
                .addOptions([
                    {
                        label: 'TXB Official Playlist',
                        description: 'Spotify playlist for TXB Tunes!',
                        value: 'txb_playlist'
                    },
                    {
                        label: 'TXJ\'s Rap 2021 Playlist',
                        description: 'Built for gamers',
                        value: 'txj_playlist',
                    },
                ]),
        );
        await interaction.reply({ content: 'Human! Select from the drop down what you\'d like to play!', components: [row]});
    }
}
module.exports = PlaylistMenu;