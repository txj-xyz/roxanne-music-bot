const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { ShoukakuTrack } = require('shoukaku');
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const retry = require('async-await-retry');

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
        let query = interaction.options.getString('query', true);
        const node = await this.client.shoukaku.getNode();

        // Check Youtube URL / Playlist
        if (this.client.util.checkURL(query)) {
            query.includes('/shorts/') ? (query = query.replace('/shorts/', '/watch?v=')) : (query = query);

            const result = await node.rest.resolve(query);
            if (!result) return await interaction.editReply("I didn't find anything on the query you provided!");
            const { loadType, tracks } = result;
            const track = tracks.shift();
            const playlist = loadType === 'PLAYLIST_LOADED';
            if (!track?.info) {
                return await interaction.editReply('There was an error finding the song information, please try again.');
            }

            // Log song request
            if (!playlist) {
                this.client.logger.log({
                    constructor: this.constructor.name,
                    message: 'Handling new single Queue request',
                    playlist: playlist,
                    query: query,
                    node: node.name,
                    track: track.info,
                    guild: interaction.guild.name,
                    guildID: interaction.guild.id,
                });
            }

            const dispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
            if (playlist) {
                for (const track of tracks) await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);

                // Log playlist request
                this.client.logger.log({
                    constructor: this.constructor.name,
                    message: 'Handling new single Queue request',
                    playlist: playlist,
                    query: query,
                    node: node.name,
                    playlistLength: tracks?.length || null,
                    guild: interaction.guild.name,
                    guildID: interaction.guild.id,
                });
            }
            await interaction
                .editReply(playlist ? `Added \`${tracks?.length}\` tracks from the playlist \`${result.playlistInfo.name}\` in queue!` : `Added the track \`${track?.info.title}\` in queue!`)
                .catch(() => null);
            dispatcher?.play();
            return;
        }

        // Single search request
        const search = await node.rest.resolve(`ytsearch:${query}`);
        if (!search?.tracks.length) return interaction.editReply("I didn't find anything on the query you provided!");
        const track = search.tracks.shift();
        const dispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);

        // Log song searching query request
        this.client.logger.log({
            constructor: this.constructor.name,
            message: 'Handling new single query Queue request',
            query: query,
            node: node.name,
            track: track.info,
            guild: interaction.guild.name,
            guildID: interaction.guild.id,
        });

        await interaction.editReply(`Added the track \`${track.info.title}\` in queue!`).catch(() => null);
        dispatcher?.play();
    }

    async buttonPlaylistQuery(interaction, query, radio = false) {
        const node = await this.client.shoukaku.getNode();
        // YouTube Playlist integration for select menus
        if (this.client.util.checkURL(query)) {
            const result = await node.rest.resolve(query);
            if (result.loadType == 'LOAD_FAILED' || !result) {
                return interaction.editReply({
                    content: "I didn't find anything on the query you provided!",
                    components: [],
                    embeds: [],
                });
            }
            const { loadType, tracks } = result;
            const track = tracks.shift();
            const playlist = loadType === 'PLAYLIST';

            // Log song request via button / menu

            if (!playlist && !radio) {
                this.client.logger.log({
                    constructor: this.constructor.name,
                    message: 'Handling new InteractionContext request',
                    query: query,
                    node: node.name,
                    track: track.info,
                    guild: interaction.guild.name,
                    guildID: interaction.guild.id,
                });
            }

            const dispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
            if (playlist) {
                // Queue up tracks
                for (const track of tracks) await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);

                // Log playlist request
                this.client.logger.log({
                    constructor: this.constructor.name,
                    message: 'Handling new InteractionContext request',
                    playlist: playlist,
                    query: query,
                    node: node.name,
                    playlistLength: tracks?.length || null,
                    guild: interaction.guild.name,
                    guildID: interaction.guild.id,
                });
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
                    content: playlist ? `Added \`${tracks?.length}\` tracks from the playlist \`${result.playlistInfo.name}\` in queue!` : `Added the track \`${track.info.title}\` in queue!`,
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
