const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { MessageEmbed, MessageButton } = require('discord.js');
const { PagesBuilder } = require('discord.js-pages');

class Search extends RoxanneInteraction {
    get name() {
        return 'search';
    }

    get description() {
        return 'Searches for songs and returns a list for you to choose from';
    }
    
    get options() {
        return [{
            name: 'query',
            type: ApplicationCommandOptionType.String,
            description: 'The search word to look for.',
            required: true,
        }];
    }

    static chunkify(arr, len) {
        let chunks = [];
        let i = 0;
        let n = arr.length;
        
        while (i < n) {
            chunks.push(arr.slice(i, i += len));
        }
        
        return chunks;
    }

    get playerCheck() {
        return { voice: true, dispatcher: false, channel: false };
    }

    static humanizeTime(millisec) {
        let seconds = (millisec / 1000).toFixed(0);
        let minutes = Math.floor(seconds / 60);
        let hours = '';
        if (minutes > 59) {
            hours = Math.floor(minutes / 60);
            hours = hours >= 10 ? hours : '0' + hours;
            minutes = minutes - hours * 60;
            minutes = minutes >= 10 ? minutes : '0' + minutes;
        }
        seconds = Math.floor(seconds % 60);
        seconds = seconds >= 10 ? seconds : '0' + seconds;
        if (hours > 59) {
            return 'Live! 🔴';
        }
        if (hours != '') {
            return hours + ':' + minutes + ':' + seconds;
        }
        return minutes + ':' + seconds;
    }

    async run({ interaction }) {
        const searchPageButtonList = [
            {
                back: new MessageButton()
                    .setEmoji('👈')
                    .setLabel('Back')
                    .setStyle('SECONDARY')
            },
            {
                next: new MessageButton()
                    .setEmoji('👉')
                    .setLabel('Next')
                    .setStyle('SECONDARY')
            }
        ];

        await interaction.deferReply();
        const query = interaction.options.getString('query', true);
        if(query.includes('https://')) return await interaction.editReply('I can only search for words');
        const node = await this.client.shoukaku.getNode();
        const search = await node.rest.resolve(query, 'youtube');
        
        if (!search?.tracks.length)
            return interaction.editReply('I didn\'t find any search results on the query you provided!');

        const mappedSearch = search.tracks.map((track, index) => (
            {
                search_id: index+1,
                full_title: `${track.info.author} - ${track.info.title}`,
                author: track.info.author,
                title: track.info.title,
                url: track.info.uri,
                length: track.info.length,
                identifier: track.info.identifier
            }
        ));
        const chunkedSearch = Search.chunkify(mappedSearch, 1); // Split search into 10 results per page
        const chunked = chunkedSearch.map((t, i) => ({ page: i, tracks: t }));
        const pages = [];
        const c = this.client;

        for (const q of chunked) {
            q.tracks.map(c => {
                pages.push(
                    new MessageEmbed()
                        // .setThumbnail(`https://img.youtube.com/vi/${c.identifier}/default.jpg`)
                        .setImage(`https://img.youtube.com/vi/${c.identifier}/hqdefault.jpg`)
                        .setURL(c.url)
                        .setTitle(`**${c.title}**`)
                        .addField('⌛ Duration: ', `\`${Search.humanizeTime(c.length)}\``, true)
                        .addField('🎵 Author: ', `\`${c.author}\``, true)
                        .setTimestamp()
                );
            }).join('\n')
        }

        let pageBuild = new PagesBuilder(interaction)
            .setColor(this.client.color)
            .setPages(pages)
            .setListenUsers(interaction.user.id)
            .setListenTimeout(15 * 1000)
            .setListenEndMethod('edit')
            .setDefaultButtons(searchPageButtonList)
            .addComponents(
                [
                    new MessageButton()
                    .setCustomId('custom')
                    .setEmoji('✅')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS')
                ]
                
            )
            .setTriggers([
                {
                    name: 'custom',
                    async callback(interactionCallback, button) {
                        button.setDisabled(true)
                        .setLabel('Added to Queue');
                        const shoukakuTrack = search.tracks[pageBuild.currentPage - 1];
                        const trackInformation = mappedSearch[pageBuild.currentPage - 1];
                        const dispatcher = await c.queue.handle(interaction.guild, interaction.member, interaction.channel, node, shoukakuTrack);
                            dispatcher?.play();
                        return await interaction.followUp({content: `Adding **${trackInformation.full_title}** to the queue!`});
                    }
                }
            ]);

        pageBuild.build();
    }
}
module.exports = Search;