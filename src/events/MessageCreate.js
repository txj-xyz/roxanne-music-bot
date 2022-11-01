const RoxanneEvent = require('../abstract/RoxanneEvent.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, MessageAttachment, ButtonStyle } = require('discord.js');
const { getVideoMeta } = require('tiktok-scraper');
const { readdirSync } = require('fs');

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

        const helpEmbed = new EmbedBuilder()
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
            ])
            .addFields([
                {
                    name: '🎵 Music',
                    value: `${this.client.interactions.commands
                        .filter((cmd) => cmd.category === 'Music')
                        .map((cmd) => `\`/${cmd.name}`)
                        .join('`, ')}\``,
                },
            ])
            .addFields([{ name: '🔗 GIF Tutorial', value: '[Full Size Link](https://i.imgur.com/yM1Q2eB.gif)' }])
            .setImage('https://i.imgur.com/yM1Q2eB.gif')
            .setFooter({ text: `The Music Project • ${this.client.interactions.commands.size} commands loaded` });

        const supportButton = new ActionRowBuilder().addComponents(
            [new ButtonBuilder().setEmoji('❓').setStyle(ButtonStyle.Link).setURL(this.client.util.supportServer).setLabel('Support Server')],
            [new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(this.client.util.config.inviteURL).setLabel('Invite me!')]
        );

        // slash command handler
        if (this.client.util.config.owners.includes(message.author.id) && message.content.startsWith(`<@${this.client.user.id}> build`)) {
            if (message.content.match(/help/gi)) {
                const buildUsage = [
                    '`build` - Build Server Commands',
                    '`build help` - Shows this message',
                    '`build global` - Build Global Commands',
                    '`build removeall` - Remove Global Commands',
                    '`build guild removeall` - Remove Server Commands',
                ];
                return message.reply({ content: buildUsage.join('\n') });
            }

            if (message.content.match(/removeall/gi)) {
                // remove only the guilds commands
                if (message.content.match(/guild/gi))
                    await message.guild.commands.set([]).catch((err) => {
                        this.client.logger.error({ error: err.stack }, err.stack);
                        message.react('❎');
                    });
                // remove all slash commands globally
                else
                    await this.client.application.commands.set([]).catch((err) => {
                        this.client.logger.error({ error: err.stack }, err.stack);
                        message.react('❎');
                    });
                return message.reply({ content: 'Done' });
            }
            let data = [];
            for (const directory of readdirSync(`${this.client.location}/src/interactions`, { withFileTypes: true })) {
                if (!directory.isDirectory()) continue;
                for (const command of readdirSync(`${this.client.location}/src/interactions/${directory.name}`, { withFileTypes: true })) {
                    if (!command.isFile()) continue;
                    const Interaction = require(`${this.client.location}/src/interactions/${directory.name}/${command.name}`);
                    data.push(new Interaction({}).interactionData);
                }
            }
            if (message.content.match(/global/gi)) {
                if (!this.client.application) return message.reply({ content: `There is no client.application?` });
                let res = await this.client.application.commands.set(data).catch((e) => e);
                if (res instanceof Error) return this.client.logger.error({ error: res.stack }, res.stack);
                return message.reply({ content: `Deploying (**${data.length.toLocaleString()}**) slash commands, this could take up to 1 hour` });
            }
            let res = await message.guild.commands.set(data).catch((e) => e);
            if (res instanceof Error) return this.client.logger.error({ error: res.stack }, res.stack);
            return message.reply({ content: `Deploying (**${data.length.toLocaleString()}**) slash commands` });
        }

        // Nickname util
        if (this.client.util.config.owners.includes(message.author.id) && message.content.startsWith(`<@${this.client.user.id}> nick`)) {
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
        if (this.client.util.config.tiktokMessageEvent && message.content.match(/https:\/\/(www.|vt.)tiktok\.com/g)) {
            const tiktokLink = message.content.match(/(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g)[0];
            try {
                const resolvedLink = await this.client.util.unshortenLink(tiktokLink);
                const videoMeta = await getVideoMeta(resolvedLink, {});
                const videoMetaEmbed = new EmbedBuilder()
                    .setColor(this.client.color)
                    .setURL(resolvedLink)
                    .setTitle(`"${videoMeta.collector[0]?.text.substring(0, 254)}"`, null, resolvedLink)
                    .addFields([
                        {
                            name: '**Likes**',
                            value: String(this.client.util.convertNumToInternational(videoMeta.collector[0]?.diggCount)),
                            inline: true,
                        },
                        {
                            name: '**Views**',
                            value: String(this.client.util.convertNumToInternational(videoMeta.collector[0]?.diggCount)),
                            inline: true,
                        },
                        {
                            name: '**Comments**',
                            value: String(this.client.util.convertNumToInternational(videoMeta.collector[0]?.commentCount)),
                            inline: true,
                        },
                    ])
                    .setFooter({ text: `Uploaded: ${new Date(videoMeta.collector[0]?.createTime * 1000).toLocaleString()}` });
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
