const RoxanneContext = require('../../abstract/RoxanneContext.js');

class PlayContext extends RoxanneContext {
    get name() {
        return 'Add to Queue!';
    }

    get type() {
        return 3;
    }

    get playerCheck() {
        return { voice: true, dispatcher: false, channel: false };
    }

    static regexArray = [
        /(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track)(?:[/:])([A-Za-z0-9]+).*$/,
        /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
    ];

    async run({ interaction, dispatcher }) {
        if (this.client.queue.get(interaction.guild.id) && dispatcher.player.connection.channelId !== interaction.member.voice.channelId) {
            return await interaction.reply({
                content: "You are not in the same voice channel I'm currently connected to!",
                ephemeral: true,
            });
        }
        let linkFound = null;
        const fetchMessage = await interaction.channel.messages.fetch(interaction.targetId);

        let embedMatchString;
        embedMatchString = null;
        if (fetchMessage.embeds?.[0]) {
            Object.values(fetchMessage.embeds?.[0]).forEach((k) => {
                if (typeof k === 'string' && k?.match(PlayContext.regexArray[0])) {
                    embedMatchString = k?.match(PlayContext.regexArray[0])?.[0].replace(/[()\ \s]+/g, '');
                } else if (typeof k === 'string' && k?.match(PlayContext.regexArray[1])) {
                    embedMatchString = k?.match(PlayContext.regexArray[1])?.[0].replace(/[()\ \s]+/g, '');
                }
            });
        }

        let messageFind;
        //prettier-ignore
        messageFind = [
            embedMatchString,
            fetchMessage.content.match(PlayContext.regexArray[0])?.[0] || fetchMessage.content.match(PlayContext.regexArray[1])?.[0] || null,
        ];
        if (messageFind.every((element) => element === null)) {
            return await interaction.reply({
                content: 'No song / playlist found, please find a message with a video / playlist or a link in a message!',
                ephemeral: true,
            });
        }

        if (messageFind.every((element) => element !== null)) {
            messageFind = messageFind[1];
            console.log('match all', messageFind);

            PlayContext.regexArray.forEach(async (v, i) => {
                const match = messageFind.match(v);
                if (match) {
                    linkFound = match[0];
                    switch (i) {
                        case 0: {
                            await interaction.deferReply({
                                ephemeral: false,
                            });
                            this.client.interactions.commands.get('play').buttonSpotifyPlaylist(interaction, linkFound);
                            break;
                        }
                        case 1: {
                            await interaction.deferReply({
                                ephemeral: false,
                            });
                            this.client.interactions.commands.get('play').buttonYoutubePlaylist(interaction, linkFound, false);
                            break;
                        }
                    }
                }
            });
        } else {
            for (const msg of messageFind) {
                console.log(msg);
                if (msg !== null) {
                    PlayContext.regexArray.forEach(async (v, i) => {
                        const match = msg.match(v);
                        if (match) {
                            linkFound = match[0];
                            switch (i) {
                                case 0: {
                                    await interaction.deferReply({
                                        ephemeral: false,
                                    });
                                    this.client.interactions.commands.get('play').buttonSpotifyPlaylist(interaction, linkFound);
                                    break;
                                }
                                case 1: {
                                    await interaction.deferReply({
                                        ephemeral: false,
                                    });
                                    this.client.interactions.commands.get('play').buttonYoutubePlaylist(interaction, linkFound, false);
                                    break;
                                }
                            }
                        }
                    });
                }
            }
        }
    }
}
module.exports = PlayContext;
