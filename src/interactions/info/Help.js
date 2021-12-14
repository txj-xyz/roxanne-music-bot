const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
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
        return [{
            name: 'command',
            type: ApplicationCommandOptionType.String,
            description: 'Specific command help'
        }];
    }

    static invite(id) {
        return `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=139623484672&scope=bot%20applications.commands`;
    }
    static supportServer() {
        return 'https://discord.gg/2EE8a3dmxU';
    }

    async run({ interaction }) {
        let command = interaction.options.getString('command');
        if(command?.startsWith('/'))
            command = command.slice(1);

        if (!command) {
            const supportButton = new MessageActionRow()
                .addComponents(
                    [
                        new MessageButton()
                            .setEmoji('❓')
                            .setStyle('LINK')
                            .setURL(Help.supportServer())
                            .setLabel('Support Server')
                    ],
                    [
                        new MessageButton()
                            .setEmoji('🎵')
                            .setStyle('LINK')
                            .setURL('https://statuspage.freshping.io/58439-RoxanneMusicBot')
                            .setLabel('Music Status Page')
                    ],
                    [
                        new MessageButton()
                            .setStyle('LINK')
                            .setURL(Help.invite(this.client.user.id))
                            .setLabel('Invite me!')
                    ],
                );

            const embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                .setTitle('• Help Menu')
                .setColor(this.client.color)
                .setDescription('Do `/help [command]` for a detailed help about that command')
                .addField('❓ Info', `${this.client.interactions.commands.filter(cmd => cmd.category === 'Info').map(cmd => `\`/${cmd.name}`).join('`, ')}\``)
                // .addField('❓ Owner', this.client.interactions.commands.filter(cmd => cmd.category === 'Owner').map(cmd => `/${cmd.name}`).join(', '))
                .addField('🎵 Music', `${this.client.interactions.commands.filter(cmd => cmd.category === 'Music').map(cmd => `\`/${cmd.name}`).join('`, ')}\``)
                .addField('🔗 GIF Tutorial', '[Full Size Link](https://cdn.discordapp.com/attachments/849007348945256458/918183844191014922/r9ChfTujzBcwpE9Ks5y8.gif)')
                .setImage('https://cdn.discordapp.com/attachments/849007348945256458/918183844191014922/r9ChfTujzBcwpE9Ks5y8.gif')
                .setFooter(`The Music Project • ${this.client.interactions.commands.size} commands loaded`);
            return interaction.reply({ embeds: [ embed ], components: [supportButton] });
        }

        command = this.client.interactions.commands.get(command);
        if (!command) {
            const commandNotFound = new MessageEmbed()
                // .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                .setColor(this.client.color)
                .setTitle('❗ Command Not Found')
                // .setDescription('**❗ Command Not Found**, please see below on how to look for help.')
                .addField('Help Usage', '`/help command:grab` or `/help`')
                .addField('🔗 GIF Tutorial', '[Full Size Link](https://cdn.discordapp.com/attachments/849007348945256458/918235109319122944/GNuAN6Ds1HxKRgCX1ykM.gif)')
                .setImage('https://cdn.discordapp.com/attachments/849007348945256458/918235109319122944/GNuAN6Ds1HxKRgCX1ykM.gif')
                .setFooter('The Music Project • Powered by Kubernetes!');
            return interaction.reply({ embeds: [ commandNotFound ], ephemeral: true});
        }
        const embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle(`/${command.name}`)
            .setColor(this.client.color)
            .setDescription(command.description)
            .setFooter(`The Music Project • ${this.client.interactions.commands.size} commands loaded`);
        if (command.options?.length) {
            for (const option of command.options)
                embed.addField(`/${command.name} ${option.name}`, option.description);
        }
        return interaction.reply({ embeds: [ embed ] });
    }
}
module.exports = Help;