const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const RoxanneDispatcher = require('../../modules/RoxanneDispatcher.js');
const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
        const pageButtonList = [
            {
                back: new ButtonBuilder().setEmoji('👈').setLabel('Back').setStyle(ButtonStyle.Danger),
            },
            {
                stop: new ButtonBuilder().setLabel('Cancel').setStyle(ButtonStyle.Secondary),
            },
            {
                next: new ButtonBuilder().setEmoji('👉').setLabel('Next').setStyle(ButtonStyle.Primary),
            },
        ];
        if (dispatcher.queue.length > 0) {
            if (!dispatcher?.current) {
                return await interaction.reply({
                    content: 'Nothing playing',
                    ephemeral: true,
                });
            }
            const mapQueue = dispatcher.queue.map((track, index) => ({
                queue_id: index + 1,
                full_title: `${track.info.author} - ${track.info.title}`,
                author: track.info.author,
                title: track.info.title,
                url: track.info.uri,
                length: track.info.length,
            }));
            const chunkedQueue = Queue.chunkify(mapQueue, 10);
            const chunked = chunkedQueue.map((t, i) => ({
                page: i,
                tracks: t,
            }));
            const pages = [];

            for (const q of chunked) {
                pages.push(
                    new EmbedBuilder()
                        .setAuthor({ name: 'Now Playing', iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
                        .setURL(dispatcher.current.info.uri)
                        .setTitle(`**${dispatcher.current.info.title}**`)
                        .setThumbnail(`https://img.youtube.com/vi/${dispatcher.current.info.identifier}/default.jpg`)
                        .setDescription(`👉 **Queue List**\n\n${q.tracks.map((c) => `**${c.queue / q_id}.)** [(${this.client.util.humanizeTime(c.length)}) - ${c.title}](${c.url})`).join('\n')}`)
                );
            }
            new PagesBuilder(interaction)
                .setColor(this.client.color)
                .setPages(pages)
                .setListenUsers(interaction.user.id)
                .setListenTimeout(60 * 1000)
                .setListenEndMethod('delete')
                .setDefaultButtons(pageButtonList)
                .build();
        } else {
            await interaction.deferReply();
            const embed = new EmbedBuilder()
                .setAuthor({ name: 'Now Playing', iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
                .setThumbnail(`https://img.youtube.com/vi/${dispatcher.current.info.identifier}/default.jpg`)
                .setURL(dispatcher.current.info.uri)
                .setColor(this.client.color)
                .setTitle(`**${dispatcher.current.info.title}**`)
                .addFields([
                    {
                        name: '⌛ Duration: ',
                        value: `\`${this.client.util.humanizeTime(dispatcher.current.info.length)}\``,
                        inline: true,
                    },
                    {
                        name: '🎵 Author: ',
                        value: `\`${dispatcher.current.info.author}\``,
                        inline: true,
                    },
                ])
                .setFooter({ text: `• ${dispatcher.queue.length} total songs in queue` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    }
}
module.exports = Queue;
