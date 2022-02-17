const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { ShoukakuTrack } = require('shoukaku');
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const retry = require('async-await-retry');

// Apple only
// const { autoGetApple } = require('apple-music-metadata');
class Play extends RoxanneInteraction {
    get name() {
        return 'play';
    }

    get description() {
        return 'Automatically fetches the video(s) and joins the voice channel you are in!';
    }

    get options() {
        return [
            {
                name: 'query',
                type: ApplicationCommandOptionType.String,
                description: 'The song you want to play',
                required: true,
            },
        ];
    }

    get playerCheck() {
        return { voice: true, dispatcher: false, channel: false };
    }

    async run({ interaction }) {
        await interaction.deferReply();
        const query = interaction.options.getString('query', true);
        const node = await this.client.shoukaku.getNode();

        // Check Youtube URL / Playlist
        if (this.client.util.checkURL(query)) {
            const result = await node.rest.resolve(query);
            if (!result) return await interaction.editReply("I didn't find anything on the query you provided!");
            const { type, tracks, playlistName } = result;
            const track = tracks.shift();
            const playlist = type === 'PLAYLIST';
            if (!track?.info) {
                return await interaction.editReply('There was an error finding the song information, please try again.');
            }
            const dispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
            if (playlist) {
                for (const track of tracks) await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
            }
            await interaction.editReply(playlist ? `Added the playlist \`${playlistName}\` in queue!` : `Added the track \`${track?.info.title}\` in queue!`).catch(() => null);
            dispatcher?.play();
            return;
        }

        // Single search request
        const search = await node.rest.resolve(query);
        if (!search?.tracks.length) return interaction.editReply("I didn't find anything on the query you provided!");
        const track = search.tracks.shift();
        const dispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
        await interaction.editReply(`Added the track \`${track.info.title}\` in queue!`).catch(() => null);
        dispatcher?.play();
    }

    async buttonYoutubePlaylist(interaction, query, radio = false) {
        const node = await this.client.shoukaku.getNode();
        // YouTube Playlist integration for select menus
        if (this.client.util.checkURL(query)) {
            const result = await node.rest.resolve(query);
            if (!result)
                return interaction.editReply({
                    content: "I didn't find any song on the query you provided!",
                    components: [],
                    embeds: [],
                });
            const { type, tracks, playlistName } = result;
            const track = tracks.shift();
            const playlist = type === 'PLAYLIST';
            const dispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
            if (playlist) {
                for (const track of tracks) await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
            }
            if (radio) {
                await interaction
                    .editReply({
                        content: `Started Radio stream: **\`${track.info.title}\`**!`,
                        components: [],
                        embeds: [],
                    })
                    .catch(() => null);
                return dispatcher?.play();
            }
            await interaction
                .editReply({
                    content: playlist ? `Added the playlist \`${playlistName}\` in queue!` : `Added the track \`${track.info.title}\` in queue!`,
                    components: [],
                    embeds: [],
                })
                .catch(() => null);
            dispatcher?.play();

            return;
        }
    }
}
module.exports = Play;
