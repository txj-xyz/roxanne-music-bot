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

    static searchPageButtonList = [
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

    get playerCheck() {
        return { voice: true, dispatcher: false, channel: false };
    }

    async run({ interaction }) {
        await interaction.deferReply();
        const query = interaction.options.getString('query', true);
        const node = await this.client.shoukaku.getNode();

        // Single search request for the query
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
                length: track.info.length
            }
        ));
        const chunkedSearch = Search.chunkify(mappedSearch, 10); // Split search into 10 results per page
        const chunked = chunkedSearch.map((t, i) => ({ page: i, tracks: t }));
        const pages = [];

        for (const q of chunked) {
            pages.push(
                new MessageEmbed()
                .setDescription(`👉 **Search Results**\n\n${q.tracks.map(c => `**${c.search_id}.)** [${c.author} - ${c.title}](${c.url})`).join('\n')}`)
            )
        }
        let pageBuild = new PagesBuilder(interaction)
                .setColor(this.client.color)
                .setPages(pages)
                .setListenUsers(interaction.user.id)
                .setListenTimeout(60 * 1000)
                .setListenEndMethod('delete')
                .setDefaultButtons(Search.searchPageButtonList);
        
        pageBuild.build();
        const searchMessage = await interaction.channel.send(`Please type a number from the search results!`);
        
        interaction.channel.awaitMessages({filter: m => m.author.id == interaction.member.user.id, max: 1, time: 60 * 1000}).then(async collected => {
            const isResponseNumber = Number(collected.first().content) ? true : false;
        
            if(isResponseNumber) {
                const responseNumber = Number(collected.first().content);
                const responseFinalResult = mappedSearch[responseNumber - 1];
                const responseShoukakuTrack = search.tracks[responseNumber - 1];

                const dispatcher = await this.client.queue.handle(interaction.guild, interaction.member, interaction.channel, node, responseShoukakuTrack);
                await interaction.channel.send(`Adding **${responseFinalResult.full_title}** to the queue!`);
                
                dispatcher?.play();
                

                await searchMessage.delete();
                pageBuild.stopListen();
                try {
                    await collected.first().delete(); //Needs MANAGE_MESSAGES permission to not error
                } catch (error) { return null; }
            }else{
                await interaction.channel.send('Operation canceled, the response you gave was not a number from the results.');
            }    
        }).catch(() => null);
    }
}
module.exports = Search;