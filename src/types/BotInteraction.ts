import { ApplicationCommandOption, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import Bot from '../Bot';

export default interface BotInteraction {
    new (client: Bot): BotInteraction;
    client: Bot;
    category: string;
    get name(): string;
    get description(): string;
    get slashData(): SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
    get permissions(): ApplicationCommandOption[] | string;
    run(args: unknown): Promise<any>;
}

export default class BotInteraction {
    constructor(client: Bot) {
        this.client = client;
    }
}
