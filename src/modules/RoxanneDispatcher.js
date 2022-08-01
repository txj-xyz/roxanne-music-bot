const { MessageEmbed } = require('discord.js');
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

        let _notifiedOnce = false;

        this.player
            .on('start', () => {
                if (this.repeat === 'one' && this.queue.length < 1) {
                    if (_notifiedOnce) return;
                    else _notifiedOnce = true;
                }
                const embed = new MessageEmbed()
                    .setColor(0xff0000)
                    .setAuthor({ name: 'Now Playing', iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
                    .setThumbnail(`https://img.youtube.com/vi/${this.current.info.identifier}/default.jpg`)
                    .setURL(this.current.info.uri)
                    .setTitle(`**${this.current.info.title}**`)
                    .addField('⌛ Duration: ', `\`${this.client.util.humanizeTime(this.current.info.length)}\``, true)
                    .addField('🎵 Author: ', `\`${this.current.info.author}\``, true)
                    .setFooter({ text: '• Powered by Kubernetes!' })
                    .setTimestamp();
                this.channel.send({ embeds: [embed] }).catch(() => null);
            })
            .on('end', async () => {
                if (this.repeat === 'one') this.queue.unshift(this.current);
                if (this.repeat === 'all') this.queue.push(this.current);
                if (![0, 1].includes(player.connection.state)) return;
                this.play();
            })
            .on('closed', async (payload) => {
                this.client.logger.log({
                    message: payload,
                    errorPossible: `possible webhook failure from lavalink ${payload.code ? payload.code : player.connection.state}`,
                });
                if (payload.code === 4014) {
                    this.queue.unshift(this.current);
                    this.play();
                }
            })
            .on('stuck', () => {
                this.client.logger.log({ message: 'Track is stuck, repeating song.' });
                this.queue.unshift(this.current);
                this.play();
                // this.destroy('Failure of Websocket or bot kicked from VC.');
            });
    }

    get exists() {
        return this.client.queue.has(this.guild.id);
    }

    play() {
        if (!this.exists || !this.queue.length) return this.destroy();
        this.current = this.queue.shift();
        this.player.setVolume(0.5).playTrack({ track: this.current.track });
    }

    destroy(reason) {
        this.client.logger.playerError(reason);
        this.queue.length = 0;
        this.player.connection.disconnect();
        this.client.queue.delete(this.guild.id);
        this.client.logger.debug(this.player.constructor.name, `Destroyed player & connection`);
        if (this.stopped) return;
        this.channel.send('No more songs in queue, feel free to queue more songs!').catch(() => null);
    }
}
module.exports = RoxanneDispatcher;
