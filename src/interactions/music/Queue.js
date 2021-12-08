
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const RoxanneDispatcher = require('../../modules/RoxanneDispatcher.js');
const { MessageEmbed, MessageButton } = require('discord.js');
const { PagesBuilder } = require('discord.js-pages'); // https://mrzillagold.github.io/discord.js-pages/modules.html

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

    static pageButtonList = [
        {
            back: new MessageButton()
                .setEmoji('👈')
                .setLabel('Back')
                .setStyle('DANGER')
        },
        {
            stop: new MessageButton()
                .setLabel('Cancel')
                .setStyle('SECONDARY')
        },
        {
            next: new MessageButton()
                .setEmoji('👉')
                .setLabel('Next')
                .setStyle('SUCCESS')
        }
    ];

    static chunkify(arr, len) {
        let chunks = [];
        let i = 0;
        let n = arr.length;
        
        while (i < n) {
            chunks.push(arr.slice(i, (i += len)));
        }
        
        return chunks;
    }

    async run({ interaction, dispatcher }) {
        if(dispatcher.queue.length > 0) {
            const mapQueue = dispatcher.queue.map((track, index) => (
                {
                    queue_id: index+1,
                    full_title: `${track.info.author} - ${track.info.title}`,
                    author: track.info.author,
                    title: track.info.title,
                    url: track.info.uri,
                    length: track.info.length
                }
            ));
            const chunkedQueue = Queue.chunkify(mapQueue, 10);
            const chunked = chunkedQueue.map((t, i) => ({ page: i, tracks: t }));
            const pages = [];
            
            for (const q of chunked) {
                pages.push(
                    new MessageEmbed()
                    .setAuthor(`Now Playing`, this.client.user.displayAvatarURL({ dynamic: true }))
                    .setURL(dispatcher.current.info.uri)
                    .setTitle(`**${dispatcher.current.info.title}**`)
                    .setThumbnail(`https://img.youtube.com/vi/${dispatcher.current.info.identifier}/default.jpg`)
                    .setDescription(`👉 **Queue List**\n\n${q.tracks.map(c => `**${c.queue_id}.)** [${c.author} - ${c.title}](${c.url})`).join('\n')}`)
                )
            }
            new PagesBuilder(interaction)
                .setColor(this.client.color)
                .setPages(pages)
                .setListenUsers(interaction.user.id)
                .setListenTimeout(60 * 1000)
                .setListenEndMethod('delete')
                .setDefaultButtons(Queue.pageButtonList)
                .build();

        } else {
            await interaction.deferReply();
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
            await interaction.editReply({ embeds: [ embed ] });
        }
        
    }
}
module.exports = Queue;