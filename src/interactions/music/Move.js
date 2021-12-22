const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class Move extends RoxanneInteraction {
    get name() {
        return 'move';
    }

    get description() {
        return "Join the current voice channel you're in!";
    }

    get playerCheck() {
        return { voice: true, dispatcher: true, channel: false };
    }

    async run({ interaction }) {
        await interaction.deferReply();
        const botVoice =
            (await interaction.guild.voiceStates.cache.get(
                this.client.user.id
            )) || null;
        const userVoice =
            (await interaction.guild.voiceStates.cache.get(
                interaction.user.id
            )) || null;
        const botVoiceID = botVoice?.channelId;
        const userVoiceID = userVoice?.channelId;
        await interaction.editReply('Moving channels!');
        botVoice
            .setChannel(userVoiceID)
            .then(async () => {
                await interaction.editReply(
                    `Moving from <#${botVoiceID}> to <#${userVoiceID}>`
                );
            })
            .catch(async (err) => {
                return await interaction.editReply(
                    'I am missing `MOVE_MEMBER` Permissions and or I cannot see the channel you are trying to move me to!'
                );
            });
    }
}
module.exports = Move;
