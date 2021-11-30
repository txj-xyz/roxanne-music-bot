const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { ShoukakuTrack } = require( 'shoukaku' );
const KongouInteraction = require('../../abstract/KongouInteraction.js');
const countInterval = require("count-interval");

class Play extends KongouInteraction {
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

    async run({ interaction }) {
        await interaction.deferReply();
        const query = interaction.options.getString('query', true);
        const node = await this.client.shoukaku.getNode();
        let lavaNode = await this.client.lavasfy.getNode();
        
        if(Play.checkURL(query) && query.match(this.client.lavasfy.spotifyPattern)) {
            let playlist;
            let fullResolvedList = [];
            playlist = await lavaNode.load(query);
            if(playlist.loadType === "NO_MATCHES") {
                return await interaction.editReply(`Sorry human, I was not able to find anything from your search.\n\`Message: ${playlist.exception.message}\``);
            }
            if(playlist.loadType === "LOAD_FAILED" || playlist.tracks.length === 0){
                return await interaction.editReply(`Sorry human, Spotify was not able to load the playlist. Please try again.\n\`Note: This is being fixed soon\``);
            }

            for(const res of playlist.tracks) {
                // fullResolvedList = [];
                let resTrack = new ShoukakuTrack(res);
                fullResolvedList.push(resTrack);
            }
            const firstTrack = fullResolvedList.shift();
            const startDispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, firstTrack)
            
            if(playlist.loadType === "TRACK_LOADED"){
                await interaction.editReply(`\`${firstTrack.info.author} - ${firstTrack.info.title}\` added to the Queue!`).catch(() => null);
            } else {
                await interaction.editReply(`Queueing \`${String(playlist.tracks.length)}\` tracks from \`${playlist.playlistInfo?.name || playlist.title}\`!`).catch(() => null);
            }
            startDispatcher?.play();
            fullResolvedList = [];

            //post process the list of tracks
            for(const postRes of playlist.tracks.slice(1)) {
                let resTrack = new ShoukakuTrack(postRes);
                await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, resTrack);
            }
            return;
        }
        
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
        if(query == "lepo lepo") {
            await interaction.editReply('Lepo lepo detected, please wait while I load Niane\'s command.');
        }
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
}
module.exports = Play;