const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

class RadioMenu extends RoxanneInteraction {
    get name() {
        return 'radio';
    }

    get description() {
        return 'Stream live the radio!';
    }

    get playerCheck() {
        return { voice: true, dispatcher: false, channel: false };
    }

    async run({ interaction }) {
        await interaction.deferReply();
        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('radio_menu')
                .setPlaceholder('Nothing selected')
                .addOptions([
                    {
                        label: 'Lofi hip-hop',
                        description: 'Beats to relax/study to',
                        value: 'lofi_radio',
                    },
                    {
                        label: 'Coffee Shop lofi beats',
                        description: 'lofi hip-hop beats',
                        value: 'coffee_lofi_radio',
                    },
                    {
                        label: 'The Good Life Radio',
                        description: 'House, Chillout, Study, Gym, Happy Music',
                        value: 'good_life_radio',
                    },
                    {
                        label: 'Drum & Bass Liquid / Chill',
                        description: 'Non-Stop Liquid - To Chill / Relax Too',
                        value: 'dnb_radio',
                    },
                ])
        );
        const currentGuildQueue = this.client.queue.get(interaction.guild.id);
        if (currentGuildQueue) {
            return await interaction.editReply('**Human, Please stop the player or wait for the queue to finish before using this command.**');
        }
        await interaction.editReply({
            content: 'Human! Select a radio station from the drop down!',
            components: [row],
        });
    }
}
module.exports = RadioMenu;
