const { MessageEmbed } = require('discord.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class Say extends RoxanneInteraction {
    get name() {
        return 'say';
    }

    get description() {
        return 'Send a message as the bot user!';
    }

    get permissions() {
        return 'OWNER';
    }

    get options() {
        return [
            {
                name: 'message',
                type: ApplicationCommandOptionType.String,
                description: 'The message you want me to say!',
                required: true,
            },
        ];
    }

    async run({ interaction }) {
        await interaction.deferReply({ ephemeral: true });
        const message = interaction.options.getString('message', true);
        await interaction.channel.send(message);
        await interaction.editReply(`Sent Message: \`\`\`\n${message}\n\`\`\``);
        this.client.logger.log(this.constructor.name, `Sent Message`, {
            message: message,
            user: interaction.user.username,
            userID: interaction.user.id
        });
    }
}
module.exports = Say;
