import { ApplicationCommandOption, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, Message } from 'discord.js';
import Bot from '../Bot';

export default interface BotInteraction {
    client: Bot;
    category: string;
    get name(): string;
    get description(): string;
    get slashData(): SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
    get permissions(): ApplicationCommandOption[] | string;
    run(args: unknown): Promise<Message<true> | undefined | void>;
}

export default class BotInteraction {
    constructor(client: Bot) {
        this.client = client;
    }
}
