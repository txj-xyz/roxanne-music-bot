const { LavasfyClient } = require('lavasfy');
const axios = require('axios');
const unshortener = require('unshorten.it');
const config = require('../../config.json');
const servers = require('../../lavalink-server.json');
const { MessageEmbed } = require('discord.js');
class UtilityHandler {
    constructor(client) {
        this.client = client;
        this.config = config;
        this.invite = this.config.inviteURL;
        this.supportServer = this.config.supportServer;
        this.grafana = this.config.grafana;
        this.humanizeTime = this.humanizeTime;
        this.convertMS = this.convertMS;
        this.ytMeta = this.ytMeta;
        // prettier-ignore
        this.urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
        this.loadingEmbed = new MessageEmbed().setAuthor('Loading.. Please wait :)');
    }

    deleteMessage(interaction, id) {
        interaction.channel.messages.fetch(id).then((message) => message.delete());
    }

    rollRandomInt16(number) {
        return Math.floor(Math.random() * number);
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
