const axios = require('axios');
const unshortener = require('unshorten.it');
const config = require('../../config.json');
const { EmbedBuilder } = require('discord.js');

class UtilityHandler {
    constructor(client) {
        this.client = client;
        this.config = config;
        this.random = (array) => array[Math.floor(Math.random() * array.length)];
        this.supportServer = this.config.supportServer;
        this.deleteMessage = this.deleteMessage;
        this.loadingEmbed = new EmbedBuilder().setAuthor({ name: 'Loading...' });
        this.loadingText = '<a:Typing:598682375303593985> **Loading...**';
    }

    deleteMessage(interaction, id) {
        return interaction.channel.messages.fetch(id).then((message) => message.delete());
    }

    removeArrayIndex(array, indexID) {
        return array.filter((_, index) => index != indexID - 1);
    }

    checkURL(string) {
        try {
            new URL(string);
            return true;
        } catch (error) {
            return false;
        }
    }

    humanizeTime(ms, sec = (ms / 1000).toFixed(0), min = Math.floor(sec / 60), hr = 0) {
        if (min > 59) hr = ((hr = Math.floor(min / 60)) => (hr >= 10 ? hr : `0${hr}`))();
        min = ((m = min - hr * 60) => (m >= 10 ? m : `0${m}`))();
        sec = ((s = Math.floor(sec % 60)) => (s >= 10 ? s : `0${s}`))();
        return hr > 59 ? 'Live! 🔴' : hr != '' ? `${hr}:${min}:${sec}` : `${min}:${sec}`;
    }

    convertMS(ms) {
        let seconds = (ms / 1000).toFixed(1),
            minutes = (ms / (1000 * 60)).toFixed(1),
            hours = (ms / (1000 * 60 * 60)).toFixed(1),
            days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
        if (seconds < 60) return seconds + ' Sec';
        else if (minutes < 60) return minutes + ' Min';
        else if (hours < 24) return hours + ' Hrs';
        else return days + ' Days';
    }

    convertNumToInternational(number) {
        return Math.abs(Number(number)) >= 1.0e9
            ? (Math.abs(Number(number)) / 1.0e9).toFixed(1) + 'B'
            : Math.abs(Number(number)) >= 1.0e6
            ? (Math.abs(Number(number)) / 1.0e6).toFixed(1) + 'M'
            : Math.abs(Number(number)) >= 1.0e3
            ? (Math.abs(Number(number)) / 1.0e3).toFixed(1) + 'K'
            : Math.abs(Number(number));
    }

    convertBytes(bytes) {
        const MB = Math.floor((bytes / 1024 / 1024) % 1000);
        const GB = Math.floor(bytes / 1024 / 1024 / 1024);
        if (MB >= 1000) return `${GB.toFixed(1)} GB`;
        else return `${Math.round(MB)} MB`;
    }

    async unshortenLink(link) {
        try {
            const resolved = await unshortener(link);
            return String(resolved);
        } catch (error) {
            return error;
        }
    }

    async ytMeta(id) {
        try {
            const videoStats = await axios({
                method: 'get',
                url: `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${id}&key=${this.config.youtube_key}`,
                responseType: 'json',
            });
            return videoStats.data.items.slice(0).some((e) => e) ? videoStats.data.items.slice(0)[0] : null;
        } catch (err) {
            return null;
        }
    }
}

module.exports = UtilityHandler;
