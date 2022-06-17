// const { readdirSync } = require('node:fs');
const { Collection } = require('discord.js');
const { EventEmitter } = require('node:events');
const InteractionHandler = require('./InteractionHandler');

class ModalHandler extends InteractionHandler {
    constructor(client) {
        super(client);
        this.client = client;
        this.dispatcher = null;
        this.built = false;
        this.commands = new Collection();
        process.on('uncaughtException', (err) => client.logger.error(err));
        this.on('error', (error) => client.logger.error(error));
        this.on('ModalSubmit', (interaction) => {
            if (interaction.isModalSubmit()) {
                this.exec(interaction);
                this.dispatcher = this.client.queue.get(interaction.guildId) ?? null;
            }
        });
    }

    build() {
        if (this.built) return this;
        if (this.client.interactions.commands.size > 0) this.commands = this.client.interactions.commands;
        else return (this.built = false);
        this.client.logger.debug(this.constructor.name, `Loaded ModalHandler ${this.commands.size} successfully`);
        this.built = true;
        return this;
    }

    static async play(command, interaction, query) {
        command['buttonPlaylistQuery'](interaction, query);
    }

    static async checkAllVoiceRelated(interaction, command, dispatcher) {
        let passedCheck = false;
        const userVoiceJoinable = interaction.member.voice?.channel?.joinable ?? (passedCheck = false);
        const userVoiceChannelLimit = interaction.member.voice?.channel?.userLimit ?? (passedCheck = false);
        const userVoiceChannelUserCount = interaction.member.voice?.channel?.members?.size ?? (passedCheck = false);

        if (command.playerCheck?.voice && !interaction.member.voice.channelId) {
            interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true });
            return (passedCheck = false);
        }
        if (command.playerCheck?.dispatcher && !dispatcher) {
            interaction.reply({ content: 'Nothing is playing in this server!', ephemeral: true });
            return (passedCheck = false);
        }
        if (!dispatcher && !userVoiceJoinable) {
            interaction.reply({ content: "I don't have the required permissions to join that channel!", ephemeral: true });
            return (passedCheck = false);
        }
        if (!dispatcher && userVoiceChannelLimit === userVoiceChannelUserCount) {
            interaction.reply({ content: 'The channel is full and I am unable to join.', ephemeral: true });
            return (passedCheck = false);
        }
        if (command.playerCheck?.channel && dispatcher.player.connection.channelId !== interaction.member.voice.channelId) {
            interaction.reply({ content: "You are not in the same voice channel I'm currently connected to!", ephemeral: true });
            return (passedCheck = false);
        }

        passedCheck = true;
        return passedCheck;
    }

    async exec(modal) {
        if (modal.customId === 'yt-search-modal') {
            const command = this.commands.get('play');
            const searchQuery = modal.fields.getTextInputValue('songSearchInput');
            if (await ModalHandler.checkAllVoiceRelated(modal, command, this.dispatcher)) {
                await ModalHandler.play(command, modal, searchQuery);
            }
        }
    }
}

module.exports = ModalHandler;
