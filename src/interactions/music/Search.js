const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { MessageEmbed, MessageButton } = require('discord.js');
const { PagesBuilder } = require('discord.js-pages');
const axios = require('axios');
class Search extends RoxanneInteraction {
    get name() {
        return 'search';
    }

    get description() {
        return 'Searches for songs and returns a list for you to choose from';
    }

    get options() {
        return [
            {
                name: 'query',
                type: ApplicationCommandOptionType.String,
                description: 'The search word to look for.',
                required: true,
            },
        ];
    }

    static pageLimit = 10;

    static chunkify(arr, len) {
        let chunks = [];
        let i = 0;
        let n = arr.length;

        while (i < n) {
            chunks.push(arr.slice(i, (i += len)));
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

    static async ytMeta(id, youtube_key) {
        try {
            const videoStats = await axios({
                method: 'get',
                url: `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${id}&key=${youtube_key}`,
                responseType: 'json',
            });
            return videoStats.data.items.slice(0).some((e) => e)
                ? videoStats.data.items.slice(0)[0]
                : null;
        } catch (err) {
            return err;
        }
    }

    static convertZDate(dateString) {
        if (!dateString) return;
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    async run({ interaction }) {
        const mappedSearch = [];

        const searchPageButtonList = [
            {
                stop: new MessageButton()
                    .setEmoji('❌')
                    .setLabel('Cancel')
                    .setStyle('DANGER'),
            },
            {
                back: new MessageButton()
                    .setEmoji('⬅️')
                    // .setLabel('Previous Result')
                    .setStyle('SECONDARY'),
            },
            {
                next: new MessageButton()
                    .setEmoji('➡️')
                    // .setLabel('Next Result')
                    .setStyle('SECONDARY'),
            },
        ];

        // Reply before processing any other messages and check for link
        await interaction.deferReply();
        const query = interaction.options.getString('query', true);
        if (query.includes('https://'))
            return await interaction.editReply(
                'I can only search for words, try searching a term instead.'
            );

        const node = await this.client.shoukaku.getNode();
        // await interaction.editReply('Searching my music servers for results..');
        const search = await node.rest.resolve(query, 'youtube');

        if (!search?.tracks.length)
            return interaction.editReply(
                "I didn't find any search results on the query you provided!"
            );

        const _search = search.tracks.slice(
            0,
            Search.pageLimit ? Search.pageLimit : search.tracks.length
        );

        // await interaction.editReply('Querying for the video information....')
        for await (const track of _search) {
            const _meta = await Search.ytMeta(
                track.info.identifier,
                'AIzaSyC55sHa-dnHfaSUV5dfWm3iMaZMe5cLuyQ'
            );

            mappedSearch.push({
                full_title: `${track.info.author} - ${track.info.title}`,
                author: track.info.author,
                title: track.info.title,
                url: track.info.uri,
                length: track.info.length,
                identifier: track.info.identifier,
                view_count:
                    _meta.statistics.viewCount?.replace(
                        /\B(?=(\d{3})+(?!\d))/g,
                        ','
                    ) || null,
                likes_count:
                    _meta.statistics.likeCount?.replace(
                        /\B(?=(\d{3})+(?!\d))/g,
                        ','
                    ) || null,
                upload_date:
                    Search.convertZDate(_meta.snippet.publishedAt) || null,
            });
        }
        const _chunkSearch = Search.chunkify(mappedSearch, 1);
        const _chunkedPages = _chunkSearch.map((t, i) => ({
            page: i,
            tracks: t,
        }));
        const pages = [];
        const c = this.client;

        for (const q of _chunkedPages) {
            q.tracks
                .map((r) => {
                    pages.push(
                        new MessageEmbed()
                            // .setThumbnail(`https://img.youtube.com/vi/${c.identifier}/default.jpg`)
                            .setImage(
                                `https://img.youtube.com/vi/${r.identifier}/hqdefault.jpg`
                            )
                            .setURL(r.url)
                            .setTitle(`**${r.title}**`)
                            .addField(
                                '⌛ Duration: ',
                                `**\`${Search.humanizeTime(r.length)}\`**`,
                                true
                            )
                            .addField(
                                '🎵 Author: ',
                                `**\`${r.author}\`**`,
                                true
                            )
                            .addField(
                                '🖥️ Video ID',
                                `**\`${r.identifier}\`**`,
                                true
                            )
                            .addField(
                                '👍 Likes',
                                `**\`${r.likes_count}\`**`,
                                true
                            )
                            .addField(
                                '🛰️ Upload Date',
                                `**\`${r.upload_date}\`**`,
                                true
                            )
                            .addField(
                                '👀 Views',
                                `**\`${r.view_count?.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ','
                                )}\`**`,
                                true
                            )
                            .setTimestamp()
                    );
                })
                .join('\n');
        }

        function stopPageBuilder() {
            setTimeout(() => {
                pageBuild.stopListen();
            }, 500);
        }

        const pageBuild = new PagesBuilder(interaction)
            .setColor(c.color)
            .setPages(pages)
            .setListenUsers(interaction.user.id)
            .setListenTimeout(30000)
            .setListenEndMethod('delete')
            .setDefaultButtons(searchPageButtonList)
            .addComponents([
                new MessageButton()
                    .setCustomId('custom')
                    .setEmoji('✅')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS'),
            ])
            .setTriggers([
                {
                    name: 'custom',
                    async callback(buttonInteraction, button) {
                        button.setDisabled(true).setLabel('Added to Queue');
                        const shoukakuTrack =
                            search.tracks[pageBuild.currentPage - 1];
                        const trackInformation =
                            mappedSearch[pageBuild.currentPage - 1];
                        const dispatcher = await c.queue.handle(
                            interaction.guild,
                            interaction.member,
                            interaction.channel,
                            node,
                            shoukakuTrack
                        );
                        // if(!c.queue.get(interaction.guild.id)) {
                        //     dispatcher?.play();
                        // }
                        c.queue.get(interaction.guild.id)
                            ? dispatcher?.play()
                            : null;
                        stopPageBuilder();
                        return await interaction.channel.send(
                            `Adding **${trackInformation.full_title}** to the queue!`
                        );
                        // return stopPageBuilder();
                    },
                },
            ]);
        pageBuild.build();
    }
}
module.exports = Search;
