const { MessageEmbed } = require('discord.js');

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
                .setAuthor(`Now Playing`, this.client.user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(`https://img.youtube.com/vi/${this.current.info.identifier}/default.jpg`)
                .setURL(this.current.info.uri)
                .setTitle(`**${this.current.info.title}**`)
                .addField(`⌛ Duration: `, `\`${RoxanneDispatcher.humanizeTime(this.current.info.length)}\``, true)
                .addField(`🎵 Author: `, `\`${this.current.info.author}\``, true)
                .setFooter(`• Powered by Kubernetes!`)
                .setTimestamp();
            this.channel
                .send({ embeds: [ embed ] })
                .catch(() => null);
        });
        this.player.on('end', () => {
            if (this.repeat === 'one') this.queue.unshift(this.current);
            if (this.repeat === 'all') this.queue.push(this.current);
            this.play();
        });
        for (const event of ['closed', 'error']) {
            this.player.on(event, data => {
                if (data instanceof Error || data instanceof Object) this.client.logger.error(data);
                this.queue.length = 0;
                this.destroy();
            });
        }
    }

    static humanizeTime(millisec) {
        let seconds = (millisec / 1000).toFixed(0);
        let minutes = Math.floor(seconds / 60);
        let hours = "";
        if (minutes > 59) {
            hours = Math.floor(minutes / 60);
            hours = (hours >= 10) ? hours : "0" + hours;
            minutes = minutes - (hours * 60);
            minutes = (minutes >= 10) ? minutes : "0" + minutes;
        }
        seconds = Math.floor(seconds % 60);
        seconds = (seconds >= 10) ? seconds : "0" + seconds;
        if (hours > 59) {
            return "Live! 🔴"
        }
        if (hours != "") {
            return hours + ":" + minutes + ":" + seconds;
        }
        return minutes + ":" + seconds;
    }

    get exists() {
        return this.client.queue.has(this.guild.id);
    }

    play() {
        if (!this.exists || !this.queue.length) return this.destroy();
        this.current = this.queue.shift();
        this.player
            .setVolume(0.5)
            .playTrack(this.current.track);
    }

    destroy(reason) {
        this.queue.length = 0;
        this.player.connection.disconnect();
        this.client.queue.delete(this.guild.id);
        this.client.logger.debug(this.player.constructor.name, `Destroyed the player & connection @ guild "${this.guild.id}"\nReason: ${reason || 'No Reason Provided'}`);
        this.client.webhook.send(`Destroyed the player & connection @ guild \`"${this.guild.id} | ${this.guild.name}"\` Reason: ${reason || 'No Reason Provided'}`)
        if (this.stopped) return;
        this.channel
            .send('No more songs in queue, feel free to queue more songs!')
            .catch(() => null);
    }
}
module.exports = RoxanneDispatcher;
