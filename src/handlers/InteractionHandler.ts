import { readdirSync } from 'fs';
import { EmbedBuilder, Collection, Interaction } from 'discord.js';
import Bot from '../Bot';
import BotInteraction from '../types/BotInteraction';
import EventEmitter = require('events');

export default interface InteractionHandler {
    client: Bot;
    commands: Collection<string, BotInteraction>;
    built: Boolean;
}

export default class InteractionHandler extends EventEmitter {
    constructor(client: Bot) {
        super();
        this.commands = new Collection();
        this.built = false;
        this.client = client;
        this.on('error', (error: unknown) => client.logger.error({ error: error }, true));
        this.client.on('interactionCreate', (interaction: Interaction): Promise<any> => this.exec(interaction));
    }

    build() {
        if (this.built) return this;
        const directories = readdirSync(`${this.client.location}/src/interactions`, { withFileTypes: true });
        for (const directory of directories) {
            if (!directory.isDirectory()) continue;
            const commands = readdirSync(`${this.client.location}/src/interactions/${directory.name}`, { withFileTypes: true });
            for (const command of commands) {
                if (!command.isFile()) continue;
                if (!command.name.endsWith('.ts')) continue;
                import(`${this.client.location}/src/interactions/${directory.name}/${command.name}`).then((interaction) => {
                    const Command: BotInteraction = new interaction.default(this.client);
                    Command.category = directory.name.charAt(0).toUpperCase() + directory.name.substring(1);
                    this.commands.set(Command.name, Command);
                    this.client.logger.log({ message: `Command '${Command.name}' loaded`, handler: this.constructor.name }, false);
                });
            }
        }
        return this;
    }

    // This method will check a `string[]` for name strings
    public checkPermissionName(interaction: Interaction, role_name: string[]): boolean {
        if (!interaction.inCachedGuild()) return false;
        if (this.client.util.config.owners.includes(interaction.user.id)) return true; // if any owner bypass perms check
        const _checkRoleName: boolean[] = role_name.map((role_string) => interaction.member.roles.cache.some((role) => role.name === role_string));
        const _containsRole: boolean = _checkRoleName.some((role) => role === true);
        return _containsRole;
    }

    public checkPermissionID(interaction: Interaction, role_id: string[]): boolean {
        if (!interaction.inCachedGuild()) return false;
        if (this.client.util.config.owners.includes(interaction.user.id)) return true; // if any owner bypass perms check
        const _checkRoleID: boolean[] = role_id.map((role_id) => interaction.member.roles.cache.some((role) => role.id === role_id));
        const _containsRole: boolean = _checkRoleID.some((role) => role === true);
        return _containsRole;
    }

    private errorEmbed(error: any): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(0xff99cc)
            .setTitle('Something errored!')
            .setDescription(`\`\`\`js\n ${error.toString()}\`\`\``)
            .setTimestamp()
            .setFooter({ text: this.client.user?.username ?? '', iconURL: this.client.user?.displayAvatarURL() });
    }

    async exec(interaction: Interaction): Promise<any> {
        if (interaction.isCommand() && interaction.isRepliable() && interaction.inCachedGuild()) {
            try {
                const command = this.commands.get(interaction.commandName);
                if (!command) return;
                switch (command.permissions) {
                    case 'OWNER':
                        if (interaction.isRepliable() && !this.client.util.config.owners.includes(interaction.user.id)) {
                            this.client.logger.log(
                                {
                                    message: `Attempted restricted permissions. { command: ${command.name}, user: ${interaction.user.username}, channel: ${interaction.channel} }`,
                                    handler: this.constructor.name,
                                },
                                true
                            );
                            return await interaction.reply({ content: 'You do not have permissions to run this command. This incident has been logged.', ephemeral: true });
                        }
                        break;
                    default:
                        break;
                }

                this.client.logger.log(
                    {
                        handler: this.constructor.name,
                        user: `${interaction.user.username} | ${interaction.user.id}`,
                        message: `Executing Command ${command.name}`,
                    },
                    true
                );

                await command.run(interaction);
                this.client.commandsRun++;
            } catch (error: any) {
                this.client.logger.error(
                    {
                        handler: this.constructor.name,
                        message: 'Something errored!',
                        error: error.stack,
                    },
                    true
                );

                // This section will attempt to catch all errors coming from the bots and feed back to the channel
                try {
                    interaction.reply({ embeds: [this.errorEmbed(error)] });
                } catch {}
                try {
                    interaction.editReply({ embeds: [this.errorEmbed(error)] });
                } catch {}
                try {
                    interaction.followUp({ embeds: [this.errorEmbed(error)] });
                } catch {}
            }
        }
    }
}
