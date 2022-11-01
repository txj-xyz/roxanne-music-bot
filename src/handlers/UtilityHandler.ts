import * as config from '../../config.json';
import { EmbedBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
import Bot from '../Bot';

export default interface UtilityHandler {
    client: Bot;
    config: typeof config;
    random(array: Array<number>): number;
    loadingEmbed: EmbedBuilder;
    loadingText: string;
}

export default class UtilityHandler {
    constructor(client: Bot) {
        this.client = client;
        this.config = config;
        this.random = (array) => array[Math.floor(Math.random() * array.length)];
        this.loadingEmbed = new EmbedBuilder().setAuthor({ name: 'Loading...' });
        this.loadingText = '<a:Typing:598682375303593985> **Loading...**';
    }

    public deleteMessage(interaction: ChatInputCommandInteraction, id: string) {
        return interaction.channel?.messages.fetch(id).then((message: Message<true | false>) => message.delete());
    }

    public removeArrayIndex(array: Array<any>, indexID: number): Array<string> {
        return array.filter((_: Array<string>, index: number) => index != indexID - 1);
    }

    public checkURL(string: string): boolean {
        try {
            new URL(string);
            return true;
        } catch (error) {
            return false;
        }
    }

    public trim(string: string, max: number): string {
        return string.length > max ? string.slice(0, max) : string;
    }

    public convertMS(ms: number | null): string {
        if (!ms) return 'n/a';
        const seconds = (ms / 1000).toFixed(1),
            minutes = (ms / (1000 * 60)).toFixed(1),
            hours = (ms / (1000 * 60 * 60)).toFixed(1),
            days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
        if (Number(seconds) < 60) return seconds + ' Sec';
        else if (Number(minutes) < 60) return minutes + ' Min';
        else if (Number(hours) < 24) return hours + ' Hrs';
        else return days + ' Days';
    }

    public convertBytes(bytes: number): string {
        const MB = Math.floor((bytes / 1024 / 1024) % 1000);
        const GB = Math.floor(bytes / 1024 / 1024 / 1024);
        if (MB >= 1000) return `${GB.toFixed(1)} GB`;
        else return `${Math.round(MB)} MB`;
    }

    public humanizeTime(ms: any, sec: any = (ms / 1000).toFixed(0), min: any = Math.floor(sec / 60), hr: any = 0) {
        if (min > 59) hr = ((hr = Math.floor(min / 60)) => (hr >= 10 ? hr : `0${hr}`))();
        min = ((m = min - hr * 60) => (m >= 10 ? m : `0${m}`))();
        sec = ((s = Math.floor(sec % 60)) => (s >= 10 ? s : `0${s}`))();
        return hr > 59 ? 'Live! 🔴' : hr != '' ? `${hr}:${min}:${sec}` : `${min}:${sec}`;
    }
}
