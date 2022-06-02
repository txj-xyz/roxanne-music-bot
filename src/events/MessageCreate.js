const RoxanneEvent = require('../abstract/RoxanneEvent.js');
const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
const { getVideoMeta } = require('tiktok-scraper');

class MessageCreate extends RoxanneEvent {
    get name() {
        return 'messageCreate';
    }

    get once() {
        return false;
    }

    get enabled() {
        return true;
    }

    async run(message) {
        if (message.author.bot) return;
        if (this.client.util.config.guildMessageDisabled.includes(message.guild.id)) return;
        const [command, ...args] = message.content.split(' ');

        const helpEmbed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('• Help Menu')
            .setColor(this.client.color)
            .setDescription('Do `/help [command]` for a detailed help about that command')
            .addField(
                '❓ Info',
                `${this.client.interactions.commands
                    .filter((cmd) => cmd.category === 'Info')
                    .map((cmd) => `\`/${cmd.name}`)
                    .join('`, ')}\``
            )
            .addField(
                '🎵 Music',
                `${this.client.interactions.commands
                    .filter((cmd) => cmd.category === 'Music')
                    .map((cmd) => `\`/${cmd.name}`)
                    .join('`, ')}\``
            )
            .addField('🔗 GIF Tutorial', '[Full Size Link](https://cdn.discordapp.com/attachments/849007348945256458/918183844191014922/r9ChfTujzBcwpE9Ks5y8.gif)')
            .setImage('https://cdn.discordapp.com/attachments/849007348945256458/918183844191014922/r9ChfTujzBcwpE9Ks5y8.gif')
            .setFooter(`The Music Project • ${this.client.interactions.commands.size} commands loaded`);

        const supportButton = new MessageActionRow().addComponents(
            [new MessageButton().setEmoji('❓').setStyle('LINK').setURL(this.client.util.supportServer).setLabel('Support Server')],
            [new MessageButton().setStyle('LINK').setURL(this.client.util.invite).setLabel('Invite me!')]
        );

        // Nickname util
        if (message.author.id.includes(this.client.util.config.owners[0]) && message.content.startsWith(`<@!${this.client.user.id}> nick`)) {
            try {
                message.guild.me.setNickname(args.slice(1).join(' ') || null);
            } catch (error) {
                return message.react('❎');
            }
            return message.react('✅');
        }

        // Help message live trigger event
        if (this.client.util.config.helpMessageEvent && message.content.startsWith('/')) {
            const findCommand = message.content.slice(1).split(' ')[0];
            if (this.client.interactions.commands.get(findCommand)) {
                await message.reply({
                    content: 'I see you are looking for some help! Check this message for more information!',
                    embeds: [helpEmbed],
                    components: [supportButton],
                });
            }
        }

        // tiktok mesage event
        if (this.client.util.config.tiktokMessageEvent && message.content.includes('tiktok.com')) {
            const tiktokLink = message.content.match(this.client.util.urlRegex)[0];
            try {
                const resolvedLink = await this.client.util.unshortenLink(tiktokLink);
                const videoMeta = await getVideoMeta(resolvedLink, {});
                const videoMetaEmbed = new MessageEmbed()
                    .setColor(this.client.color)
                    .setURL(resolvedLink)
                    .setTitle(`"${videoMeta.collector[0]?.text.substring(0, 254)}"`, null, resolvedLink)
                    .addField('**Likes**', String(this.client.util.convertNumToInternational(videoMeta.collector[0]?.diggCount)), true)
                    .addField('**Views**', String(this.client.util.convertNumToInternational(videoMeta.collector[0]?.playCount)), true)
                    .addField('**Comments**', String(this.client.util.convertNumToInternational(videoMeta.collector[0]?.commentCount)), true)
                    .setFooter(`Uploaded: ${new Date(videoMeta.collector[0]?.createTime * 1000).toLocaleString()}`);
                await message.reply({ embeds: [videoMetaEmbed], files: [new MessageAttachment(videoMeta.collector[0]?.videoUrl, `tiktok.mp4`)] }).catch((error) => {
                    this.client.logger.error(error, 'Video too Large to send.');
                });
            } catch (error) {
                this.client.logger.error(error, 'Video too Large to send.');
            }
        }
    }
}
module.exports = MessageCreate;
