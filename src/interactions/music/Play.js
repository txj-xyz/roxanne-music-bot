const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { ShoukakuTrack } = require('shoukaku');
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const retry = require('async-await-retry');

// Apple only
const { autoGetApple } = require('apple-music-metadata');
// const playlistLink = 'https://music.apple.com/us/playlist/say-hello/pl.u-Ymb0EGMFDkRN6j';
// const songLink = 'https://music.apple.com/us/album/tell-me-feat-hero-baldwin/1535914918?i=1535914921';
// const albumLink = 'https://music.apple.com/us/album/say-hello-ep-feat-meliha/1552265558';

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
        //Check for apple music
        // if (query.includes('apple.com')) return await interaction.editReply('Sorry human, Apple Music is not available at the moment. <:sad:585678099069403148>');
        const node = await this.client.shoukaku.getNode();

        // Apple music integration
        if (this.client.util.checkURL(query) && query.includes('music.apple.com')) {
            await interaction.editReply('[APPLE BETA] - Loading results, please wait, this may take a moment..');
            const result = await autoGetApple(query);
            if (!result) return await interaction.editReply('Failed to resolve the query, please try another URL.');

            switch (result.type) {
                case 'song': {
                    const trackName = `${result.artist} - ${result.title}`;
                    const trackSearch = await node.rest.resolve(trackName, 'youtube');
                    const firstTrack = trackSearch.tracks.shift();
                    const dispatcherApple = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, firstTrack);
                    await interaction.editReply(`Queueing \`${trackName}\``);
                    dispatcherApple?.play();
                    return;
                }
                case 'playlist': {
                    const firstTrackInPlaylist = result.tracks.shift();
                    const firstTrackName = `${firstTrackInPlaylist.artist} - ${firstTrackInPlaylist.title}`;
                    const firstTrackSearch = await node.rest.resolve(firstTrackName, 'youtube');
                    const firstTrack = firstTrackSearch.tracks.shift();
                    const dispatcherApple = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, firstTrack);
                    dispatcherApple?.play();

                    await interaction.editReply('Gathering playlist songs.');
                    let temp = [];
                    for (const track of result.tracks) {
                        const trackName = `${track.artist} - ${track.title}`;
                        temp.push(node.rest.resolve(trackName, 'youtube'));
                    }
                    // Handle all promises in order of search
                    Promise.all(temp).then((results) => {
                        for (const r of results) {
                            if (r.type === 'SEARCH') {
                                const trackToQueue = r.tracks.shift();
                                this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, trackToQueue);
                            }
                        }
                    });
                    await interaction.editReply(
                        `Found ${result.tracks.length + 1} results from playlist \`${result.name}\` from user \`${result.author}\`\n\n\nNOTE: THIS IS A BETA, SOME RESULTS MAY NOT BE FOUND PROPERLY`
                    );
                    return (temp = []);
                }
                case 'album': {
                    const firstTrackInAlbum = result.tracks.shift();
                    const firstTrackName = `${firstTrackInAlbum.artist} - ${firstTrackInAlbum.title}`;
                    const firstTrackSearch = await node.rest.resolve(firstTrackName, 'youtube');
                    const firstTrack = firstTrackSearch.tracks.shift();
                    const dispatcherApple = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, firstTrack);
                    dispatcherApple?.play();

                    await interaction.editReply('Gathering album songs.');
                    let temp = [];
                    for (const track of result.tracks) {
                        const trackName = `${track.artist} - ${track.title}`;
                        temp.push(node.rest.resolve(trackName, 'youtube'));
                    }
                    // Handle all promises in order of search
                    Promise.all(temp).then((results) => {
                        for (const r of results) {
                            if (r.type === 'SEARCH') {
                                const trackToQueue = r.tracks.shift();
                                this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, trackToQueue);
                            }
                        }
                    });
                    await interaction.editReply(
                        `Found ${result.tracks.length + 1} results from album \`${result.name}\` from author \`${result.author}\`\n\n\nNOTE: THIS IS A BETA, SOME RESULTS MAY BE NOT FOUND PROPERLY`
                    );
                    return (temp = []);
                }
                default:
                    return;
            }
        }

        // Spotify Integration Tracks / Playlists
        if (this.client.util.checkURL(query) && query.match(this.client.util.lava.spotifyPattern)) {
            let playlist;
            let fullResolvedList = [];

            try {
                playlist = await retry(this.client.util.spotifyRetry, [this.client.util.lava, query, interaction], {
                    retriesMax: 10,
                    interval: 1000,
                    exponential: true,
                    factor: 2,
                });
            } catch (err) {
                return await interaction.editReply('Sorry human, I was not able to load the playlist after 10 tries.');
            }

            if (playlist.loadType === 'NO_MATCHES') {
                return await interaction.editReply(`Sorry human, I was not able to find anything from your search.\n\`Message: ${playlist.exception.message}\``);
            }

            if (playlist.loadType === 'TRACK_LOADED' && !playlist.tracks[0]) {
                return await interaction.editReply(`There was an error finding the song information, please try again.`);
            }

            for (const res of playlist.tracks) {
                if (res) {
                    let resTrack = new ShoukakuTrack(res);
                    fullResolvedList.push(resTrack);
                }
            }
            const firstTrack = fullResolvedList.shift();
            const startDispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, firstTrack);

            if (playlist.loadType === 'TRACK_LOADED') {
                await interaction.editReply(`\`${firstTrack.info.author} - ${firstTrack.info.title}\` added to the Queue!`).catch(() => null);
            } else {
                await interaction.editReply(`Queueing \`${String(playlist.tracks.length)}\` tracks from \`${playlist.playlistInfo?.name || playlist.title}\`!`).catch(() => null);
            }
            startDispatcher?.play();
            fullResolvedList = [];

            for (const postRes of playlist.tracks.slice(1)) {
                if (postRes) {
                    let resTrack = new ShoukakuTrack(postRes);
                    await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, resTrack);
                }
            }
            return;
        }

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
        const search = await node.rest.resolve(query, 'youtube');
        if (!search?.tracks.length) return interaction.editReply("I didn't find anything on the query you provided!");
        const track = search.tracks.shift();
        const dispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
        await interaction.editReply(`Added the track \`${track.info.title}\` in queue!`).catch(() => null);
        dispatcher?.play();
    }

    async buttonSpotifyPlaylist(interaction, query) {
        const node = await this.client.shoukaku.getNode();
        // Spotify Integration Tracks / Playlists select menus
        if (this.client.util.checkURL(query) && query.match(this.client.util.lava.spotifyPattern)) {
            let playlist;
            let fullResolvedList = [];
            try {
                playlist = await retry(this.client.util.spotifyRetry, [this.client.util.lava, query, interaction], {
                    retriesMax: 10,
                    interval: 1000,
                    exponential: true,
                    factor: 2,
                });
            } catch (err) {
                return await interaction.editReply({
                    content: 'Sorry human, I was not able to load the playlist after 10 tries.',
                    components: [],
                    embeds: [],
                });
            }
            if (playlist.loadType === 'NO_MATCHES') {
                return await interaction.editReply({
                    content: `Sorry human, I was not able to find anything from your search.\n\`Message: ${playlist.exception.message}\``,
                    components: [],
                    embeds: [],
                });
            }
            for (const res of playlist.tracks) {
                let resTrack = new ShoukakuTrack(res);
                fullResolvedList.push(resTrack);
            }
            const firstTrack = fullResolvedList.shift();
            const startDispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, firstTrack);

            if (playlist.loadType === 'TRACK_LOADED') {
                await interaction
                    .editReply({
                        content: `\`${firstTrack.info.author} - ${firstTrack.info.title}\` added to the Queue!`,
                        components: [],
                        embeds: [],
                    })
                    .catch(() => null);
            } else {
                await interaction
                    .editReply({
                        content: `Queueing \`${String(playlist.tracks.length)}\` tracks from \`${playlist.playlistInfo?.name || playlist.title}\`!`,
                        components: [],
                        embeds: [],
                    })
                    .catch(() => null);
            }
            startDispatcher?.play();
            fullResolvedList = [];

            for (const postRes of playlist.tracks.slice(1)) {
                let resTrack = new ShoukakuTrack(postRes);
                await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, resTrack);
            }
            return;
        }
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
