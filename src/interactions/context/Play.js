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

        const messageFind = [
            fetchMessage.embeds[0]?.url.match(PlayContext.regexArray[0])?.[0] || fetchMessage.embeds[0]?.url.match(PlayContext.regexArray[1])?.[0] || null,
            fetchMessage.content.match(PlayContext.regexArray[0])?.[0] || fetchMessage.content.match(PlayContext.regexArray[1])?.[0] || null,
        ];
        if (messageFind.every((element) => element === null)) {
            return await interaction.reply({
                content: 'No song / playlist found, please find a message with a video / playlist or a link in a message!',
                ephemeral: true,
            });
        }

        for (const msg of messageFind) {
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
module.exports = PlayContext;
