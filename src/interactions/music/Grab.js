
const KongouInteraction = require('../../abstract/KongouInteraction.js');
const KongouDispatcher = require('../../modules/KongouDispatcher.js');
const { MessageEmbed } = require('discord.js');

class Grab extends KongouInteraction {
    get name() {
        return 'grab';
    }

    get description() {
        return 'Grabs the current song and sends it to you!';
    }

    get playerCheck() {
        return { voice: true, dispatcher: true, channel: true };
    }

    async run({ interaction, dispatcher }) {
        await interaction.deferReply({ ephemeral: true });
        const embed = new MessageEmbed()
            .setAuthor(
                `Song saved`,
                this.client.user.displayAvatarURL({
                dynamic: true,
                })
            )
            .setThumbnail(
                `https://img.youtube.com/vi/${dispatcher.current.info.identifier}/default.jpg`
            )
            .setURL(dispatcher.current.info.uri)
            .setColor(this.client.color)
            .setTitle(`**${dispatcher.current.info.title}**`)
            .addField(
                `⌛ Duration: `,
                `\`${KongouDispatcher.humanizeTime(dispatcher.current.info.length)}\``,
                true
            )
            .addField(`🎵 Author: `, `\`${dispatcher.current.info.author}\``, true)
            .addField(
                `▶ Play it:`,
                `\`\/play query:${dispatcher.current.info.uri}\``
            )
            .addField(`🔎 Saved in:`, `<#${interaction.channelId}>`)
            .setTimestamp();

        await interaction.user.createDM();
        await interaction.user.dmChannel.send({embeds: [ embed ]}).then(async() => {
            await interaction.editReply(`I sent you the current song, check your DMs!`);
        }).catch(async error => {
            await interaction.editReply(`I'm sorry, your DMs are currently disabled, I cannot send you a message!`);
        })
    }
}
module.exports = Grab;