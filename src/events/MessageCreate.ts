import { Message, SlashCommandBuilder } from 'discord.js';
import BotEvent from '../types/BotEvent';
import { readdirSync } from 'fs';
import BotInteraction from '../types/BotInteraction';

export default class MessageCreate extends BotEvent {
    get name() {
        return 'messageCreate';
    }

    get fireOnce() {
        return false;
    }

    get enabled() {
        return true;
    }

    async run(message: Message): Promise<Message<true> | undefined | void> {
        if (message.author.bot) return;
        if (!message.inGuild()) return;

        // slash command handler
        if (this.client.util.config.owners.includes(message.author.id) && message.content.startsWith(`<@${this.client.user?.id}> build`)) {
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
                    await message.guild?.commands.set([]).catch((err) => {
                        this.client.logger.error({ error: err.stack, handler: this.constructor.name }, true);
                        message.react('❎');
                    });
                // remove all slash commands globally
                else
                    await this.client.application?.commands.set([]).catch((err) => {
                        this.client.logger.error({ error: err.stack, handler: this.constructor.name }, true);
                        message.react('❎');
                    });
                return message.reply({ content: 'Done' });
            }

            const data: SlashCommandBuilder[] = [];
            await this.buildCommands(data);

            // global commands
            if (message.content.match(/global/gi)) {
                if (!this.client.application) return message.reply({ content: `There is no client.application?` }).catch(() => {});
                const res = await this.client.application.commands.set(data).catch((e) => e);
                if (res instanceof Error) return this.client.logger.error({ error: res.stack, handler: this.constructor.name }, true);
                return message
                    .reply({
                        content: `Deploying (**${data.length.toLocaleString()}**) slash commands, This could take up to 1 hour.\n\`\`\`diff\n${data
                            .map((command) => `${command.default_member_permissions === '0' ? '-' : '+'} ${command.name} - '${command.description}'`)
                            .join('\n')}\n\`\`\``,
                    })
                    .catch(() => {});
            }

            // guild commands
            const res = await message.guild.commands.set(data).catch((e) => e);
            if (res instanceof Error) return this.client.logger.error({ error: res.stack, handler: this.constructor.name }, true);
            return message
                .reply({
                    content: `Deploying (**${data.length.toLocaleString()}**) slash commands\n\`\`\`diff\n${data
                        .map((command) => `${command.default_member_permissions === '0' ? '-' : '+'} ${command.name} - '${command.description}'`)
                        .join('\n')}\n\`\`\``,
                })
                .catch(() => {});
        }
    }

    private async buildCommands(data: Array<SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>>) {
        for await (const directory of readdirSync(`${this.client.location}/src/interactions`, { withFileTypes: true })) {
            if (!directory.isDirectory()) continue;
            for await (const command of readdirSync(`${this.client.location}/src/interactions/${directory.name}`, { withFileTypes: true })) {
                if (!command.isFile()) continue;
                if (command.name.endsWith('.ts')) {
                    import(`${this.client.location}/src/interactions/${directory.name}/${command.name}`).then((interaction) => {
                        const Command: BotInteraction = new interaction.default(this.client);
                        data.push(Command.slashData);
                    });
                }
            }
        }
    }
}
