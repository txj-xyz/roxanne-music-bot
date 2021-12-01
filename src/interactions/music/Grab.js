
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
        return { voice: false, dispatcher: true, channel: false };
    }

    async run({ interaction, dispatcher }) {
        await interaction.deferReply({ ephemeral: true });
        const embed = new MessageEmbed()
            .setColor(this.client.color)
            .setTitle('Now Playing')
            .setThumbnail(`https://img.youtube.com/vi/${dispatcher.current.info.identifier}/default.jpg`)
            .setDescription(`[${dispatcher.current.info.author} - ${dispatcher.current.info.title}](${dispatcher.current.info.uri}) [${KongouDispatcher.humanizeTime(dispatcher.current.info.length)}]`);
        await interaction.editReply({ embeds: [ embed ] });
    }
}
module.exports = Grab;