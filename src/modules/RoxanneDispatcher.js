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

        this.player.on('start', () => {
            if (this.repeat === 'one' || this.queue.length < 1) {
                if (_notifiedOnce) return;
                else _notifiedOnce = true;
            }

            const embed = new MessageEmbed()
                .setColor(0xff0000)
                .setAuthor('Now Playing', this.client.user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(`https://img.youtube.com/vi/${this.current.info.identifier}/default.jpg`)
                .setURL(this.current.info.uri)
                .setTitle(`**${this.current.info.title}**`)
                .addField('⌛ Duration: ', `\`${this.client.util.humanizeTime(this.current.info.length)}\``, true)
                .addField('🎵 Author: ', `\`${this.current.info.author}\``, true)
                .setFooter('• Powered by Kubernetes!')
                .setTimestamp();
            this.channel.send({ embeds: [embed] }).catch(() => null);
        });
        this.player.on('end', async () => {
            if (this.repeat === 'one') this.queue.unshift(this.current);
            if (this.repeat === 'all') this.queue.push(this.current);
            if (![0, 1].includes(player.connection.state)) return;
            this.play();
        });

        this.player.on('closed', async (payload) => {
            await Wait(5000);
            if (payload.code === 4014 && ![0, 1].includes(player.connection.state)) {
                await this.player.connection.reconnect();
                await Wait(100);
                await this.player.resume();
                await this.player.connection.setDeaf(true);
                if (![0, 1].includes(player.connection.state)) this.destroy();
            }
        });
    }

    get exists() {
        return this.client.queue.has(this.guild.id);
    }

    play() {
        if (!this.exists || !this.queue.length) return this.destroy();
        this.current = this.queue.shift();
        this.player.setVolume(0.5).playTrack(this.current.track);
    }

    destroy(reason) {
        this.queue.length = 0;
        this.player.connection.disconnect();
        this.client.queue.delete(this.guild.id);
        this.client.logger.debug(this.player.constructor.name, `Destroyed the player & connection @ guild "${this.guild.id}"\nReason: ${reason || 'No Reason Provided'}`);
        if (this.stopped) return;
        this.channel.send('No more songs in queue, feel free to queue more songs!').catch(() => null);
    }
}
module.exports = RoxanneDispatcher;
