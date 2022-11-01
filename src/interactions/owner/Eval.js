const { EmbedBuilder } = require('discord.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { inspect } = require('util');
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class Eval extends RoxanneInteraction {
    get name() {
        return 'eval';
    }

    get description() {
        return 'Evaluate code in the scope of Eval#Class';
    }

    get permissions() {
        return 'OWNER';
    }

    get options() {
        return [
            {
                name: 'code',
                type: ApplicationCommandOptionType.String,
                description: 'The code you want me to evaluate',
                required: true,
            },
        ];
    }

    static trim(string, max) {
        return string.length > max ? string.slice(0, max) : string;
    }

    async run({ interaction }) {
        await interaction.deferReply({ ephemeral: false });
        const code = interaction.options.getString('code', true);
        let res;
        try {
            res = await eval(code);
            res = inspect(res, { depth: 0 });
        } catch (error) {
            res = inspect(error, { depth: 0 });
        }
        const embed = new EmbedBuilder()
            .setColor(this.client.color)
            .setTitle('Eval Results')
            .setDescription(`\`\`\`js\n${Eval.trim(res, 4000)}\`\`\``)
            .setTimestamp()
            .setFooter({ text: this.client.user.username, iconURL: this.client.user.displayAvatarURL() });
        await interaction.editReply({ embeds: [embed] });
    }
}
module.exports = Eval;
