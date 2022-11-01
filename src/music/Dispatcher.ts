import { Channel, EmbedBuilder, Guild, Message } from 'discord.js';
import { Player, Track, WebSocketClosedEvent } from 'shoukaku';
import Bot from '../Bot';

// Dispatcher
export default interface MusicDispatcher {
    client: Bot;
    guild: Guild;
    channel: Channel;
    player: Player;
    queue: Array<Track>;
    repeat: 'off' | 'one' | 'all';
    current: Track;
    stopped: boolean;
    nowplaying?: Message;
    playingEmbed(playing: Track): EmbedBuilder;
    notifiedOnce: boolean;
    // handlePlayer(player: Player): void;
}

export default class MusicDispatcher {
    constructor(client: Bot, guild: Guild, channel: Channel, player: Player) {
        this.client = client;
        this.guild = guild;
        this.channel = channel;
        this.player = player;
        this.queue = [];
        this.repeat = 'off';
        this.stopped = false;
        this.notifiedOnce = false;
        this.player
            .on('start', async () => await this.startEvent())
            .on('end', () => this.endEvent())
            .on('stuck', async () => this.stuckEvent())
            .on('closed', async (payload: WebSocketClosedEvent) => await this.closedEvent(payload));
    }

    private async startEvent() {
        if (this.repeat === 'one' && this.queue.length < 1) {
            if (this.notifiedOnce) return;
            else this.notifiedOnce = true;
        }
        if (this.nowplaying) {
            this.nowplaying = await this.nowplaying.edit({ embeds: [this.playingEmbed(this.current)] });
            return;
        }
        this.nowplaying = this.channel.isTextBased() ? await this.channel.send({ embeds: [this.playingEmbed(this.current)] }) : void 0;
        this.client.logger.log({ handler: this.constructor.name, message: `Track Started` }, false);
    }

    private endEvent() {
        if (this.repeat === 'one') this.queue.unshift(this.current);
        if (this.repeat === 'all') this.queue.push(this.current);
        if (![0, 1].includes(this.player.connection.state)) return;
        this.play();
        this.client.logger.log({ handler: this.constructor.name, message: `Track Ended` }, false);
    }

    private async stuckEvent() {
        if (!this.channel.isTextBased()) return;
        this.client.logger.log({ handler: this.constructor.name, message: `Track is stuck, stopping music.` }, false);
        await this.channel.send('Track is stuck, stopping music.');
        this.destroy();
    }

    private async closedEvent(payload: WebSocketClosedEvent) {
        if (!this.channel.isTextBased()) return;
        if (!this.player.connection.channelId) return;
        this.client.logger.log({ handler: this.constructor.name, message: `Track closed with payload: ${payload.code}` }, false);
        const channel_test: Channel | null = await this.client.channels.fetch(this.player.connection.channelId);
        if (channel_test?.isVoiceBased() && channel_test.members.size === 0) return this.destroy();
        setTimeout(() => {
            if (!this.player.connection.channelId) return;
            return this.player.node
                .joinChannel({
                    guildId: this.guild.id,
                    shardId: this.guild.shardId,
                    channelId: this.player.connection.channelId,
                    deaf: true,
                })
                .catch(() => {
                    if (!this.channel.isTextBased()) return;
                    this.channel.send('There was a failure with resuming the connection to the Discord Gateway');
                    return this.destroy();
                });
        }, this.client.util.config.shoukakuOptions.reconnectInterval);
    }

    public playingEmbed(playing: Track): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(0xff0000)
            .setAuthor({ name: 'Now Playing', iconURL: this.client.user?.displayAvatarURL() })
            .setThumbnail(`https://img.youtube.com/vi/${playing.info.identifier}/default.jpg`)
            .setURL(playing.info.uri)
            .setTitle(`**${playing.info.title}**`)
            .addFields([
                {
                    name: '⌛ Duration: ',
                    value: `\`${this.client.util.humanizeTime(playing.info.length)}\``,
                    inline: true,
                },
                {
                    name: '🎵 Author: ',
                    value: `\`${playing.info.author}\``,
                    inline: true,
                },
            ])
            .setFooter({ text: '• Powered by Kubernetes!' })
            .setTimestamp();
    }

    public get exists(): boolean {
        return this.client.music.queue.has(this.guild.id);
    }

    public async play(): Promise<Player | void> {
        if (!this.exists || !this.queue.length) return this.destroy();
        this.current = this.queue[0];
        return this.player.setVolume(0.5).playTrack({ track: this.current.track });
    }

    public async destroy(): Promise<void> {
        // this.client.logger.error(reason ?? '');
        this.queue.length = 0;
        this.player.connection.disconnect();
        this.client.music.queue.delete(this.guild.id);
        this.channel.isTextBased() && !this.stopped ? this.channel.send('No more songs in queue, feel free to queue more songs!') : void 0;
    }
}
