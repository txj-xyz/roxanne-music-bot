const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');

class Ping extends RoxanneInteraction {
    get name() {
        return 'ping';
    }

    get description() {
        return 'Basic pongy command!';
    }

    async run({ interaction }) {
        // const pingTime = Date.now();
        // await interaction.deferReply({ ephemeral: true });
        // await interaction.editReply(`Took \`${Date.now() - pingTime}ms\``);
        const modal = new Modal().setCustomId('yt-search-modal').setTitle('YouTube Query');
        const songSearchInput = new TextInputComponent().setCustomId('songSearchInput').setLabel('What would you like to search?').setStyle('SHORT');
        const firstActionRow = new MessageActionRow().addComponents(songSearchInput);
        modal.addComponents(firstActionRow);
        await interaction.showModal(modal);
    }
}
module.exports = Ping;
