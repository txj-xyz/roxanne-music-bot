const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const RoxanneDispatcher = require('../../modules/RoxanneDispatcher.js');
const { MessageEmbed } = require('discord.js');

class Grab extends RoxanneInteraction {
    get name() {
        return 'grab';
    }

    get description() {
        return 'Grabs the current song and sends it to you!';
    }

    async run({ interaction }) {
        await interaction.deferReply({ ephemeral: true });

        const dispatcher = this.client.queue.get(interaction.guild.id) || undefined;
        if (!dispatcher) return await interaction.editReply('There is nothing playing at the moment.');
        const embed = new MessageEmbed()
            .setAuthor('Song saved', this.client.user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(`https://img.youtube.com/vi/${dispatcher.current.info.identifier}/default.jpg`)
            .setURL(dispatcher.current.info.uri)
            .setColor(this.client.color)
            .setTitle(`**${dispatcher.current.info.title}**`)
            .addField('⌛ Duration: ', `\`${this.client.util.humanizeTime(dispatcher.current.info.length)}\``, true)
            .addField('🎵 Author: ', `\`${dispatcher.current.info.author}\``, true)
            .addField('▶ Play it:', `\`/play query:${dispatcher.current.info.uri}\``)
            .addField('🔎 Saved in:', `<#${interaction.channelId}>`)
            .setTimestamp();

        // Open DM Channel with user
        await interaction.user.createDM();

        // Send song embed
        try {
            await interaction.user.dmChannel.send({ embeds: [embed] });
            await interaction.editReply('I sent you the current song, check your DMs!');
        } catch (error) {
            await interaction.editReply("I'm sorry, your DMs are currently disabled, I cannot send you a message!");
        }

        // Close DM Channel with user
        await interaction.user.deleteDM();
    }
}
module.exports = Grab;
