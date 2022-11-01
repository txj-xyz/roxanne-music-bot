import { Channel, Guild, GuildMember, GuildTextBasedChannel } from 'discord.js';
import { Player, Node, Track } from 'shoukaku';
import Bot from '../Bot';
import { MusicDispatcher } from '.';

// Music Queue
export default interface MusicQueue {
    client: Bot;
    player?: Player;
    dispatcher: MusicDispatcher;
    handle(guild: Guild, member: GuildMember, channel: GuildTextBasedChannel, node: Node, track: Track, first: boolean): Promise<MusicDispatcher>;
}

export default class MusicQueue extends Map {
    constructor(client: Bot) {
        super();
        this.client = client;
    }

    public async handle(guild: Guild, member: GuildMember, channel: GuildTextBasedChannel | Channel, node: Node, track: Track, first: boolean): Promise<MusicDispatcher> {
        const existing = this.get(guild.id);
        if (!existing && member.voice.channelId) {
            this.player = await node.joinChannel({ guildId: guild.id, shardId: guild.shardId, channelId: member.voice.channelId, deaf: true });
            this.dispatcher = new MusicDispatcher(this.client, guild, channel, this.player);
            this.dispatcher.queue.push(track);
            this.set(guild.id, this.dispatcher);
            return this.dispatcher;
        }
        first ? existing.queue.unshift(track) : existing.queue.push(track);
        return this.dispatcher;
    }
}
