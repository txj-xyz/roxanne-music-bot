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

    static checkURL(string) {
        try {
            new URL(string);
            return true;
        } catch (error) {
            return false;
        }
    }

    static async spotifyRetry(lavasfyClient, query, interaction) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            const node = await lavasfyClient.getNode();
            await node.load(query).then(async (r) => {
                if (r.loadType === 'LOAD_FAILED') {
                    await interaction.editReply({
                        content:
                            '<a:embed_loading:695358635110301726> Please wait while I grab songs from Spotify <a:embed_loading:695358635110301726>',
                        components: [],
                    });
                    reject('LOAD_FAILED');
                } else if (r.loadType.includes('LOADED')) {
                    resolve(r);
                } else if (r.loadType === 'NO_MATCHES') {
                    resolve(r);
                }
            });
        });
    }

    async run({ interaction, dispatcher }) {
        await interaction.deferReply();
        if (!interaction.options.data.length) {
            return await interaction.editReply(
                'Sorry human, You must provide an option for me! **See: `/help`**.'
            );
        }

        // Optional ID to play next from the queue
        const queueBumpID = interaction.options.getInteger('id', false);
        if (queueBumpID) {
            //Move Queue ID to top of queue and rebuild array
            tempBumpArray = dispatcher.queue;
            // return console.log(PlayNext.moveToFront(queueBumpID - 1, tempBumpArray)[0])
            dispatcher.queue = PlayNext.moveToFront(
                queueBumpID - 1,
                tempBumpArray
            );
            let songInfo = dispatcher.queue[0].info;
            return await interaction.editReply(
                `Moved \`${songInfo.author} - ${songInfo.title}\` to the top of the Queue!`
            );
        }

        const query = interaction.options.getString('query', false);
        if (!query)
            return await interaction.editReply(
                'Sorry human, You must provide an option.'
            );
        //Check for apple music
        if (query.includes('apple.com'))
            return await interaction.editReply(
                'Sorry human, Apple Music is not available at the moment. <:sad:585678099069403148>'
            );

        const node = await this.client.shoukaku.getNode();

        // Spotify Integration Tracks / Playlists
        if (
            PlayNext.checkURL(query) &&
            query.match(this.client.util.lava.spotifyPattern)
        ) {
            let playlist;
            let fullResolvedList = [];

            try {
                playlist = await retry(
                    PlayNext.spotifyRetry,
                    [this.client.util.lava, query, interaction],
                    {
                        retriesMax: 10,
                        interval: 1000,
                        exponential: true,
                        factor: 2,
                    }
                );
            } catch (err) {
                return await interaction.editReply(
                    'Sorry human, I was not able to load the playlist after 10 tries.'
                );
            }

            if (playlist.loadType === 'NO_MATCHES') {
                return await interaction.editReply(
                    `Sorry human, I was not able to find anything from your search.\n\`Message: ${playlist.exception.message}\``
                );
            }

            for (const res of playlist.tracks) {
                let resTrack = new ShoukakuTrack(res);
                fullResolvedList.push(resTrack);
            }
            const firstTrack = fullResolvedList.shift();
            const startDispatcher = await this.client.queue.handle(
                interaction.guild,
                interaction.member,
                interaction.channel,
                node,
                firstTrack,
                true
            );

            if (playlist.loadType === 'TRACK_LOADED') {
                await interaction
                    .editReply(
                        `\`${firstTrack.info.author} - ${firstTrack.info.title}\` added to the top of the queue!`
                    )
                    .catch(() => null);
            } else {
                await interaction
                    .editReply(
                        `Queueing \`${String(
                            playlist.tracks.length
                        )}\` tracks from \`${
                            playlist.playlistInfo?.name || playlist.title
                        }\` to play next in the queue!`
                    )
                    .catch(() => null);
            }
            startDispatcher?.play();
            fullResolvedList = [];

            for (const postRes of playlist.tracks.slice(1)) {
                let resTrack = new ShoukakuTrack(postRes);
                await this.client.queue.handle(
                    interaction.guild,
                    interaction.member,
                    interaction.channel,
                    node,
                    resTrack
                );
            }
            return;
        }

        // Check Youtube URL / Playlist
        if (PlayNext.checkURL(query)) {
            const result = await node.rest.resolve(query);
            if (!result)
                return interaction.editReply(
                    "I didn't find any song on the query you provided!"
                );
            const { type, tracks, playlistName } = result;
            const track = tracks.shift();
            const playlist = type === 'PLAYLIST';
            const dispatcher2 = await this.client.queue.handle(
                interaction.guild,
                interaction.member,
                interaction.channel,
                node,
                track
            );
            if (playlist) {
                for (const track of tracks)
                    await this.client.queue.handle(
                        interaction.guild,
                        interaction.member,
                        interaction.channel,
                        node,
                        track,
                        true
                    );
            }
            await interaction
                .editReply(
                    playlist
                        ? `Added the playlist \`${playlistName}\`  to play next in the queue!`
                        : `Added the track \`${track.info.title}\`  to play next in the queue!`
                )
                .catch(() => null);
            dispatcher2?.play();
            return;
        }

        // Single search request
        const search = await node.rest.resolve(query, 'youtube');
        if (!search?.tracks.length)
            return interaction.editReply(
                "I didn't find any song on the query you provided!"
            );
        const track = search.tracks.shift();
        const dispatcher2 = await this.client.queue.handle(
            interaction.guild,
            interaction.member,
            interaction.channel,
            node,
            track,
            true
        );
        await interaction
            .editReply(
                `Added the track \`${track.info.title}\` to play next in the queue!`
            )
            .catch(() => null);
        dispatcher2?.play();
    }
}
module.exports = PlayNext;
