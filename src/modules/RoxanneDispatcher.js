const { EmbedBuilder } = require('discord.js');
const Wait = require('util').promisify(setTimeout);

class RoxanneDispatcher {
    constructor({ client, guild, channel, player }) {
        this.client = client;
        this.guild = guild;
        this.channel = channel;
        this.player = player;
        this.queue = [];
        this.repeat = 'off';
        this.current = null;
        this.stopped = false;
        this.nowplaying = null;

        let _notifiedOnce = false;

        this.player
            .on('start', async () => {
                if (this.repeat === 'one' && this.queue.length < 1) {
                    if (_notifiedOnce) return;
                    else _notifiedOnce = true;
                }
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setAuthor({ name: 'Now Playing', iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
                    .setThumbnail(`https://img.youtube.com/vi/${this.current.info.identifier}/default.jpg`)
                    .setURL(this.current.info.uri)
                    .setTitle(`**${this.current.info.title}**`)
                    .addFields([
                        {
                            name: '⌛ Duration: ',
                            value: `\`${this.client.util.humanizeTime(this.current.info.length)}\``,
                            inline: true,
                        },
                        {
                            name: '🎵 Author: ',
                            value: `\`${this.current.info.author}\``,
                            inline: true,
                        },
                    ])
                    .setFooter({ text: '• Powered by Kubernetes!' })
                    .setTimestamp();
                if (this.nowplaying !== null) {
                    this.nowplaying = await this.nowplaying.edit({ embeds: [embed] }).catch(() => null);
                    return;
                }
                this.nowplaying = await this.channel.send({ embeds: [embed] }).catch(() => null);
            })
            .on('end', async () => {
                if (this.repeat === 'one') this.queue.unshift(this.current);
                if (this.repeat === 'all') this.queue.push(this.current);
                if (![0, 1].includes(player.connection.state)) return;
                this.play();
            })
            .on('stuck', () => {
                this.client.logger.log('Track is stuck, repeating song.');
                this.channel.send('There was a stuck track playing the current song.');
                this.destroy();
            })
            .on('closed', async (payload) => {
                console.log(payload);
                this.client.logger.log(`Connection is closed with payload ${payload.code}`);

                // Full reconnection support for the new re-identification from Discord Gateways
                const channel_test = await this.client.channels.fetch(this.player.connection.channelId);
                await Wait(2000);
                if (channel_test.members.size === 0) {
                    this.channel.send('There is nobody in the voice channel so I left :)');
                    return this.destroy(`Payload failure ${payload.code}`);
                }
                return this.player.node
                    .joinChannel({
                        guildId: this.guild.id,
                        shardId: this.guild.shardId,
                        channelId: this.player.connection.channelId,
                        deaf: true,
                    })
                    .catch((err) => {
                        console.log(err);
                        this.channel.send('There was a failure with resuming the connection to Discord.');
                        return this.destroy(`Payload failure ${payload.code}`);
                    });
            });
    }

    get exists() {
        return this.client.queue.has(this.guild.id);
    }

    play() {
        if (!this.exists || !this.queue.length) {
            this.nowplaying.delete().catch((e) => e);
            return this.destroy();
        }
        this.current = this.queue.shift();
        this.player.setVolume(0.5).playTrack({ track: this.current.track });
    }

    destroy(reason) {
        this.client.logger.playerError(reason ?? '');
        this.queue.length = 0;
        this.player.connection.disconnect();
        this.client.queue.delete(this.guild.id);
        this.client.logger.debug(`Destroyed player & connection`);
        if (this.stopped) return;
        !reason ? this.channel.send('No more songs in queue, feel free to queue more songs!').catch(() => null) : void 0;
    }
}
module.exports = RoxanneDispatcher;
