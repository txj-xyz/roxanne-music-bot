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
        return [{
            name: 'message',
            type: ApplicationCommandOptionType.String,
            description: 'The message you want me to say!',
            required: true,
        }];
    }

    async run({ interaction }) {        
        await interaction.deferReply({ephemeral: true});
        const message = interaction.options.getString('message', true);

        // Webhook logging for say command
        const logEmbed = new MessageEmbed()
        .setColor(0xff99CC)
        .setTitle('/say Command used!')
        .setDescription(`\`\`\`\n${message}\`\`\``)
        .addField(`Guild Name`, interaction.guild.name, true)
        .addField(`User Triggered`, interaction.user.username , true)
        .setTimestamp()
        .setFooter(this.client.user.username, this.client.user.displayAvatarURL());

        await interaction.channel.send(message);
        await interaction.editReply(`Sent Message: \`\`\`\n${message}\n\`\`\``);
        await this.client.webhook.send({ embeds: [ logEmbed ] });
    }
}
module.exports = Say;
