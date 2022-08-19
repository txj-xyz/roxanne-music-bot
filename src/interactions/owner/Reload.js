const { EmbedBuilder } = require('discord.js');
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class Reload extends RoxanneInteraction {
    get name() {
        return 'reload';
    }

    get description() {
        return 'Live reload all commands!';
    }

    get permissions() {
        return 'OWNER';
    }

    get options() {
        return [];
    }

    async run({ interaction }) {
        await interaction.deferReply({ ephemeral: true });
        let embed, stashed;

        try {
            stashed = this.client.interactions;
            this.client.interactions.rebuild();

            embed = new EmbedBuilder()
                .setColor(this.client.color)
                .setTitle('Reload complete !')
                .setDescription(`Successfully live reloaded ${this.client.interactions.commands.size} commands!`)
                .setTimestamp()
                .setFooter({ text: this.client.user.username, iconURL: this.client.user.displayAvatarURL() });
        } catch (error) {
            this.client.logger.error(error);
            this.client.interactions = stashed;

            embed = new EmbedBuilder()
                .setColor(0xff99cc)
                .setTitle('Something went wrong!')
                .setDescription('Live reload failed, I will attempt to continue with the previous state.')
                .addFields([
                    {
                        name: 'Error output',
                        value: `\`\`\`${error}\`\`\``,
                    },
                ])
                .setTimestamp()
                .setFooter({ text: this.client.user.username, iconURL: this.client.user.displayAvatarURL() });
        } finally {
            await interaction.editReply({ embeds: [embed] });
        }
    }
}
module.exports = Reload;
