const RoxanneEvent = require('../abstract/RoxanneEvent.js');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

class MessageCreate extends RoxanneEvent {
    get name() {
        return 'messageCreate';
    }

    get once() {
        return false;
    }
    static invite(id) {
        return `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=139623484672&scope=bot%20applications.commands`;
    }
    static supportServer() {
        return 'https://discord.gg/2EE8a3dmxU';
    } 

    async run(message) {
        const helpEmbed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('• Help Menu')
            .setColor(this.client.color)
            .setDescription('Do `/help [command]` for a detailed help about that command')
            .addField('❓ Info', `${this.client.interactions.commands.filter(cmd => cmd.category === 'Info').map(cmd => `\`/${cmd.name}`).join('`, ')}\``)
            .addField('🎵 Music', `${this.client.interactions.commands.filter(cmd => cmd.category === 'Music').map(cmd => `\`/${cmd.name}`).join('`, ')}\``)
            .addField('🔗 GIF Tutorial', '[Full Size Link](https://cdn.discordapp.com/attachments/849007348945256458/918183844191014922/r9ChfTujzBcwpE9Ks5y8.gif)')
            .setImage('https://cdn.discordapp.com/attachments/849007348945256458/918183844191014922/r9ChfTujzBcwpE9Ks5y8.gif')
            .setFooter(`The Music Project • ${this.client.interactions.commands.size} commands loaded`);

        const supportButton = new MessageActionRow()
            .addComponents(
                [
                    new MessageButton()
                        .setEmoji('❓')
                        .setStyle('LINK')
                        .setURL(MessageCreate.supportServer())
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
                        .setURL(MessageCreate.invite(this.client.user.id))
                        .setLabel('Invite me!')
                ],
            );
        if(!['918662128632733696', '714232432672505928'].includes(message.guild.id)) return;
        if(message.content.startsWith('/')){
            const findCommand = message.content.slice(1).split(' ')[0];
            if(this.client.interactions.commands.get(findCommand)){
                await message.reply({content: 'I see you are looking for some help! Check this message for more information!', embeds: [helpEmbed], components: [supportButton]});
            }
        }
    }
}
module.exports = MessageCreate;
