const { readdirSync } = require('fs');
const { MessageEmbed } = require('discord.js');
const { Collection } = require('@discordjs/collection');
const EventEmitter = require('events');

class InteractionHandler extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.commands = new Collection();
        this.built = false;
        this.on('error', (error) => client.logger.error(error));
        this.client.on('interactionCreate', (interaction) => this.exec(interaction));
    }

    static checkPermission(permissions, interaction, client) {
        if (permissions.includes('OWNER')) return client.util.config.owners.includes(interaction.user.id);
        else return interaction.channel.permissionsFor(interaction.member).has(permissions);
    }

    build() {
        if (this.built) return this;
        const directories = readdirSync(`${this.client.location}/src/interactions`, { withFileTypes: true });
        for (const directory of directories) {
            if (!directory.isDirectory()) continue;
            const commands = readdirSync(`${this.client.location}/src/interactions/${directory.name}`, { withFileTypes: true });
            for (const command of commands) {
                if (!command.isFile()) continue;
                const Interaction = require(`${this.client.location}/src/interactions/${directory.name}/${command.name}`);
                const Command = new Interaction(this.client);
                Command.category = directory.name.charAt(0).toUpperCase() + directory.name.substring(1);
                this.commands.set(Command.name, Command);
<<<<<<< HEAD
                this.client.logger.debug(this.constructor.name, `\tCommand '${Command.name}' loaded (@${Command.uid})`);
=======
                builtFiles.push(`\tCommand '${Command.name}' loaded (@${Command.uid})`);
                // this.client.logger.debug(this.constructor.name, `\tCommand '${Command.name}' loaded (@${Command.uid})`);
>>>>>>> 151032177e4e0745bc7a6c4795f66479a51d727d
            }
        }
        this.client.logger.log(this.constructor.name, `Loaded ${this.commands.size} interaction client command(s)`, builtFiles.toString());
        this.built = true;
        return this;
    }

    /**
     * WARNING : The lack of a proper deep-clone in NodeJS, or of any working polyfills makes
     * such operations of 'self-replacement' vulnerable to errors, for that the previous state
     * cannot be stashed and popped back in case of error. Thus, this should only be used as a
     * development tool and not be available to actual users, even admins.
     */
    rebuild() {
        this.client.logger.log(this.constructor.name, '---- Live reload triggered ----');

        // let stashed = this.commands;
        try {
            this.commands = new Collection();
            this.built = false;

            // Node's require() keeps a cache, which we wanna clear prior to reloading the modules
            Object.keys(require.cache).forEach(function (key) {
                delete require.cache[key];
            });

            this.build();
        } catch (error) {
            // this.commands = stashed;
            // In case of failure, the special Reload command is still made avaiable
            const ReloadInteraction = require(`${this.client.location}/src/interactions/info/Reload.js`);
            const ReloadCommand = new ReloadInteraction(this.client);
            this.commands.set(ReloadCommand.name, ReloadCommand);
            this.client.logger.error(this.constructor.name, `Failed to reload commands ! '/reload' was still loaded, fix the issue and reload!\nError : ${error}`);
            throw error;
        }

        this.client.logger.log(this.constructor.name, '---- Live reload completed ----');
        return this; // For the sake of transparency, this behaves just as build()
    }

    async update(guildId) {
        if (!this.client.application?.owner) await this.client.application?.fetch();
        const commands = this.commands.map((command) => command.interactionData);
        if (!guildId) {
            // global command
            await this.client.application?.commands.set(commands);
            this.client.logger.debug(this.constructor.name, `Updated ${commands.size} interaction command(s) [Discord Side]`);
        } else {
            // guild specific command for testing
            await this.client.guilds.cache.get(guildId)?.commands.set(commands);
            this.client.logger.debug(this.constructor.name, `Updated ${this.commands.size} interaction command(s) [Discord Side]`);
        }
    }

    async exec(interaction) {
        try {
            if (interaction.isCommand() || interaction.isContextMenu()) {
                const command = this.commands.get(interaction.commandName);
                const dispatcher = this.client.queue.get(interaction.guildId);

                if (!command) return;

                // no perms check before run
                if (command.permissions && !InteractionHandler.checkPermission(command.permissions, interaction, this.client)) {
                    return interaction.reply({
                        content: "You don't have the required permissions to use this command!",
                        ephemeral: true,
                    });
                }

                // player related stuff
                if (command.playerCheck?.voice && !interaction.member.voice.channelId)
                    return interaction.reply({
                        content: 'You are not in a voice channel!',
                        ephemeral: true,
                    });

                // manual checking for stop command acting as a `/leave` command override
                if (interaction.commandName === 'stop' && this.client.util.config.foreverMode) {
                    // const botVoice = (await interaction.guild.voiceStates.cache.get(this.client.user.id)) || null;
                    this.client.logger.log(this.constructor.name, `Executing ${command.type ? 'context' : 'command'} ${command.name} (@${command.uid})`);
                    await command.run({ interaction });
                    this.client.commandsRun++;
                    return;
                }

                if (command.playerCheck?.dispatcher && !dispatcher) {
                    return interaction.reply({
                        content: 'Nothing is playing in this server!',
                        ephemeral: true,
                    });
                }

                if (command.playerCheck?.channel && dispatcher.player.connection.channelId !== interaction.member.voice.channelId) {
                    return interaction.reply({
                        content: "You are not in the same voice channel I'm currently connected to!",
                        ephemeral: true,
                    });
                }

                // general interaction commands
                this.client.logger.log(this.constructor.name, `Executing ${command.type ? 'context' : 'command'} ${command.name} (@${command.uid})`);
                await command.run({ interaction, dispatcher });
                this.client.commandsRun++;
            }
        } catch (error) {
            const embed = new MessageEmbed()
                .setColor(0xff99cc)
                .setTitle('Something errored!')
                .setDescription(`\`\`\`js\n ${error.toString()}\`\`\``)
                .setTimestamp()
                .setFooter(this.client.user.username, this.client.user.displayAvatarURL());
            this.client.logger.log(this.constructor.name, `Something errored! \`${error.toString()}\``);

            if (interaction.replied || interaction.deferred) await interaction.editReply({ embeds: [embed] }).catch((error) => this.emit('error', error));
            else await interaction.reply({ embeds: [embed] }).catch((error) => this.emit('error', error));
            this.emit('error', error);
        }
    }
}

module.exports = InteractionHandler;
