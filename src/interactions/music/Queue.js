
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const RoxanneDispatcher = require('../../modules/RoxanneDispatcher.js');
const { MessageEmbed } = require('discord.js');

class Queue extends RoxanneInteraction {
    get name() {
        return 'queue';
    }

    get description() {
        return 'Shows the current queue for this guild!';
    }

    get playerCheck() {
        return { voice: false, dispatcher: true, channel: false };
    }

    async run({ interaction, dispatcher }) {
        const queue = dispatcher.queue.length > 20 ? dispatcher.queue.slice(0, 20) : dispatcher.queue;
        const embed = new MessageEmbed()
            .setAuthor(`Now Playing`, this.client.user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(`https://img.youtube.com/vi/${dispatcher.current.info.identifier}/default.jpg`)
            .setURL(dispatcher.current.info.uri)
            .setColor(this.client.color)
            .setTitle(`**${dispatcher.current.info.title}**`)
            .addField(`⌛ Duration: `, `\`${RoxanneDispatcher.humanizeTime(dispatcher.current.info.length)}\``, true)
            .addField(`🎵 Author: `, `\`${dispatcher.current.info.author}\``, true)
            .setFooter(`• ${dispatcher.queue.length} total songs in queue`)
            .setTimestamp();
            if (queue.length) embed.addField('👉 Up Next', queue.map((track, index) => `**${index+1}.)** \`${track.info.author} - ${track.info.title}\``).join('\n'));
        await interaction.reply({ embeds: [ embed ] });
    }
}
module.exports = Queue;