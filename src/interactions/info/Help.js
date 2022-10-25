const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const RoxanneInteraction = require('../../abstract/RoxanneInteraction.js');

class Help extends RoxanneInteraction {
    get name() {
        return 'help';
    }

    get description() {
        return 'Want to see my commands and how to use them?';
    }

    get options() {
        return [
            {
                name: 'command',
                type: ApplicationCommandOptionType.String,
                description: 'Specific command help',
                // choices: this.client.commands.map((command) => ({ name: command.name, value: command.description })),
                // choices: this.client.interactions.commands.filter((cmd) => cmd.category !== 'Context').map((cmd) => ({ name: cmd.name, value: cmd.description })),
            },
        ];
    }

    static invite(id) {
        return `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=414518209792&scope=bot%20applications.commands`;
    }

    async run({ interaction }) {
        let command = interaction.options.getString('command');
        if (command?.startsWith('/')) command = command.slice(1);

        if (!command) {
            const supportButton = new ActionRowBuilder().addComponents(
                [new ButtonBuilder().setEmoji('❓').setStyle(ButtonStyle.Link).setURL(this.client.util.supportServer).setLabel('Support Server')],
                [new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(Help.invite(this.client.user.id)).setLabel('Invite me!')]
            );

            const embed = new EmbedBuilder()
                .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL() })
                .setTitle('• Help Menu')
                .setColor(this.client.color)
                .setDescription('Do `/help [command]` for a detailed help about that command')
                .addFields([
                    {
                        name: '❓ Info',
                        value: `${this.client.interactions.commands
                            .filter((cmd) => cmd.category === 'Info')
                            .map((cmd) => `\`/${cmd.name}`)
                            .join('`, ')}\``,
                    },
                    {
                        name: '🎵 Music',
                        value: `${this.client.interactions.commands
                            .filter((cmd) => cmd.category === 'Music')
                            .map((cmd) => `\`/${cmd.name}`)
                            .join('`, ')}\``,
                    },
                    {
                        name: '🔗 GIF Tutorial',
                        value: '[Full Size Link](https://i.imgur.com/yM1Q2eB.gif)',
                    },
                ])
                .setImage('https://i.imgur.com/yM1Q2eB.gif')
                .setFooter({ text: `The Music Project • ${this.client.interactions.commands.size} commands loaded` });
            return interaction.reply({
                embeds: [embed],
                components: [supportButton],
            });
        }

        command = this.client.interactions.commands.get(command);
        if (!command) {
            const commandNotFound = new EmbedBuilder()
                .setColor(this.client.color)
                .setTitle('❗ Command Not Found')
                .addFields([
                    {
                        name: 'Help Usage',
                        value: '`/help command:grab` or `/help`',
                    },
                    {
                        name: '🔗 GIF Tutorial',
                        value: '[Full Size Link](https://i.imgur.com/yM1Q2eB.gif)',
                    },
                ])
                .setImage('https://cdn.discordapp.com/attachments/849007348945256458/918235109319122944/GNuAN6Ds1HxKRgCX1ykM.gif')
                .setFooter({ text: 'The Music Project • Powered by Kubernetes!' });
            return interaction.reply({
                embeds: [commandNotFound],
                ephemeral: true,
            });
        }
        const embed = new EmbedBuilder()
            .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL() })
            .setTitle(`/${command.name}`)
            .setColor(this.client.color)
            .setDescription(command.description)
            .setFooter({ text: `The Music Project • ${this.client.interactions.commands.size} commands loaded` });
        if (command.options?.length) {
            for (const option of command.options) embed.addFields({ name: `/${command.name} ${option.name}`, value: option.description });
        }
        return interaction.reply({ embeds: [embed] });
    }
}
module.exports = Help;
