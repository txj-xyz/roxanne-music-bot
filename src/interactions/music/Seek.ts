const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');

class Seek extends RoxanneInteraction {
    get name() {
        return 'seek';
    }

    get description() {
        return 'Seeks the current song to the positon you like!';
    }

    get playerCheck() {
        return { voice: true, dispatcher: true, channel: true };
    }

    static ParseHumanTime(str) {
        let Parsed;
        try {
            Parsed = require('../../modules/parseTimestring.js')(str);
            return Parsed;
        } catch {
            Parsed = false;
            return Parsed;
        }
    }

    get options() {
        return [
            {
                name: 'position',
                type: ApplicationCommandOptionType.String,
                description: "<number s/m/h> 'e.g: 50m 20s'",
                required: true,
            },
        ];
    }

    async run({ interaction, dispatcher }) {
        await interaction.deferReply();
        const seekPositonString = interaction.options.getString('position', true);
        const seekResolvedString = Seek.ParseHumanTime(seekPositonString) * 1000;

        if (dispatcher.current.info.isSeekable) {
            if (seekResolvedString > dispatcher.current.info.length) {
                return await interaction.editReply('The seek requested is longer than the song! I cannot do that!');
            } else {
                await dispatcher.player.seekTo(seekResolvedString);
                await interaction.editReply(`Seeked to \`${this.client.util.humanizeTime(seekResolvedString)}\`!`);
            }
        } else {
            return await interaction.editReply('Sorry human this song is not seekable!');
        }
    }
}
module.exports = Seek;
