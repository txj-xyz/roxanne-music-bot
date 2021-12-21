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

    get options() {
        return [];
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

        botVoice.setChannel(userVoiceID).catch(async () => {
            return await interaction.editReply(
                "I'm unable to join your voice channel, I am missing permissions!"
            );
        });

        await interaction.editReply(
            `Moving from <#${botVoiceID}> to <#${userVoiceID}>`
        );
    }
}
module.exports = Move;
