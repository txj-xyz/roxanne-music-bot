import BotInteraction from '../../types/BotInteraction';
import { Channel, ChatInputCommandInteraction, Guild, Message, SlashCommandBuilder } from 'discord.js';
import { LavalinkResponse, Node, Track } from 'shoukaku';
// import { BotModule } from '../../handlers/ModuleHandler';

export default class Play extends BotInteraction {
    get name() {
        return 'play';
    }

    get description() {
        return 'Play music through the bot';
    }

    get slashData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => option.setName('song').setDescription('The song you want to play.').setRequired(true));
    }
    public async playURL(interaction: ChatInputCommandInteraction<'cached'>, options: { node: Node; query: string }): Promise<Message<true>> {
        const guild: Guild = await this.client.guilds.fetch(interaction.guild.id);
        const channel: Channel | null = await this.client.channels.fetch(interaction.channelId, { force: true });
        if (!channel) return interaction.editReply({ content: 'There was an error fetching the channel' });
        options.query.includes('/shorts/') ? (options.query = options.query.replace('/shorts/', '/watch?v=')) : (options.query = options.query);
        const result: LavalinkResponse | null = await options.node.rest.resolve(options.query);
        if (!result) return await interaction.editReply({ content: 'I did not find anything on the query you provided!' });
        const { loadType, tracks } = result;
        const track: Track | undefined = tracks.shift();
        const playlist = loadType === 'PLAYLIST_LOADED';
        if (!track) return await interaction.editReply({ content: 'I did not find anything on the query you provided!' });
        const dispatcher = await this.client.music.queue.handle(guild, interaction.member, channel, options.node, track, false);
        if (playlist) {
            this.client.logger.log({ handler: this.constructor.name, message: `Handling new music playlist request | guild: ${interaction.guildId} | node: ${options.node.name}` }, true);
            for (const song of tracks) {
                await this.client.music.queue.handle(guild, interaction.member, channel, options.node, song, false);
            }
            dispatcher.play();
            return interaction.editReply({ content: `Added \`${tracks.length}\` tracks from the playlist \`${result.playlistInfo.name}\` in queue!` });
        } else {
            this.client.logger.log({ handler: this.constructor.name, message: `Handling new music request | guild: ${interaction.guildId} | node: ${options.node.name}` }, true);
            dispatcher.play();
            return interaction.editReply({ content: `Added the track \`${track.info.title}\` in queue!` });
        }
    }

    public async playSearch(interaction: ChatInputCommandInteraction<'cached'>, options: { node: Node; query: string }): Promise<Message<true>> {
        const guild: Guild = await this.client.guilds.fetch(interaction.guild.id);
        const channel: Channel | null = await this.client.channels.fetch(interaction.channelId, { force: true });
        if (!channel) return interaction.editReply({ content: 'There was an error fetching the channel' });
        // Single search request
        const search: LavalinkResponse | null = await options.node.rest.resolve(`ytsearch:${options.query}`);
        if (!search) return await interaction.editReply({ content: 'I did not find anything on the query you provided!' });
        const track: Track | undefined = search.tracks.shift();
        if (!track) return await interaction.editReply({ content: 'I did not find anything on the query you provided!' });
        const dispatcher = await this.client.music.queue.handle(guild, interaction.member, channel, options.node, track, false);
        dispatcher.play();
        return await interaction.editReply(`Added the track \`${track.info.title}\` in queue!`);
    }

    async run(interaction: ChatInputCommandInteraction<'cached'>) {
        await interaction.deferReply({ ephemeral: false });
        interaction.editReply({ content: '<:peepoSpy:762571392494338068>' });
        const song: string = interaction.options.getString('song', true);
        const node: Node | undefined = this.client.music.shoukaku.getNode('auto');
        // Catch if there is no node found
        if (!node) return interaction.editReply({ content: `Internal Error Occurred.` });

        // If the song requested was a URL handle it here
        if (this.client.util.checkURL(song)) return this.playURL(interaction, { node, query: song });
        else return await this.playSearch(interaction, { node, query: song });
    }
}
