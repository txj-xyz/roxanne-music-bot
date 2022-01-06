const { LavasfyClient } = require('lavasfy');
const axios = require('axios');
const DatabaseHandler = require('./DatabaseHandler.js');
const { token, webhookUrl, inviteURL, youtube_key, spotifyClientID, spotifySecret } = require('../../config.json');
const servers = require('../../lavasfy-servers.json');
const { MessageEmbed } = require('discord.js');
class UtilityHandler {
    constructor(client) {
        this.client = client;
        this.invite = inviteURL;
        this.supportServer = 'https://discord.gg/GJanE63MGj';
        this.db = new DatabaseHandler(client);
        this.humanizeTime = this.humanizeTime;
        this.convertMS = this.convertMS;
        this.ytMeta = this.ytMeta;
        this.lavaConnect(spotifyClientID, spotifySecret, servers);
    }
    urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
    loadingEmbed = new MessageEmbed().setAuthor('Loading.. Please wait :)');

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

    // prettier-ignore
    humanizeTime(ms, sec = (ms / 1000).toFixed(0), min = Math.floor(sec / 60), hr = 0) {
        if (min > 59) hr = ((hr = Math.floor(min / 60)) => hr >= 10 ? hr : `0${hr}`)()
        min = ((m = min - hr * 60) => m >= 10 ? m : `0${m}`)()
        sec = ((s = Math.floor(sec % 60)) => s >= 10 ? s : `0${s}`)()
        return (hr != '' ? `${hr}:${min}:${sec}` : `${min}:${sec}`)
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

    async lavaConnect(clientID, clientSecret, servers) {
        try {
            let c = new LavasfyClient(
                {
                    clientID: clientID,
                    clientSecret: clientSecret,
                    filterAudioOnlyResult: true,
                    autoResolve: true,
                    useSpotifyMetadata: true,
                },
                servers
            );
            await c.requestToken();
            this.lava = c;
        } catch (error) {
            this.lava = null;
        }
    }

    async spotifyRetry(lavasfyClient, query, interaction) {
        return new Promise(async (resolve, reject) => {
            const node = await lavasfyClient.getNode();
            await node.load(query).then(async (r) => {
                if (r.loadType === 'LOAD_FAILED') {
                    await interaction.editReply({
                        content: 'Please wait while I grab songs from Spotify',
                        components: [],
                    });
                    reject('LOAD_FAILED');
                } else if (r.loadType.includes('LOADED')) {
                    resolve(r);
                } else if (r.loadType === 'NO_MATCHES') {
                    resolve(r);
                }
            });
        });
    }

    async ytMeta(id) {
        try {
            const videoStats = await axios({
                method: 'get',
                url: `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${id}&key=${youtube_key}`,
                responseType: 'json',
            });
            return videoStats.data.items.slice(0).some((e) => e) ? videoStats.data.items.slice(0)[0] : null;
        } catch (err) {
            return err;
        }
    }
}

module.exports = UtilityHandler;
