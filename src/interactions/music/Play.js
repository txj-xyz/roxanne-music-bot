const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { ShoukakuTrack } = require( 'shoukaku' );
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const retry = require('async-await-retry');
// const countInterval = require("count-interval");

class Play extends RoxanneInteraction {
    get name() {
        return 'play';
    }

    get description() {
        return 'Automatically fetches the video(s) and joins the voice channel you are in!';
    }
    
    get options() {
        return [{
            name: 'query',
            type: ApplicationCommandOptionType.String,
            description: 'The song you want to play',
            required: true,
        }];
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
            await node.load(query).then(async r => {
                if(r.loadType === 'LOAD_FAILED') {
                    await interaction.editReply({content: 'Please wait while I grab songs from Spotify', components: []});
                    reject('LOAD_FAILED');
                } else if(r.loadType.includes('LOADED')) {
                    resolve(r);
                } else if(r.loadType === 'NO_MATCHES') {
                    resolve(r);
                }
            });
        });
    }

    async run({ interaction }) {
        await interaction.deferReply();
        const query = interaction.options.getString('query', true);
        //Check for apple music
        if(query.includes('apple.com')) return await interaction.editReply('Sorry human, Apple Music is not available at the moment. <:sad:585678099069403148>');

        const node = await this.client.shoukaku.getNode();
        

        // Spotify Integration Tracks / Playlists
        if(Play.checkURL(query) && query.match(this.client.lavasfy.spotifyPattern)) {
            let playlist;
            let fullResolvedList = [];

            try {
                playlist = await retry(Play.spotifyRetry, [this.client.lavasfy, query, interaction], {retriesMax: 10, interval: 1000, exponential: true, factor: 2});
            } catch (err) {
                return await interaction.editReply('Sorry human, I was not able to load the playlist after 10 tries.');
            }

            if(playlist.loadType === 'NO_MATCHES') {
                return await interaction.editReply(`Sorry human, I was not able to find anything from your search.\n\`Message: ${playlist.exception.message}\``);
            }

            for(const res of playlist.tracks) {
                let resTrack = new ShoukakuTrack(res);
                fullResolvedList.push(resTrack);
            }
            const firstTrack = fullResolvedList.shift();
            const startDispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, firstTrack);
            
            if(playlist.loadType === 'TRACK_LOADED'){
                await interaction.editReply(`\`${firstTrack.info.author} - ${firstTrack.info.title}\` added to the Queue!`).catch(() => null);
            } else {
                await interaction.editReply(`Queueing \`${String(playlist.tracks.length)}\` tracks from \`${playlist.playlistInfo?.name || playlist.title}\`!`).catch(() => null);
            }
            startDispatcher?.play();
            fullResolvedList = [];

            for(const postRes of playlist.tracks.slice(1)) {
                let resTrack = new ShoukakuTrack(postRes);
                await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, resTrack);
            }
            return;
        }
        
        // Check Youtube URL / Playlist
        if (Play.checkURL(query)) {
            const result = await node.rest.resolve(query);
            if (!result) 
                return interaction.editReply('I didn\'t find any song on the query you provided!');
            const { type, tracks, playlistName } = result;
            const track = tracks.shift();
            const playlist = type === 'PLAYLIST';
            const dispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
            if (playlist) {
                for (const track of tracks) await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
            }   
            await interaction
                .editReply(playlist ? `Added the playlist \`${playlistName}\` in queue!` : `Added the track \`${track.info.title}\` in queue!`)
                .catch(() => null);
            dispatcher?.play();
            return;
        }

        // Single search request
        const search = await node.rest.resolve(query, 'youtube');
        if (!search?.tracks.length)
            return interaction.editReply('I didn\'t find any song on the query you provided!');
        const track = search.tracks.shift();
        const dispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
        await interaction
            .editReply(`Added the track \`${track.info.title}\` in queue!`)
            .catch(() => null);
        dispatcher?.play();
    }

    async buttonSpotifyPlaylist(interaction, query) {
        const node = await this.client.shoukaku.getNode();
        // Spotify Integration Tracks / Playlists select menus
        if(Play.checkURL(query) && query.match(this.client.lavasfy.spotifyPattern)) {
            let playlist;
            let fullResolvedList = [];
            try {
                playlist = await retry(Play.spotifyRetry, [this.client.lavasfy, query, interaction], {retriesMax: 10, interval: 1000, exponential: true, factor: 2});
            } catch (err) {
                return await interaction.editReply({content: 'Sorry human, I was not able to load the playlist after 10 tries.', components: []});
            }
            if(playlist.loadType === 'NO_MATCHES') {
                return await interaction.editReply({content: `Sorry human, I was not able to find anything from your search.\n\`Message: ${playlist.exception.message}\``, components: []});
            }
            for(const res of playlist.tracks) {
                let resTrack = new ShoukakuTrack(res);
                fullResolvedList.push(resTrack);
            }
            const firstTrack = fullResolvedList.shift();
            const startDispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, firstTrack);
            
            if(playlist.loadType === 'TRACK_LOADED'){
                await interaction.editReply({content: `\`${firstTrack.info.author} - ${firstTrack.info.title}\` added to the Queue!`, components: []}).catch(() => null);
            } else {
                await interaction.editReply({content: `Queueing \`${String(playlist.tracks.length)}\` tracks from \`${playlist.playlistInfo?.name || playlist.title}\`!`, components: []}).catch(() => null);
            }
            startDispatcher?.play();
            fullResolvedList = [];

            for(const postRes of playlist.tracks.slice(1)) {
                let resTrack = new ShoukakuTrack(postRes);
                await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, resTrack);
            }
            return;
        }
    }

    async buttonYoutubePlaylist(interaction, query, radio) {
        const node = await this.client.shoukaku.getNode();
        // YouTube Playlist integration for select menus
        if (Play.checkURL(query)) {
            const result = await node.rest.resolve(query);
            if (!result) 
                return interaction.editReply({content: 'I didn\'t find any song on the query you provided!', components: []});
            const { type, tracks, playlistName } = result;
            const track = tracks.shift();
            const playlist = type === 'PLAYLIST';
            const dispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
            if (playlist) {
                for (const track of tracks) await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
            }
            if(radio){
                await interaction
                    .editReply({content: `Started Radio stream: **\`${track.info.title}\`**!`, components: []})
                    .catch(() => null);
                return dispatcher?.play();
            }
            await interaction
                .editReply({content: playlist ? `Added the playlist \`${playlistName}\` in queue!` : `Added the track \`${track.info.title}\` in queue!`, components: []})
                .catch(() => null);
            dispatcher?.play();
            
            return;
        }
    }
}
module.exports = Play;